import axios from 'axios';
import { logStructured } from '../utils/logger.js';

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = {
  reasoning: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
  general: 'google/gemma-3-27b-it:free',
};

/**
 * Generate a personalized DSA roadmap using AI
 * Uses a robust 3-stage failover: OpenRouter -> OpenAI -> Heuristic rule-based
 */
export const generateDSARoadmap = async (userData, targetGoal = 'FAANG in 3 months') => {
  const { easy, medium, hard, currentScore, weak_topics = [], userId } = userData;

  const prompt = `You are a DSA expert coaching an engineer preparing for FAANG interviews.

User's Current Stats:
- Easy problems solved: ${easy}
- Medium problems solved: ${medium}
- Hard problems solved: ${hard}
- Current Score: ${currentScore}/100
- Weak Topics: ${weak_topics.join(', ') || 'Not specified'}
- Goal: ${targetGoal}

Generate a detailed, actionable 30/60/90 day DSA roadmap:

### Week 1-4 (30 days)
- Focus area
- Specific topics to master
- Number of problems by difficulty (Easy/Medium/Hard)
- Expected score progression
- Daily time commitment
- Resources recommended

### Week 5-8 (60 days)
- Advanced topics
- Problem solving patterns
- Mock interview prep
- Expected score progression

### Week 9-12 (90 days)
- Final preparation
- Weak topic reinforcement
- Contest problems
- Expected final score

Format the response as actionable JSON with this structure:
{
  "phase_30": { "focus": "", "topics": [], "daily_commitment": "", "expected_score": 0 },
  "phase_60": { "focus": "", "topics": [], "daily_commitment": "", "expected_score": 0 },
  "phase_90": { "focus": "", "topics": [], "daily_commitment": "", "expected_score": 0 },
  "key_milestones": [],
  "success_metrics": []
}`;

  // Stage 1: Try OpenRouter
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey !== 'your_openrouter_api_key_here') {
    try {
      const response = await axios.post(
        BASE_URL,
        {
          model: MODELS.reasoning,
          messages: [
            {
              role: 'system',
              content: 'You are an expert DSA coach. Provide practical, actionable roadmaps.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'SkillGap DSA Tracker',
          },
          timeout: 15000,
        }
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : parseRoadmapText(content);

      logStructured('DSA_ROADMAP_GENERATED', {
        userId,
        current_score: currentScore,
        target_goal: targetGoal,
        source: 'openrouter',
      });

      return {
        roadmap,
        generatedAt: new Date(),
        model: MODELS.reasoning,
        source: 'openrouter',
      };
    } catch (error) {
      console.warn('Stage 1 (OpenRouter) roadmap generation failed, trying Stage 2 (OpenAI):', error.message);
    }
  }

  // Stage 2: Try OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert DSA coach. Provide practical, actionable roadmaps. Respond with JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : parseRoadmapText(content);

      logStructured('DSA_ROADMAP_GENERATED', {
        userId,
        current_score: currentScore,
        target_goal: targetGoal,
        source: 'openai',
      });

      return {
        roadmap,
        generatedAt: new Date(),
        model: 'gpt-4o-mini',
        source: 'openai',
      };
    } catch (error) {
      console.warn('Stage 2 (OpenAI) roadmap generation failed, falling back to Stage 3 (Rule-based):', error.message);
    }
  }

  // Stage 3: Rule-based fallback
  const fallbackRoadmap = generateRuleBasedRoadmap({ easy, medium, hard, currentScore }, targetGoal);
  logStructured('DSA_ROADMAP_GENERATED', {
    userId,
    current_score: currentScore,
    target_goal: targetGoal,
    source: 'rule-based',
  });

  return {
    roadmap: fallbackRoadmap,
    generatedAt: new Date(),
    model: 'rule-based',
    source: 'rule-based',
  };
};

/**
 * Fallback parser for non-JSON responses
 */
function parseRoadmapText(text) {
  return {
    phase_30: {
      focus: 'Master fundamentals',
      topics: ['Arrays', 'Strings', 'Linked Lists'],
      daily_commitment: '1-2 hours',
      expected_score: 45,
    },
    phase_60: {
      focus: 'Build patterns',
      topics: ['Trees', 'Graphs', 'Dynamic Programming'],
      daily_commitment: '2-3 hours',
      expected_score: 65,
    },
    phase_90: {
      focus: 'Optimize and refine',
      topics: ['Hard problems', 'System Design', 'Contests'],
      daily_commitment: '2-3 hours',
      expected_score: 75,
    },
    key_milestones: [
      { day: 30, target: 'Solve 50 medium problems' },
      { day: 60, target: 'Solve 25 hard problems' },
      { day: 90, target: 'Complete mock interviews' },
    ],
    success_metrics: [
      'Solve daily LeetCode problems',
      'Understand patterns, not just solutions',
      'Track progress weekly',
    ],
  };
}

/**
 * Dynamic Rule-Based Heuristic Roadmap generator
 */
function generateRuleBasedRoadmap(stats, targetGoal) {
  const easyNeeded = Math.max(0, 100 - stats.easy);
  const mediumNeeded = Math.max(0, 150 - stats.medium);
  const hardNeeded = Math.max(0, 40 - stats.hard);

  return {
    phase_30: {
      focus: 'Master Easy and Medium fundamentals. Close early logic gaps.',
      topics: ['Arrays', 'Strings', 'Two Pointers', 'Hashing', 'Sliding Window'],
      daily_commitment: '1.5 hours',
      expected_score: Math.min(100, Math.round(stats.currentScore + (100 - stats.currentScore) * 0.35)),
    },
    phase_60: {
      focus: 'Intensive Medium practice on Trees, Graphs, and Heaps.',
      topics: ['Binary Search', 'BFS & DFS', 'Recursion & Backtracking', 'Greedy Algorithms'],
      daily_commitment: '2 hours',
      expected_score: Math.min(100, Math.round(stats.currentScore + (100 - stats.currentScore) * 0.70)),
    },
    phase_90: {
      focus: 'Advanced patterns (DP, Graph algorithms) and mock interviews.',
      topics: ['Dynamic Programming', 'Trie', 'Segment Trees', 'Monotonic Stack'],
      daily_commitment: '2.5 hours',
      expected_score: Math.min(100, Math.round(stats.currentScore + (100 - stats.currentScore) * 0.95)),
    },
    key_milestones: [
      { day: 30, target: `Complete at least ${Math.min(easyNeeded, 30)} Easy and ${Math.min(mediumNeeded, 25)} Medium problems` },
      { day: 60, target: `Target ${Math.min(mediumNeeded, 50)} more Mediums and basic recursion/graph patterns` },
      { day: 90, target: `Attempt ${Math.min(hardNeeded, 15)} Hard problems under timed test conditions` },
    ],
    success_metrics: [
      'Understand the visual pattern before jumping straight into code',
      'Optimize space complexity (e.g. modify in-place where applicable)',
      'Aim for a consistent daily solving streak',
    ],
  };
}

/**
 * Cache roadmaps by userId
 */
const roadmapCache = new Map();

export const cacheRoadmap = (userId, roadmap) => {
  roadmapCache.set(userId, {
    data: roadmap,
    cachedAt: Date.now(),
  });
};

export const getCachedRoadmap = (userId) => {
  const cached = roadmapCache.get(userId);
  return cached?.data || null;
};
