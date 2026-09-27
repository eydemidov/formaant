/**
 * @vitest-environment jsdom
 */
import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Spectrogram } from '../src/components/Spectrogram';
import { defaultAnalysisSettings } from '../src/audio/defaults';
import { vowelProfiles } from '../src/audio/vowelProfiles';
import type { AnalysisResult, TimeSelection } from '../src/types';

const analysis = {
  duration: 1,
  settings: defaultAnalysisSettings,
  spectrogram: { magnitudes: [], maxFreq: 3000 },
} as AnalysisResult;

function SelectionHarness() {
  const [selection, setSelection] = useState<TimeSelection | null>(null);
  const [cursor, setCursor] = useState(0);
  return createElement('div', null,
    createElement(Spectrogram, {
      analysis,
      selection,
      currentTime: cursor,
      viewRange: { start: 0, end: 1 },
      showPitch: false,
      showFormants: false,
      showIntensity: false,
      showIpa: false,
      showIpaFormants: false,
      filterConsonants: false,
      vowelReferences: vowelProfiles['modern-rp-male'],
      onWheelZoom: () => {},
      onPan: () => {},
      onZoomSelection: () => {},
      onSelectionChange: setSelection,
      onCursorChange: (time) => { setSelection(null); setCursor(time); },
    }),
    createElement('output', { 'data-testid': 'selection' }, selection ? `${selection.start.toFixed(2)}–${selection.end.toFixed(2)}` : 'none'),
    createElement('output', { 'data-testid': 'cursor' }, cursor.toFixed(2))
  );
}

describe('spectrogram selection', () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.restoreAllMocks();
  });

  it('keeps a dragged range on release and moves the cursor only for a click', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    cleanup = () => act(() => { root.unmount(); container.remove(); });
    act(() => root.render(createElement(SelectionHarness)));
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    const selection = () => container.querySelector('[data-testid="selection"]')?.textContent;
    const cursor = () => container.querySelector('[data-testid="cursor"]')?.textContent;
    const fire = (type: string, clientX: number) => act(() => {
      canvas.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX }));
    });

    fire('mousedown', 20);
    fire('mousemove', 60);
    fire('mouseup', 60);
    expect(selection()).toBe('0.20–0.60');
    expect(cursor()).toBe('0.00');

    fire('mousedown', 40);
    fire('mousemove', 50);
    fire('mouseup', 50);
    expect(selection()).toBe('0.30–0.70');

    fire('mousedown', 70);
    fire('mousemove', 80);
    fire('mouseup', 80);
    expect(selection()).toBe('0.30–0.80');

    fire('mousedown', 90);
    fire('mouseup', 90);
    expect(selection()).toBe('none');
    expect(cursor()).toBe('0.90');
  });
});
