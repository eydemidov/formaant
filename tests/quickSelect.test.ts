import { describe, expect, it } from 'vitest';
import { findHighEnergyRegions } from '../src/audio/quickSelect';

describe('findHighEnergyRegions', () => {
  it('returns a separate section for each sustained energy burst', () => {
    const times = Array.from({ length: 60 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => {
      if (index >= 10 && index <= 20) return 70;
      if (index >= 35 && index <= 42) return 65;
      if (index === 50) return 95;
      return 30;
    });

    const regions = findHighEnergyRegions({ times, values }, 0.6);

    expect(regions).toHaveLength(2);
    expect(regions[0].start).toBeCloseTo(0.1);
    expect(regions[0].end).toBeCloseTo(0.21);
    expect(regions[1].start).toBeCloseTo(0.35);
    expect(regions[1].end).toBeCloseTo(0.43);
  });

  it('bridges a brief dip within a section', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 && index !== 14 && index !== 15 ? 70 : 30);

    const regions = findHighEnergyRegions({ times, values }, 0.4);

    expect(regions).toHaveLength(1);
    expect(regions[0].start).toBeCloseTo(0.1);
    expect(regions[0].end).toBeCloseTo(0.21);
  });

  it('excludes sustained weak energy and low-energy shoulders', () => {
    const times = Array.from({ length: 70 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => {
      if (index >= 14 && index <= 23) return 70;
      if (index >= 10 && index <= 27) return 56;
      if (index >= 40 && index <= 52) return 48;
      return 30;
    });

    const regions = findHighEnergyRegions({ times, values }, 0.7);
    expect(regions).toHaveLength(1);
    expect(regions[0].start).toBeCloseTo(0.14);
    expect(regions[0].end).toBeCloseTo(0.24);
  });

  it('ignores a burst with too little contrast against the background', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 ? 38 : 30);

    expect(findHighEnergyRegions({ times, values }, 0.4)).toEqual([]);
  });

  it('does not create sections from a uniform signal', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    expect(findHighEnergyRegions({ times, values: times.map(() => 60) }, 0.4)).toEqual([]);
  });
});
