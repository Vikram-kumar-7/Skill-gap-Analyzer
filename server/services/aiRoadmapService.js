import axios from 'axios';
import { logStructured } from '../utils/logger.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = {
  reasoning: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
  general: 'google/gemma-3-27b-it:free',
};

/**
 * Generate a personalized DSA roadmap using AI
 * Integrates with existing OpenRouter setup
 */
export const generateDSARoadmap = async (userData, targetGoal = 'FAANG in 3 months') => {
  const { easy, medium, hard, currentScore, weak_topics = [], userId } = userData;
  
  if (!OPENROUTER_API_KEY) {
    logStructured('DSA_ROADMAP_ERROR', {
      error: 'OPENROUTER_API_KEY not configured',
      userId,
    });
    throw new Error('AI service not configured');
  }

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
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'SkillGap DSA Tracker',
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : parseRoadmapText(content);

    logStructured('DSA_ROADMAP_GENERATED', {
      userId,
      current_score: currentScore,
      target_goal: targetGoal,
    });

    return {
      roadmap,
      generatedAt: new Date(),
      model: MODELS.reasoning,
    };
  } catch (error) {
    logStructured('DSA_ROADMAP_ERROR', {
      userId,
      error: error.message,
      status: error.response?.status,
    });
    throw new Error(`Failed to generate DSA roadmap: ${error.message}`);
  }
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
