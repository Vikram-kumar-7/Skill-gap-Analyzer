/**
 * Compare resume skills against job description skills.
 * @param {Array<{skill: string, frequency: number}>} resumeSkillsObj
 * @param {Array<{skill: string, frequency: number}>} jobSkillsObj
 * @returns {{ missing: string[], matched: string[], matchPercentage: number }}
 */
export const compareSkills = (resumeSkillsObj, jobSkillsObj) => {
  const resumeSkills = resumeSkillsObj.map(s => s.skill);
  const jobSkills = jobSkillsObj.map(s => s.skill);

  const normalizedResume = resumeSkills.map((s) => s.toLowerCase());
  const normalizedJob = jobSkills.map((s) => s.toLowerCase());

  const missing = jobSkills.filter(
    (skill) => !normalizedResume.includes(skill.toLowerCase())
  );

  const matched = jobSkills.filter((skill) =>
    normalizedResume.includes(skill.toLowerCase())
  );

  const matchPercentage =
    jobSkills.length > 0
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;

  return { missing, matched, matchPercentage };
};
