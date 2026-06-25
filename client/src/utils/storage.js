import { supabase } from './supabase.js';

// ── localStorage helpers ─────────────────────────────────────────────────────

export const getUser = () => JSON.parse(localStorage.getItem('sga_user') || 'null');

export const saveUser = (data) => {
  localStorage.setItem('sga_user', JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
};

export const getAnalyses = () => JSON.parse(localStorage.getItem('sga_analyses') || '[]');

export const saveAnalysis = async (analysis) => {
  const existing = getAnalyses();
  // deactivate all existing
  const updated = existing.map((a) => ({ ...a, isActive: false }));
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const newAnalysis = { 
    ...analysis, 
    isActive: true, 
    id, 
    createdAt: Date.now() 
  };
  const next = [newAnalysis, ...updated];
  localStorage.setItem('sga_analyses', JSON.stringify(next));
  window.dispatchEvent(new Event('storage'));

  // Sync to Supabase
  await queueOrExecuteSync({
    action: 'save_analysis',
    payload: newAnalysis,
  });
};

export const deleteAnalysis = async (id) => {
  const existing = getAnalyses().filter((a) => a.id !== id);
  // ensure one is active
  if (existing.length > 0 && !existing.some((a) => a.isActive)) {
    existing[0].isActive = true;
  }
  localStorage.setItem('sga_analyses', JSON.stringify(existing));
  window.dispatchEvent(new Event('storage'));

  // Sync to Supabase
  await queueOrExecuteSync({
    action: 'delete_analysis',
    payload: { id },
  });
};

export const setActiveAnalysis = async (id) => {
  const existing = getAnalyses().map((a) => ({ ...a, isActive: a.id === id }));
  localStorage.setItem('sga_analyses', JSON.stringify(existing));
  window.dispatchEvent(new Event('storage'));

  // Sync to Supabase
  await queueOrExecuteSync({
    action: 'set_active_analysis',
    payload: { id },
  });
};

export const getSkills = () => JSON.parse(localStorage.getItem('sga_skills') || '[]');

export const saveSkills = async (arr) => {
  localStorage.setItem('sga_skills', JSON.stringify(arr));
  window.dispatchEvent(new Event('storage'));

  // Sync to Supabase
  await queueOrExecuteSync({
    action: 'sync_skills',
    payload: arr,
  });
};

export const getProjects = () => JSON.parse(localStorage.getItem('sga_projects') || '[]');

export const saveProjects = async (arr) => {
  localStorage.setItem('sga_projects', JSON.stringify(arr));
  window.dispatchEvent(new Event('storage'));

  // Sync to Supabase
  await queueOrExecuteSync({
    action: 'sync_projects',
    payload: arr,
  });
};

export const getActivity = () => JSON.parse(localStorage.getItem('sga_activity') || '[]');

export const addActivity = (text) => {
  const existing = getActivity();
  const next = [{ text, time: Date.now() }, ...existing].slice(0, 50);
  localStorage.setItem('sga_activity', JSON.stringify(next));
  window.dispatchEvent(new Event('storage'));
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

// ── Supabase Offline Sync Queue & Hydration ──────────────────────────────────────

const getSyncQueue = () => JSON.parse(localStorage.getItem('sga_sync_queue') || '[]');
const saveSyncQueue = (queue) => localStorage.setItem('sga_sync_queue', JSON.stringify(queue));

const queueOrExecuteSync = async (item) => {
  const queue = getSyncQueue();
  queue.push(item);
  saveSyncQueue(queue);
  await flushSyncQueue();
};

export const flushSyncQueue = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return; // Not logged in

    if (!navigator.onLine) return; // Offline

    const queue = getSyncQueue();
    if (queue.length === 0) return;

    const failedItems = [];

    for (const item of queue) {
      let success = false;
      try {
        if (item.action === 'save_analysis') {
          const a = item.payload;
          const { error } = await supabase.from('analyses').upsert({
            id: a.id.length > 20 ? a.id : undefined, // Use custom local id if it fits UUID pattern or let database generate
            user_id: userId,
            role: a.role || 'Unknown',
            match_pct: a.matchPct || 0,
            missing_skills: a.missingSkills || [],
            present_skills: a.presentSkills || [],
            extra_skills: a.extraSkills || [],
            enriched_missing: a.enrichedMissing || [],
            radar_data: a.radarData || [],
            current_salary: a.currentSalary || null,
            projected_salary: a.projectedSalary || null,
            is_active: a.isActive || false,
            created_at: new Date(a.createdAt || Date.now()).toISOString(),
          });
          if (!error) success = true;
        } else if (item.action === 'delete_analysis') {
          const { error } = await supabase
            .from('analyses')
            .delete()
            .eq('id', item.payload.id)
            .eq('user_id', userId);
          if (!error) success = true;
        } else if (item.action === 'set_active_analysis') {
          // Deactivate others
          const { error: err1 } = await supabase
            .from('analyses')
            .update({ is_active: false })
            .eq('user_id', userId);
          // Activate target
          const { error: err2 } = await supabase
            .from('analyses')
            .update({ is_active: true })
            .eq('id', item.payload.id)
            .eq('user_id', userId);
          if (!err1 && !err2) success = true;
        } else if (item.action === 'sync_skills') {
          const skills = item.payload;
          await supabase.from('skills_progress').delete().eq('user_id', userId);
          if (skills.length > 0) {
            const rows = skills.map((s) => ({
              user_id: userId,
              name: s.name,
              category: s.category || 'Other',
              proficiency: s.proficiency || 'Beginner',
              status: s.status || 'Not Started',
              last_practiced: s.lastPracticed ? new Date(s.lastPracticed).toISOString() : null,
              added_date: s.addedDate ? new Date(s.addedDate).toISOString() : new Date().toISOString(),
            }));
            const { error } = await supabase.from('skills_progress').insert(rows);
            if (!error) success = true;
          } else {
            success = true;
          }
        } else if (item.action === 'sync_projects') {
          const projects = item.payload;
          await supabase.from('projects').delete().eq('user_id', userId);
          if (projects.length > 0) {
            const rows = projects.map((p) => ({
              user_id: userId,
              title: p.title || p.name || 'Untitled',
              description: p.description || '',
              difficulty: p.difficulty || 'Medium',
              skills_covered: p.skillsCovered || [],
              why_it_helps: p.whyItHelps || '',
              status: p.status || 'not_started',
              milestones: p.milestones || {},
              added_date: p.addedDate ? new Date(p.addedDate).toISOString() : new Date().toISOString(),
            }));
            const { error } = await supabase.from('projects').insert(rows);
            if (!error) success = true;
          } else {
            success = true;
          }
        }
      } catch (err) {
        console.error('Error processing queued item:', err.message);
      }

      if (!success) {
        failedItems.push(item);
      }
    }

    saveSyncQueue(failedItems);
  } catch (globalErr) {
    console.error('Failed to flush sync queue:', globalErr.message);
  }
};

export const syncRemoteToLocal = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    // 1. Analyses
    const { data: remoteAnalyses, error: err1 } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (!err1 && remoteAnalyses) {
      const localAnalyses = remoteAnalyses.map((a) => ({
        id: a.id,
        role: a.role,
        matchPct: a.match_pct,
        missingSkills: a.missing_skills,
        presentSkills: a.present_skills,
        extraSkills: a.extra_skills,
        enrichedMissing: a.enriched_missing,
        radarData: a.radar_data,
        currentSalary: a.current_salary,
        projectedSalary: a.projected_salary,
        isActive: a.is_active,
        createdAt: new Date(a.created_at).getTime(),
      }));
      localStorage.setItem('sga_analyses', JSON.stringify(localAnalyses));
    }

    // 2. Skills Progress
    const { data: remoteSkills, error: err2 } = await supabase
      .from('skills_progress')
      .select('*');

    if (!err2 && remoteSkills) {
      const localSkills = remoteSkills.map((s) => ({
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        status: s.status,
        lastPracticed: s.last_practiced ? new Date(s.last_practiced).getTime() : null,
        addedDate: new Date(s.added_date).toISOString(),
      }));
      localStorage.setItem('sga_skills', JSON.stringify(localSkills));
    }

    // 3. Projects
    const { data: remoteProjects, error: err3 } = await supabase
      .from('projects')
      .select('*');

    if (!err3 && remoteProjects) {
      const localProjects = remoteProjects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        skillsCovered: p.skills_covered,
        whyItHelps: p.why_it_helps,
        status: p.status,
        milestones: p.milestones,
        addedDate: new Date(p.added_date).toISOString(),
      }));
      localStorage.setItem('sga_projects', JSON.stringify(localProjects));
    }

    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to sync remote data to local cache:', err.message);
  }
};

// Listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', flushSyncQueue);
  window.addEventListener('load', () => {
    flushSyncQueue();
    syncRemoteToLocal();
  });
}
