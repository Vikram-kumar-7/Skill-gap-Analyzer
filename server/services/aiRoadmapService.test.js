import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { generateDSARoadmap } from './aiRoadmapService.js';

vi.mock('axios');

describe('aiRoadmapService - 3-stage failover', () => {
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
    process.env = originalEnv;
  });

  it('Stage 1: should return OpenRouter content when OpenRouter succeeds', async () => {
    axios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: JSON.stringify({ phase_30: { focus: 'OpenRouter' } }) } }]
      }
    });

    const result = await generateDSARoadmap({ easy: 10, medium: 5, hard: 0, currentScore: 20 }, 'FAANG');
    expect(result.roadmap.phase_30.focus).toBe('OpenRouter');
    expect(result.source).toBe('openrouter');
  });

  it('Stage 2: should fall back to OpenAI when OpenRouter fails but OpenAI succeeds', async () => {
    axios.post
      .mockRejectedValueOnce(new Error('OpenRouter down'))
      .mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: JSON.stringify({ phase_30: { focus: 'OpenAI' } }) } }]
        }
      });

    const result = await generateDSARoadmap({ easy: 10, medium: 5, hard: 0, currentScore: 20 }, 'FAANG');
    expect(result.roadmap.phase_30.focus).toBe('OpenAI');
    expect(result.source).toBe('openai');
  });

  it('Stage 3: should fall back to rule-based when both fail', async () => {
    axios.post
      .mockRejectedValueOnce(new Error('OpenRouter down'))
      .mockRejectedValueOnce(new Error('OpenAI down'));

    const result = await generateDSARoadmap({ easy: 10, medium: 5, hard: 0, currentScore: 20 }, 'FAANG');
    expect(result.roadmap.phase_30.focus).toContain('Master Easy');
    expect(result.source).toBe('rule-based');
  });
});
