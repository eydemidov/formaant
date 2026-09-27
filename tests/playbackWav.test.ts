import { describe, expect, it } from 'vitest';
import { createPlaybackWav } from '../src/audio/playbackWav';

describe('createPlaybackWav', () => {
  it('encodes mono PCM samples at the supplied sample rate', async () => {
    const blob = createPlaybackWav(Float32Array.of(-1, 0, 1), 16000);
    const view = new DataView(await blob.arrayBuffer());
    const textAt = (offset: number, length: number) => Array.from(
      { length }, (_, index) => String.fromCharCode(view.getUint8(offset + index))
    ).join('');

    expect(blob.type).toBe('audio/wav');
    expect(view.byteLength).toBe(50);
    expect(textAt(0, 4)).toBe('RIFF');
    expect(textAt(8, 4)).toBe('WAVE');
    expect(textAt(36, 4)).toBe('data');
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(6);
    expect(view.getInt16(44, true)).toBe(-32768);
    expect(view.getInt16(46, true)).toBe(0);
    expect(view.getInt16(48, true)).toBe(32767);
  });
});
