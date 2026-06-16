// ── localStorage helpers ─────────────────────────────────────────────────────

export const getUser = () => JSON.parse(localStorage.getItem('sga_user') || 'null');

export const saveUser = (data) => {
  localStorage.setItem('sga_user', JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
};

export const getAnalyses = () => JSON.parse(localStorage.getItem('sga_analyses') || '[]');

export const saveAnalysis = (analysis) => {
  const existing = getAnalyses();
  // deactivate all existing
  const updated = existing.map((a) => ({ ...a, isActive: false }));
  const next = [{ ...analysis, isActive: true, id: Date.now(), createdAt: Date.now() }, ...updated];
  localStorage.setItem('sga_analyses', JSON.stringify(next));
};

export const deleteAnalysis = (id) => {
  const existing = getAnalyses().filter((a) => a.id !== id);
  // ensure one is active
  if (existing.length > 0 && !existing.some((a) => a.isActive)) {
    existing[0].isActive = true;
  }
  localStorage.setItem('sga_analyses', JSON.stringify(existing));
};

export const setActiveAnalysis = (id) => {
  const existing = getAnalyses().map((a) => ({ ...a, isActive: a.id === id }));
  localStorage.setItem('sga_analyses', JSON.stringify(existing));
};

export const getSkills = () => JSON.parse(localStorage.getItem('sga_skills') || '[]');

export const saveSkills = (arr) => localStorage.setItem('sga_skills', JSON.stringify(arr));

export const getProjects = () => JSON.parse(localStorage.getItem('sga_projects') || '[]');

export const saveProjects = (arr) => localStorage.setItem('sga_projects', JSON.stringify(arr));

export const getActivity = () => JSON.parse(localStorage.getItem('sga_activity') || '[]');

export const addActivity = (text) => {
  const existing = getActivity();
  const next = [{ text, time: Date.now() }, ...existing].slice(0, 50);
  localStorage.setItem('sga_activity', JSON.stringify(next));
};

export const formatTime = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const getStorageSize = () => {
  let total = 0;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sga_') || key.startsWith('sg_') || key === 'skillgap_history') {
      total += (localStorage.getItem(key) || '').length * 2; // UTF-16
    }
  }
  return total; // bytes
};
