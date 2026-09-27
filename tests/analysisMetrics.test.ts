import { describe, it, expect } from 'vitest';
import { analyzeAudio } from '../src/audio/analyzer';

describe('Analysis metrics', () => {
  const sampleRate = 16000;
  const duration = 0.1;
  const samples = new Float32Array(Math.floor(sampleRate * duration));
  for (let index = 0; index < samples.length; index++) {
    samples[index] = 0.5 * Math.sin(2 * Math.PI * 440 * index / sampleRate);
  }

  const analysis = analyzeAudio(samples, sampleRate);

  it('has non-negative spectral power', () => {
    const spectrogram = analysis.spectrogram;
    const frameIndex = Math.min(Math.round(0.05 / spectrogram.timeStep), spectrogram.magnitudes.length - 1);
    const frame = spectrogram.magnitudes[frameIndex];
    let totalPower = 0;
    for (let index = 0; index < frame.length; index++) totalPower += frame[index] * frame[index];
    expect(totalPower * spectrogram.freqStep).toBeGreaterThan(0);
  });

  it('has valid intensity values', () => {
    const intensity = analysis.intensity;
    expect(intensity.times.length).toBeGreaterThan(0);
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let index = 0; index < intensity.times.length; index++) {
      const distance = Math.abs(intensity.times[index] - 0.05);
      if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
    }
    expect(intensity.values[bestIndex]).toBeGreaterThan(0);
    expect(intensity.values[bestIndex]).toBeLessThan(120);
  });

  it('has finite harmonicity values', () => {
    const harmonicity = analysis.harmonicity;
    expect(harmonicity.times.length).toBeGreaterThan(0);
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let index = 0; index < harmonicity.times.length; index++) {
      const distance = Math.abs(harmonicity.times[index] - 0.05);
      if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
    }
    expect(Number.isFinite(harmonicity.values[bestIndex])).toBe(true);
  });
});
