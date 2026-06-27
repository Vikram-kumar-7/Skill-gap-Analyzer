/**
 * DSA Storage utilities - localStorage management for offline-first DSA tracking
 */

const STORAGE_KEYS = {
  DSA_SCORE: 'dsa_score',
  DSA_HISTORY: 'dsa_history',
  LEETCODE_USERNAME: 'dsa_leetcode_username',
  LAST_SYNC: 'dsa_last_sync',
};

export const dsaStorage = {
  /**
   * Save current DSA score
   */
  saveScore: (scoreData) => {
    try {
      const payload = {
        ...scoreData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DSA_SCORE, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Failed to save DSA score:', error);
      return false;
    }
  },

  /**
   * Get current DSA score from localStorage
   */
  getScore: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DSA_SCORE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get DSA score:', error);
      return null;
    }
  },

  /**
   * Add score to history (keeps last 30)
   */
  addToHistory: (scoreData) => {
    try {
      const history = dsaStorage.getHistory();
      const newEntry = {
        ...scoreData,
        savedAt: new Date().toISOString(),
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 30);
      localStorage.setItem(STORAGE_KEYS.DSA_HISTORY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Failed to add to history:', error);
      return false;
    }
  },

  /**
   * Get DSA score history
   */
  getHistory: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DSA_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get DSA history:', error);
      return [];
    }
  },

  /**
   * Clear history
   */
  clearHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DSA_HISTORY);
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  },

  /**
   * Save LeetCode username
   */
  saveLeetcodeUsername: (username) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEETCODE_USERNAME, username);
      return true;
    } catch (error) {
      console.error('Failed to save LeetCode username:', error);
      return false;
    }
  },

  /**
   * Get saved LeetCode username
   */
  getLeetcodeUsername: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LEETCODE_USERNAME) || '';
    } catch (error) {
      console.error('Failed to get LeetCode username:', error);
      return '';
    }
  },

  /**
   * Update last sync timestamp
   */
  setLastSync: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to set last sync:', error);
      return false;
    }
  },

  /**
   * Get last sync timestamp
   */
  getLastSync: () => {
    try {
      const sync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return sync ? new Date(sync) : null;
    } catch (error) {
      console.error('Failed to get last sync:', error);
      return null;
    }
  },

  /**
   * Get weekly delta (compares last score with one from a week ago)
   */
  getWeeklyDelta: () => {
    try {
      const history = dsaStorage.getHistory();
      if (history.length < 2) return null;

      const current = history[0];
      const weekAgo = history.find((entry) => {
        const diff = new Date(current.savedAt) - new Date(entry.savedAt);
        const daysAgo = diff / (1000 * 60 * 60 * 24);
        return daysAgo >= 7 && daysAgo <= 14;
      });

      if (!weekAgo) return null;

      return {
        currentScore: current.score,
        previousScore: weekAgo.score,
        delta: current.score - weekAgo.score,
        percentChange: Math.round(((current.score - weekAgo.score) / weekAgo.score) * 100),
        daysAgo: Math.round((new Date(current.savedAt) - new Date(weekAgo.savedAt)) / (1000 * 60 * 60 * 24)),
      };
    } catch (error) {
      console.error('Failed to calculate weekly delta:', error);
      return null;
    }
  },

  /**
   * Clear all DSA data
   */
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear DSA storage:', error);
      return false;
    }
  },
};
