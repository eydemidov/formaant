import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VowelSpace } from '../src/components/VowelSpace';
import type { AnalysisResult, TimeSelection } from '../src/types';

const analysis = {
  formants: {
    times: [0, 1, 2],
    tracked: [[300, 1100, 500], [2200, 1200, 1900]],
  },
} as AnalysisResult;

function renderVowelSpace(selection: TimeSelection | null, currentTime = 2): string {
  return renderToStaticMarkup(createElement(VowelSpace, {
    analysis,
    selection,
    currentTime,
    profile: 'modern-rp-male',
    onProfileChange: () => {},
  }));
}

describe('vowel space trace and marker', () => {
  it('shows the trace points and nearest marker without a range selection', () => {
    const markup = renderVowelSpace(null);

    expect(markup.match(/fill="var\(--accent, #89b4fa\)"/g)).toHaveLength(2);
    expect(markup).toContain('F1: 500 Hz | F2: 1900 Hz');
    expect(markup).toContain('2 points');
    expect(markup).toContain('<polyline');
    expect(markup).toContain('stroke="#ef4444"');
  });

  it('keeps the trace and moves the marker to the range mean, including valid points outside the profile axes', () => {
    const markup = renderVowelSpace({ start: 0, end: 1 });

    expect(markup).toContain('F1: 700 Hz | F2: 1700 Hz');
    expect(markup).toContain('stroke="#ef4444"');
    expect(markup.match(/fill="var\(--accent, #89b4fa\)"/g)).toHaveLength(1);
  });
});
