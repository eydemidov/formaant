import type { FormantData, IntensityData, TimeSelection } from '../types';

function isFormantRegionFlat(region: TimeSelection, formants: Pick<FormantData, 'times' | 'f1' | 'f2'>): boolean {
  const firstFormants: number[] = [];
  const secondFormants: number[] = [];
  let frameCount = 0;

  for (let index = 0; index < formants.times.length; index++) {
    const time = formants.times[index];
    if (time < region.start || time > region.end) continue;
    frameCount++;
    const first = formants.f1[index];
    const second = formants.f2[index];
    if (first == null || second == null || !Number.isFinite(first) || !Number.isFinite(second) || first <= 0 || second <= 0) continue;
    firstFormants.push(first);
    secondFormants.push(second);
  }

  if (firstFormants.length < 2 || firstFormants.length / frameCount < 0.4) return false;

  const isFlat = (values: number[], minimumRange: number, relativeRange: number) => {
    values.sort((left, right) => left - right);
    const low = values[Math.floor(values.length * 0.1)];
    const high = values[Math.ceil(values.length * 0.9) - 1];
    const median = values[Math.floor(values.length / 2)];
    return high - low <= Math.max(minimumRange, median * relativeRange);
  };

  return isFlat(firstFormants, 150, 0.3) && isFlat(secondFormants, 300, 0.25);
}

export function findHighEnergyRegions(
  intensity: IntensityData,
  duration: number,
  formants: Pick<FormantData, 'times' | 'f1' | 'f2'>
): TimeSelection[] {
  const { times, values } = intensity;
  const frameCount = Math.min(times.length, values.length);
  if (frameCount < 2 || duration <= 0) return [];

  const sorted = values.slice(0, frameCount).filter(Number.isFinite).sort((left, right) => left - right);
  if (sorted.length < 2) return [];
  const floor = sorted[Math.floor((sorted.length - 1) * 0.2)];
  const upper = sorted[Math.floor((sorted.length - 1) * 0.95)];
  const peak = upper - floor >= 6 ? upper : sorted[sorted.length - 1];
  if (peak - floor < 20) return [];

  const threshold = Math.max(floor + 20, floor + (peak - floor) * 0.7);
  const frameStep = times[1] - times[0];
  if (frameStep <= 0) return [];
  const regions: TimeSelection[] = [];
  let first = -1;
  let last = -1;

  const finishRegion = () => {
    if (first < 0) return;
    const start = Math.max(0, times[first] - frameStep / 2);
    const end = Math.min(duration, times[last] + frameStep / 2);
    if (end - start >= 0.04) {
      const trim = (end - start) * 0.1;
      const region = { start: start + trim, end: end - trim };
      if (isFormantRegionFlat(region, formants)) regions.push(region);
    }
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
