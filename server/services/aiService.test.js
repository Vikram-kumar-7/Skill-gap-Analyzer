import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { generateInsights } from './aiService.js';

vi.mock('axios');

describe('aiService - 3-stage failover', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: 'test_openrouter_key',
      OPENAI_API_KEY: 'test_openai_key',
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('Stage 1: should return OpenRouter content when OpenRouter succeeds', async () => {
    const mockJson = {
      choices: [{ message: { content: JSON.stringify({ summary: 'OpenRouter Success', strengths: [], improvements: [], resumeTips: [], interviewPrep: [], recommendedProjects: [] }) } }]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJson,
    });

    const result = await generateInsights('resume', 'job', ['React'], ['JavaScript'], true);
    expect(result.summary).toBe('OpenRouter Success');
    expect(result.source).toBe('ai_openrouter');
  });

  it('Stage 2: should fall back to OpenAI when OpenRouter fails but OpenAI succeeds', async () => {
    // OpenRouter mock failure
    global.fetch = vi.fn().mockRejectedValue(new Error('OpenRouter API down'));

    // OpenAI mock success
    axios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: JSON.stringify({ summary: 'OpenAI Success', strengths: [], improvements: [], resumeTips: [], interviewPrep: [], recommendedProjects: [] }) } }]
      }
    });

    const result = await generateInsights('resume', 'job', ['React'], ['JavaScript'], true);
    expect(result.summary).toBe('OpenAI Success');
    expect(result.source).toBe('ai_openai');
  });

  it('Stage 3: should fall back to rule-based when both OpenRouter and OpenAI fail', async () => {
    // OpenRouter failure
    global.fetch = vi.fn().mockRejectedValue(new Error('OpenRouter API down'));

    // OpenAI failure
    axios.post.mockRejectedValue(new Error('OpenAI API down'));

    const result = await generateInsights('resume', 'job', ['React'], ['JavaScript'], true);
    expect(result.summary).toBe('Significant skill gaps detected.');
    expect(result.source).toBe('rule-based');
  });
});
