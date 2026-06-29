import {
  SKILL_DB,
  ROLE_REQUIREMENTS,
  ROI_SCORES,
  COURSE_LINKS,
  TIME_ESTIMATES,
} from './skillDb.js';
import { normalizeSkill, SKILL_GROUPS } from './skillAliases.js';

// ── Skill extractor ───────────────────────────────────────────────────────────
export const extractSkillsFromText = (text) => {
  console.log('>>> NEW EXTRACTOR RUNNING, text length:', text.length);
  const norm = text.toLowerCase().replace(/[^a-z0-9\s.#+]/g, ' ');
  const found = new Set();

  console.log('>>> NORM PREVIEW:', norm.substring(0, 300));

  // Build enhanced alias list: SKILL_DB aliases + SKILL_GROUPS aliases merged
  for (const skill of SKILL_DB) {
    const skillNameLower = skill.name.toLowerCase();

    // Get extra aliases from SKILL_GROUPS by matching canonical
    const canonical = normalizeSkill(skill.name);
    const extraAliases = SKILL_GROUPS[canonical] || [];

    const allTerms = [
      skillNameLower,
      ...skill.aliases.map(a => a.toLowerCase()),
      ...extraAliases.map(a => a.toLowerCase()),
    ];

    for (const term of allTerms) {
      if (!term) continue;
      // Word boundary for short terms to avoid false positives
      const matched = term.length <= 2
        ? new RegExp(`\\b${term}\\b`).test(norm)
        : norm.includes(term);

      if (matched) {
        found.add(skill.name); // always use SKILL_DB display name
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

  // Match % based on JD skills only — role requirements are "nice to have" suggestions
  const required = jdSkills;
  const niceToHave = roleRequired.filter(
    s => !jdSkills.some(j => normalizeSkill(j) === normalizeSkill(s))
  );

  const present = required.filter((s) => 
    resumeSkills.some(rs => normalizeSkill(rs) === normalizeSkill(s))
  );
  const missing = required.filter((s) => 
    !resumeSkills.some(rs => normalizeSkill(rs) === normalizeSkill(s))
  );
  const extra = resumeSkills.filter((s) => 
    !required.some(req => normalizeSkill(req) === normalizeSkill(s))
  ); // bonus skills

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
    const matched = skillList.filter((s) => 
      allInGroup.some(g => normalizeSkill(g) === normalizeSkill(s))
    ).length;
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

  // Enrich nice-to-have skills too (for display only, not in match %)
  const enrichedNiceToHave = niceToHave.map((name) => {
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

  return {
    role: targetRole,
    matchPct,
    presentSkills: present,
    missingSkills: missing,
    extraSkills: extra,
    niceToHave: enrichedNiceToHave,
    enrichedMissing: enriched,
    radarData,
    currentSalary,
    projectedSalary,
    createdAt: Date.now(),
  };
};

/**
 * Maps a list of raw/lowercase skill strings back to the exact capitalized display name
 * defined in SKILL_DB, matching via normalizeSkill.
 */
export const mapToDisplayNames = (skills = []) => {
  return skills.map((s) => {
    const dbSkill = SKILL_DB.find((db) => normalizeSkill(db.name) === normalizeSkill(s));
    return dbSkill ? dbSkill.name : s;
  });
};

/**
 * Computes metrics and UI-friendly objects using already-extracted skill names.
 * Used for backend-generated skill analysis results.
 */
export const runAnalysisWithExtracted = ({ resumeSkills, jdSkills, targetRole, insights }) => {
  // Map raw/lowercase inputs back to display names in SKILL_DB
  const mappedResumeSkills = mapToDisplayNames(resumeSkills);
  const mappedJdSkills = mapToDisplayNames(jdSkills);

  const roleRequired = ROLE_REQUIREMENTS[targetRole] || [];

  const required = mappedJdSkills;
  const niceToHave = roleRequired.filter(
    (s) => !mappedJdSkills.some((j) => normalizeSkill(j) === normalizeSkill(s))
  );

  const present = required.filter((s) =>
    mappedResumeSkills.some((rs) => normalizeSkill(rs) === normalizeSkill(s))
  );
  const missing = required.filter((s) =>
    !mappedResumeSkills.some((rs) => normalizeSkill(rs) === normalizeSkill(s))
  );
  const extra = mappedResumeSkills.filter((s) =>
    !required.some((req) => normalizeSkill(req) === normalizeSkill(s))
  );

  const matchPct = required.length > 0 ? Math.round((present.length / required.length) * 100) : 0;

  // Enrich missing skills
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

  // Radar data
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
    const matched = skillList.filter((s) =>
      allInGroup.some((g) => normalizeSkill(g) === normalizeSkill(s))
    ).length;
    return Math.min(100, Math.round((matched / Math.max(allInGroup.length, 1)) * 100 * 2.5));
  };

  const axes = Object.keys(catGroups);
  const radarData = axes.map((axis) => ({
    subject: axis,
    user: scoreAxis(mappedResumeSkills, catGroups[axis]),
    target: scoreAxis(required, catGroups[axis]),
    fullMark: 100,
  }));

  // Salary estimates
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

  const enrichedNiceToHave = niceToHave.map((name) => {
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

  return {
    role: targetRole,
    matchPct,
    presentSkills: present,
    missingSkills: missing,
    extraSkills: extra,
    niceToHave: enrichedNiceToHave,
    enrichedMissing: enriched,
    radarData,
    currentSalary,
    projectedSalary,
    insights,
    createdAt: Date.now(),
  };
};
