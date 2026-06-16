// ============================================================
// src/services/useAI.js
// Custom React Hook to wrap all AI-related calls.
// Handles: loading indicators, response error states, and data.
// ============================================================
import { useState, useCallback } from 'react';
import { InterviewAI } from './interviewAI';
import { ProjectAI } from './projectAI';

import { aiCache } from '../utils/aiCache';

export function useAI() {
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState(null);

  const execute = useCallback(async (key, serviceMethod, ...args) => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    setError(null);
    try {
      const res = await serviceMethod(...args);
      return res;
    } catch (err) {
      const msg = err.message || 'AI request failed. Please check your credentials or API quota.';
      setError(msg);
      throw err;
    } finally {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  // Wrap Interview methods with caching support
  const generateHints = useCallback(
    async (question, difficulty, topic) => {
      const cacheKey = `hints:${question}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;
      const res = await execute(
        'generateHints',
        InterviewAI.generateHints,
        question,
        difficulty,
        topic
      );
      aiCache.set(cacheKey, res);
      return res;
    },
    [execute]
  );

  const generateAnswerOutline = useCallback(
    async (question, difficulty, topic) => {
      const cacheKey = `outline:${question}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;
      const res = await execute(
        'generateAnswerOutline',
        InterviewAI.generateAnswerOutline,
        question,
        difficulty,
        topic
      );
      aiCache.set(cacheKey, res);
      return res;
    },
    [execute]
  );

  const evaluateAnswer = useCallback(
    async (question, userAnswer, expectedAnswer, topic) => {
      const cacheKey = `eval:${question}:${userAnswer.trim().toLowerCase()}`;
      const cached = aiCache.get(cacheKey);
      if (cached) return cached;
      const res = await execute(
        'evaluateAnswer',
        InterviewAI.evaluateAnswer,
        question,
        userAnswer,
        expectedAnswer,
        topic
      );
      aiCache.set(cacheKey, res);
      return res;
    },
    [execute]
  );

  const generateFollowUp = useCallback(
    (...args) => execute('generateFollowUp', InterviewAI.generateFollowUp, ...args),
    [execute]
  );

  // Wrap Project methods
  const suggestProjects = useCallback(
    (...args) => execute('suggestProjects', ProjectAI.suggestProjects, ...args),
    [execute]
  );
  const generateRoadmap = useCallback(
    (...args) => execute('generateRoadmap', ProjectAI.generateRoadmap, ...args),
    [execute]
  );
  const reviewCode = useCallback(
    (...args) => execute('reviewCode', ProjectAI.reviewCode, ...args),
    [execute]
  );
  const fetchSkillDemand = useCallback(
    (...args) => execute('fetchSkillDemand', ProjectAI.fetchSkillDemand, ...args),
    [execute]
  );

  return {
    loadingStates,
    error,
    evaluateAnswer,
    generateHints,
    generateFollowUp,
    generateAnswerOutline,
    suggestProjects,
    generateRoadmap,
    reviewCode,
    fetchSkillDemand,
  };
}
