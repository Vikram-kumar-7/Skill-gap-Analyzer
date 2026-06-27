import express from 'express';
import { fetchLeetCodeStats, calculateScore, getTier, getScoreBreakdown, generateSuggestions, getProgressDelta } from '../services/leetcodeService.js';
import { generateDSARoadmap, getCachedRoadmap, cacheRoadmap } from '../services/aiRoadmapService.js';
import { fetchGFGStats, importGFGStats } from '../services/gfgService.js';
import { saveDSAScore, getDSAScore, getDSAScoreHistory, saveLeetcodeUsername } from '../utils/db.js';
import { logStructured } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/dsa/leetcode/:username
 * Fetch and return LeetCode stats for a user
 */
router.get('/leetcode/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const stats = await fetchLeetCodeStats(username);
    
    const score = calculateScore(stats.easy, stats.medium, stats.hard);
    const tier = getTier(score);
    const breakdown = getScoreBreakdown(stats.easy, stats.medium, stats.hard);
    const suggestions = generateSuggestions(stats.easy, stats.medium, stats.hard);

    res.json({
      success: true,
      data: {
        username,
        stats,
        score: Math.round(score * 100) / 100,
        tier,
        breakdown,
        suggestions,
      },
    });
  } catch (error) {
    logStructured('DSA_LEETCODE_ROUTE_ERROR', {
      username: req.params.username,
      error: error.message,
    });
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/dsa/gfg/:username
 * Fetch GeeksforGeeks stats (placeholder - returns unavailable)
 */
router.get('/gfg/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const stats = await fetchGFGStats(username);
    
    res.json({
      success: true,
      data: {
        username,
        stats,
        note: 'GeeksforGeeks does not have a public API. Please use LeetCode or manually import stats.',
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/dsa/score/save
 * Save DSA score to database
 * Body: { userId, username, easy, medium, hard }
 */
router.post('/score/save', async (req, res) => {
  try {
    const { userId, username, easy, medium, hard, source = 'leetcode' } = req.body;

    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        error: 'userId and username are required',
      });
    }

    const score = calculateScore(easy, medium, hard);
    const tier = getTier(score);
    const breakdown = getScoreBreakdown(easy, medium, hard);

    const scoreData = {
      userId,
      username,
      easy,
      medium,
      hard,
      score,
      tier,
      scoreBreakdown: breakdown,
      source,
    };

    await saveDSAScore(userId, scoreData);

    logStructured('DSA_SCORE_SAVED', {
      userId,
      username,
      score,
      tier,
    });

    res.json({
      success: true,
      data: {
        score: Math.round(score * 100) / 100,
        tier,
        breakdown,
      },
    });
  } catch (error) {
    logStructured('DSA_SCORE_SAVE_ERROR', {
      userId: req.body.userId,
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/dsa/score/:userId
 * Get latest DSA score for a user
 */
router.get('/score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const scoreData = await getDSAScore(userId);

    if (!scoreData) {
      return res.json({
        success: true,
        data: null,
        message: 'No score found. Start by syncing your LeetCode account.',
      });
    }

    res.json({
      success: true,
      data: scoreData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/dsa/history/:userId
 * Get DSA score history for a user (last 30 records)
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30 } = req.query;

    const history = await getDSAScoreHistory(userId, parseInt(limit));

    if (history.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No history found.',
      });
    }

    // Calculate weekly deltas
    const withDeltas = history.map((current, index) => {
      const previous = history[index + 1] || null;
      const delta = getProgressDelta(current, previous);
      return {
        ...current,
        delta,
      };
    });

    res.json({
      success: true,
      data: withDeltas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/dsa/leetcode-username
 * Save LeetCode username for a user
 * Body: { userId, leetcodeUsername }
 */
router.post('/leetcode-username', async (req, res) => {
  try {
    const { userId, leetcodeUsername } = req.body;

    if (!userId || !leetcodeUsername) {
      return res.status(400).json({
        success: false,
        error: 'userId and leetcodeUsername are required',
      });
    }

    // Verify the username exists
    await fetchLeetCodeStats(leetcodeUsername);

    await saveLeetcodeUsername(userId, leetcodeUsername);

    logStructured('LEETCODE_USERNAME_SAVED', {
      userId,
      leetcodeUsername: leetcodeUsername.toLowerCase(),
    });

    res.json({
      success: true,
      message: 'LeetCode username saved successfully',
    });
  } catch (error) {
    logStructured('LEETCODE_USERNAME_ERROR', {
      userId: req.body.userId,
      error: error.message,
    });
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/dsa/roadmap/generate
 * Generate AI roadmap based on user's current stats
 * Body: { userId, easy, medium, hard, score, weak_topics, targetGoal }
 */
router.post('/roadmap/generate', async (req, res) => {
  try {
    const { userId, easy, medium, hard, score, weak_topics = [], targetGoal = 'FAANG in 3 months' } = req.body;

    if (!userId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId and score are required',
      });
    }

    // Check cache first
    const cached = getCachedRoadmap(userId);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Generate new roadmap
    const roadmap = await generateDSARoadmap(
      { easy, medium, hard, currentScore: score, weak_topics, userId },
      targetGoal
    );

    // Cache the result
    cacheRoadmap(userId, roadmap);

    logStructured('DSA_ROADMAP_GENERATED', {
      userId,
      score,
      targetGoal,
    });

    res.json({
      success: true,
      data: roadmap,
      cached: false,
    });
  } catch (error) {
    logStructured('DSA_ROADMAP_ERROR', {
      userId: req.body.userId,
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/dsa/gfg/import
 * Manually import GeeksforGeeks stats
 * Body: { userId, username, easy, medium, hard }
 */
router.post('/gfg/import', async (req, res) => {
  try {
    const { userId, username, gfg_username, easy, medium, hard } = req.body;

    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        error: 'userId and username are required',
      });
    }

    const stats = await importGFGStats(gfg_username || username, { easy, medium, hard });
    const score = calculateScore(stats.easy, stats.medium, stats.hard);
    const tier = getTier(score);
    const breakdown = getScoreBreakdown(stats.easy, stats.medium, stats.hard);

    const scoreData = {
      userId,
      username,
      easy: stats.easy,
      medium: stats.medium,
      hard: stats.hard,
      score,
      tier,
      scoreBreakdown: breakdown,
      source: 'gfg',
    };

    await saveDSAScore(userId, scoreData);

    res.json({
      success: true,
      data: {
        score: Math.round(score * 100) / 100,
        tier,
        breakdown,
        stats,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
