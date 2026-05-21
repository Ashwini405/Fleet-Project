import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const API = 'http://localhost:5001/api/notifications';
const POLL_MS = 15000; // poll every 15 seconds

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [criticalPopup, setCriticalPopup] = useState(null);
  const seenCritical = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch(`${API}?limit=50`);
      const data = await res.json();
      if (!data.success) return;
      setNotifications(data.data || []);
      setUnreadCount(data.unread_count || 0);

      // Show popup for new Critical/High unread — and resolved (Low with ✅)
      const urgent = (data.data || []).find(
        n => n.status === 'Unread' &&
             !seenCritical.current.has(n.id) &&
             (
               n.severity === 'Critical' ||
               n.severity === 'High' ||
               n.message?.startsWith('✅')
             )
      );
      if (urgent) {
        seenCritical.current.add(urgent.id);
        setCriticalPopup(urgent);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    await fetch(`${API}/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Read' } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch(`${API}/read-all`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
    setUnreadCount(0);
  }, []);

  const dismissPopup = useCallback(() => setCriticalPopup(null), []);

  const refresh = fetchNotifications;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, criticalPopup,
      markRead, markAllRead, dismissPopup, refresh
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
