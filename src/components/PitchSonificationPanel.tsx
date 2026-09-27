import { useState, useCallback } from 'react';
import { playPitchSonification, type SonificationOptions } from '../audio/pitchSonification';
import type { PitchData } from '../types';

interface PitchSonificationPanelProps {
  pitch: PitchData | null;
  onClose: () => void;
}

export default function PitchSonificationPanel({ pitch, onClose }: PitchSonificationPanelProps) {
  const [mode, setMode] = useState<SonificationOptions['mode']>('sine');
  const [playing, setPlaying] = useState(false);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  const handlePlay = useCallback(() => {
    if (!pitch || pitch.times.length < 2) return;

    const ctx = new AudioContext();
    const { stop } = playPitchSonification(ctx, pitch, { mode });
    setPlaying(true);
    setStopFn(() => stop);

    // Auto-stop when done
    const duration = pitch.times[pitch.times.length - 1] - pitch.times[0];
    setTimeout(() => {
      setPlaying(false);
      setStopFn(null);
    }, duration * 1000 + 200);
  }, [pitch, mode]);

  const handleStop = useCallback(() => {
    stopFn?.();
    setPlaying(false);
    setStopFn(null);
  }, [stopFn]);

  const hasPitch = pitch && pitch.times.length >= 2;
  const voicedCount = pitch?.frequencies.filter(f => f !== null && f > 0).length ?? 0;

  return (
    <div className="p-4 space-y-4 min-w-[320px]">
      <h2 className="text-lg font-semibold">Pitch Sonification</h2>
      <p className="text-sm text-muted-foreground">
        Listen to the pitch track to verify accuracy. Unvoiced regions are silent.
      </p>

      {!hasPitch && (
        <div className="text-sm text-yellow-500">
          No pitch data available. Load an audio file and compute pitch first.
        </div>
      )}

      {hasPitch && (
        <>
          <div className="text-xs text-muted-foreground">
            {pitch!.times.length} frames, {voicedCount} voiced
            ({((voicedCount / pitch!.times.length) * 100).toFixed(0)}%)
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mode</label>
            <div className="flex gap-2">
              {(['sine', 'hum', 'pulse'] as const).map((m) => (
                <button
                  key={m}
                  className={`px-3 py-1.5 rounded text-sm ${
                    mode === m
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  onClick={() => setMode(m)}
                >
                  {m === 'sine' ? '🎵 Sine' : m === 'hum' ? '🗣️ Hum' : '⚡ Pulse'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === 'sine' && 'Smooth sine wave — easiest to hear pitch contour'}
              {mode === 'hum' && 'Pulse train + formants — voice-like humming sound'}
              {mode === 'pulse' && 'Raw glottal pulses — buzzy, shows voicing clearly'}
            </p>
          </div>

          <div className="flex gap-2">
            {!playing ? (
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                onClick={handlePlay}
              >
                ▶ Play
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                onClick={handleStop}
              >
                ■ Stop
              </button>
            )}
          </div>
        </>
      )}

      <button
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
