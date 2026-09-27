/**
 * Pitch sonification — synthesize audio from pitch track for auditory verification.
 *
 * Two modes:
 * 1. Sine: smooth sine wave following pitch contour
 * 2. Hum: sine wave filtered through vowel-like formants
 */

import type { PitchData } from '../types';

export interface SonificationOptions {
  mode: 'hum' | 'sine';
  sampleRate?: number;
  gain?: number;
}

// Hum formants (same as Praat: Pitch_to_Sound.cpp)
const HUM_FORMANTS = [600, 1400, 2400, 3400, 4500, 5500];
const HUM_BANDWIDTHS = [50, 100, 200, 300, 400, 500];

/**
 * Generate audio buffer from pitch data.
 */
export function sonifyPitch(
  pitch: PitchData,
  options: SonificationOptions = { mode: 'sine' },
): Float32Array {
  const sr = options.sampleRate ?? 44100;
  const gain = options.gain ?? 0.5;

  if (pitch.times.length < 2) return new Float32Array(0);

  const duration = pitch.times[pitch.times.length - 1] - pitch.times[0];
  const startTime = pitch.times[0];
  const numSamples = Math.ceil(duration * sr);
  const output = new Float32Array(numSamples);

  synthesizeSine(output, pitch, startTime, sr, gain);
  if (options.mode === 'hum') {
    applyFormantFilter(output, sr);
  }

  return output;
}

/**
 * Sine wave synthesis — smooth pitch contour playback.
 */
function synthesizeSine(
  output: Float32Array,
  pitch: PitchData,
  startTime: number,
  sr: number,
  gain: number,
): void {
  let phase = 0;
  for (let i = 0; i < output.length; i++) {
    const t = startTime + i / sr;
    const freq = interpolateFreq(pitch, t);
    if (freq !== null && freq > 0) {
      output[i] = gain * Math.sin(phase);
      phase += (2 * Math.PI * freq) / sr;
    } else {
      output[i] = 0;
      // Keep phase for smooth restart
    }
  }
}

/**
 * Apply cascaded second-order resonators (formant filtering) for hum mode.
 */
function applyFormantFilter(samples: Float32Array, sr: number): void {
  for (let f = 0; f < HUM_FORMANTS.length; f++) {
    applyResonator(samples, sr, HUM_FORMANTS[f], HUM_BANDWIDTHS[f]);
  }
  // Normalize
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > max) max = abs;
  }
  if (max > 0) {
    const scale = 0.7 / max;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= scale;
    }
  }
}

/**
 * Second-order IIR resonator (bandpass).
 */
function applyResonator(samples: Float32Array, sr: number, freq: number, bw: number): void {
  const r = Math.exp(-Math.PI * bw / sr);
  const theta = 2 * Math.PI * freq / sr;
  const a1 = -2 * r * Math.cos(theta);
  const a2 = r * r;
  // Mix: output = input + resonator output (parallel formant model)
  let y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = x - a1 * y1 - a2 * y2;
    samples[i] = y * (1 - r);
    y2 = y1;
    y1 = y;
  }
}

/**
 * Linear interpolation of pitch frequency at time t.
 */
function interpolateFreq(pitch: PitchData, t: number): number | null {
  const { times, frequencies } = pitch;
  if (t <= times[0]) return frequencies[0];
  if (t >= times[times.length - 1]) return frequencies[times.length - 1];

  // Binary search
  let lo = 0, hi = times.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid;
    else hi = mid;
  }

  const f0 = frequencies[lo];
  const f1 = frequencies[hi];
  if (f0 === null || f1 === null) return f0 ?? f1;

  const frac = (t - times[lo]) / (times[hi] - times[lo]);
  return f0 + frac * (f1 - f0);
}

/**
 * Play sonified pitch through Web Audio API.
 */
export function playPitchSonification(
  ctx: AudioContext,
  pitch: PitchData,
  options: SonificationOptions = { mode: 'sine' },
): { stop: () => void } {
  const sr = options.sampleRate ?? ctx.sampleRate;
  const samples = sonifyPitch(pitch, { ...options, sampleRate: sr });

  const buffer = ctx.createBuffer(1, samples.length, sr);
  buffer.copyToChannel(samples as unknown as Float32Array<ArrayBuffer>, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();

  return {
    stop: () => {
      try { source.stop(); } catch { /* already stopped */ }
    },
  };
}
