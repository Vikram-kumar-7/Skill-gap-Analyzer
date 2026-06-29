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
    let response;
    let usedModel = openRouterModel;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }
    } catch (error) {
      console.warn('Stage 1 (OpenRouter Gemma 4) failed, attempting Stage 1.5 (Llama 3.3 70B)...', error.message);
    }

    // Stage 1.5: Fallback to Llama 3.3 70B on OpenRouter
    if (!response || !response.ok) {
      try {
        usedModel = 'meta-llama/llama-3.3-70b-instruct:free';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'SkillGapAnalyzer',
          },
          body: JSON.stringify({
            model: usedModel,
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
      } catch (error) {
        console.warn('Stage 1.5 (OpenRouter Llama 3.3 70B) failed:', error.message);
      }
    }

    if (response && response.ok) {
      try {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const cleanContent = rawContent
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/\s*```$/m, '')
          .trim();

        const resultObj = JSON.parse(cleanContent);
        const durationMs = Date.now() - startTime;
        logStructured({
          event: 'ai_request',
          stage: 'openrouter',
          model: usedModel,
          success: true,
          durationMs,
        });

        return { ...resultObj, source: 'ai_openrouter' };
      } catch (jsonErr) {
        console.warn('Failed to parse OpenRouter insights response:', jsonErr.message);
      }
    }
  }

  // Stage 2: Try OpenAI (gpt-4o-mini) OR redirect to OpenRouter if key is an OpenRouter key
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = 'gpt-4o-mini';
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    const startTime = Date.now();
    try {
      const isOpenRouterKey = openaiKey.startsWith('sk-or-v1-');
      let responseData;
      let usedModel = openaiModel;

      if (isOpenRouterKey) {
        console.log('Redirecting insights generation Stage 2 to OpenRouter (using Llama 3.3 70B)...');
        usedModel = 'meta-llama/llama-3.3-70b-instruct:free';
        const apiRes = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: usedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
          },
          {
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5000',
              'X-Title': 'SkillGapAnalyzer',
            },
            timeout: 15000,
          }
        );
        responseData = apiRes.data;
      } else {
        const apiRes = await axios.post(
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
        responseData = apiRes.data;
      }

      const rawContent = responseData.choices[0].message.content || '';
      const cleanContent = rawContent
        .replace(/^```(?:json)?\s*/m, '')
        .replace(/\s*```$/m, '')
        .trim();

      const resultObj = JSON.parse(cleanContent);
      const durationMs = Date.now() - startTime;
      logStructured({
        event: 'ai_request',
        stage: isOpenRouterKey ? 'openai_redirect_openrouter' : 'openai',
        model: usedModel,
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
      console.warn('Stage 2 (OpenAI/Redirect) failed, falling back to Stage 3 (Rule-based):', error.message);
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

/**
 * Extract skills from text using AI with a clean extraction prompt.
 * Falls back to rule-based extraction on failure.
 * @param {string} text - Raw text (resume or job description)
 * @param {boolean} useAiMode - Whether to attempt AI extraction
 * @returns {Promise<string[]>} - Array of normalized skill strings
 */
export const extractSkillsWithAI = async (text, useAiMode = true) => {
  if (!useAiMode || !text) {
    return [];
  }

  const systemPrompt = `You are a skill extraction engine. Return ONLY a raw JSON array. No markdown, no explanation, no preamble.`;
  const userPrompt = `Extract skills from this text as a JSON array of plain lowercase keywords only.

Rules:
- Strip ALL parenthetical context: "MongoDB (transactions)" → "mongodb"  
- Normalize versions: "Node.js" → "nodejs", "React 18" → "react"
- Split combined skills: "Node.js, Express.js" → ["nodejs", "express"]
- No descriptions, no context, no sentences
- Return ONLY a raw JSON array, no markdown, no explanation

Text: ${text.substring(0, 2000)}

Return format: ["skill1", "skill2", "skill3"]`;

  // Stage 1: Try OpenRouter (Gemma 31B)
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = 'google/gemma-4-31b-it:free';
  if (openRouterKey && openRouterKey !== 'your_openrouter_api_key_here') {
    const startTime = Date.now();
    let response;
    let usedModel = openRouterModel;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
          temperature: 0.3,
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }
    } catch (error) {
      console.warn('AI extraction Stage 1 (OpenRouter Gemma 4) failed, attempting Stage 1.5 (Llama 3.3 70B)...', error.message);
    }

    // Stage 1.5: Fallback to Llama 3.3 70B on OpenRouter
    if (!response || !response.ok) {
      try {
        usedModel = 'meta-llama/llama-3.3-70b-instruct:free';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'SkillGapAnalyzer',
          },
          body: JSON.stringify({
            model: usedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1024,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('AI extraction Stage 1.5 (OpenRouter Llama 3.3 70B) failed:', error.message);
      }
    }

    if (response && response.ok) {
      try {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const cleanContent = rawContent
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/\s*```$/m, '')
          .trim();
        const result = JSON.parse(cleanContent);
        if (Array.isArray(result)) {
          logStructured({ event: 'ai_extraction', stage: 'openrouter', model: usedModel, success: true });
          return result;
        }
      } catch (jsonErr) {
        console.warn('Failed to parse OpenRouter AI extraction JSON:', jsonErr.message);
      }
    }
  }

  // Stage 2: Try OpenAI (gpt-4o-mini) OR redirect to OpenRouter if key is an OpenRouter key
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = 'gpt-4o-mini';
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    const startTime = Date.now();
    try {
      const isOpenRouterKey = openaiKey.startsWith('sk-or-v1-');
      let responseData;
      let usedModel = openaiModel;

      if (isOpenRouterKey) {
        console.log('Redirecting AI extraction Stage 2 to OpenRouter (using Llama 3.3 70B)...');
        usedModel = 'meta-llama/llama-3.3-70b-instruct:free';
        const apiRes = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: usedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1024,
          },
          {
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5000',
              'X-Title': 'SkillGapAnalyzer',
            },
            timeout: 15000,
          }
        );
        responseData = apiRes.data;
      } else {
        const apiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: openaiModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: 'json_object' },
          },
          { headers: { Authorization: `Bearer ${openaiKey}` }, timeout: 15000 }
        );
        responseData = apiRes.data;
      }

      const rawContent = responseData.choices[0].message.content || '';
      const cleanContent = rawContent
        .replace(/^```(?:json)?\s*/m, '')
        .replace(/\s*```$/m, '')
        .trim();
      const result = JSON.parse(cleanContent);
      const arr = Array.isArray(result) ? result : result.skills || [];
      if (Array.isArray(arr)) {
        logStructured({ event: 'ai_extraction', stage: isOpenRouterKey ? 'openai_redirect_openrouter' : 'openai', model: usedModel, success: true });
        return arr;
      }
    } catch (error) {
      console.warn('AI extraction Stage 2 (OpenAI/Redirect) failed:', error.message);
    }
  }

  return [];
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
