/**
 * Export publication-quality figure as PNG.
 * Renders waveform + spectrogram + pitch/formants
 * at high DPI for academic papers.
 */
import type { AnalysisResult, ViewRange } from '../types';
import { getColormap } from '../utils/colormap';
import { pitchToY } from '../utils/view';

export interface FigureExportOptions {
  width?: number;       // pixels (default 2400 for ~8 inches at 300 dpi)
  height?: number;      // pixels (default 1200)
  dpi?: number;         // metadata only (PNG doesn't embed DPI natively)
  showPitch?: boolean;
  showFormants?: boolean;
  showIntensity?: boolean;
  viewRange?: ViewRange;
  fontSize?: number;    // base font size in px
}

export function exportFigurePng(
  analysis: AnalysisResult,
  options: FigureExportOptions = {}
): void {
  const {
    width = 2400,
    height = 1200,
    showPitch = true,
    showFormants = true,

    viewRange = { start: 0, end: analysis.duration },
    fontSize = 14,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Layout
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotW = width - margin.left - margin.right;
  const waveH = Math.round((height - margin.top - margin.bottom) * 0.25);
  const specH = height - margin.top - margin.bottom - waveH;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // ─── Waveform ───────────────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(margin.left, margin.top);

  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  const waveStep = Math.max(1, Math.floor(analysis.waveform.length / plotW));
  for (let px = 0; px < plotW; px++) {
    const sampleIdx = Math.floor((viewRange.start + (px / plotW) * (viewRange.end - viewRange.start)) * analysis.sampleRate);
    let min = 0, max = 0;
    for (let s = 0; s < waveStep; s++) {
      const i = sampleIdx + s;
      if (i < analysis.waveform.length) {
        const v = analysis.waveform[i];
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const yMin = waveH / 2 - min * (waveH / 2);
    const yMax = waveH / 2 - max * (waveH / 2);
    ctx.moveTo(px, yMin);
    ctx.lineTo(px, yMax);
  }
  ctx.stroke();

  // Zero line
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, waveH / 2);
  ctx.lineTo(plotW, waveH / 2);
  ctx.stroke();

  ctx.restore();

  // ─── Spectrogram ────────────────────────────────────────────────────────────

  const { spectrogram } = analysis;
  const maxDisplayFreq = Math.min(analysis.settings.formant.maxFrequency, spectrogram.maxFreq);
  const binsToShow = Math.min(
    spectrogram.magnitudes[0]?.length ?? 0,
    Math.ceil(maxDisplayFreq / spectrogram.freqStep)
  );

  if (spectrogram.magnitudes.length > 0) {
    const globalMax = spectrogram.magnitudes.reduce((m, frame) => {
      for (let i = 0; i < frame.length; i++) m = Math.max(m, frame[i]);
      return m;
    }, 1e-6);

    const colorForValue = getColormap(analysis.settings.spectrogram.colormap);
    const dynRange = analysis.settings.spectrogram.dynamicRangeDb;

    // Render pixel-by-pixel for high quality
    const imgData = ctx.createImageData(plotW, specH);
    for (let px = 0; px < plotW; px++) {
      const time = viewRange.start + (px / plotW) * (viewRange.end - viewRange.start);
      // Find nearest frame
      let frameIdx = 0;
      let minDist = Infinity;
      for (let i = 0; i < spectrogram.frameTimes.length; i++) {
        const d = Math.abs(spectrogram.frameTimes[i] - time);
        if (d < minDist) { minDist = d; frameIdx = i; }
      }
      const frame = spectrogram.magnitudes[frameIdx];
      if (!frame) continue;

      for (let py = 0; py < specH; py++) {
        const bin = Math.floor((1 - py / specH) * binsToShow);
        if (bin >= frame.length) continue;
        const value = frame[bin] / globalMax;
        const db = 20 * Math.log10(Math.max(value, 1e-6));
        const normalized = Math.max(0, Math.min(1, 1 - Math.abs(db) / Math.max(dynRange, 1)));
        const [r, g, b] = colorForValue(normalized);
        const idx = (py * plotW + px) * 4;
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, margin.left, margin.top + waveH);
  }

  // Overlays need offset
  ctx.save();
  ctx.translate(margin.left, margin.top + waveH);

  // Pitch overlay
  if (showPitch) {
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < analysis.pitch.times.length; i++) {
      const f = analysis.pitch.frequencies[i];
      const t = analysis.pitch.times[i];
      if (f === null || t < viewRange.start || t > viewRange.end) {
        started = false;
        continue;
      }
      const x = (t - viewRange.start) / (viewRange.end - viewRange.start) * plotW;
      const y = pitchToY(f, specH, analysis.settings.pitch.minHz, analysis.settings.pitch.maxHz);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Pitch ${analysis.settings.pitch.maxHz} Hz`, plotW - 4, 4);
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${analysis.settings.pitch.minHz} Hz`, plotW - 4, specH - 4);
    ctx.restore();
  }

  // Formant overlay
  if (showFormants) {
    const colors = ['#dc2626', '#16a34a', '#2563eb'];
    analysis.formants.tracked.forEach((track, idx) => {
      ctx.fillStyle = colors[idx] ?? '#dc2626';
      track.forEach((f, fi) => {
        if (f === null) return;
        const t = analysis.formants.times[fi];
        if (t < viewRange.start || t > viewRange.end || f > maxDisplayFreq) return;
        const x = (t - viewRange.start) / (viewRange.end - viewRange.start) * plotW;
        const y = specH - (f / maxDisplayFreq) * specH;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  ctx.restore();

  // ─── Axes ───────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#000000';
  ctx.font = `${fontSize}px sans-serif`;

  // Y-axis frequency labels
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const freqSteps = [0, 1000, 2000, 3000, 4000, 5000].filter(f => f <= maxDisplayFreq);
  if (!freqSteps.includes(maxDisplayFreq)) freqSteps.push(maxDisplayFreq);
  for (const freq of freqSteps) {
    const y = margin.top + waveH + specH - (freq / maxDisplayFreq) * specH;
    ctx.fillText(`${freq / 1000}k`, margin.left - 8, y);
  }

  // X-axis time labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const duration = viewRange.end - viewRange.start;
  const timeStep = duration < 1 ? 0.1 : duration < 5 ? 0.5 : 1;
  for (let t = Math.ceil(viewRange.start / timeStep) * timeStep; t <= viewRange.end; t += timeStep) {
    const x = margin.left + (t - viewRange.start) / duration * plotW;
    ctx.fillText(`${t.toFixed(1)}s`, x, height - margin.bottom + 8);
  }

  // Axis labels
  ctx.save();
  ctx.translate(15, margin.top + waveH + specH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Frequency (Hz)', 0, 0);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillText('Time (s)', margin.left + plotW / 2, height - 8);

  // ─── Border ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin.left, margin.top, plotW, waveH + specH);

  // ─── Download ───────────────────────────────────────────────────────────────
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'figure.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
