import { describe, it, expect } from 'vitest';
import { calculateDemand, getDifficulty, calculateSkillROI, analyzeMarket } from './marketAnalyzer.js';

describe('marketAnalyzer', () => {
  it('should calculate demand correctly for known skills', () => {
    const reactDemand = calculateDemand('React');
    expect(typeof reactDemand).toBe('number');
    expect(reactDemand).toBeGreaterThanOrEqual(0);
  });

  it('should return default difficulty for unknown skills', () => {
    expect(getDifficulty('UnknownMegaSkill')).toBe(3);
  });

  it('should return difficulty rating for known skills', () => {
    expect(getDifficulty('html')).toBe(1);
    expect(getDifficulty('kubernetes')).toBe(5);
  });

  it('should calculate ROI properly', () => {
    const roiObj = calculateSkillROI('React');
    expect(roiObj).toHaveProperty('skill', 'React');
    expect(roiObj).toHaveProperty('roi');
    expect(roiObj).toHaveProperty('demand');
    expect(roiObj).toHaveProperty('difficulty');
    expect(roiObj).toHaveProperty('confidenceReason');
  });

  it('should sort market data by ROI descending', () => {
    const analyzed = analyzeMarket(['React', 'Kubernetes', 'HTML']);
    expect(analyzed).toBeInstanceOf(Array);
    expect(analyzed.length).toBe(3);
    expect(analyzed[0].roi).toBeGreaterThanOrEqual(analyzed[1].roi);
    expect(analyzed[1].roi).toBeGreaterThanOrEqual(analyzed[2].roi);
  });
});
