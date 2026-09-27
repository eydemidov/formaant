import type { AnalysisResult, TimeSelection } from '../types';

interface SelectionStatsProps {
  analysis: AnalysisResult | null;
  selection: TimeSelection | null;
}

function computeStats(values: (number | null)[], times: number[], start: number, end: number) {
  const filtered: number[] = [];
  for (let i = 0; i < times.length; i++) {
    if (times[i] >= start && times[i] <= end && values[i] !== null && values[i]! > 0) {
      filtered.push(values[i]!);
    }
  }
  if (filtered.length === 0) return null;
  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const variance = filtered.reduce((a, b) => a + (b - mean) ** 2, 0) / filtered.length;
  const stdev = Math.sqrt(variance);
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  return { mean, stdev, min, max, n: filtered.length };
}

export function SelectionStats({ analysis, selection }: SelectionStatsProps) {
  if (!analysis || !selection || selection.end - selection.start < 0.001) return null;

  const { start, end } = selection;
  const pitchStats = computeStats(
    analysis.pitch.frequencies,
    analysis.pitch.times,
    start, end
  );

  const f1Stats = computeStats(analysis.formants.f1, analysis.formants.times, start, end);
  const f2Stats = computeStats(analysis.formants.f2, analysis.formants.times, start, end);

  return (
    <>
      <span className="statusbar-item statusbar-cursor-info statusbar-reading statusbar-reading-pitch" title={pitchStats ? `Pitch: ${pitchStats.min.toFixed(0)}–${pitchStats.max.toFixed(0)} Hz, σ=${pitchStats.stdev.toFixed(1)}` : undefined}>
        Pitch: {pitchStats ? `${pitchStats.mean.toFixed(0)} Hz` : '—'}
      </span>
      <span className="statusbar-item statusbar-cursor-info statusbar-reading" title={f1Stats ? `F1: ${f1Stats.min.toFixed(0)}–${f1Stats.max.toFixed(0)} Hz` : undefined}>
        F1: {f1Stats ? f1Stats.mean.toFixed(0) : '—'}
      </span>
      <span className="statusbar-item statusbar-cursor-info statusbar-reading" title={f2Stats ? `F2: ${f2Stats.min.toFixed(0)}–${f2Stats.max.toFixed(0)} Hz` : undefined}>
        F2: {f2Stats ? f2Stats.mean.toFixed(0) : '—'}
      </span>
    </>
  );
}
