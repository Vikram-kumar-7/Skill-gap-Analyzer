import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logStructured } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticProjects = JSON.parse(readFileSync(join(__dirname, '../data/projects.json'), 'utf-8'));

export const generateInsights = async (
  resumeText,
  jobText,
  missingSkills,
  matchedSkills,
  useAiMode = true
) => {
  if (!useAiMode) {
    return generateRuleBasedInsights(resumeText, jobText, missingSkills, matchedSkills);
  }

  const missingStr = missingSkills.slice(0, 5).join(', ');
  const systemPrompt = `You are a career advisor and technical interviewer. Return valid JSON only. Respond ONLY with valid JSON. No markdown fences, no explanation, no preamble.`;
  const userPrompt = `Analyze this based on the job description and resume.
Focus on missing skills: ${missingStr}

Return JSON exact format:
{
  "summary": "2 sentence summary",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "resumeTips": ["...", "..."],
  "interviewPrep": [
    {"question": "...", "reason": "Because they lack X"}
  ],
  "recommendedProjects": [
    {"title": "...", "desc": "...", "focusSkills": ["..."]}
  ]
}

Resume: ${resumeText.substring(0, 1500)}
Job: ${jobText.substring(0, 1500)}`;

  // Stage 1: Try OpenRouter (Gemma 31B)
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = 'google/gemma-4-31b-it:free';
  if (openRouterKey && openRouterKey !== 'your_openrouter_api_key_here') {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const cleanContent = rawContent
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/\s*```$/m, '')
          .trim();

        const resultObj = JSON.parse(cleanContent);
        logStructured({
          event: 'ai_request',
          stage: 'openrouter',
          model: openRouterModel,
          success: true,
          durationMs,
        });

        return { ...resultObj, source: 'ai_openrouter' };
      } else {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
    } catch (error) {
      const durationMs = Date.now() - startTime;
      logStructured({
        event: 'ai_request',
        stage: 'openrouter',
        model: openRouterModel,
        success: false,
        durationMs,
        error: error.message,
      });
      console.warn('Stage 1 (OpenRouter) failed, trying Stage 2 (OpenAI):', error.message);
    }
  }

  // Stage 2: Try OpenAI (gpt-4o-mini)
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = 'gpt-4o-mini';
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    const startTime = Date.now();
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: 'json_object' },
        },
        {
          headers: { Authorization: `Bearer ${openaiKey}` },
          timeout: 15000,
        }
      );

      const durationMs = Date.now() - startTime;
      const rawContent = response.data.choices[0].message.content || '';
      const cleanContent = rawContent
        .replace(/^```(?:json)?\s*/m, '')
        .replace(/\s*```$/m, '')
        .trim();

      const resultObj = JSON.parse(cleanContent);
      logStructured({
        event: 'ai_request',
        stage: 'openai',
        model: openaiModel,
        success: true,
        durationMs,
      });

      return { ...resultObj, source: 'ai_openai' };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      logStructured({
        event: 'ai_request',
        stage: 'openai',
        model: openaiModel,
        success: false,
        durationMs,
        error: error.message,
      });
      console.warn('Stage 2 (OpenAI) failed, falling back to Stage 3 (Rule-based):', error.message);
    }
  }

  // Stage 3: Rule-based fallback
  const startTime = Date.now();
  const result = generateRuleBasedInsights(resumeText, jobText, missingSkills, matchedSkills);
  const durationMs = Date.now() - startTime;
  logStructured({
    event: 'ai_request',
    stage: 'rule-based',
    model: 'rule-based',
    success: true,
    durationMs,
  });

  return result;
};

function generateRuleBasedInsights(resumeText, jobText, missingSkills, matchedSkills) {
  const matchRatio = matchedSkills.length / (matchedSkills.length + missingSkills.length || 1);
  let summary = matchRatio >= 0.8 ? 'Excellent match!' : 'Significant skill gaps detected.';

  // Generate Projects based on missing skills
  const recommendedProjects = [];
  missingSkills.forEach((skill) => {
    const projList = staticProjects[skill.toLowerCase()];
    if (projList) {
      recommendedProjects.push({
        title: projList[0].title,
        desc: projList[0].desc,
        focusSkills: [skill],
      });
    }
  });

  if (recommendedProjects.length === 0) {
    recommendedProjects.push({
      title: 'Full Stack Task Manager',
      desc: `Build a comprehensive app utilizing: ${missingSkills.slice(0, 3).join(', ')}`,
      focusSkills: missingSkills.slice(0, 3),
    });
  }

  // Generate Interview Prep based on missing skills
  const interviewPrep = missingSkills.slice(0, 3).map((skill) => ({
    question: `How would you handle a scenario requiring ${skill}?`,
    reason: `You lack direct experience in ${skill}, so expect theoretical questions.`,
  }));

  matchedSkills.slice(0, 2).forEach((skill) => {
    interviewPrep.push({
      question: `Describe a complex problem you solved using ${skill}.`,
      reason: `You listed ${skill}, so expect deep-dive questions to verify expertise.`,
    });
  });

  return {
    summary,
    strengths: matchedSkills.slice(0, 4).map((s) => `Strong background in ${s}`),
    improvements: missingSkills.slice(0, 4).map((s) => `Need to learn ${s}`),
    resumeTips: [
      "Quantify your achievements (e.g., 'Improved load time by 40%')",
      'Tailor your summary to match the job description keywords',
    ],
    interviewPrep,
    recommendedProjects: recommendedProjects.slice(0, 3),
    source: 'rule-based',
  };
}
