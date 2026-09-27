/**
 * Automatic IPA vowel annotation based on F1/F2 values.
 *
 * Uses standard reference values for cardinal vowels from
 * Hillenbrand et al. (1995) and IPA handbook norms.
 * F1 correlates with vowel height (open/close), F2 with frontness/backness.
 */

import { isWithinProfileRange, vowelProfiles, type ProfileVowel, type VowelProfile } from './vowelProfiles';
import type { PitchData, SpectrogramData } from '../types';

export interface VowelReference {
  symbol: string;
  f1: number;
  f2: number;
  description: string;
}

/**
 * Reference vowel formant values (adult averages, Hz).
 * Sources: Hillenbrand et al. (1995), Peterson & Barney (1952), IPA norms.
 */
export const vowelReferences: VowelReference[] = [
  // Close front
  { symbol: 'i', f1: 270, f2: 2290, description: 'close front unrounded' },
  { symbol: 'y', f1: 235, f2: 2100, description: 'close front rounded' },
  { symbol: 'ɪ', f1: 390, f2: 1990, description: 'near-close near-front unrounded' },
  // Close-mid front
  { symbol: 'e', f1: 390, f2: 2300, description: 'close-mid front unrounded' },
  { symbol: 'ø', f1: 370, f2: 1900, description: 'close-mid front rounded' },
  // Open-mid front
  { symbol: 'ɛ', f1: 550, f2: 1770, description: 'open-mid front unrounded' },
  { symbol: 'œ', f1: 585, f2: 1710, description: 'open-mid front rounded' },
  // Open front
  { symbol: 'æ', f1: 660, f2: 1720, description: 'near-open front unrounded' },
  { symbol: 'a', f1: 730, f2: 1370, description: 'open front unrounded' },
  // Central
  { symbol: 'ə', f1: 500, f2: 1500, description: 'mid central' },
  { symbol: 'ɐ', f1: 600, f2: 1400, description: 'near-open central' },
  { symbol: 'ɨ', f1: 300, f2: 1600, description: 'close central unrounded' },
  // Close back
  { symbol: 'u', f1: 300, f2: 870, description: 'close back rounded' },
  { symbol: 'ʊ', f1: 440, f2: 1020, description: 'near-close near-back rounded' },
  // Close-mid back
  { symbol: 'o', f1: 360, f2: 880, description: 'close-mid back rounded' },
  { symbol: 'ɤ', f1: 360, f2: 1200, description: 'close-mid back unrounded' },
  // Open-mid back
  { symbol: 'ɔ', f1: 590, f2: 880, description: 'open-mid back rounded' },
  { symbol: 'ʌ', f1: 600, f2: 1170, description: 'open-mid back unrounded' },
  // Open back
  { symbol: 'ɑ', f1: 730, f2: 1090, description: 'open back unrounded' },
  { symbol: 'ɒ', f1: 700, f2: 760, description: 'open back rounded' },
];

export interface IpaAnnotation {
  time: number;
  symbol: string;
  f1: number;
  f2: number;
  averageF1: number;
  averageF2: number;
  confidence: number; // 0-1, based on distance to nearest reference
}

/**
 * Compute Euclidean distance in the F1/F2 vowel space.
 * F1 and F2 are weighted differently since F2 has a larger range.
 * We use Bark-scale normalization for perceptual accuracy.
 */
function hzToBark(hz: number): number {
  return 26.81 / (1 + 1960 / hz) - 0.53;
}

function vowelDistance(f1a: number, f2a: number, f1b: number, f2b: number): number {
  const b1a = hzToBark(f1a);
  const b2a = hzToBark(f2a);
  const b1b = hzToBark(f1b);
  const b2b = hzToBark(f2b);
  return Math.sqrt((b1a - b1b) ** 2 + (b2a - b2b) ** 2);
}

/**
 * Find the closest IPA vowel for given F1/F2 values.
 */
export function classifyVowel(f1: number, f2: number, profile?: VowelProfile): { symbol: string; confidence: number } {
  let minDist = Infinity;
  let bestSymbol = '?';

  for (const ref of profile ? vowelProfiles[profile] : vowelReferences) {
    if (profile && !isWithinProfileRange(f1, f2, ref as ProfileVowel)) continue;
    const dist = vowelDistance(f1, f2, ref.f1, ref.f2);
    if (dist < minDist) {
      minDist = dist;
      bestSymbol = ref.symbol;
    }
  }

  // Confidence: map distance to 0-1 range. Distance of 0 = 1.0, distance > 3 Bark = 0
  const confidence = minDist === Infinity ? 0 : Math.max(0, 1 - minDist / 3);
  return { symbol: bestSymbol, confidence };
}

export interface IpaAnnotationOptions {
  /** Minimum confidence threshold (0-1) to include an annotation */
  minConfidence: number;
  /** Minimum time gap between annotations in seconds (to avoid clutter) */
  minTimeGap: number;
  /** Minimum intensity (dB) to consider a frame voiced */
  minIntensityDb: number;
  filterConsonants: boolean;
  profile?: VowelProfile;
}

const defaultOptions: IpaAnnotationOptions = {
  minConfidence: 0.4,
  minTimeGap: 0.05,
  minIntensityDb: -40,
  filterConsonants: true,
};

export interface VowelEvidence {
  pitch: PitchData;
  spectrogram: SpectrogramData;
}

function nearestFrameIndex(times: number[], time: number, maxGap: number): number {
  let low = 0;
  let high = times.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (times[middle] < time) low = middle + 1;
    else high = middle;
  }
  const before = low - 1;
  const nearest = before >= 0 && (low === times.length || time - times[before] <= times[low] - time)
    ? before : low;
  return nearest < times.length && Math.abs(times[nearest] - time) <= maxGap ? nearest : -1;
}

function voicedSpectralFrames(evidence: VowelEvidence): boolean[] {
  const { spectrogram } = evidence;
  if (spectrogram.freqStep <= 0) return [];
  const startBin = Math.ceil(250 / spectrogram.freqStep);
  const endBin = Math.floor(3000 / spectrogram.freqStep);
  const peaks = spectrogram.magnitudes.map((frame) => {
    let peak = 0;
    for (let bin = startBin; bin <= Math.min(endBin, frame.length - 1); bin++) {
      peak = Math.max(peak, frame[bin]);
    }
    return peak;
  });
  const sortedPeaks = peaks.filter((peak) => peak > 0).sort((left, right) => left - right);
  if (sortedPeaks.length === 0) return [];
  const referencePeak = sortedPeaks[Math.floor((sortedPeaks.length - 1) * 0.9)];
  const strongThreshold = referencePeak * 0.12;

  return spectrogram.magnitudes.map((frame) => {
    const availableBins = Math.max(0, Math.min(endBin, frame.length - 1) - startBin + 1);
    let strongBins = 0;
    for (let bin = startBin; bin < startBin + availableBins; bin++) {
      if (frame[bin] >= strongThreshold) strongBins++;
    }
    return availableBins > 0 && strongBins >= Math.max(3, Math.ceil(availableBins * 0.05));
  });
}

function sustainedVowelFrames(times: number[], evidence: VowelEvidence): boolean[] {
  const spectralFrames = voicedSpectralFrames(evidence);
  const candidates = times.map((time) => {
    const pitchIndex = nearestFrameIndex(evidence.pitch.times, time, 0.03);
    const spectralIndex = nearestFrameIndex(
      evidence.spectrogram.frameTimes, time, Math.max(0.03, evidence.spectrogram.timeStep)
    );
    return pitchIndex >= 0 && evidence.pitch.frequencies[pitchIndex] != null &&
      spectralIndex >= 0 && spectralFrames[spectralIndex] === true;
  });
  const sustained = candidates.map(() => false);
  for (let start = 0; start < candidates.length;) {
    if (!candidates[start]) {
      start++;
      continue;
    }
    let end = start + 1;
    while (end < candidates.length && candidates[end] && times[end] - times[end - 1] <= 0.03) end++;
    if (end - start >= 3) sustained.fill(true, start, end);
    start = end;
  }
  return sustained;
}

/**
 * Generate IPA vowel annotations from formant tracking data.
 * Only annotates frames where both F1 and F2 are present (voiced segments).
 */
export function generateIpaAnnotations(
  times: number[],
  f1: (number | null)[],
  f2: (number | null)[],
  intensityValues?: number[],
  options?: Partial<IpaAnnotationOptions>,
  evidence?: VowelEvidence
): IpaAnnotation[] {
  const opts = { ...defaultOptions, ...options };
  const supportedFrames = opts.filterConsonants && evidence ? sustainedVowelFrames(times, evidence) : null;
  const annotations: IpaAnnotation[] = [];
  const annotationIndices: number[] = [];
  let lastAnnotationTime = -Infinity;

  for (let i = 0; i < times.length; i++) {
    const f1Val = f1[i];
    const f2Val = f2[i];
    if (f1Val === null || f2Val === null) continue;
    if (supportedFrames && !supportedFrames[i]) continue;

    // Skip if below intensity threshold
    if (intensityValues && intensityValues[i] !== undefined && intensityValues[i] < opts.minIntensityDb) {
      continue;
    }

    // Skip if F1/F2 values are implausible
    if (!opts.profile && (f1Val < 150 || f1Val > 1000 || f2Val < 500 || f2Val > 3000)) continue;

    // Enforce minimum time gap
    if (times[i] - lastAnnotationTime < opts.minTimeGap) continue;

    const { symbol, confidence } = classifyVowel(f1Val, f2Val, opts.profile);
    if (symbol !== '?' && confidence >= opts.minConfidence) {
      annotations.push({ time: times[i], symbol, f1: f1Val, f2: f2Val, averageF1: f1Val, averageF2: f2Val, confidence });
      annotationIndices.push(i);
      lastAnnotationTime = times[i];
    }
  }

  for (let annotationIndex = 0; annotationIndex < annotations.length; annotationIndex++) {
    const annotation = annotations[annotationIndex];
    const endIndex = annotationIndices[annotationIndex + 1] ?? times.length;
    let totalF1 = 0;
    let totalF2 = 0;
    let count = 0;

    for (let frameIndex = annotationIndices[annotationIndex]; frameIndex < endIndex; frameIndex++) {
      const frameF1 = f1[frameIndex];
      const frameF2 = f2[frameIndex];
      if (frameF1 == null || frameF2 == null ||
        (supportedFrames && !supportedFrames[frameIndex]) ||
        (!opts.profile && (frameF1 < 150 || frameF1 > 1000 || frameF2 < 500 || frameF2 > 3000)) ||
        (intensityValues?.[frameIndex] !== undefined && intensityValues[frameIndex] < opts.minIntensityDb) ||
        classifyVowel(frameF1, frameF2, opts.profile).symbol !== annotation.symbol) break;
      totalF1 += frameF1;
      totalF2 += frameF2;
      count++;
    }

    annotation.averageF1 = totalF1 / count;
    annotation.averageF2 = totalF2 / count;
  }

  return annotations;
}
