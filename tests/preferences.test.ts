import { describe, expect, it } from 'vitest';
import { defaultAnalysisSettings, defaultFilterSettings } from '../src/audio/defaults';
import { vowelProfiles } from '../src/audio/vowelProfiles';
import { parseAppPreferences } from '../src/utils/preferences';

describe('app preferences', () => {
  it('uses defaults when nothing is saved', () => {
    const preferences = parseAppPreferences(null);
    expect(preferences.settings).toEqual(defaultAnalysisSettings);
    expect(preferences.settings.formant).toMatchObject({
      maxFrequency: 3000,
      lpcOrder: 24,
      numberOfFormants: 2,
    });
    expect(preferences.filterSettings).toEqual(defaultFilterSettings);
    expect(preferences.overlays.ipaFormants).toBe(true);
    expect(preferences.filterConsonants).toBe(true);
    expect(preferences.vowelProfile).toBe('modern-rp-male');
    expect(preferences.customProfiles).toEqual([]);
    expect(preferences.targetVowel).toBe('iː');
  });

  it('restores analysis, filter, and overlay preferences', () => {
    const preferences = parseAppPreferences(JSON.stringify({
      settings: { spectrogram: { colormap: 'magma' }, formant: { maxFrequency: 5000 } },
      filterSettings: { type: 'highpass', cutoffHz: 300 },
      vowelProfile: 'modern-rp-female',
      targetVowel: 'ʉː',
      filterConsonants: false,
      overlays: { pitch: false, ipaFormants: false },
    }));

    expect(preferences.settings.spectrogram.colormap).toBe('magma');
    expect(preferences.settings.spectrogram.fftSize).toBe(defaultAnalysisSettings.spectrogram.fftSize);
    expect(preferences.settings.formant.maxFrequency).toBe(5000);
    expect(preferences.filterSettings).toMatchObject({ type: 'highpass', cutoffHz: 300 });
    expect(preferences.overlays.pitch).toBe(false);
    expect(preferences.overlays.ipaFormants).toBe(false);
    expect(preferences.overlays.formants).toBe(true);
    expect(preferences.vowelProfile).toBe('modern-rp-female');
    expect(preferences.targetVowel).toBe('ʉː');
    expect(preferences.filterConsonants).toBe(false);
    for (const vowelProfile of Object.keys(vowelProfiles)) {
      expect(parseAppPreferences(JSON.stringify({ vowelProfile })).vowelProfile).toBe(vowelProfile);
    }
  });

  it('ignores malformed values', () => {
    expect(parseAppPreferences('{broken').settings).toEqual(defaultAnalysisSettings);
    const preferences = parseAppPreferences(JSON.stringify({
      settings: { spectrogram: { fftSize: 123, colormap: 'unknown', hopSize: 'fast' } },
      vowelProfile: 'unknown',
      filterConsonants: 'false',
      overlays: { ipa: 'false' },
    }));

    expect(preferences.settings.spectrogram).toEqual(defaultAnalysisSettings.spectrogram);
    expect(preferences.overlays.ipa).toBe(true);
    expect(preferences.vowelProfile).toBe('modern-rp-male');
    expect(preferences.targetVowel).toBe('iː');
    expect(preferences.filterConsonants).toBe(true);
    expect(parseAppPreferences(JSON.stringify({ vowelProfile: 'toString' })).vowelProfile).toBe('modern-rp-male');
    expect(parseAppPreferences(JSON.stringify({ vowelProfile: 'french-male', targetVowel: 'iː' })).targetVowel).toBe('i');
  });

  it('restores an empty target vowel across profiles', () => {
    expect(parseAppPreferences(JSON.stringify({ vowelProfile: 'french-male', targetVowel: '' })).targetVowel).toBe('');
  });

  it('restores a selected custom profile and its vowels', () => {
    const customProfiles = [{ id: 'custom:practice', name: 'Practice', vowels: [
      { symbol: 'ɒ', f1: 620, f2: 980, f1Min: 590, f1Max: 650, description: 'practice vowel' },
    ] }];
    const preferences = parseAppPreferences(JSON.stringify({ customProfiles, vowelProfile: 'custom:practice', targetVowel: 'ɒ' }));

    expect(preferences.customProfiles[0]).toMatchObject(customProfiles[0]);
    expect(preferences.vowelProfile).toBe('custom:practice');
    expect(preferences.targetVowel).toBe('ɒ');
  });

  it('rejects malformed custom profiles and falls back when the selected one is missing', () => {
    const preferences = parseAppPreferences(JSON.stringify({
      customProfiles: [{ id: 'custom:bad', name: 'Bad', vowels: [{ symbol: 'i', f1: -1, f2: 2000, description: '' }] }],
      vowelProfile: 'custom:bad',
      targetVowel: 'i',
    }));

    expect(preferences.customProfiles).toEqual([]);
    expect(preferences.vowelProfile).toBe('modern-rp-male');
    expect(preferences.targetVowel).toBe('iː');
  });
});
