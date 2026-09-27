export interface PlaybackClock {
  displayedTime: number;
  mediaTime: number;
  wallTime: number;
}

export function advancePlaybackClock(
  previous: PlaybackClock,
  mediaTime: number,
  wallTime: number,
  speed: number,
  duration: number,
  looping: boolean,
  advancing: boolean
): PlaybackClock {
  if (!advancing) return { displayedTime: mediaTime, mediaTime, wallTime };

  const elapsed = Math.max(0, (wallTime - previous.wallTime) / 1000);
  let displayedTime: number;
  if (looping) {
    displayedTime = mediaTime < previous.mediaTime - 0.01
      ? mediaTime
      : duration > 0 ? (previous.displayedTime + elapsed * speed) % duration : mediaTime;
  } else {
    displayedTime = Math.min(duration, Math.max(mediaTime, previous.displayedTime + elapsed * speed));
  }

  return { displayedTime, mediaTime, wallTime };
}
