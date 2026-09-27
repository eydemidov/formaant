import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VowelSpace } from '../src/components/VowelSpace';
import type { AnalysisResult, TimeSelection, VowelSpaceMode } from '../src/types';

const analysis = {
  formants: {
    times: [0, 1, 2],
    tracked: [[300, 1100, 500], [2200, 1200, 1900]],
  },
} as AnalysisResult;

function renderVowelSpace(mode: VowelSpaceMode, selection: TimeSelection | null, currentTime = 2): string {
  return renderToStaticMarkup(createElement(VowelSpace, {
    analysis,
    selection,
    currentTime,
    profile: 'modern-rp-male',
    onProfileChange: () => {},
    mode,
    onModeChange: () => {},
  }));
}

describe('vowel space display modes', () => {
  it('keeps the trace points and current marker in Trace mode', () => {
    const markup = renderVowelSpace('trace', null);

    expect(markup.match(/fill="var\(--accent, #89b4fa\)"/g)).toHaveLength(2);
    expect(markup).toContain('F1: 500 Hz | F2: 1900 Hz');
    expect(markup).toContain('2 points');
    expect(markup).toContain('stroke="#ef4444"');
  });

  it('shows only the mean marker for a range, including valid points outside the profile axes', () => {
    const markup = renderVowelSpace('average', { start: 0, end: 1 });

    expect(markup).toContain('Average F1: 700 Hz | F2: 1700 Hz');
    expect(markup).toContain('stroke="#ef4444"');
    expect(markup).not.toContain('fill="var(--accent, #89b4fa)"');
    expect(markup).not.toContain('<polyline');
  });

  it('shows the nearest point when Average has no range selection', () => {
    const markup = renderVowelSpace('average', null);

    expect(markup).toContain('F1: 500 Hz | F2: 1900 Hz');
    expect(markup).not.toContain('Average F1');
    expect(markup).not.toContain('fill="var(--accent, #89b4fa)"');
  });
});
