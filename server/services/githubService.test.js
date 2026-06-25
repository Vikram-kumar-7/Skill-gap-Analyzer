import { describe, it, expect, vi, afterAll } from 'vitest';
import axios from 'axios';
import { runGitHubAnalysis } from './githubService.js';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn().mockImplementation(() => {
        return {
          get: vi.fn().mockImplementation((url) => {
            const err = new Error('Rate limit exceeded');
            err.response = { status: 403 };
            throw err;
          })
        };
      })
    }
  };
});

describe('githubService - mock vs real logic', () => {
  const originalEnv = process.env.ALLOW_MOCK_FALLBACK;

  afterAll(() => {
    process.env.ALLOW_MOCK_FALLBACK = originalEnv;
  });

  it('should generate valid mock analysis structure when ALLOW_MOCK_FALLBACK is true', async () => {
    process.env.ALLOW_MOCK_FALLBACK = 'true';
    const result = await runGitHubAnalysis('some-random-user');

    expect(result).toBeDefined();
    expect(result.username).toBe('some-random-user');
    expect(result.isMock).toBe(true);
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(typeof result.skillConfidence).toBe('object');
  });

  it('should generate predefined mock profile for vikram-kumar-7', async () => {
    process.env.ALLOW_MOCK_FALLBACK = 'true';
    const result = await runGitHubAnalysis('vikram-kumar-7');

    expect(result.username).toBe('vikram-kumar-7');
    expect(result.isMock).toBe(true);
    expect(result.skillConfidence['Node.js']).toBe(8.4);
    expect(result.skillConfidence['MongoDB']).toBe(7.1);
    expect(result.evidence.commitsPerWeek).toBe(4.2);
    expect(result.evidence.testFilesFound).toBe(2);
  });

  it('should throw error and NOT fallback to mock when ALLOW_MOCK_FALLBACK is false/unset', async () => {
    process.env.ALLOW_MOCK_FALLBACK = 'false';
    
    await expect(runGitHubAnalysis('vikram-kumar-7')).rejects.toThrow(
      'GitHub API rate limit exceeded. Please configure GITHUB_TOKEN or try again later.'
    );
  });
});
