import { useMemo } from 'react';
import { hzToBark } from '../audio/ipaMapper';
import { vowelProfiles, VOWEL_RANGE_ALLOWANCE, type VowelProfile } from '../audio/vowelProfiles';
import type { AnalysisResult, TimeSelection } from '../types';

const CLOSE_TARGET_BARK = 1;

interface VowelSpaceProps {
  analysis: AnalysisResult | null;
  selection: TimeSelection | null;
  currentTime: number;
  profile: VowelProfile;
  onProfileChange: (profile: VowelProfile) => void;
  targetVowel: string;
  onTargetVowelChange: (symbol: string) => void;
}

interface VowelPoint {
  f1: number;
  f2: number;
  time: number;
}

export function VowelSpace({ analysis, selection, currentTime, profile, onProfileChange, targetVowel, onTargetVowelChange }: VowelSpaceProps) {
  const hasRange = selection !== null && selection.end > selection.start;
  const references = vowelProfiles[profile];
  const target = targetVowel ? references.find((vowel) => vowel.symbol === targetVowel) ?? references[0] : undefined;
  const f1Min = Math.floor(Math.min(...references.map((vowel) => (vowel.f1Min ?? vowel.f1) * (1 - VOWEL_RANGE_ALLOWANCE))) / 100) * 100;
  const f1Max = Math.ceil(Math.max(...references.map((vowel) => (vowel.f1Max ?? vowel.f1) * (1 + VOWEL_RANGE_ALLOWANCE))) / 100) * 100;
  const f2Min = Math.floor(Math.min(...references.map((vowel) => (vowel.f2Min ?? vowel.f2) * (1 - VOWEL_RANGE_ALLOWANCE))) / 100) * 100;
  const f2Max = Math.ceil(Math.max(...references.map((vowel) => (vowel.f2Max ?? vowel.f2) * (1 + VOWEL_RANGE_ALLOWANCE))) / 100) * 100;
  const f1Ticks = Array.from(
    { length: Math.floor(f1Max / 200) - Math.ceil(f1Min / 200) + 1 },
    (_, index) => (Math.ceil(f1Min / 200) + index) * 200
  );
  const f2Ticks = Array.from(
    { length: Math.floor(f2Max / 500) - Math.ceil(f2Min / 500) + 1 },
    (_, index) => (Math.ceil(f2Min / 500) + index) * 500
  );
  const allPoints = useMemo(() => {
    if (!analysis) return [];
    const result: VowelPoint[] = [];
    const f1Track = analysis.formants.tracked[0] ?? [];
    const f2Track = analysis.formants.tracked[1] ?? [];
    const times = analysis.formants.times;

    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      const f1 = f1Track[i];
      const f2 = f2Track[i];
      if (f1 != null && f2 != null && Number.isFinite(f1) && Number.isFinite(f2) && f1 > 0 && f2 > 0) {
        result.push({ f1, f2, time: t });
      }
    }
    return result;
  }, [analysis]);

  const selectedPoints = useMemo(() => {
    if (!hasRange || !selection) return allPoints;
    return allPoints.filter((point) => point.time >= selection.start && point.time <= selection.end);
  }, [allPoints, selection, hasRange]);

  const points = useMemo(() => selectedPoints.filter((point) =>
    point.f1 >= f1Min && point.f1 <= f1Max && point.f2 >= f2Min && point.f2 <= f2Max
  ), [selectedPoints, f1Min, f1Max, f2Min, f2Max]);

  const selectionAverage = useMemo(() => {
    if (!hasRange || selectedPoints.length === 0) return null;
    let totalF1 = 0;
    let totalF2 = 0;
    for (const point of selectedPoints) {
      totalF1 += point.f1;
      totalF2 += point.f2;
    }
    return { f1: totalF1 / selectedPoints.length, f2: totalF2 / selectedPoints.length };
  }, [hasRange, selectedPoints]);

  const nearestPoint = useMemo(() => {
    let nearest: VowelPoint | null = null;
    let minDist = Infinity;
    for (const point of allPoints) {
      const distance = Math.abs(point.time - currentTime);
      if (distance < minDist) { minDist = distance; nearest = point; }
    }
    return nearest;
  }, [allPoints, currentTime]);

  const marker = hasRange ? selectionAverage : nearestPoint;
  const comparisonRows = [
    { label: 'F1', target: target?.f1, measured: marker?.f1 },
    { label: 'F2', target: target?.f2, measured: marker?.f2 },
  ];

  // Plot dimensions
  const width = 280;
  const height = 260;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Axes: F2 (x, reversed: high left) and F1 (y: small at top, large at bottom — IPA convention)
  const toX = (f2: number) => margin.left + (1 - (f2 - f2Min) / (f2Max - f2Min)) * plotW;
  const toY = (f1: number) => margin.top + ((f1 - f1Min) / (f1Max - f1Min)) * plotH;

  return (
    <div className="vowel-space-panel">
      <div className="vowel-space-header">
        Vowel Space
        <select
          value={profile}
          onChange={(e) => onProfileChange(e.target.value as VowelProfile)}
          className="vowel-space-select"
          aria-label="Vowel matching profile"
        >
          <option value="modern-rp-male">Modern RP male</option>
          <option value="modern-rp-female">Modern RP female</option>
          <option value="american-male">American male</option>
          <option value="american-female">American female</option>
          <option value="mandarin-male">Mandarin male</option>
          <option value="mandarin-female">Mandarin female</option>
          <option value="french-male">French male</option>
          <option value="french-female">French female</option>
          <option value="japanese-male">Japanese male</option>
          <option value="japanese-female">Japanese female</option>
          <option value="serbian-male">Serbian male</option>
          <option value="serbian-female">Serbian female</option>
        </select>
      </div>
      <svg width={width} height={height} className="vowel-space-svg">
        {/* Background */}
        <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="var(--bg-base)" stroke="var(--border)" />

        {/* Grid lines */}
        {f1Ticks.map(f1 => (
          <line key={`f1-${f1}`} x1={margin.left} x2={margin.left + plotW} y1={toY(f1)} y2={toY(f1)} stroke="var(--border)" strokeDasharray="2,2" />
        ))}
        {f2Ticks.map(f2 => (
          <line key={`f2-${f2}`} x1={toX(f2)} x2={toX(f2)} y1={margin.top} y2={margin.top + plotH} stroke="var(--border)" strokeDasharray="2,2" />
        ))}

        {/* IPA reference points */}
        {references.map((v) => (
          <g key={`${v.symbol}-${v.description}`}>
            <title>{v.description}</title>
            <text
              x={toX(v.f2)}
              y={toY(v.f1)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill={v.symbol === target?.symbol ? '#ffffff' : 'var(--text-dim)'}
              opacity={v.symbol === target?.symbol ? 1 : 0.6}
            >
              {v.symbol}
            </text>
          </g>
        ))}

        {/* Trajectory line */}
        {points.length > 1 && (
          <polyline
            points={points.map(p => `${toX(p.f2)},${toY(p.f1)}`).join(' ')}
            fill="none"
            stroke="var(--accent, #89b4fa)"
            strokeWidth="0.8"
            opacity="0.4"
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.f2)}
            cy={toY(p.f1)}
            r="2"
            fill="var(--accent, #89b4fa)"
            opacity="0.6"
          />
        ))}

        {marker && (
          <circle
            cx={toX(marker.f2)}
            cy={toY(marker.f1)}
            r="5"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}

        {/* Axis labels */}
        <text x={margin.left + plotW / 2} y={height - 4} textAnchor="middle" fontSize="10" fill="var(--text-dim)">
          front ← F2 (Hz) → back
        </text>
        <text x={10} y={margin.top + plotH / 2} textAnchor="middle" fontSize="10" fill="var(--text-dim)" transform={`rotate(-90, 10, ${margin.top + plotH / 2})`}>
          open ← F1 (Hz) → close
        </text>

        {/* F2 tick labels */}
        {f2Ticks.map(f2 => (
          <text key={f2} x={toX(f2)} y={margin.top + plotH + 12} textAnchor="middle" fontSize="9" fill="var(--text-dim)">
            {f2}
          </text>
        ))}

        {/* F1 tick labels */}
        {f1Ticks.map(f1 => (
          <text key={f1} x={margin.left - 4} y={toY(f1)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="var(--text-dim)">
            {f1}
          </text>
        ))}
      </svg>

      <div className="vowel-target">
        <label className="vowel-target-control">
          Target vowel
          <select aria-label="Target vowel" value={target?.symbol ?? ''} onChange={(event) => onTargetVowelChange(event.target.value)}>
            <option value="">None</option>
            {references.map((vowel) => (
              <option key={vowel.symbol} value={vowel.symbol}>{vowel.symbol} — {vowel.description}</option>
            ))}
          </select>
        </label>
        <table className="vowel-target-table" aria-label="Target vowel comparison">
          <thead>
            <tr>
              <th scope="col" aria-label="Formant" />
              <th scope="col">Target</th>
              <th scope="col">Selection</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => {
              const isClose = row.measured !== undefined && row.target !== undefined && Math.abs(hzToBark(row.measured) - hzToBark(row.target)) <= CLOSE_TARGET_BARK;
              return (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.target === undefined ? '—' : `${row.target} Hz`}</td>
                  <td
                    className={row.measured === undefined || row.target === undefined ? undefined : isClose ? 'vowel-target-close' : 'vowel-target-far'}
                    aria-label={row.measured === undefined || row.target === undefined ? undefined : `${row.label} selection ${row.measured.toFixed(0)} Hz, ${isClose ? 'close to' : 'far from'} target`}
                  >
                    {row.measured === undefined ? '—' : `${row.measured.toFixed(0)} Hz`}
                  </td>
                  <td>{row.measured === undefined || row.target === undefined ? '—' : `${Math.abs(row.measured - row.target).toFixed(0)} Hz`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
