// src/services/aiService.js
// Client wrapper for the backend AI proxy — no API keys ever live in the browser.
// Failover (Gemma → GPT-4o-mini → rule-based) happens server-side.

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || '';

/**
 * Core fetch wrapper around the backend AI proxy.
 */
async function callModel(
  prompt,
  jsonOutput = false,
  enableReasoning = false,
  timeoutMs = 30000
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        jsonOutput,
        enableReasoning,
        timeoutMs,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 429) throw new Error('RATE_LIMITED');
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

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

// ── Public API ────────────────────────────────────────────────
export const ai = {
  /**
   * Use for: answer evaluation, hints, follow-up questions, answer outlines.
   */
  async reason(prompt, jsonOutput = false) {
    return await callModel(prompt, jsonOutput, false, 30000);
  },

  /**
   * Use for: project suggestions, roadmaps, code review.
   */
  async generate(prompt, jsonOutput = false) {
    return await callModel(prompt, jsonOutput, false, 30000);
  },
};

export default ai;

