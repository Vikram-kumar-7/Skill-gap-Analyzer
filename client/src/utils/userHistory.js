// ============================================================
// src/utils/userHistory.js
// Tracks interview practice history per skill/topic.
// Builds a rich context string that can be injected into any
// AI prompt to give personalised, history-aware feedback.
//
// Storage key: 'skillgap_history'
// ============================================================

const KEY = 'skillgap_history';

function defaults() {
  return { topics: {}, mistakes: {}, projects: [], sessions: [] };
}

export const HistoryService = {
  // ── Read ──────────────────────────────────────────────────
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || defaults();
    } catch {
      return defaults();
    }
  },

  // ── Write helpers ─────────────────────────────────────────
  save(h) {
    localStorage.setItem(KEY, JSON.stringify(h));
  },

  /**
   * Record a practice attempt for a topic.
   * @param {string}   topic         - e.g. "React", "JavaScript"
   * @param {number}   score         - 0-100 self-assessed score
   * @param {string[]} missingPoints - concepts the user marked as weak
   */
  recordAnswer(topic, score, missingPoints = []) {
    const h = this.get();

    // Rolling topic scores
    if (!h.topics[topic]) h.topics[topic] = { attempts: 0, scores: [] };
    h.topics[topic].attempts++;
    h.topics[topic].scores.push(score);
    // Keep at most 20 scores per topic to stay storage-lean
    if (h.topics[topic].scores.length > 20) h.topics[topic].scores.shift();

    // Count repeated mistake keywords
    missingPoints.forEach(p => {
      h.mistakes[p] = (h.mistakes[p] || 0) + 1;
    });

    // Prepend session entry, cap at 50
    h.sessions.unshift({
      topic,
      score,
      missingPoints,
      date: Date.now(),
    });
    if (h.sessions.length > 50) h.sessions.length = 50;

    this.save(h);
  },

  /**
   * Record a project the user has built (synced from ProjectsPage).
   * @param {string}   name   - Project title
   * @param {string[]} skills - Tech stack / skills used
   */
  recordProject(name, skills = []) {
    const h = this.get();
    h.projects.push({ name, skills, date: Date.now() });
    // Keep most recent 20
    if (h.projects.length > 20) h.projects.shift();
    this.save(h);
  },

  /**
   * Clear all history (useful for a "reset" button in Settings).
   */
  clear() {
    localStorage.removeItem(KEY);
  },

  // ── Analytics helpers ─────────────────────────────────────

  /**
   * Returns all topics with their computed average score.
   * Sorted worst → best.
   */
  getTopicStats() {
    const h = this.get();
    return Object.entries(h.topics)
      .map(([topic, v]) => {
        const avg = v.scores.length
          ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length)
          : 0;
        const trend = v.scores.slice(-3); // last 3 scores
        const direction =
          trend.length < 2 ? 'stable'
          : trend[trend.length - 1] > trend[0] ? 'improving'
          : trend[trend.length - 1] < trend[0] ? 'declining'
          : 'stable';
        return { topic, avg, attempts: v.attempts, trend, direction };
      })
      .sort((a, b) => a.avg - b.avg);
  },

  /**
   * Returns mistake phrases that appear 3+ times, worst-first.
   */
  getChronicGaps() {
    const h = this.get();
    return Object.entries(h.mistakes)
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase, count]) => ({ phrase, count }));
  },

  /**
   * Returns recent sessions (last N).
   */
  getRecentSessions(n = 10) {
    return this.get().sessions.slice(0, n);
  },

  // ── THE KEY FUNCTION ──────────────────────────────────────
  /**
   * Builds a compact context block for AI prompts.
   * Inject at the top of any LLM prompt for personalised feedback.
   *
   * @param {string} currentTopic - The skill/topic being evaluated now
   * @returns {string} - Ready-to-inject context string, or '' if no history
   *
   * Example output injected into a prompt:
   * [DEVELOPER HISTORY]
   * WEAK AREAS: React (avg 48%, 5 attempts, trend: 41→45→52)
   * THIS TOPIC: tried 5x, scores: 41 → 45 → 52 → 48 → 51
   * CHRONIC GAPS (mention explicitly if repeated): "missing cleanup function" (4x)
   * BUILT: Todo App, Weather Dashboard
   * [/DEVELOPER HISTORY]
   */
  buildContext(currentTopic) {
    const h = this.get();
    const lines = [];

    // Weak topics (avg score < 70%)
    const stats = this.getTopicStats();
    const weak = stats.filter(t => t.avg < 70);

    if (weak.length) {
      lines.push(
        `WEAK AREAS: ${weak.map(t =>
          `${t.topic} (avg ${t.avg}%, ${t.attempts} attempt${t.attempts !== 1 ? 's' : ''}` +
          (t.trend.length >= 2 ? `, trend: ${t.trend.join('→')}` : '') +
          `)`
        ).join(' | ')}`
      );
    }

    // Current topic specifically
    const topicData = h.topics[currentTopic];
    if (topicData && topicData.scores.length) {
      lines.push(
        `THIS TOPIC: tried ${topicData.attempts}x, scores: ${topicData.scores.slice(-5).join(' → ')}`
      );
    }

    // Chronic gaps — explicitly flag these for the AI
    const chronic = this.getChronicGaps();
    if (chronic.length) {
      lines.push(
        `CHRONIC GAPS (mention explicitly if repeated): ${
          chronic.map(({ phrase, count }) => `"${phrase}" (${count}x)`).join(', ')
        }`
      );
    }

    // Projects built
    if (h.projects.length) {
      lines.push(
        `BUILT: ${h.projects.slice(-3).map(p => p.name).join(', ')}`
      );
    }

    return lines.length
      ? `[DEVELOPER HISTORY]\n${lines.join('\n')}\n[/DEVELOPER HISTORY]\n\n`
      : '';
  },
};
