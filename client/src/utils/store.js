/**
 * store.js — Central localStorage data layer for SkillGap Analyzer.
 * All user data lives here. No external DB needed.
 */

const KEYS = {
  USER: 'sg_user',
  ANALYSES: 'sg_analyses',
  ACTIVE_ANALYSIS: 'sg_active_analysis',
  SKILL_TRACKER: 'sg_skill_tracker',
  ROADMAP_PROGRESS: 'sg_roadmap_progress',
  ROADMAP_START: 'sg_roadmap_start',
  ACTIVITY_LOG: 'sg_activity_log',
  DAILY_TIP: 'sg_daily_tip',
  RESUME: 'sg_resume',
  INTERVIEW_ANSWERS: 'sg_interview_answers',
  PROJECTS: 'sg_projects',
  PORTFOLIO: 'sg_portfolio',
  SCENARIOS: 'sg_scenarios',
  SETTINGS: 'sg_settings',
  HEATMAP: 'sg_heatmap',
};

// === Helpers ===
function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

// === User Profile ===
export function getUser() {
  return get(KEYS.USER, {
    name: 'User',
    email: '',
    initials: 'U',
    targetRole: 'Full Stack Engineer',
    experienceLevel: '1-3 yrs',
    location: '',
  });
}

export function setUser(data) {
  const current = getUser();
  set(KEYS.USER, { ...current, ...data });
}

// === Settings ===
export function getSettings() {
  return get(KEYS.SETTINGS, {
    darkMode: true,
    aiEnabled: true,
    apiKey: '',
    accentColor: 'purple',
    fontSize: 'normal',
    reduceAnimations: false,
    studyReminder: false,
    studyTime: '09:00',
    theme: 'dark',
  });
}

export function setSettings(data) {
  const current = getSettings();
  set(KEYS.SETTINGS, { ...current, ...data });
}

// === Analyses ===
export function getAnalyses() {
  return get(KEYS.ANALYSES, []);
}

export function saveAnalysis(analysis) {
  const analyses = getAnalyses();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(),
    ...analysis,
  };
  analyses.unshift(entry);
  set(KEYS.ANALYSES, analyses);
  logActivity('analysis', `Completed analysis for "${analysis.targetRole || 'job'}"`, { matchPercentage: analysis.matchPercentage });
  return entry;
}

export function deleteAnalysis(id) {
  const analyses = getAnalyses().filter(a => a.id !== id);
  set(KEYS.ANALYSES, analyses);
  // If deleted the active one, clear active
  const active = getActiveAnalysis();
  if (active && active.id === id) setActiveAnalysis(null);
}

export function getActiveAnalysis() {
  return get(KEYS.ACTIVE_ANALYSIS, null);
}

export function setActiveAnalysis(analysis) {
  set(KEYS.ACTIVE_ANALYSIS, analysis);
  if (analysis) {
    logActivity('analysis', `Set "${analysis.targetRole || 'analysis'}" as active`);
  }
}

// === Skill Tracker ===
export function getSkillTracker() {
  return get(KEYS.SKILL_TRACKER, []);
}

export function setSkillTracker(skills) {
  set(KEYS.SKILL_TRACKER, skills);
}

export function addSkill(skill) {
  const tracker = getSkillTracker();
  if (tracker.find(s => s.name.toLowerCase() === skill.name.toLowerCase())) return false;
  tracker.push({
    name: skill.name,
    category: skill.category || 'Other',
    proficiency: skill.proficiency || 'Beginner',
    status: skill.status || 'Not Started',
    lastPracticed: null,
    addedDate: new Date().toISOString(),
    ...skill,
  });
  set(KEYS.SKILL_TRACKER, tracker);
  logActivity('skill', `Added skill: ${skill.name}`);
  return true;
}

export function updateSkill(name, updates) {
  const tracker = getSkillTracker();
  const idx = tracker.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
  if (idx >= 0) {
    tracker[idx] = { ...tracker[idx], ...updates };
    set(KEYS.SKILL_TRACKER, tracker);
  }
}

export function markSkillComplete(name) {
  updateSkill(name, { status: 'Completed', lastPracticed: new Date().toISOString() });
  logActivity('skill_complete', `Completed skill: ${name}`);
  recordHeatmapEntry();
}

// === Roadmap Progress ===
export function getRoadmapProgress() {
  return get(KEYS.ROADMAP_PROGRESS, {});
}

export function setRoadmapProgress(progress) {
  set(KEYS.ROADMAP_PROGRESS, progress);
}

export function toggleSubTask(skillName, taskIndex) {
  const progress = getRoadmapProgress();
  if (!progress[skillName]) progress[skillName] = { tasks: {} };
  progress[skillName].tasks[taskIndex] = !progress[skillName].tasks[taskIndex];
  set(KEYS.ROADMAP_PROGRESS, progress);
}

export function markRoadmapSkillComplete(skillName) {
  const progress = getRoadmapProgress();
  if (!progress[skillName]) progress[skillName] = { tasks: {} };
  progress[skillName].completed = true;
  progress[skillName].completedDate = new Date().toISOString();
  set(KEYS.ROADMAP_PROGRESS, progress);
  markSkillComplete(skillName);
}

export function getRoadmapStart() {
  return get(KEYS.ROADMAP_START, null);
}

export function setRoadmapStart(date) {
  set(KEYS.ROADMAP_START, date || new Date().toISOString());
}

export function getCurrentRoadmapWeek() {
  const start = getRoadmapStart();
  if (!start) return 1;
  const diff = Date.now() - new Date(start).getTime();
  return Math.min(12, Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
}

// === Activity Log ===
export function getActivityLog() {
  return get(KEYS.ACTIVITY_LOG, []);
}

export function logActivity(type, message, meta = {}) {
  const log = getActivityLog();
  log.unshift({
    id: Date.now(),
    type,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  });
  // Keep max 50
  if (log.length > 50) log.length = 50;
  set(KEYS.ACTIVITY_LOG, log);
}

// === Daily Tip ===
export function getDailyTip() {
  return get(KEYS.DAILY_TIP, null);
}

export function setDailyTip(tip) {
  set(KEYS.DAILY_TIP, { ...tip, date: new Date().toISOString().slice(0, 10) });
}

export function isTipFresh() {
  const tip = getDailyTip();
  if (!tip) return false;
  return tip.date === new Date().toISOString().slice(0, 10);
}

// === Interview ===
export function getInterviewAnswers() {
  return get(KEYS.INTERVIEW_ANSWERS, []);
}

export function saveInterviewAnswer(answer) {
  const answers = getInterviewAnswers();
  answers.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...answer,
  });
  set(KEYS.INTERVIEW_ANSWERS, answers);
  logActivity('interview', `Practiced: "${answer.question?.substring(0, 50)}..."`, { score: answer.score });
}

export function getInterviewCount() {
  return getInterviewAnswers().length;
}

// === Resume ===
export function getResume() {
  return get(KEYS.RESUME, {
    contact: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    summary: '',
    experience: [{ title: '', company: '', period: '', bullets: [''] }],
    projects: [{ name: '', description: '', techStack: '', url: '' }],
    skills: [],
    education: [{ degree: '', school: '', year: '' }],
    certifications: [],
  });
}

export function setResume(data) {
  set(KEYS.RESUME, data);
}

// === Projects / Portfolio ===
export function getUserProjects() {
  return get(KEYS.PROJECTS, []);
}

export function setUserProjects(projects) {
  set(KEYS.PROJECTS, projects);
}

export function addUserProject(project) {
  const projects = getUserProjects();
  projects.push({
    id: Date.now().toString(36),
    status: 'not_started',
    addedDate: new Date().toISOString(),
    milestones: {},
    ...project,
  });
  set(KEYS.PROJECTS, projects);
  logActivity('project', `Added project: ${project.title}`);
}

export function getPortfolio() {
  return get(KEYS.PORTFOLIO, []);
}

export function setPortfolio(portfolio) {
  set(KEYS.PORTFOLIO, portfolio);
}

// === Scenarios (Career Simulator) ===
export function getScenarios() {
  return get(KEYS.SCENARIOS, []);
}

export function saveScenario(scenario) {
  const scenarios = getScenarios();
  if (scenarios.length >= 5) scenarios.pop();
  scenarios.unshift({
    id: Date.now().toString(36),
    date: new Date().toISOString(),
    ...scenario,
  });
  set(KEYS.SCENARIOS, scenarios);
}

export function deleteScenario(id) {
  set(KEYS.SCENARIOS, getScenarios().filter(s => s.id !== id));
}

// === Heatmap ===
export function getHeatmap() {
  return get(KEYS.HEATMAP, {});
}

export function recordHeatmapEntry() {
  const heatmap = getHeatmap();
  const today = new Date().toISOString().slice(0, 10);
  heatmap[today] = (heatmap[today] || 0) + 1;
  set(KEYS.HEATMAP, heatmap);
}

export function getStreak() {
  const heatmap = getHeatmap();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (heatmap[key]) { streak++; } else if (i > 0) break;
  }
  return streak;
}

// === Completed Skills Count ===
export function getCompletedSkillsCount() {
  const tracker = getSkillTracker();
  const roadmapProgress = getRoadmapProgress();
  const fromTracker = tracker.filter(s => s.status === 'Completed').length;
  const fromRoadmap = Object.values(roadmapProgress).filter(p => p.completed).length;
  return Math.max(fromTracker, fromRoadmap);
}

// === Data Import/Export ===
export function exportAllData() {
  const data = {};
  Object.entries(KEYS).forEach(([, key]) => {
    const val = localStorage.getItem(key);
    if (val) data[key] = JSON.parse(val);
  });
  return data;
}

export function importAllData(data) {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
}

export function clearSection(section) {
  const keyMap = {
    analyses: [KEYS.ANALYSES, KEYS.ACTIVE_ANALYSIS],
    roadmap: [KEYS.ROADMAP_PROGRESS, KEYS.ROADMAP_START],
    tracker: [KEYS.SKILL_TRACKER, KEYS.HEATMAP],
    interview: [KEYS.INTERVIEW_ANSWERS],
    resume: [KEYS.RESUME],
    projects: [KEYS.PROJECTS, KEYS.PORTFOLIO],
    all: Object.values(KEYS),
  };
  (keyMap[section] || []).forEach(k => localStorage.removeItem(k));
}

export function getStorageUsage() {
  let total = 0;
  Object.values(KEYS).forEach(key => {
    const val = localStorage.getItem(key);
    if (val) total += val.length * 2; // UTF-16
  });
  return total;
}
