import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TYRE_API     = 'http://localhost:5001/api/notifications';
const WARRANTY_API = 'http://localhost:5001/api/warranty-notifications';
const FASTAG_API   = 'http://localhost:5001/api/fastag-notifications';
const POLL_MS      = 15000;

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [criticalPopup, setCriticalPopup] = useState(null);
  const seenCritical = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const [tyreRes, warrantyRes, fastagRes] = await Promise.all([
        fetch(`${TYRE_API}?limit=50`),
        fetch(`${WARRANTY_API}`),
        fetch(`${FASTAG_API}`),
      ]);
      const [tyreData, warrantyData, fastagData] = await Promise.all([
        tyreRes.json(),
        warrantyRes.json(),
        fastagRes.json(),
      ]);

      // Normalise tyre notifications
      const tyreItems = (tyreData.success ? tyreData.data : []).map(n => ({
        ...n,
        _source:  'tyre',
        is_read:  n.status === 'Read',
        // keep severity as-is
      }));

      // Normalise warranty notifications
      const warrantyItems = (warrantyData.success ? warrantyData.data : []).map(n => ({
        ...n,
        _source: 'warranty',
        status:  n.is_read ? 'Read' : 'Unread',
        // map severity for consistent display
      }));

      // Normalise fastag notifications
      const fastagItems = (fastagData.success ? fastagData.data : []).map(n => ({
        ...n,
        _source: 'fastag',
        status:  n.is_read ? 'Read' : 'Unread',
      }));

      // Merge and sort by created_at descending
      const merged = [...tyreItems, ...warrantyItems, ...fastagItems].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      const unread = merged.filter(n => n.status === 'Unread' || !n.is_read).length;
      setNotifications(merged);
      setUnreadCount(unread);

      // Popup for new Critical/High unread warranty or tyre alerts
      const urgent = merged.find(
        n => (n.status === 'Unread' || !n.is_read) &&
             !seenCritical.current.has(`${n._source}-${n.id}`) &&
             (n.severity === 'Critical' || n.severity === 'High')
      );
      if (urgent) {
        seenCritical.current.add(`${urgent._source}-${urgent.id}`);
        setCriticalPopup(urgent);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id, source) => {
    const url = source === 'warranty' ? `${WARRANTY_API}/${id}/read`
      : source === 'fastag' ? `${FASTAG_API}/${id}/read`
      : `${TYRE_API}/${id}/read`;
    await fetch(url, { method: 'PATCH' });
    setNotifications(prev =>
      prev.map(n =>
        n.id === id && n._source === source
          ? { ...n, status: 'Read', is_read: true }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await Promise.all([
      fetch(`${TYRE_API}/read-all`,    { method: 'PATCH' }),
      fetch(`${WARRANTY_API}/read-all`, { method: 'PATCH' }),
      fetch(`${FASTAG_API}/read-all`, { method: 'PATCH' }),
    ]);
    setNotifications(prev => prev.map(n => ({ ...n, status: 'Read', is_read: true })));
    setUnreadCount(0);
  }, []);

  const dismissPopup = useCallback(() => setCriticalPopup(null), []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, criticalPopup,
      markRead, markAllRead, dismissPopup, refresh: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
