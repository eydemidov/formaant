import { describe, it, expect } from 'vitest';
import { classifyVowel, generateIpaAnnotations, vowelReferences } from '../src/audio/ipaVowels';
import { vowelProfiles } from '../src/audio/vowelProfiles';

describe('IPA Vowel Classification', () => {
  it('keeps each active profile target inside its stated range', () => {
    for (const [profile, references] of Object.entries(vowelProfiles)) {
      expect(references).toHaveLength(profile.startsWith('modern-rp-') ? 11 : profile.startsWith('japanese-') ? 5 : 10);
      expect(references.every((reference) => !/onset|glide/.test(reference.description))).toBe(true);
      for (const reference of references) {
        if (reference.f1Min != null) expect(reference.f1).toBeGreaterThanOrEqual(reference.f1Min);
        if (reference.f1Max != null) expect(reference.f1).toBeLessThanOrEqual(reference.f1Max);
        if (reference.f2Min != null) expect(reference.f2).toBeGreaterThanOrEqual(reference.f2Min);
        if (reference.f2Max != null) expect(reference.f2).toBeLessThanOrEqual(reference.f2Max);
      }
    }
  });

  it('uses the selected Modern RP profile for matching', () => {
    expect(classifyVowel(290, 2364, 'modern-rp-male').symbol).toBe('iː');
    expect(classifyVowel(290, 2364, 'modern-rp-female').symbol).toBe('?');
    expect(classifyVowel(845, 1663, 'modern-rp-female').symbol).toBe('a');
  });

  it('allows five percent beyond each profile range bound', () => {
    expect(classifyVowel(262, 2364, 'modern-rp-male').symbol).toBe('iː');
    expect(classifyVowel(256, 2364, 'modern-rp-male').symbol).toBe('?');
    expect(classifyVowel(1005, 1663, 'modern-rp-female').symbol).toBe('a');
    expect(classifyVowel(1030, 1663, 'modern-rp-female').symbol).toBe('?');
    expect(classifyVowel(280, 2338, 'american-male').symbol).toBe('i');
    expect(classifyVowel(275, 2338, 'american-male').symbol).toBe('?');
    expect(classifyVowel(1150, 1558, 'american-female').symbol).toBe('ɑ');
    expect(classifyVowel(1180, 1558, 'american-female').symbol).toBe('?');
  });

  it('uses the supplied American male and female targets', () => {
    expect(classifyVowel(340, 2338, 'american-male').symbol).toBe('i');
    expect(classifyVowel(436, 2767, 'american-female').symbol).toBe('i');
    expect(classifyVowel(918, 1558, 'american-female').symbol).toBe('ɑ');
  });

  it('uses the supplied Mandarin targets without range limits', () => {
    for (const profile of ['mandarin-male', 'mandarin-female'] as const) {
      for (const reference of vowelProfiles[profile]) {
        expect(classifyVowel(reference.f1, reference.f2, profile)).toMatchObject({
          symbol: reference.symbol,
          confidence: 1,
        });
        expect(reference.f1Min).toBeNull();
        expect(reference.f1Max).toBeNull();
        expect(reference.f2Min).toBeNull();
        expect(reference.f2Max).toBeNull();
      }
    }
    expect(classifyVowel(280, 2200, 'mandarin-male').symbol).toBe('i');
  });

  it('uses the supplied French targets without range limits', () => {
    for (const profile of ['french-male', 'french-female'] as const) {
      for (const reference of vowelProfiles[profile]) {
        expect(classifyVowel(reference.f1, reference.f2, profile)).toMatchObject({
          symbol: reference.symbol,
          confidence: 1,
        });
        expect(reference.f1Min).toBeUndefined();
        expect(reference.f1Max).toBeUndefined();
        expect(reference.f2Min).toBeUndefined();
        expect(reference.f2Max).toBeUndefined();
      }
    }
  });

  it('uses the supplied Japanese targets and five-percent range allowance', () => {
    for (const profile of ['japanese-male', 'japanese-female'] as const) {
      for (const reference of vowelProfiles[profile]) {
        expect(classifyVowel(reference.f1, reference.f2, profile)).toMatchObject({
          symbol: reference.symbol,
          confidence: 1,
        });
      }
    }
    expect(classifyVowel(258, 2154, 'japanese-male').symbol).toBe('i');
    expect(classifyVowel(257, 2154, 'japanese-male').symbol).toBe('?');
  });

  it('classifies close front vowel [i]', () => {
    const result = classifyVowel(270, 2290);
    expect(result.symbol).toBe('i');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('classifies open back vowel [ɑ]', () => {
    const result = classifyVowel(730, 1090);
    expect(result.symbol).toBe('ɑ');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('classifies close back vowel [u]', () => {
    const result = classifyVowel(300, 870);
    expect(result.symbol).toBe('u');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('classifies mid central vowel [ə]', () => {
    const result = classifyVowel(500, 1500);
    expect(result.symbol).toBe('ə');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('classifies open-mid front vowel [ɛ]', () => {
    const result = classifyVowel(550, 1770);
    expect(result.symbol).toBe('ɛ');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('returns lower confidence for ambiguous values', () => {
    // Midway between two vowels
    const result = classifyVowel(450, 1400);
    expect(result.confidence).toBeLessThan(0.9);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('has all reference vowels with valid F1/F2', () => {
    for (const ref of vowelReferences) {
      expect(ref.f1).toBeGreaterThan(100);
      expect(ref.f1).toBeLessThan(1000);
      expect(ref.f2).toBeGreaterThan(500);
      expect(ref.f2).toBeLessThan(3000);
    }
  });
});

describe('generateIpaAnnotations', () => {
  it('uses the selected profile when annotating frames', () => {
    const annotations = generateIpaAnnotations(
      [0, 0.1], [290, 1005], [2364, 1663], undefined,
      { profile: 'modern-rp-female' }
    );
    expect(annotations.map((annotation) => annotation.symbol)).toEqual(['a']);
    expect(generateIpaAnnotations(
      [0], [1150], [1558], undefined,
      { profile: 'american-female' }
    ).map((annotation) => annotation.symbol)).toEqual(['ɑ']);
  });

  it('generates annotations for voiced frames', () => {
    const times = [0.0, 0.1, 0.2, 0.3, 0.4];
    const f1: (number | null)[] = [270, null, 730, 500, 300];
    const f2: (number | null)[] = [2290, null, 1090, 1500, 870];

    const annotations = generateIpaAnnotations(times, f1, f2);
    expect(annotations.length).toBeGreaterThan(0);
    expect(annotations[0].symbol).toBe('i');
    expect(annotations[0].time).toBe(0.0);
  });

  it('skips null frames', () => {
    const times = [0.0, 0.1, 0.2];
    const f1: (number | null)[] = [null, null, null];
    const f2: (number | null)[] = [null, null, null];

    const annotations = generateIpaAnnotations(times, f1, f2);
    expect(annotations).toHaveLength(0);
  });

  it('respects minTimeGap', () => {
    const times = [0.0, 0.01, 0.02, 0.03, 0.1];
    const f1: (number | null)[] = [270, 270, 270, 270, 730];
    const f2: (number | null)[] = [2290, 2290, 2290, 2290, 1090];

    const annotations = generateIpaAnnotations(times, f1, f2, undefined, { minTimeGap: 0.05 });
    // Should only get 2: one at 0.0 and one at 0.1
    expect(annotations.length).toBe(2);
  });

  it('averages formants across the frames represented by each vowel label', () => {
    const times = [0, 0.02, 0.04, 0.1, 0.12, 0.14];
    const f1 = [260, 270, 280, 720, 730, 740];
    const f2 = [2280, 2290, 2300, 1080, 1090, 1100];

    const annotations = generateIpaAnnotations(times, f1, f2, undefined, { minTimeGap: 0.08 });

    expect(annotations).toHaveLength(2);
    expect(annotations[0]).toMatchObject({ symbol: 'i', averageF1: 270, averageF2: 2290 });
    expect(annotations[1]).toMatchObject({ symbol: 'ɑ', averageF1: 730, averageF2: 1090 });
  });

  it('stops averaging at a frame without formants', () => {
    const annotations = generateIpaAnnotations(
      [0, 0.02, 0.04, 0.06],
      [260, 280, null, 300],
      [2280, 2300, null, 2320],
      undefined,
      { minTimeGap: 0.08 }
    );

    expect(annotations).toHaveLength(1);
    expect(annotations[0]).toMatchObject({ averageF1: 270, averageF2: 2290 });
  });

  it('filters by intensity threshold', () => {
    const times = [0.0, 0.1, 0.2];
    const f1: (number | null)[] = [270, 730, 300];
    const f2: (number | null)[] = [2290, 1090, 870];
    const intensity = [-50, -30, -60]; // Only middle one above -40

    const annotations = generateIpaAnnotations(times, f1, f2, intensity, {
      minIntensityDb: -40,
      minTimeGap: 0,
    });
    expect(annotations.length).toBe(1);
    expect(annotations[0].time).toBe(0.1);
  });

  it('rejects implausible F1/F2 values', () => {
    const times = [0.0, 0.1];
    const f1: (number | null)[] = [50, 5000]; // Too low, too high
    const f2: (number | null)[] = [2000, 1000];

    const annotations = generateIpaAnnotations(times, f1, f2);
    expect(annotations).toHaveLength(0);
  });

  it('requires sustained voicing and strong low-frequency spectrum when evidence is provided', () => {
    const times = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08];
    const vowelSpectrum = Float64Array.from({ length: 80 }, (_, bin) =>
      bin >= 6 && bin <= 12 ? 0.5 : 0
    );
    const sparseSpectrum = Float64Array.from({ length: 80 }, (_, bin) => bin === 8 ? 0.5 : 0);
    const evidence = {
      pitch: { times, frequencies: [120, 120, 120, null, null, null, 120, 120, 120] },
      spectrogram: {
        frameTimes: times,
        timeStep: 0.01,
        freqStep: 50,
        maxFreq: 4000,
        magnitudes: [vowelSpectrum, vowelSpectrum, vowelSpectrum, vowelSpectrum,
          vowelSpectrum, vowelSpectrum, sparseSpectrum, sparseSpectrum, sparseSpectrum],
      },
    };
    const annotations = generateIpaAnnotations(
      times, times.map(() => 270), times.map(() => 2290), undefined,
      { minTimeGap: 0 }, evidence
    );

    expect(annotations.map((annotation) => annotation.time)).toEqual([0, 0.01, 0.02]);
  });

  it('rejects an isolated loud burst even with a pitch estimate', () => {
    const times = [0, 0.01, 0.02];
    const burst = Float64Array.from({ length: 80 }, (_, bin) =>
      bin >= 6 && bin <= 12 ? 1 : 0
    );
    const silence = new Float64Array(80);
    const annotations = generateIpaAnnotations(
      times, [270, 270, 270], [2290, 2290, 2290], undefined,
      { minTimeGap: 0 },
      {
        pitch: { times, frequencies: [120, 120, 120] },
        spectrogram: {
          frameTimes: times, timeStep: 0.01, freqStep: 50, maxFreq: 4000,
          magnitudes: [silence, burst, silence],
        },
      }
    );

    expect(annotations).toHaveLength(0);
  });
});
