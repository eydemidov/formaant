import { describe, expect, it } from 'vitest';
import { defaultAnalysisSettings, defaultFilterSettings } from '../src/audio/defaults';
import { parseAppPreferences } from '../src/utils/preferences';

describe('app preferences', () => {
  it('uses defaults when nothing is saved', () => {
    const preferences = parseAppPreferences(null);
    expect(preferences.settings).toEqual(defaultAnalysisSettings);
    expect(preferences.filterSettings).toEqual(defaultFilterSettings);
    expect(preferences.overlays.ipaFormants).toBe(true);
    expect(preferences.vowelProfile).toBe('modern-rp-male');
  });

  it('restores analysis, filter, and overlay preferences', () => {
    const preferences = parseAppPreferences(JSON.stringify({
      settings: { spectrogram: { colormap: 'magma' }, formant: { maxFrequency: 5000 } },
      filterSettings: { type: 'highpass', cutoffHz: 300 },
      vowelProfile: 'modern-rp-female',
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
    expect(parseAppPreferences(JSON.stringify({ vowelProfile: 'american-male' })).vowelProfile).toBe('american-male');
    expect(parseAppPreferences(JSON.stringify({ vowelProfile: 'american-female' })).vowelProfile).toBe('american-female');
  });

  it('ignores malformed values', () => {
    expect(parseAppPreferences('{broken').settings).toEqual(defaultAnalysisSettings);
    const preferences = parseAppPreferences(JSON.stringify({
      settings: { spectrogram: { fftSize: 123, colormap: 'unknown', hopSize: 'fast' } },
      vowelProfile: 'unknown',
      overlays: { ipa: 'false' },
    }));

    expect(preferences.settings.spectrogram).toEqual(defaultAnalysisSettings.spectrogram);
    expect(preferences.overlays.ipa).toBe(true);
    expect(preferences.vowelProfile).toBe('modern-rp-male');
  });
});
