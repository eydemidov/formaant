import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VowelSpace } from '../src/components/VowelSpace';
import { vowelProfiles, type VowelProfile } from '../src/audio/vowelProfiles';
import type { AnalysisResult, TimeSelection } from '../src/types';

const analysis = {
  formants: {
    times: [0, 1, 2],
    tracked: [[300, 1100, 500], [2200, 1200, 1900]],
  },
} as AnalysisResult;

function renderVowelSpace(
  selection: TimeSelection | null,
  currentTime = 2,
  source = analysis,
  profile: VowelProfile = 'modern-rp-male',
  targetVowel = vowelProfiles[profile][0].symbol
): string {
  return renderToStaticMarkup(createElement(VowelSpace, {
    analysis: source,
    selection,
    currentTime,
    profile,
    onProfileChange: () => {},
    targetVowel,
    onTargetVowelChange: () => {},
  }));
}

describe('vowel space trace and marker', () => {
  it('shows the trace points and nearest marker without a range selection', () => {
    const markup = renderVowelSpace(null);

    expect(markup.match(/fill="var\(--accent, #89b4fa\)"/g)).toHaveLength(2);
    expect(markup).toContain('Target vowel');
    expect(markup).toContain('Target vowel comparison');
    expect(markup).toContain('front ← F2 (Hz) → back');
    expect(markup).toContain('open ← F1 (Hz) → close');
    expect(markup).toContain('<th scope="col">Target</th>');
    expect(markup).toContain('<td>290 Hz</td>');
    expect(markup).toContain('<td>2364 Hz</td>');
    expect(markup).toContain('aria-label="F1 selection 500 Hz, far from target"');
    expect(markup).toContain('aria-label="F2 selection 1900 Hz, far from target"');
    expect(markup).not.toContain('2 points');
    expect(markup).toContain('<polyline');
    expect(markup).toContain('stroke="#ef4444"');
  });

  it('keeps the trace and moves the marker to the range mean, including valid points outside the profile axes', () => {
    const markup = renderVowelSpace({ start: 0, end: 1 });

    expect(markup).toContain('aria-label="F1 selection 700 Hz, far from target"');
    expect(markup).toContain('<td>410 Hz</td>');
    expect(markup).toContain('<td>664 Hz</td>');
    expect(markup).toContain('stroke="#ef4444"');
    expect(markup.match(/fill="var\(--accent, #89b4fa\)"/g)).toHaveLength(1);
  });

  it('colors both measured formants green when they are close to the target', () => {
    const source = {
      formants: { times: [0], tracked: [[300], [2350]] },
    } as AnalysisResult;
    const markup = renderVowelSpace(null, 0, source);

    expect(markup.match(/class="vowel-target-close"/g)).toHaveLength(2);
    expect(markup).toContain('<td>10 Hz</td>');
    expect(markup).toContain('<td>14 Hz</td>');
    expect(markup).not.toContain('✓');
  });

  it('colors F1 and F2 independently', () => {
    const source = {
      formants: { times: [0], tracked: [[300], [1900]] },
    } as AnalysisResult;
    const markup = renderVowelSpace(null, 0, source);

    expect(markup).toContain('aria-label="F1 selection 300 Hz, close to target"');
    expect(markup).toContain('aria-label="F2 selection 1900 Hz, far from target"');
    expect(markup.match(/class="vowel-target-close"/g)).toHaveLength(1);
    expect(markup.match(/class="vowel-target-far"/g)).toHaveLength(1);
  });

  it('uses vowels and means from the active voice profile', () => {
    const markup = renderVowelSpace(null, 2, analysis, 'japanese-male');

    expect(markup).toContain('<td>301 Hz</td>');
    expect(markup).toContain('<td>2154 Hz</td>');
    expect(markup).toContain('i — close front');
    expect(markup).toContain('u — high central Japanese /u/');
  });

  it('shows the saved target vowel instead of the first option', () => {
    const markup = renderVowelSpace(null, 2, analysis, 'modern-rp-male', 'ɪ');

    expect(markup).toContain('<td>394 Hz</td>');
    expect(markup).toContain('<td>1829 Hz</td>');
    expect(markup).toContain('value="ɪ" selected=""');
  });

  it('allows no target while keeping the selection readings visible', () => {
    const markup = renderVowelSpace(null, 2, analysis, 'modern-rp-male', '');

    expect(markup).toContain('<option value="" selected="">None</option>');
    expect(markup).toContain('<td>500 Hz</td>');
    expect(markup).toContain('<td>1900 Hz</td>');
    expect(markup.match(/<td>—<\/td>/g)).toHaveLength(4);
    expect(markup).not.toContain('vowel-target-close');
    expect(markup).not.toContain('vowel-target-far');
  });
});
