const STORAGE_KEY = 'fleet_inspection_followups';

export const getFollowUps = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error loading follow-ups:', e);
    return {};
  }
};

export const getInspectionFollowUp = (inspectionId) => {
  if (!inspectionId) return null;
  const all = getFollowUps();
  return all[inspectionId] || null;
};

export const saveInspectionFollowUp = (inspectionId, data) => {
  if (!inspectionId) return;
  try {
    const all = getFollowUps();
    all[inspectionId] = {
      ...(all[inspectionId] || {}),
      ...data,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Error saving follow-up:', e);
  }
};
