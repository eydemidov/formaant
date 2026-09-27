import { describe, expect, it } from 'vitest';
import {
  exportSelectedRegionWav,
  exportTextGrid,
} from '../src/export';
import { createEmptyTextGrid } from '../src/audio/defaults';

describe('export helpers', () => {
  it('writes a valid wav header', () => {
    const wav = exportSelectedRegionWav(new Float32Array([0, 0.5, -0.5]), 16000);
    const header = new TextDecoder().decode(wav.slice(0, 12));
    expect(header.startsWith('RIFF')).toBe(true);
    expect(header.includes('WAVE')).toBe(true);
  });

  it('formats TextGrid output', () => {
    const textGrid = createEmptyTextGrid(1);
    const text = exportTextGrid(textGrid);
    expect(text).toContain('Object class = "TextGrid"');
    expect(text).toContain('IntervalTier');
  });
});
