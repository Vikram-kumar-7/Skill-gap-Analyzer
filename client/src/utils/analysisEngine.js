import {
  SKILL_DB,
  ROLE_REQUIREMENTS,
  ROI_SCORES,
  COURSE_LINKS,
  TIME_ESTIMATES,
} from './skillDb.js';

// ── Text normaliser ───────────────────────────────────────────────────────────
const normalise = (text) => text.toLowerCase().replace(/[^a-z0-9\s.#+]/g, ' ');

// ── Skill extractor ───────────────────────────────────────────────────────────
export const extractSkillsFromText = (text) => {
  const norm = normalise(text);
  const found = new Set();
  for (const skill of SKILL_DB) {
    const terms = [skill.name.toLowerCase(), ...skill.aliases.map((a) => a.toLowerCase())];
    for (const term of terms) {
      if (norm.includes(term)) {
        found.add(skill.name);
        break;
      }
    }
  }
  return [...found];
};

// ── Analysis engine ───────────────────────────────────────────────────────────
export const runAnalysis = ({ resumeText, jobDescription, targetRole }) => {
  const resumeSkills = extractSkillsFromText(resumeText);
  
  // Merge GitHub Intelligence output as an additional input alongside resume skills
  try {
    const gitAnalysisStr = localStorage.getItem('sga_github_analysis');
    if (gitAnalysisStr) {
      const gitAnalysis = JSON.parse(gitAnalysisStr);
      if (gitAnalysis && gitAnalysis.skillConfidence) {
        const confidenceThreshold = 3.0; // High confidence threshold
        const gitSkills = Object.entries(gitAnalysis.skillConfidence)
          .filter(([_, conf]) => conf >= confidenceThreshold)
          .map(([skill, _]) => skill);

        for (const gs of gitSkills) {
          if (!resumeSkills.includes(gs)) {
            resumeSkills.push(gs);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to merge GitHub skills in client-side analysis:', err.message);
  }

  const jdSkills = extractSkillsFromText(jobDescription);
  const roleRequired = ROLE_REQUIREMENTS[targetRole] || [];

  // Union of JD skills + role requirements
  const requiredSet = new Set([...jdSkills, ...roleRequired]);
  const required = [...requiredSet];

  const present = required.filter((s) => resumeSkills.includes(s));
  const missing = required.filter((s) => !resumeSkills.includes(s));
  const extra = resumeSkills.filter((s) => !required.includes(s)); // bonus skills

  const matchPct = required.length > 0 ? Math.round((present.length / required.length) * 100) : 0;

  // Enrich missing skills with metadata
  const enriched = missing.map((name) => {
    const meta = SKILL_DB.find((s) => s.name === name) || {};
    const roi = ROI_SCORES[name] || 10;
    return {
      name,
      category: meta.category || 'General',
      demand: meta.demand || 3,
      difficulty: meta.difficulty || 3,
      roi,
      timeEstimate: TIME_ESTIMATES[meta.difficulty || 3],
      courses: COURSE_LINKS[name] || [],
      tasks: [
        `Study ${name} fundamentals`,
        `Build a small project using ${name}`,
        `Add ${name} to your portfolio`,
      ],
      completed: false,
    };
  });

  // Radar data (5 axes)
  const byCategory = (skillList, cats) =>
    cats.map(
      (cat) =>
        skillList.filter((s) => {
          const m = SKILL_DB.find((x) => x.name === s);
          return m && m.category === cat;
        }).length
    );

  const cats = ['Frontend', 'Backend', 'Database', 'DevOps', 'AI-ML'];
  const catLabels = ['Technical', 'Tools', 'Soft Skills', 'Projects', 'Domain'];
  // map: Technical=Frontend+Backend, Tools=DevOps, Soft Skills=AI-ML, Projects=Database, Domain=Mobile
  const catGroups = {
    Technical: ['Frontend', 'Backend'],
    Tools: ['DevOps'],
    'Soft Skills': ['Soft Skills'],
    Projects: ['Database', 'Mobile'],
    Domain: ['AI-ML', 'Design'],
  };

  const scoreAxis = (skillList, group) => {
    const allInGroup = SKILL_DB.filter((s) => group.includes(s.category)).map((s) => s.name);
    if (!allInGroup.length) return 0;
    const matched = skillList.filter((s) => allInGroup.includes(s)).length;
    return Math.min(100, Math.round((matched / Math.max(allInGroup.length, 1)) * 100 * 2.5));
  };

  const axes = Object.keys(catGroups);
  const radarData = axes.map((axis) => ({
    subject: axis,
    user: scoreAxis(resumeSkills, catGroups[axis]),
    target: scoreAxis(required, catGroups[axis]),
    fullMark: 100,
  }));

  // Salary estimates (rough INR LPA)
  const BASE_SALARY = { Fresher: 4, '0-1yr': 5, '1-3yr': 8, '3-5yr': 14, '5+yr': 22 };
  const salaryBoost = present.reduce((acc, s) => {
    const m = SKILL_DB.find((x) => x.name === s);
    return acc + (m ? m.avgSalaryBoost * 0.3 : 0);
  }, 0);
  const currentSalary = Math.round(BASE_SALARY['Fresher'] + salaryBoost);
  const projectedSalary = Math.round(
    currentSalary +
      enriched.reduce((a, s) => {
        const m = SKILL_DB.find((x) => x.name === s.name);
        return a + (m ? m.avgSalaryBoost * 0.25 : 0);
      }, 0)
  );

  return {
    role: targetRole,
    matchPct,
    presentSkills: present,
    missingSkills: missing,
    extraSkills: extra,
    enrichedMissing: enriched,
    radarData,
    currentSalary,
    projectedSalary,
    createdAt: Date.now(),
  };
};
