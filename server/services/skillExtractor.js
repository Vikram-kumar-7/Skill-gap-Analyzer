import { SKILL_GROUPS } from '../utils/skillAliases.js';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Precompile regex per canonical skill from SKILL_GROUPS
const compiledSkills = Object.entries(SKILL_GROUPS).map(([canonical, aliases]) => {
  const escapedTerms = aliases.map(escapeRegex);
  const regex = new RegExp(`\\b(?:${escapedTerms.join('|')})\\b`, 'gi');
  return { skill: canonical, regex };
});

/**
 * Extract known skills from text using the master SKILL_GROUPS alias map.
 * Returns canonical keys directly — no skills.json dependency.
 * @param {string} text - Raw text to extract skills from
 * @returns {Array} - Array of { skill: string, frequency: number }
 */
export const extractSkills = (text) => {
  if (!text || typeof text !== 'string') return [];

  const found = new Map();

  for (const { skill, regex } of compiledSkills) {
    const matches = text.match(regex);
    if (matches) {
      found.set(skill, matches.length);
    }
  }

  return Array.from(found.entries()).map(([skill, frequency]) => ({ skill, frequency }));
};
