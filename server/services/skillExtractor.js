import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const skills = JSON.parse(
  readFileSync(join(__dirname, "../data/skills.json"), "utf-8")
);

const aliases = JSON.parse(
  readFileSync(join(__dirname, "../data/aliases.json"), "utf-8")
);

/**
 * Extract known skills from text with alias mapping and frequency scoring.
 * @param {string} text - Raw text to extract skills from
 * @returns {Array} - Array of { skill: string, frequency: number }
 */
export const extractSkills = (text) => {
  if (!text || typeof text !== "string") return [];

  const lowerText = text.toLowerCase();
  const foundSkillsMap = new Map();

  for (const skill of skills) {
    const lowerSkill = skill.toLowerCase();
    const skillAliases = aliases[lowerSkill] || [];
    const searchTerms = [lowerSkill, ...skillAliases];
    
    let frequency = 0;

    for (const term of searchTerms) {
      // Use word boundaries for all terms to improve accuracy
      const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        frequency += matches.length;
      }
    }

    // Context weight heuristic (bonus if near words like 'experience', 'using', 'expert')
    if (frequency > 0) {
      const contextRegex = new RegExp(`(?:experience with|using|expert in|proficient in|built with)\\s+(?:\\w+\\s+){0,3}\\b${escapeRegex(lowerSkill)}\\b`, "i");
      if (contextRegex.test(lowerText)) {
        frequency += 2; // Context bonus weight
      }
      foundSkillsMap.set(skill, frequency);
    }
  }

  return Array.from(foundSkillsMap.entries()).map(([skill, frequency]) => ({
    skill,
    frequency
  }));
};

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
