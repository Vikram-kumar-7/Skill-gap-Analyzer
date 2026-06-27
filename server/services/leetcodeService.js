import axios from 'axios';
import { logStructured } from '../utils/logger.js';

const LEETCODE_API = 'https://leetcode-stats-api.herokuapp.com';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const cache = new Map();

/**
 * Fetch LeetCode stats for a username
 * Returns: { easy, medium, hard, total, acceptanceRate, ranking }
 */
export const fetchLeetCodeStats = async (username) => {
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid username provided');
  }

  const normalizedUsername = username.trim().toLowerCase();
  
  // Check cache
  const cached = cache.get(normalizedUsername);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logStructured('DSA_LEETCODE_CACHE_HIT', {
      username: normalizedUsername,
      age_ms: Date.now() - cached.timestamp,
    });
    return cached.data;
  }

  try {
    const response = await axios.get(`${LEETCODE_API}/${normalizedUsername}`, {
      timeout: 5000,
    });

    const stats = {
      easy: response.data.totalSolved?.easy || 0,
      medium: response.data.totalSolved?.medium || 0,
      hard: response.data.totalSolved?.hard || 0,
      total: response.data.totalSolved?.total || 0,
      acceptanceRate: response.data.acceptanceRate || 0,
      ranking: response.data.ranking || null,
      fetchedAt: new Date(),
    };

    // Cache the result
    cache.set(normalizedUsername, {
      data: stats,
      timestamp: Date.now(),
    });

    logStructured('DSA_LEETCODE_FETCH_SUCCESS', {
      username: normalizedUsername,
      stats,
    });

    return stats;
  } catch (error) {
    logStructured('DSA_LEETCODE_FETCH_ERROR', {
      username: normalizedUsername,
      error: error.message,
      status: error.response?.status,
    });
    throw new Error(`Failed to fetch LeetCode stats for ${normalizedUsername}: ${error.message}`);
  }
};

/**
 * Calculate DSA score using logarithmic scaling
 * Formula: log(easy+1)*10 + log(medium+1)*25 + log(hard+1)*40
 */
export const calculateScore = (easy, medium, hard) => {
  const rawScore =
    Math.log(easy + 1) * 10 +
    Math.log(medium + 1) * 25 +
    Math.log(hard + 1) * 40;

  const maxScore =
    Math.log(501) * 10 +
    Math.log(301) * 25 +
    Math.log(151) * 40;

  const normalizedScore = (rawScore / maxScore) * 100;
  return Math.min(100, Math.max(0, normalizedScore));
};

/**
 * Determine tier based on score
 */
export const getTier = (score) => {
  if (score <= 30) return 'Beginner';
  if (score <= 50) return 'Internship-ready';
  if (score <= 65) return 'Startup SDE-1';
  if (score <= 80) return 'Product company ready';
  if (score <= 90) return 'FAANG interviews';
  return 'Competitive level';
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
export const generateSuggestions = (easy, medium, hard, targetScore = 70) => {
  const currentScore = calculateScore(easy, medium, hard);
  
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
  
  // Estimate how many problems needed
  const mediumImpact = Math.log(medium + 11) * 25 - Math.log(medium + 1) * 25;
  const hardImpact = Math.log(hard + 6) * 40 - Math.log(hard + 1) * 40;
  
  const problemsNeeded = Math.ceil(scoreGap / Math.max(mediumImpact, 0.5));

  // Primary suggestion: solve more mediums (sweet spot)
  suggestions.push({
    type: 'medium',
    count: Math.ceil(problemsNeeded * 0.7),
    topics: ['Trees', 'Dynamic Programming', 'Graphs'],
    impact: Math.round(scoreGap * 0.7),
  });

  // Secondary suggestion: hard problems for bigger gains
  if (scoreGap > 15) {
    suggestions.push({
      type: 'hard',
      count: Math.ceil(problemsNeeded * 0.3),
      topics: ['Advanced DP', 'System Design', 'Binary Search'],
      impact: Math.round(scoreGap * 0.3),
    });
  }

  return {
    status: 'gap_exists',
    currentScore: Math.round(currentScore),
    targetScore,
    gap: Math.round(scoreGap),
    suggestions,
  };
};

/**
 * Get streak data from cached history
 */
export const getProgressDelta = (currentData, previousData) => {
  if (!previousData) {
    return {
      easy: currentData.easy,
      medium: currentData.medium,
      hard: currentData.hard,
      total: currentData.total,
      scoreDelta: 0,
      trend: 'up',
    };
  }

  const prevScore = calculateScore(previousData.easy, previousData.medium, previousData.hard);
  const currentScore = calculateScore(currentData.easy, currentData.medium, currentData.hard);
  const scoreDelta = currentScore - prevScore;

  return {
    easy: currentData.easy - previousData.easy,
    medium: currentData.medium - previousData.medium,
    hard: currentData.hard - previousData.hard,
    total: currentData.total - previousData.total,
    scoreDelta: Math.round(scoreDelta * 100) / 100,
    trend: scoreDelta >= 0 ? 'up' : 'down',
  };
};
