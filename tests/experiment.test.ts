import { describe, it, expect } from 'vitest';
import {
  generateTrialOrder,
  type ExperimentConfig,
} from '../src/audio/experiment';

const baseConfig: ExperimentConfig = {
  options: ['ba', 'pa'],
  stimuli: ['s1.wav', 's2.wav', 's3.wav'],
  repetitions: 4,
  randomize: false,
  isi: 500,
};

describe('generateTrialOrder', () => {
  it('produces correct total count (stimuli × repetitions)', () => {
    const order = generateTrialOrder(baseConfig);
    expect(order.length).toBe(3 * 4);
  });

  it('each stimulus appears exactly repetitions times', () => {
    const order = generateTrialOrder({ ...baseConfig, randomize: true });
    const counts: Record<string, number> = {};
    for (const s of order) {
      counts[s] = (counts[s] || 0) + 1;
    }
    expect(counts['s1.wav']).toBe(4);
    expect(counts['s2.wav']).toBe(4);
    expect(counts['s3.wav']).toBe(4);
  });

  it('non-randomized order is sequential', () => {
    const order = generateTrialOrder(baseConfig);
    // First 3 should be s1, s2, s3
    expect(order[0]).toBe('s1.wav');
    expect(order[1]).toBe('s2.wav');
    expect(order[2]).toBe('s3.wav');
  });

  it('randomized order is not always identical to sequential (probabilistic)', () => {
    // Run multiple times; at least one should differ
    let diffFound = false;
    const sequential = generateTrialOrder({ ...baseConfig, randomize: false });
    for (let i = 0; i < 20; i++) {
      const randomized = generateTrialOrder({ ...baseConfig, randomize: true });
      if (randomized.join(',') !== sequential.join(',')) {
        diffFound = true;
        break;
      }
    }
    expect(diffFound).toBe(true);
  });
});
