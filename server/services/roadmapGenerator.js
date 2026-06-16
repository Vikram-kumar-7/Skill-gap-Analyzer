import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const courses = JSON.parse(readFileSync(join(__dirname, '../data/courses.json'), 'utf-8'));

/**
 * Generate a learning roadmap for missing skills,
 * ordered by ROI priority with course recommendations.
 * @param {Array} marketData - Skill analysis data sorted by ROI
 * @returns {Array} - Ordered learning roadmap
 */
export const generateRoadmap = (marketData) => {
  const roadmap = [];

  // Group skills into phases by priority
  const highPriority = marketData.filter((s) => s.roi >= 50);
  const medPriority = marketData.filter((s) => s.roi >= 20 && s.roi < 50);
  const lowPriority = marketData.filter((s) => s.roi < 20);

  const phases = [
    { name: 'Phase 1: High-Impact Skills (Learn First)', skills: highPriority, weeks: '1-4' },
    { name: 'Phase 2: Growth Skills', skills: medPriority, weeks: '5-8' },
    { name: 'Phase 3: Nice-to-Have Skills', skills: lowPriority, weeks: '9-12' },
  ];

  for (const phase of phases) {
    if (phase.skills.length === 0) continue;

    const phaseData = {
      phase: phase.name,
      timeline: phase.weeks,
      skills: phase.skills.map((skillData) => {
        const skillCourses = courses[skillData.skill.toLowerCase()]?.courses || [];
        const estimatedTime = getEstimatedTime(skillData.difficulty);

        return {
          skill: skillData.skill,
          roi: skillData.roi,
          demand: skillData.demand,
          difficulty: skillData.difficulty,
          estimatedWeeks: estimatedTime,
          courses: skillCourses.slice(0, 3), // Top 3 courses
          salary: skillData.salary,
        };
      }),
    };

    roadmap.push(phaseData);
  }

  return roadmap;
};

/**
 * Estimate learning time in weeks based on difficulty.
 */
function getEstimatedTime(difficulty) {
  if (difficulty <= 1.5) return '1 week';
  if (difficulty <= 2.5) return '2-3 weeks';
  if (difficulty <= 3.5) return '4-6 weeks';
  if (difficulty <= 4.5) return '6-10 weeks';
  return '10-16 weeks';
}
