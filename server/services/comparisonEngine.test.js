import { describe, it, expect } from 'vitest';
import { compareSkills } from './comparisonEngine.js';

describe('compareSkills', () => {
  it('should return correct missing and matched skills', () => {
    const resume = [{ skill: 'React', frequency: 1 }, { skill: 'JavaScript', frequency: 3 }];
    const job = [{ skill: 'React', frequency: 1 }, { skill: 'Node.js', frequency: 1 }];

    const result = compareSkills(resume, job);
    expect(result.matched).toContain('React');
    expect(result.missing).toContain('Node.js');
    expect(result.matchPercentage).toBe(50);
  });

  it('should handle case insensitivity matching correctly', () => {
    const resume = [{ skill: 'react', frequency: 1 }];
    const job = [{ skill: 'React', frequency: 1 }];

    const result = compareSkills(resume, job);
    expect(result.matched).toContain('React');
    expect(result.missing).not.toContain('React');
    expect(result.matchPercentage).toBe(100);
  });

  it('should handle empty input arrays gracefully', () => {
    const result = compareSkills([], []);
    expect(result.matched).toEqual([]);
    expect(result.missing).toEqual([]);
    expect(result.matchPercentage).toBe(0);
  });
});
