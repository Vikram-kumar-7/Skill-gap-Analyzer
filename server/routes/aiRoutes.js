import { Router } from 'express';
import axios from 'axios';
import { logStructured } from '../utils/logger.js';

const router = Router();

// Helper to call OpenAI with structured logging and fallback
async function callOpenAIWithFallback({ messages, options = {}, isJson = true, fallbackFn }) {
  const startTime = Date.now();
  const key = process.env.OPENAI_API_KEY;
  const modelName = 'gpt-4o-mini';

  if (key && key !== 'your_openai_api_key_here') {
    try {
      const payload = {
        model: modelName,
        messages,
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options.max_tokens || 2048,
      };
      if (isJson) {
        payload.response_format = { type: 'json_object' };
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        payload,
        { 
          headers: { Authorization: `Bearer ${key}` },
          timeout: 15000 
        }
      );

      const durationMs = Date.now() - startTime;
      const text = response.data.choices[0].message.content;

      logStructured({
        event: 'ai_request',
        stage: 'openai',
        model: modelName,
        success: true,
        durationMs,
      });

      if (isJson) {
        return { ...JSON.parse(text), source: 'ai' };
      } else {
        return { content: text, source: 'ai' };
      }
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logStructured({
        event: 'ai_request',
        stage: 'openai',
        model: modelName,
        success: false,
        durationMs,
        error: err.message,
      });
      console.warn('OpenAI call failed, using fallback:', err.message);
    }
  } else {
    console.warn('OpenAI API key missing or placeholder in server environment, using fallback');
  }

  const fallbackResult = await fallbackFn();
  return { ...fallbackResult, source: 'fallback' };
}

/**
 * POST /api/ai/chat
 * Proxy endpoint to query OpenRouter securely.
 */
router.post('/chat', async (req, res) => {
  const startTime = Date.now();
  const { prompt, jsonOutput, enableReasoning, timeoutMs } = req.body;

  const hasKey = (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') ||
                  (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');

  if (!hasKey) {
    return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY or OPENAI_API_KEY in server env' });
  }

  if (prompt && typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt must be a string.' });
  }
  if (prompt && prompt.length > 50000) {
    return res.status(400).json({ error: 'Prompt too long (max 50,000 characters).' });
  }

  const safeTimeout = Math.min(Math.max(Number(timeoutMs) || 30000, 1000), 30000);

  const system = jsonOutput
    ? 'Respond ONLY with valid JSON. No markdown fences, no explanation, no preamble.'
    : 'You are a helpful technical mentor and senior software engineer.';

  const openRouterModel = 'google/gemma-4-31b-it:free';
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // Stage 1: Try OpenRouter (Gemma 31B)
  if (openRouterKey && openRouterKey !== 'your_openrouter_api_key_here') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), safeTimeout / 2);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'SkillGapAnalyzer',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: enableReasoning ? 8192 : 2048,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }

      if (response.ok) {
        const data = await response.json();
        logStructured({
          event: 'ai_request',
          stage: 'proxy_openrouter',
          model: openRouterModel,
          success: true,
          durationMs,
        });
        return res.json(data);
      } else {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logStructured({
        event: 'ai_request',
        stage: 'proxy_openrouter',
        model: openRouterModel,
        success: false,
        durationMs,
        error: err.message,
      });
      console.warn('Proxy Stage 1 (OpenRouter) failed, trying Stage 2 (OpenAI):', err.message);
    }
  }

  // Stage 2: Try OpenAI (gpt-4o-mini)
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = 'gpt-4o-mini';
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    try {
      const payload = {
        model: openaiModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: enableReasoning ? 4096 : 2048,
      };
      if (jsonOutput) {
        payload.response_format = { type: 'json_object' };
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        payload,
        {
          headers: { Authorization: `Bearer ${openaiKey}` },
          timeout: safeTimeout / 2,
        }
      );

      const durationMs = Date.now() - startTime;
      logStructured({
        event: 'ai_request',
        stage: 'proxy_openai',
        model: openaiModel,
        success: true,
        durationMs,
      });

      return res.json({
        choices: [
          {
            message: {
              content: response.data.choices[0].message.content,
              role: 'assistant',
            },
          },
        ],
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logStructured({
        event: 'ai_request',
        stage: 'proxy_openai',
        model: openaiModel,
        success: false,
        durationMs,
        error: err.message,
      });
      console.warn('Proxy Stage 2 (OpenAI) failed:', err.message);
    }
  }

  return res.status(502).json({ error: 'All AI models in proxy failed.' });
});

/**
 * POST /api/ai/daily-tip — Generate daily personalized tip
 * Body: { week, topMissingCategory, targetRole, matchPercentage }
 */
router.post('/daily-tip', async (req, res) => {
  const { week, topMissingCategory, targetRole, matchPercentage } = req.body;

  const result = await callOpenAIWithFallback({
    messages: [
      {
        role: 'system',
        content: 'You are a concise career coach. Reply with 2-3 sentences max.',
      },
      {
        role: 'user',
        content: `Week ${week}/12 of learning roadmap. Target role: ${targetRole}. Current match: ${matchPercentage}%. Biggest gap area: ${topMissingCategory}. Give one specific, actionable tip for today.`,
      },
    ],
    options: { temperature: 0.7, max_tokens: 100 },
    isJson: false,
    fallbackFn: async () => ({ content: null }),
  });

  return res.json({ tip: result.content || null, source: result.source });
});

/**
 * POST /api/ai/score-answer — Score an interview answer
 * Body: { question, answer, idealAnswer, keywords }
 */
router.post('/score-answer', async (req, res) => {
  const { question, answer, idealAnswer, keywords } = req.body;

  const fallbackFn = async () => {
    const answerLower = (answer || '').toLowerCase();
    const kw = keywords || [];
    const matched = kw.filter((k) => answerLower.includes(k.toLowerCase()));
    const score = Math.min(
      100,
      Math.round(
        (matched.length / Math.max(kw.length, 1)) * 70 +
          ((answer || '').length > 100 ? 15 : 5) +
          ((answer || '').length > 250 ? 15 : 0)
      )
    );

    return {
      score,
      feedback: {
        accuracy:
          matched.length >= kw.length * 0.7
            ? 'Good coverage of key concepts'
            : 'Missing some important concepts',
        completeness: (answer || '').length > 200 ? 'Detailed response' : 'Could be more thorough',
        clarity: 'Provide specific examples for stronger answers',
        missedConcepts: kw.filter((k) => !answerLower.includes(k.toLowerCase())),
      },
    };
  };

  const result = await callOpenAIWithFallback({
    messages: [
      {
        role: 'system',
        content:
          'You are a technical interviewer. Score answers 0-100. Return JSON only: {"score": number, "feedback": {"accuracy": string, "completeness": string, "clarity": string, "missedConcepts": [string]}}',
      },
      {
        role: 'user',
        content: `Question: ${question}\nCandidate Answer: ${answer}\nIdeal Answer: ${idealAnswer || 'N/A'}\nKey concepts: ${(keywords || []).join(', ')}\n\nScore and provide feedback.`,
      },
    ],
    options: { temperature: 0.3 },
    isJson: true,
    fallbackFn,
  });

  return res.json(result);
});

/**
 * POST /api/ai/improve-bullet — Improve resume bullet point
 * Body: { bullet, role }
 */
router.post('/improve-bullet', async (req, res) => {
  const { bullet, role } = req.body;

  const fallbackFn = async () => {
    const verbs = ['Engineered', 'Architected', 'Optimized', 'Spearheaded'];
    const bulletText = bullet || '';
    return {
      improved: [
        `${verbs[0]} ${bulletText.toLowerCase()}, resulting in measurable performance improvements`,
        `${verbs[1]} solution that ${bulletText.toLowerCase()}, reducing complexity by 40%`,
        `${verbs[2]} ${bulletText.toLowerCase()}, improving efficiency and team velocity by 25%`,
      ],
    };
  };

  const result = await callOpenAIWithFallback({
    messages: [
      {
        role: 'system',
        content: 'You are a resume expert. Return JSON: {"improved": [string, string, string]}',
      },
      {
        role: 'user',
        content: `Improve this resume bullet for a ${role} role. Add metrics, action verbs, and impact. Original: "${bullet}". Return 3 stronger versions.`,
      },
    ],
    options: { temperature: 0.7 },
    isJson: true,
    fallbackFn,
  });

  return res.json(result);
});

/**
 * POST /api/ai/generate-project — Generate a custom project idea
 * Body: { skills, targetRole }
 */
router.post('/generate-project', async (req, res) => {
  const { skills, targetRole } = req.body;

  const fallbackFn = async () => {
    const templates = [
      {
        title: `${targetRole || 'Developer'} Portfolio Dashboard`,
        features: ['Authentication', 'Data visualization', 'CRUD operations', 'Responsive design'],
        difficulty: 'Medium',
        estimatedHours: 30,
      },
      {
        title: `Real-time ${(skills || [])[0] || 'Tech'} Tracker`,
        features: ['WebSocket updates', 'Search and filter', 'Charts', 'Export data'],
        difficulty: 'Hard',
        estimatedHours: 40,
      },
    ];
    const tmpl = templates[Math.floor(Math.random() * templates.length)];
    const skillsList = skills || [];
    return {
      ...tmpl,
      description: `Build a ${tmpl.title} using ${skillsList.slice(0, 3).join(', ')}. Perfect for demonstrating full-stack capabilities.`,
      techStack: skillsList.slice(0, 5),
      milestones: [
        'Set up project scaffold',
        'Build core features',
        'Add authentication',
        'Implement UI/UX polish',
        'Deploy and document',
      ],
    };
  };

  const result = await callOpenAIWithFallback({
    messages: [
      {
        role: 'system',
        content:
          'Generate a unique project idea. Return JSON: {"title": string, "description": string, "features": [string], "techStack": [string], "milestones": [string], "difficulty": string, "estimatedHours": number}',
      },
      {
        role: 'user',
        content: `Generate a project for someone who knows [${(skills || []).join(', ')}] and is targeting [${targetRole}]. Make it portfolio-worthy and realistic.`,
      },
    ],
    options: { temperature: 0.8 },
    isJson: true,
    fallbackFn,
  });

  return res.json(result);
});

/**
 * POST /api/ai/generate-summary — Generate professional resume summary
 * Body: { role, skills }
 */
router.post('/generate-summary', async (req, res) => {
  const { role, skills } = req.body;

  const fallbackFn = async () => {
    const skillsList = skills || [];
    return {
      summary: `Results-driven ${role || 'engineer'} with expertise in ${skillsList.slice(0, 3).join(', ')}. Passionate about building scalable, user-centric solutions with modern technologies. Proven track record of delivering high-quality code and collaborating effectively in agile environments.`,
    };
  };

  const result = await callOpenAIWithFallback({
    messages: [
      {
        role: 'system',
        content: 'Write a professional 3-sentence resume summary. Return JSON: {"summary": string}',
      },
      {
        role: 'user',
        content: `Role: ${role}. Top skills: ${(skills || []).join(', ')}. Write a compelling professional summary.`,
      },
    ],
    options: { temperature: 0.7 },
    isJson: true,
    fallbackFn,
  });

  return res.json(result);
});

export default router;
