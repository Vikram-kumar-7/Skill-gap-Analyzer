import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const skills = JSON.parse(readFileSync(join(__dirname, '../data/skills.json'), 'utf-8'));

const aliases = JSON.parse(readFileSync(join(__dirname, '../data/aliases.json'), 'utf-8'));

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Precompile skill names and aliases into combined regex patterns at module load
const compiledSkills = skills.map((skill) => {
  const lowerSkill = skill.toLowerCase();
  const skillAliases = aliases[lowerSkill] || [];
  const searchTerms = [lowerSkill, ...skillAliases];

  // Combine skill name and its aliases into a single regex with word boundaries
  // Example: \b(?:react|reactjs|react\.js)\b
  const escapedTerms = searchTerms.map(escapeRegex);
  const regex = new RegExp(`\\b(?:${escapedTerms.join('|')})\\b`, 'gi');

  // Precompile context regex
  const contextRegex = new RegExp(
    `(?:experience with|using|expert in|proficient in|built with)\\s+(?:\\w+\\s+){0,3}\\b${escapeRegex(lowerSkill)}\\b`,
    'i'
  );

  return { skill, regex, contextRegex };
});

/**
 * Extract known skills from text with alias mapping and frequency scoring.
 * @param {string} text - Raw text to extract skills from
 * @returns {Array} - Array of { skill: string, frequency: number }
 */
export const extractSkills = (text) => {
  if (!text || typeof text !== 'string') return [];

  const foundSkillsMap = new Map();

  for (const { skill, regex, contextRegex } of compiledSkills) {
    let frequency = 0;

    const matches = text.match(regex);
    if (matches) {
      frequency += matches.length;
    }

    if (frequency > 0) {
      if (contextRegex.test(text)) {
        frequency += 2; // Context bonus weight
      }
      foundSkillsMap.set(skill, frequency);
    }
  }

  return Array.from(foundSkillsMap.entries()).map(([skill, frequency]) => ({
    skill,
    frequency,
  }));
};
