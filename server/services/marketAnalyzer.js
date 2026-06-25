import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jobs = JSON.parse(readFileSync(join(__dirname, '../data/jobs.json'), 'utf-8'));
const salaries = JSON.parse(readFileSync(join(__dirname, '../data/salaries.json'), 'utf-8'));
const dependencies = JSON.parse(
  readFileSync(join(__dirname, '../data/dependencies.json'), 'utf-8')
);

// Difficulty ratings for learning each skill (1 = easy, 5 = very hard)
const difficultyMap = {
  html: 1,
  css: 1.5,
  git: 1.5,
  sql: 2,
  javascript: 2.5,
  python: 2,
  typescript: 3,
  react: 3,
  'node.js': 2.5,
  'vue.js': 2.5,
  angular: 3.5,
  'next.js': 3.5,
  express: 2,
  mongodb: 2,
  postgresql: 2.5,
  redis: 2,
  docker: 3,
  kubernetes: 5,
  aws: 4,
  azure: 4,
  'google cloud': 4,
  terraform: 4,
  'ci/cd': 3,
  'machine learning': 4.5,
  'deep learning': 5,
  pytorch: 4.5,
  tensorflow: 4.5,
  nlp: 4.5,
  'data science': 4,
  django: 2.5,
  flask: 2,
  fastapi: 2.5,
  java: 3,
  'spring boot': 3.5,
  'c++': 4,
  'c#': 3,
  go: 3,
  rust: 4.5,
  graphql: 3,
  microservices: 4,
  serverless: 3.5,
  figma: 1.5,
  'rest api': 2,
  linux: 3,
  agile: 1.5,
  'generative ai': 3.5,
  'prompt engineering': 2,
  langchain: 3.5,
  openai: 2.5,
  cybersecurity: 4,
  blockchain: 4.5,
  solidity: 4,
  'react native': 3,
  flutter: 3,
  svelte: 2.5,
  sass: 1.5,
  'tailwind css': 1.5,
  bootstrap: 1,
  jest: 2,
  cypress: 2.5,
  selenium: 2.5,
  webpack: 3,
  communication: 1,
  leadership: 2,
  'problem solving': 1,
  teamwork: 1,
  'project management': 2,
};

// Precompute demand counts once at module load
const demandCache = new Map();
if (Array.isArray(jobs)) {
  for (const job of jobs) {
    if (job && Array.isArray(job.skills)) {
      const lowercaseSkills = new Set(job.skills.map((s) => s.toLowerCase()));
      for (const skill of lowercaseSkills) {
        demandCache.set(skill, (demandCache.get(skill) || 0) + 1);
      }
    }
  }
}

export const calculateDemand = (skill) => {
  const lowerSkill = skill.toLowerCase();
  const count = demandCache.get(lowerSkill) || 0;
  return parseFloat(((count / jobs.length) * 100).toFixed(1));
};

export const getDifficulty = (skill) => {
  return difficultyMap[skill.toLowerCase()] || 3;
};

export const calculateSkillROI = (skill) => {
  const demand = calculateDemand(skill);
  const difficulty = getDifficulty(skill);
  const salaryData = salaries[skill.toLowerCase()] || null;

  const salaryWeight = salaryData ? salaryData.avgSalary / 100000 : 1;
  const growthBonus = salaryData ? 1 + salaryData.growth / 100 : 1;

  const roi = parseFloat((((demand * salaryWeight * growthBonus) / difficulty) * 10).toFixed(1));

  // Generate Confidence Justification
  let confidenceReason = '';
  if (roi >= 50) {
    confidenceReason = `Extremely high ROI due to strong market demand (${demand}%) and ${salaryData?.growth > 15 ? 'rapid salary growth' : 'high average pay'}.`;
  } else if (roi >= 30) {
    confidenceReason = `Solid investment. Good balance of demand and achievable learning curve (Difficulty: ${difficulty}/5).`;
  } else if (demand > 40 && difficulty >= 4) {
    confidenceReason = `High demand (${demand}%), but tough to learn. Expect a longer time investment.`;
  } else {
    confidenceReason = `Lower priority. Lower market penetration or limited salary multiplier in current dataset.`;
  }

  // Get prerequisites
  const prereqs = dependencies[skill.toLowerCase()] || [];

  return {
    skill,
    roi,
    demand,
    difficulty,
    salary: salaryData,
    confidenceReason,
    prerequisites: prereqs,
  };
};

export const analyzeMarket = (skills) => {
  return skills.map((skill) => calculateSkillROI(skill)).sort((a, b) => b.roi - a.roi);
};
