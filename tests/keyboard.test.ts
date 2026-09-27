/**
 * @vitest-environment jsdom
 */
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useKeyboardShortcuts, type KeyboardShortcutHandlers } from '../src/hooks/useKeyboardShortcuts';

function ShortcutHook({ handlers, enabled }: { handlers: KeyboardShortcutHandlers; enabled: boolean }) {
  useKeyboardShortcuts(handlers, enabled);
  return null;
}

function mountHook(handlers: KeyboardShortcutHandlers, enabled: boolean) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(ShortcutHook, { handlers, enabled })));
  return () => act(() => {
    root.unmount();
    container.remove();
  });
}

function makeHandlers(): KeyboardShortcutHandlers {
  return {
    onOpenAudio: vi.fn(),
    onPlayPause: vi.fn(),
    onSelectAll: vi.fn(),
    onMoveSelectionLeft: vi.fn(),
    onMoveSelectionRight: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onFitToWindow: vi.fn(),
  };
}

function fire(key: string, opts: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts });
  document.dispatchEvent(event);
}

describe('useKeyboardShortcuts', () => {
  let unmount: () => void;

  afterEach(() => unmount?.());

  it('O opens audio, regardless of letter case', () => {
    const handlers = makeHandlers();
    unmount = mountHook(handlers, true);
    fire('o');
    fire('O', { shiftKey: true });
    expect(handlers.onOpenAudio).toHaveBeenCalledTimes(2);
  });

  it('does not open audio while typing or using modifiers', () => {
    const handlers = makeHandlers();
    unmount = mountHook(handlers, true);
    fire('o', { metaKey: true });
    fire('o', { ctrlKey: true });
    fire('o', { altKey: true });
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', bubbles: true }));
    input.remove();
    expect(handlers.onOpenAudio).not.toHaveBeenCalled();
  });

  it('Space triggers play/pause', () => {
    const h = makeHandlers();
    unmount = mountHook(h, true);
    fire(' ', { code: 'Space' });
    expect(h.onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('ArrowLeft triggers move selection left', () => {
    const h = makeHandlers();
    unmount = mountHook(h, true);
    fire('ArrowLeft');
    expect(h.onMoveSelectionLeft).toHaveBeenCalledTimes(1);
  });

  it('ArrowRight triggers move selection right', () => {
    const h = makeHandlers();
    unmount = mountHook(h, true);
    fire('ArrowRight');
    expect(h.onMoveSelectionRight).toHaveBeenCalledTimes(1);
  });

  it('does nothing when disabled', () => {
    const h = makeHandlers();
    unmount = mountHook(h, false);
    fire(' ', { code: 'Space' });
    expect(h.onPlayPause).not.toHaveBeenCalled();
  });

  it('Ctrl+= triggers zoom in', () => {
    const h = makeHandlers();
    unmount = mountHook(h, true);
    fire('=', { ctrlKey: true });
    expect(h.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('Ctrl+0 triggers fit to window', () => {
    const h = makeHandlers();
    unmount = mountHook(h, true);
    fire('0', { ctrlKey: true });
    expect(h.onFitToWindow).toHaveBeenCalledTimes(1);
  });
});
