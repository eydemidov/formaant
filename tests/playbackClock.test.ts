import { describe, expect, it } from 'vitest';
import { advancePlaybackClock, playbackStartTime } from '../src/utils/playbackClock';

describe('playbackStartTime', () => {
  it('restarts after the file ends while preserving a cursor or selection start', () => {
    expect(playbackStartTime(2, 2)).toBe(0);
    expect(playbackStartTime(1.2, 2)).toBe(1.2);
    expect(playbackStartTime(2, 2, 0.5)).toBe(0.5);
  });
});

describe('advancePlaybackClock', () => {
  const initial = { displayedTime: 0, mediaTime: 0, wallTime: 0 };

  it('moves between coarse media time updates at the selected speed', () => {
    const first = advancePlaybackClock(initial, 0, 100, 1, 10, false, true);
    const second = advancePlaybackClock(first, 0, 150, 2, 10, false, true);

    expect(first.displayedTime).toBeCloseTo(0.1);
    expect(second.displayedTime).toBeCloseTo(0.2);
  });

  it('stops advancing while playback is paused or buffering', () => {
    const clock = advancePlaybackClock(initial, 0.05, 100, 1, 10, false, false);
    expect(clock.displayedTime).toBe(0.05);
  });

  it('wraps short loops and resynchronizes when media time wraps', () => {
    const clock = advancePlaybackClock(initial, 0, 100, 1, 0.07, true, true);
    const wrapped = advancePlaybackClock({ displayedTime: 0.06, mediaTime: 0.06, wallTime: 100 }, 0.01, 110, 1, 0.07, true, true);

    expect(clock.displayedTime).toBeCloseTo(0.03);
    expect(wrapped.displayedTime).toBeCloseTo(0.01);
  });
});
