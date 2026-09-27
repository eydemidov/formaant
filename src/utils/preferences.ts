import { defaultAnalysisSettings, defaultFilterSettings } from '../audio/defaults';
import { getProfileVowels, isBuiltInVowelProfile, parseCustomVowelProfile, vowelProfiles, type CustomVowelProfile, type VowelProfileId } from '../audio/vowelProfiles';
import type { AnalysisSettings, FilterSettings } from '../types';

const STORAGE_KEY = 'formaant-preferences';

export interface AppPreferences {
  settings: AnalysisSettings;
  filterSettings: FilterSettings;
  vowelProfile: VowelProfileId;
  customProfiles: CustomVowelProfile[];
  targetVowel: string;
  filterConsonants: boolean;
  overlays: {
    pitch: boolean;
    formants: boolean;
    intensity: boolean;
    ipa: boolean;
    ipaFormants: boolean;
  };
}

const defaults: AppPreferences = {
  settings: defaultAnalysisSettings,
  filterSettings: defaultFilterSettings,
  vowelProfile: 'modern-rp-male',
  customProfiles: [],
  targetVowel: vowelProfiles['modern-rp-male'][0].symbol,
  filterConsonants: true,
  overlays: {
    pitch: true,
    formants: true,
    intensity: true,
    ipa: true,
    ipaFormants: true,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeSection<T extends object>(fallback: T, saved: unknown): T {
  if (!isRecord(saved)) return { ...fallback };
  const merged = { ...fallback };
  for (const key of Object.keys(fallback) as Array<keyof T>) {
    const value = saved[key as string];
    if (typeof value === typeof fallback[key] && (typeof value !== 'number' || Number.isFinite(value))) {
      merged[key] = value as T[typeof key];
    }
  }
  return merged;
}

export function parseAppPreferences(raw: string | null): AppPreferences {
  if (!raw) return defaults;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved)) return defaults;

    const savedSettings = isRecord(saved.settings) ? saved.settings : {};
    const spectrogram = mergeSection(defaultAnalysisSettings.spectrogram, savedSettings.spectrogram);
    const pitch = mergeSection(defaultAnalysisSettings.pitch, savedSettings.pitch);
    const formant = mergeSection(defaultAnalysisSettings.formant, savedSettings.formant);
    const filterSettings = mergeSection(defaultFilterSettings, saved.filterSettings);

    if (![256, 512, 1024, 2048, 4096].includes(spectrogram.fftSize)) {
      spectrogram.fftSize = defaultAnalysisSettings.spectrogram.fftSize;
    }
    if (!['hanning', 'hamming', 'gaussian', 'bartlett', 'rectangular'].includes(spectrogram.windowFunction)) {
      spectrogram.windowFunction = defaultAnalysisSettings.spectrogram.windowFunction;
    }
    if (!['jet', 'grayscale', 'viridis', 'magma'].includes(spectrogram.colormap)) {
      spectrogram.colormap = defaultAnalysisSettings.spectrogram.colormap;
    }
    if (!['none', 'lowpass', 'highpass', 'bandpass', 'notch'].includes(filterSettings.type)) {
      filterSettings.type = defaultFilterSettings.type;
    }

    const customProfiles = Array.isArray(saved.customProfiles)
      ? saved.customProfiles.map(parseCustomVowelProfile).filter((profile): profile is CustomVowelProfile => profile !== null)
      : [];
    const uniqueProfiles = customProfiles.filter((profile, index) => customProfiles.findIndex((candidate) => candidate.id === profile.id) === index);
    const vowelProfile = isBuiltInVowelProfile(saved.vowelProfile) ||
      (typeof saved.vowelProfile === 'string' && uniqueProfiles.some((profile) => profile.id === saved.vowelProfile))
      ? saved.vowelProfile as VowelProfileId : defaults.vowelProfile;
    const references = getProfileVowels(vowelProfile, uniqueProfiles);

    return {
      settings: { spectrogram, pitch, formant },
      filterSettings,
      vowelProfile,
      customProfiles: uniqueProfiles,
      targetVowel: typeof saved.targetVowel === 'string' && (saved.targetVowel === '' || references.some((vowel) => vowel.symbol === saved.targetVowel))
        ? saved.targetVowel
        : references[0].symbol,
      filterConsonants: typeof saved.filterConsonants === 'boolean' ? saved.filterConsonants : defaults.filterConsonants,
      overlays: mergeSection(defaults.overlays, saved.overlays),
    };
  } catch {
    return defaults;
  }
}

export function loadAppPreferences(): AppPreferences {
  if (typeof window === 'undefined') return defaults;
  try {
    return parseAppPreferences(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return defaults;
  }
}

export function saveAppPreferences(preferences: AppPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    return;
  }
}
