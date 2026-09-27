import type { AnalysisResult } from '../types';
import { SelectionStats } from './SelectionStats';

interface StatusBarProps {
  hasAudio: boolean;
  analysis: AnalysisResult | null;
  duration: number;
  selection: { start: number; end: number } | null;
  sampleRate: number;
  isRecording: boolean;
  streamDuration?: number;
  cursorTime?: number;
  pitchAtCursor?: number | null;
  formantsAtCursor?: { f1: number | null; f2: number | null; f3: number | null };
}

export function StatusBar({ hasAudio, analysis, duration, selection, sampleRate, isRecording, streamDuration, cursorTime, pitchAtCursor, formantsAtCursor }: StatusBarProps) {
  const fmt = (t: number) => t.toFixed(3) + 's';
  const hasSelection = selection != null && selection.end - selection.start >= 0.001;

  return (
    <footer className="statusbar" role="status" aria-label="Status bar">
      {isRecording && (
        <span className="statusbar-item statusbar-recording">
          <span className="recording-dot" /> REC {streamDuration != null ? fmt(streamDuration) : ''}
        </span>
      )}
      {hasAudio && (
        <>
          <span className="statusbar-item">Duration: {fmt(duration)}</span>
          <span className="statusbar-item">Sample Rate: {sampleRate} Hz</span>
          {selection && (
            <span className="statusbar-item">
              Selection: {fmt(selection.start)} – {fmt(selection.end)} ({((selection.end - selection.start) * 1000).toFixed(0)} ms)
            </span>
          )}
          <SelectionStats analysis={analysis} selection={selection} />
          {cursorTime != null && !hasSelection && (
            <span className="statusbar-item statusbar-cursor-info">
              {pitchAtCursor != null && pitchAtCursor > 0 ? `F0: ${pitchAtCursor.toFixed(1)} Hz` : 'F0: —'}
              {formantsAtCursor && (
                <> · F1: {formantsAtCursor.f1 != null && formantsAtCursor.f1 > 0 ? Math.round(formantsAtCursor.f1) : '—'} · F2: {formantsAtCursor.f2 != null && formantsAtCursor.f2 > 0 ? Math.round(formantsAtCursor.f2) : '—'}</>
              )}
            </span>
          )}
        </>
      )}
      {!hasAudio && !isRecording && (
        <span className="statusbar-item statusbar-hint">Drop an audio file or press Record to begin</span>
      )}
    </footer>
  );
}
