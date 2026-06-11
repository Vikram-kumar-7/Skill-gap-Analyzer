// ============================================================
// src/services/aiService.js
// OpenRouter client with client-side 2-stage failover routing
// Vite env: VITE_OPENROUTER_API_KEY in .env.local
// ============================================================

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Stage 1 is our ultra-fast and capable primary model.
// Stage 2 is the auto-balanced OpenRouter free models router fallback.
const PRIMARY_MODEL = 'google/gemma-4-31b-it:free';
const FALLBACK_MODEL = 'openrouter/free';

/**
 * Core fetch wrapper around OpenRouter.
 */
async function callModel(model, prompt, jsonOutput = false, enableReasoning = false, timeoutMs = 30000) {
  // Try to read from localStorage first, then fallback to Vite environment variable
  let apiKey = localStorage.getItem('sga_api_key');
  if (apiKey) apiKey = apiKey.trim();
  if (!apiKey || apiKey === 'your_key_from_openrouter.ai' || apiKey === 'sk-...') {
    apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      'Missing API Key — please set your OpenRouter API Key in the Settings page or in client/.env.local'
    );
  }

  const system = jsonOutput
    ? 'Respond ONLY with valid JSON. No markdown fences, no explanation, no preamble.'
    : 'You are a helpful technical mentor and senior software engineer.';

  const body = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: enableReasoning ? 8192 : 2048,
  };

  if (enableReasoning) {
    body.reasoning = { effort: 'high' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res;
    let fallbackToDirect = false;

    // 1. Try to query the backend proxy first to avoid CORS preflight latency
    try {
      res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          jsonOutput,
          enableReasoning,
          timeoutMs
        }),
        signal: controller.signal,
      });
      if (!res.ok && (res.status >= 500 || res.status === 404)) {
        fallbackToDirect = true;
      }
    } catch (e) {
      // Backend is likely not running, fallback to direct OpenRouter call
      console.warn('[aiService] Backend proxy unavailable, falling back to direct OpenRouter call:', e.message);
      fallbackToDirect = true;
    }

    // 2. Fallback to direct OpenRouter call if needed
    if (fallbackToDirect) {
      res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SkillGapAnalyzer',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (res.status === 429) throw new Error('RATE_LIMITED');
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!jsonOutput) return text;

    // Strip accidental markdown fences if the model ignores the system prompt
    const clean = text
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```$/m, '')
      .trim();

    try {
      return JSON.parse(clean);
    } catch {
      throw new Error(`Model returned invalid JSON: ${clean.slice(0, 200)}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw error;
  }
}

/**
 * 2-Stage failover routing query helper
 */
async function queryWithFailover(prompt, jsonOutput) {
  // Stage 1: Try the primary fast model with a 12-second timeout (sufficient for OPTIONS + POST)
  console.log(`[aiService] Querying primary model: ${PRIMARY_MODEL}...`);
  try {
    return await callModel(PRIMARY_MODEL, prompt, jsonOutput, false, 12000);
  } catch (e) {
    console.warn(`[aiService] Primary model ${PRIMARY_MODEL} failed or timed out: ${e.message} — trying fallback...`);
    // Stage 2: Fallback to the auto-balanced router with a 25-second timeout
    return await callModel(FALLBACK_MODEL, prompt, jsonOutput, false, 25000);
  }
}

// ── Public API ────────────────────────────────────────────────
export const ai = {
  /**
   * Use for: answer evaluation, hints, follow-up questions, answer outlines.
   */
  async reason(prompt, jsonOutput = false) {
    return await queryWithFailover(prompt, jsonOutput);
  },

  /**
   * Use for: project suggestions, roadmaps, code review.
   */
  async generate(prompt, jsonOutput = false) {
    return await queryWithFailover(prompt, jsonOutput);
  },
};

export default ai;
