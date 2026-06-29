import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const aliases = JSON.parse(readFileSync(join(__dirname, '../data/aliases.json'), 'utf-8'));

export const SKILL_GROUPS = aliases;

const ALIAS_TO_CANONICAL = {};
for (const [canonical, aliasList] of Object.entries(aliases)) {
  ALIAS_TO_CANONICAL[canonical.toLowerCase()] = canonical.toLowerCase();
  for (const alias of aliasList) {
    ALIAS_TO_CANONICAL[alias.toLowerCase()] = canonical.toLowerCase();
  }
}

export function normalizeSkill(skill) {
  if (!skill) return '';
  const lower = skill.toLowerCase().trim();
  return ALIAS_TO_CANONICAL[lower] || lower;
}

export function normalizeSkills(skills = []) {
  return [...new Set(skills.map(normalizeSkill).filter(Boolean))];
}

export function findGaps(resumeSkills = [], jdSkills = []) {
  const normalizedResume = normalizeSkills(resumeSkills);
  return normalizeSkills(jdSkills).filter(s => !normalizedResume.includes(s));
}

export function findMatches(resumeSkills = [], jdSkills = []) {
  const normalizedResume = normalizeSkills(resumeSkills);
  return normalizeSkills(jdSkills).filter(s => normalizedResume.includes(s));
}

export function matchScore(resumeSkills = [], jdSkills = []) {
  if (!jdSkills.length) return 0;
  const matches = findMatches(resumeSkills, jdSkills);
  return Math.round((matches.length / normalizeSkills(jdSkills).length) * 100);
}
