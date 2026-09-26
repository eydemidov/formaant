import type { FormantFrame } from '../types';

export interface TrackingOptions {
  /** Weight for transition cost between frames (higher = prefer continuity) */
  transitionCostWeight: number;
  /** Smoothing window size in frames (odd number, applied after Viterbi) */
  smoothingWindow: number;
  /** Median filter kernel size (odd number, 1 = disabled) */
  medianFilterSize: number;
}

const defaultOptions: TrackingOptions = {
  transitionCostWeight: 1.0,
  smoothingWindow: 3,
  medianFilterSize: 3,
};

/**
 * Transition cost: penalizes frequency jumps between consecutive frames.
 * Uses relative difference + log ratio for perceptual scaling.
 */
function transitionCost(prev: number, current: number, weight: number): number {
  const delta = Math.abs(current - prev);
  const logPenalty = Math.abs(Math.log((current + 1) / (prev + 1)));
  return weight * (delta * 0.005 + logPenalty);
}

/**
 * Apply median filter to remove isolated outliers.
 * Preserves null values.
 */
function medianFilter(values: Array<number | null>, kernelSize: number): Array<number | null> {
  if (kernelSize <= 1) return values;
  const half = Math.floor(kernelSize / 2);
  return values.map((value, index) => {
    if (value === null) return null;
    const window: number[] = [];
    for (let offset = -half; offset <= half; offset++) {
      const value = values[index + offset];
      if (value !== undefined && value !== null) {
        window.push(value);
      }
    }
    if (window.length === 0) return null;
    window.sort((a, b) => a - b);
    return window[Math.floor(window.length / 2)];
  });
}

/**
 * Gaussian-weighted smoothing for continuous trajectories.
 * Window size determines how many neighbors contribute.
 */
function gaussianSmooth(values: Array<number | null>, windowSize: number): Array<number | null> {
  if (windowSize <= 1) return values;
  const half = Math.floor(windowSize / 2);
  const sigma = half / 2.5;
  // Precompute Gaussian weights
  const weights: number[] = [];
  for (let offset = -half; offset <= half; offset++) {
    weights.push(Math.exp(-(offset * offset) / (2 * sigma * sigma)));
  }

  return values.map((value, index) => {
    if (value === null) return null;
    let sum = 0;
    let weightSum = 0;
    for (let offset = -half; offset <= half; offset++) {
      const neighbor = values[index + offset];
      if (neighbor !== undefined && neighbor !== null) {
        const w = weights[offset + half];
        sum += neighbor * w;
        weightSum += w;
      }
    }
    return weightSum > 0 ? sum / weightSum : null;
  });
}

/**
 * Viterbi tracking for a single formant across frames.
 * Uses expected frequency as anchor and transition costs for continuity.
 */
function trackSingleFormant(
  frames: FormantFrame[],
  expectedHz: number,
  options: TrackingOptions
): Array<number | null> {
  const track = new Array<number | null>(frames.length).fill(null);
  let segmentStart = 0;

  while (segmentStart < frames.length) {
    if (frames[segmentStart].candidates.length === 0) {
      segmentStart++;
      continue;
    }
    let segmentEnd = segmentStart + 1;
    while (segmentEnd < frames.length && frames[segmentEnd].candidates.length > 0) {
      segmentEnd++;
    }

    const states = frames.slice(segmentStart, segmentEnd).map((frame) => frame.candidates);
    const costs = states.map((state) => new Array(state.length).fill(Number.POSITIVE_INFINITY));
    const backPointers = states.map((state) => new Array(state.length).fill(-1));

    for (let index = 0; index < states[0].length; index++) {
      costs[0][index] = Math.abs(states[0][index] - expectedHz) / expectedHz;
    }

    for (let frameIndex = 1; frameIndex < states.length; frameIndex++) {
      for (let candidateIndex = 0; candidateIndex < states[frameIndex].length; candidateIndex++) {
        const candidate = states[frameIndex][candidateIndex];
        const emission = Math.abs(candidate - expectedHz) / Math.max(expectedHz, 1) * 0.3;
        for (let prevIndex = 0; prevIndex < states[frameIndex - 1].length; prevIndex++) {
          const prev = states[frameIndex - 1][prevIndex];
          const trans = transitionCost(prev, candidate, options.transitionCostWeight);
          const cost = costs[frameIndex - 1][prevIndex] + emission + trans;
          if (cost < costs[frameIndex][candidateIndex]) {
            costs[frameIndex][candidateIndex] = cost;
            backPointers[frameIndex][candidateIndex] = prevIndex;
          }
        }
      }
    }

    let bestIndex = 0;
    let bestCost = Number.POSITIVE_INFINITY;
    const finalFrameCosts = costs[costs.length - 1];
    for (let index = 0; index < finalFrameCosts.length; index++) {
      if (finalFrameCosts[index] < bestCost) {
        bestCost = finalFrameCosts[index];
        bestIndex = index;
      }
    }

    for (let frameIndex = states.length - 1; frameIndex >= 0; frameIndex--) {
      track[segmentStart + frameIndex] = states[frameIndex][bestIndex] ?? null;
      bestIndex = backPointers[frameIndex][bestIndex];
    }
    segmentStart = segmentEnd;
  }

  const filtered = medianFilter(track, options.medianFilterSize);
  return gaussianSmooth(filtered, options.smoothingWindow);
}

/**
 * Track multiple formants across frames with inter-frame smoothing.
 * Returns continuous trajectories for each formant.
 */
export function trackFormants(
  frames: FormantFrame[],
  numberOfFormants = 5,
  options?: Partial<TrackingOptions>
): Array<Array<number | null>> {
  const opts: TrackingOptions = { ...defaultOptions, ...options };
  const expected = [500, 1500, 2500, 3500, 4500];
  const tracks: Array<Array<number | null>> = [];

  // Track formants sequentially, removing assigned candidates to prevent overlap
  const remainingFrames = frames.map((f) => ({ ...f, candidates: [...f.candidates] }));

  for (let i = 0; i < numberOfFormants; i++) {
    const track = trackSingleFormant(remainingFrames, expected[i] ?? expected[expected.length - 1], opts);
    tracks.push(track);

    // Remove the chosen candidate from each frame to avoid reuse
    for (let frameIdx = 0; frameIdx < remainingFrames.length; frameIdx++) {
      const chosen = track[frameIdx];
      if (chosen !== null) {
        const idx = remainingFrames[frameIdx].candidates.findIndex(
          (c) => Math.abs(c - chosen) < 1
        );
        if (idx !== -1) {
          remainingFrames[frameIdx].candidates.splice(idx, 1);
        }
      }
    }
  }
  return tracks;
}
