import { describe, expect, it } from 'vitest';
import { findHighEnergyRegions } from '../src/audio/quickSelect';

function stableFormants(times: number[]) {
  return { times, f1: times.map(() => 500), f2: times.map(() => 1600) };
}

describe('findHighEnergyRegions', () => {
  it('returns a separate section for each sustained energy burst', () => {
    const times = Array.from({ length: 60 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => {
      if (index >= 10 && index <= 20) return 70;
      if (index >= 35 && index <= 42) return 65;
      if (index === 50) return 95;
      return 30;
    });

    const regions = findHighEnergyRegions({ times, values }, 0.6, stableFormants(times));

    expect(regions).toHaveLength(2);
    expect(regions[0].start).toBeCloseTo(0.111);
    expect(regions[0].end).toBeCloseTo(0.199);
    expect(regions[1].start).toBeCloseTo(0.358);
    expect(regions[1].end).toBeCloseTo(0.422);
  });

  it('bridges a brief dip within a section', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 && index !== 14 && index !== 15 ? 70 : 30);

    const regions = findHighEnergyRegions({ times, values }, 0.4, stableFormants(times));

    expect(regions).toHaveLength(1);
    expect(regions[0].start).toBeCloseTo(0.111);
    expect(regions[0].end).toBeCloseTo(0.199);
  });

  it('excludes sustained weak energy and low-energy shoulders', () => {
    const times = Array.from({ length: 70 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => {
      if (index >= 14 && index <= 23) return 70;
      if (index >= 10 && index <= 27) return 56;
      if (index >= 40 && index <= 52) return 48;
      return 30;
    });

    const regions = findHighEnergyRegions({ times, values }, 0.7, stableFormants(times));
    expect(regions).toHaveLength(1);
    expect(regions[0].start).toBeCloseTo(0.15);
    expect(regions[0].end).toBeCloseTo(0.23);
  });

  it('ignores a burst with too little contrast against the background', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 ? 38 : 30);

    expect(findHighEnergyRegions({ times, values }, 0.4, stableFormants(times))).toEqual([]);
  });

  it('does not create sections from a uniform signal', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    expect(findHighEnergyRegions({ times, values: times.map(() => 60) }, 0.4, stableFormants(times))).toEqual([]);
  });

  it('rejects an energetic section when F1 drifts but keeps a flat section', () => {
    const times = Array.from({ length: 60 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 || index >= 35 && index <= 45 ? 70 : 30);
    const formants = stableFormants(times);
    for (let index = 10; index <= 20; index++) formants.f1[index] = 400 + (index - 10) * 30;

    const regions = findHighEnergyRegions({ times, values }, 0.6, formants);

    expect(regions).toHaveLength(1);
    expect(regions[0].start).toBeCloseTo(0.361);
  });

  it('rejects an energetic section when F2 drifts', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 ? 70 : 30);
    const formants = stableFormants(times);
    for (let index = 10; index <= 20; index++) formants.f2[index] = 1200 + (index - 10) * 60;

    expect(findHighEnergyRegions({ times, values }, 0.4, formants)).toEqual([]);
  });

  it('accepts moderate formant variation with intermittent missing readings', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 ? 70 : 30);
    const f1: (number | null)[] = times.map(() => null);
    const f2: (number | null)[] = times.map(() => null);
    [11, 13, 16, 19].forEach((index, point) => {
      f1[index] = [430, 490, 560, 520][point];
      f2[index] = [1430, 1550, 1690, 1600][point];
    });

    expect(findHighEnergyRegions({ times, values }, 0.4, { times, f1, f2 })).toHaveLength(1);
  });

  it('rejects an energetic section with too few paired formant readings', () => {
    const times = Array.from({ length: 40 }, (_, index) => (index + 0.5) * 0.01);
    const values = times.map((_, index) => index >= 10 && index <= 20 ? 70 : 30);
    const formants = { ...stableFormants(times), f2: times.map((_, index) => index === 14 || index === 15 ? 1600 : null) };

    expect(findHighEnergyRegions({ times, values }, 0.4, formants)).toEqual([]);
  });
});
