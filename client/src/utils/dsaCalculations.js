/**
 * DSA Scoring and Calculation Utilities
 */

/**
 * Calculate DSA score using logarithmic scaling
 * Formula: log(easy+1)*10 + log(medium+1)*25 + log(hard+1)*40
 * This models realistic diminishing returns after 200+ problems
 */
export const calculateDSAScore = (easy, medium, hard) => {
  const rawScore =
    Math.log(easy + 1) * 10 +
    Math.log(medium + 1) * 25 +
    Math.log(hard + 1) * 40;

  const maxScore =
    Math.log(501) * 10 +
    Math.log(301) * 25 +
    Math.log(151) * 40;

  return Math.min(100, parseFloat(((rawScore / maxScore) * 100).toFixed(1)));
};

/**
 * Get tier based on score
 */
export const getDSATier = (score) => {
  if (score <= 30) return 'Beginner';
  if (score <= 50) return 'Internship-ready';
  if (score <= 65) return 'Startup SDE-1';
  if (score <= 80) return 'Product company ready';
  if (score <= 90) return 'FAANG interviews';
  return 'Competitive level';
};

/**
 * Get tier color
 */
export const getTierColor = (tier) => {
  const colors = {
    'Beginner': '#ef4444',
    'Internship-ready': '#f97316',
    'Startup SDE-1': '#eab308',
    'Product company ready': '#84cc16',
    'FAANG interviews': '#22c55e',
    'Competitive level': '#06b6d4',
  };
  return colors[tier] || '#10b981';
};

/**
 * Calculate score breakdown percentages
 */
export const getScoreBreakdown = (easy, medium, hard) => {
  const easyScore = Math.log(easy + 1) * 10;
  const mediumScore = Math.log(medium + 1) * 25;
  const hardScore = Math.log(hard + 1) * 40;
  const total = easyScore + mediumScore + hardScore;

  if (total === 0) {
    return { easy: 0, medium: 0, hard: 0 };
  }

  return {
    easy: Math.round((easyScore / total) * 100),
    medium: Math.round((mediumScore / total) * 100),
    hard: Math.round((hardScore / total) * 100),
  };
};

/**
 * Generate actionability suggestions
 */
export const generateActionableSuggestions = (
  easy,
  medium,
  hard,
  targetScore = 70
) => {
  const currentScore = calculateDSAScore(easy, medium, hard);

  if (currentScore >= targetScore) {
    return {
      status: 'milestone_reached',
      message: `🎉 Congratulations! You've reached your target score of ${targetScore}!`,
      nextMilestone: Math.min(100, targetScore + 10),
      suggestions: [],
    };
  }

  const suggestions = [];
  const scoreGap = targetScore - currentScore;

  // Calculate impact per problem
  const mediumImpact =
    Math.log(medium + 11) * 25 - Math.log(medium + 1) * 25;
  const hardImpact = Math.log(hard + 6) * 40 - Math.log(hard + 1) * 40;

  const problemsNeeded = Math.ceil(
    scoreGap / Math.max(mediumImpact, 0.5)
  );

  // Primary suggestion: solve more mediums (sweet spot)
  suggestions.push({
    type: 'medium',
    count: Math.ceil(problemsNeeded * 0.7),
    topics: ['Trees', 'Dynamic Programming', 'Graphs', 'Sliding Window'],
    impact: Math.round(scoreGap * 0.7),
    description: `Solve ${Math.ceil(problemsNeeded * 0.7)} more Medium problems to gain ~${Math.round(scoreGap * 0.7)} points`,
  });

  // Secondary suggestion: hard problems for bigger gains
  if (scoreGap > 15) {
    suggestions.push({
      type: 'hard',
      count: Math.ceil(problemsNeeded * 0.3),
      topics: ['Advanced DP', 'Binary Indexed Tree', 'Segment Trees'],
      impact: Math.round(scoreGap * 0.3),
      description: `Solve ${Math.ceil(problemsNeeded * 0.3)} Hard problems to gain ~${Math.round(scoreGap * 0.3)} points`,
    });
  }

  return {
    status: 'gap_exists',
    currentScore: Math.round(currentScore * 100) / 100,
    targetScore,
    gap: Math.round(scoreGap * 100) / 100,
    totalProblems: easy + medium + hard,
    suggestions,
  };
};

/**
 * Format score with appropriate color coding
 */
export const formatScoreWithStyle = (score) => {
  let color = '#ef4444'; // red
  if (score > 30) color = '#f97316'; // orange
  if (score > 50) color = '#eab308'; // yellow
  if (score > 65) color = '#84cc16'; // lime
  if (score > 80) color = '#22c55e'; // green
  if (score > 90) color = '#06b6d4'; // cyan

  return {
    score: Math.round(score * 100) / 100,
    color,
    percentage: Math.round(Math.min(100, score)),
  };
};

/**
 * Get achievement badge based on stats
 */
export const getAchievements = (easy, medium, hard) => {
  const achievements = [];

  if (easy >= 50) achievements.push({ emoji: '⚡', label: 'Speed Demon', desc: 'Solved 50+ Easy problems' });
  if (medium >= 50) achievements.push({ emoji: '🎯', label: 'Medium Master', desc: 'Solved 50+ Medium problems' });
  if (hard >= 30) achievements.push({ emoji: '💎', label: 'Hard Mode', desc: 'Solved 30+ Hard problems' });
  if (easy + medium + hard >= 200) achievements.push({ emoji: '🚀', label: 'Legend', desc: 'Solved 200+ problems total' });
  if (easy + medium + hard >= 500) achievements.push({ emoji: '👑', label: 'Elite', desc: 'Solved 500+ problems total' });

  return achievements;
};

/**
 * Estimate days to reach target score
 */
export const estimateDaysToTarget = (currentScore, targetScore, problemsPerDay = 2) => {
  if (currentScore >= targetScore) return 0;

  const easyProblemsNeeded = Math.max(0, Math.ceil((targetScore - currentScore) / 5));
  const totalProblems = easyProblemsNeeded;

  return Math.ceil(totalProblems / problemsPerDay);
};

/**
 * Get benchmark tier descriptions
 */
export const BENCHMARK_TIERS = [
  {
    name: 'Beginner',
    score: '0–30',
    description: 'Just starting your DSA journey',
    color: '#ef4444',
    icon: '📚',
  },
  {
    name: 'Internship-ready',
    score: '31–50',
    description: 'Ready for internship roles',
    color: '#f97316',
    icon: '🎓',
  },
  {
    name: 'Startup SDE-1',
    score: '51–65',
    description: 'Ready for startup/mid-level positions',
    color: '#eab308',
    icon: '🚀',
  },
  {
    name: 'Product company ready',
    score: '66–80',
    description: 'Competitive for product companies',
    color: '#84cc16',
    icon: '🎯',
  },
  {
    name: 'FAANG interviews',
    score: '81–90',
    description: 'Well-prepared for FAANG interviews',
    color: '#22c55e',
    icon: '✨',
  },
  {
    name: 'Competitive level',
    score: '91–100',
    description: 'Elite competitive programmer',
    color: '#06b6d4',
    icon: '👑',
  },
];
