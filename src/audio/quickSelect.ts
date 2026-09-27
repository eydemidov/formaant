import type { IntensityData, TimeSelection } from '../types';

export function findHighEnergyRegions(intensity: IntensityData, duration: number): TimeSelection[] {
  const { times, values } = intensity;
  const frameCount = Math.min(times.length, values.length);
  if (frameCount < 2 || duration <= 0) return [];

  const sorted = values.slice(0, frameCount).filter(Number.isFinite).sort((left, right) => left - right);
  if (sorted.length < 2) return [];
  const floor = sorted[Math.floor((sorted.length - 1) * 0.2)];
  const upper = sorted[Math.floor((sorted.length - 1) * 0.95)];
  const peak = upper - floor >= 6 ? upper : sorted[sorted.length - 1];
  if (peak - floor < 15) return [];

  const threshold = Math.max(floor + 15, floor + (peak - floor) * 0.7);
  const frameStep = times[1] - times[0];
  if (frameStep <= 0) return [];
  const regions: TimeSelection[] = [];
  let first = -1;
  let last = -1;

  const finishRegion = () => {
    if (first < 0) return;
    const start = Math.max(0, times[first] - frameStep / 2);
    const end = Math.min(duration, times[last] + frameStep / 2);
    if (end - start >= 0.04) regions.push({ start, end });
  };

  for (let index = 0; index < frameCount; index++) {
    if (!Number.isFinite(values[index]) || values[index] < threshold) continue;
    if (first >= 0 && times[index] - times[last] > 0.04) {
      finishRegion();
      first = -1;
    }
    if (first < 0) first = index;
    last = index;
  }
  finishRegion();
  return regions;
}
