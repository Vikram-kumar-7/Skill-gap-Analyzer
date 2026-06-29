import axios from 'axios';
import { logStructured } from '../utils/logger.js';

const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const cache = new Map();

/**
 * Query the official LeetCode GraphQL API directly
 */
const queryGraphQL = async (username) => {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
        }
      }
    }
  `;

  const { data } = await axios.post(
    'https://leetcode.com/graphql',
    { query, variables: { username } },
    {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    }
  );

  const statsList = data?.data?.matchedUser?.submitStats?.acSubmissionNum;
  if (!statsList) {
    throw new Error(`User "${username}" not found via GraphQL`);
  }

  const easySolved = statsList.find(s => s.difficulty === 'Easy')?.count || 0;
  const mediumSolved = statsList.find(s => s.difficulty === 'Medium')?.count || 0;
  const hardSolved = statsList.find(s => s.difficulty === 'Hard')?.count || 0;
  const totalSolved = statsList.find(s => s.difficulty === 'All')?.count || 0;
  const ranking = data?.data?.matchedUser?.profile?.ranking || null;

  return {
    easy: easySolved,
    medium: mediumSolved,
    hard: hardSolved,
    total: totalSolved,
    acceptanceRate: 50.0,
    ranking,
    fetchedAt: new Date(),
  };
};

/**
 * Query LeetCode stats via fallback REST APIs
 */
const queryFallbackAPIs = async (username) => {
  try {
    // 1. Try tashif API
    const response = await axios.get(`https://leetcode-stats.tashif.codes/${username}`, {
      timeout: 8000,
    });
    if (response.data && response.data.status === 'success') {
      return {
        easy: response.data.easySolved || 0,
        medium: response.data.mediumSolved || 0,
        hard: response.data.hardSolved || 0,
        total: response.data.totalSolved || 0,
        acceptanceRate: response.data.acceptanceRate || 50.0,
        ranking: response.data.ranking || null,
        fetchedAt: new Date(),
      };
    }
    throw new Error('Tashif API returned unsuccessful status');
  } catch (tashifErr) {
    logStructured('DSA_LEETCODE_TASHIF_FAILED', { username, error: tashifErr.message });
    // 2. Try Heroku proxy API
    const response2 = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`, {
      timeout: 6000,
    });
    
    // Check if the response2 is valid (some APIs return stats directly, some put inside totalSolved)
    const resData = response2.data;
    if (resData) {
      return {
        easy: resData.totalSolved?.easy || resData.easySolved || 0,
        medium: resData.totalSolved?.medium || resData.mediumSolved || 0,
        hard: resData.totalSolved?.hard || resData.hardSolved || 0,
        total: resData.totalSolved?.total || resData.totalSolved || 0,
        acceptanceRate: resData.acceptanceRate || 50.0,
        ranking: resData.ranking || null,
        fetchedAt: new Date(),
      };
    }
    throw new Error('Heroku API returned empty data');
  }
};

/**
 * Fetch LeetCode stats for a username
 * Returns: { easy, medium, hard, total, acceptanceRate, ranking }
 */
export const fetchLeetCodeStats = async (username) => {
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid username provided');
  }

  const normalizedUsername = username.trim();
  const cacheKey = normalizedUsername.toLowerCase();
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logStructured('DSA_LEETCODE_CACHE_HIT', {
      username: cacheKey,
      age_ms: Date.now() - cached.timestamp,
    });
    return cached.data;
  }

  try {
    // Try GraphQL (Primary)
    const stats = await queryGraphQL(normalizedUsername);

    // Cache the result
    cache.set(cacheKey, {
      data: stats,
      timestamp: Date.now(),
    });

    logStructured('DSA_LEETCODE_FETCH_SUCCESS', {
      username: cacheKey,
      source: 'graphql',
      stats,
    });

    return stats;
  } catch (gqlError) {
    logStructured('DSA_LEETCODE_GQL_FAILED', { username: cacheKey, error: gqlError.message });

    try {
      // Try Fallback APIs (Secondary)
      const stats = await queryFallbackAPIs(normalizedUsername);

      // Cache the result
      cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now(),
      });

      logStructured('DSA_LEETCODE_FETCH_SUCCESS', {
        username: cacheKey,
        source: 'rest_fallback',
        stats,
      });

      return stats;
    } catch (fallbackError) {
      logStructured('DSA_LEETCODE_FETCH_ERROR', {
        username: cacheKey,
        error: fallbackError.message,
      });

      const allowMock = process.env.ALLOW_MOCK_FALLBACK === 'true';
      if (allowMock) {
        console.warn(`⚠️ LeetCode API call failed for ${cacheKey}: ${fallbackError.message}. Generating heuristic mock LeetCode stats.`);
        return {
          easy: 65,
          medium: 48,
          hard: 12,
          total: 125,
          acceptanceRate: 48.6,
          ranking: 98500,
          fetchedAt: new Date(),
        };
      }

      throw new Error(`Failed to fetch LeetCode stats for ${normalizedUsername}: ${fallbackError.message}`);
    }
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
