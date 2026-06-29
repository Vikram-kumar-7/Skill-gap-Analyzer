import { API_BASE_URL } from '../services/api';

/**
 * Frontend DSA API client
 * Fixes double '/api/api' path duplication
 */

export const dsaAPI = {
  /**
   * Fetch LeetCode stats from our backend
   */
  fetchLeetCodeStats: async (username) => {
    const response = await fetch(`${API_BASE_URL}/dsa/leetcode/${username}`);
    if (!response.ok) throw new Error('Failed to fetch LeetCode stats');
    return response.json();
  },

  /**
   * Save DSA score
   */
  saveDSAScore: async (userId, scoreData) => {
    const response = await fetch(`${API_BASE_URL}/dsa/score/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...scoreData }),
    });
    if (!response.ok) throw new Error('Failed to save DSA score');
    return response.json();
  },

  /**
   * Get current DSA score
   */
  getDSAScore: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/dsa/score/${userId}`);
    if (!response.ok) throw new Error('Failed to get DSA score');
    return response.json();
  },

  /**
   * Get DSA score history
   */
  getScoreHistory: async (userId, limit = 30) => {
    const response = await fetch(`${API_BASE_URL}/dsa/history/${userId}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get score history');
    return response.json();
  },

  /**
   * Save LeetCode username for auto-sync
   */
  saveLeetcodeUsername: async (userId, leetcodeUsername) => {
    const response = await fetch(`${API_BASE_URL}/dsa/leetcode-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, leetcodeUsername }),
    });
    if (!response.ok) throw new Error('Failed to save LeetCode username');
    return response.json();
  },

  /**
   * Generate AI roadmap
   */
  generateRoadmap: async (userId, scoreData, targetGoal) => {
    const response = await fetch(`${API_BASE_URL}/dsa/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        easy: scoreData.easy,
        medium: scoreData.medium,
        hard: scoreData.hard,
        score: scoreData.score,
        weak_topics: scoreData.weak_topics || [],
        targetGoal: targetGoal || 'FAANG in 3 months',
      }),
    });
    if (!response.ok) throw new Error('Failed to generate roadmap');
    return response.json();
  },

  /**
   * Import GFG stats manually
   */
  importGFGStats: async (userId, username, stats) => {
    const response = await fetch(`${API_BASE_URL}/dsa/gfg/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        username,
        gfg_username: username,
        easy: stats.easy,
        medium: stats.medium,
        hard: stats.hard,
      }),
    });
    if (!response.ok) throw new Error('Failed to import GFG stats');
    return response.json();
  },
};
