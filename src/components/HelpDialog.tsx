import { useEffect } from 'react';

const shortcuts = [
  { keys: 'O', description: 'Open audio' },
  { keys: 'R', description: 'Start / Stop recording' },
  { keys: 'Space', description: 'Play / Pause' },
  { keys: '⌘/Ctrl + A', description: 'Select all' },
  { keys: '← / →', description: 'Move selection / pan' },
  { keys: '⌘/Ctrl + + / =', description: 'Zoom in' },
  { keys: '⌘/Ctrl + -', description: 'Zoom out' },
  { keys: '⌘/Ctrl + 0', description: 'Fit to window' },
  { keys: '?', description: 'Show this help' },
];

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="shortcuts-overlay" role="dialog" aria-modal="true" aria-label="Help" onClick={onClose}>
      <div className="shortcuts-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Help</h2>
          <button className="shortcuts-close" onClick={onClose} aria-label="Close help dialog">×</button>
        </div>
        <section className="help-about">
          <h3>About Formaant</h3>
          <p>A browser-based tool for speech analysis and accent training, based on Web Praat.</p>
          <p>Analyze pitch, formants, intensity, and spectrograms while practicing pronunciation.</p>
          <p>GPL-3.0 · <a href="https://github.com/eydemidov/formaant" target="_blank" rel="noreferrer">On GitHub</a></p>
        </section>
        <section>
          <h3 className="help-section-title">Keyboard Shortcuts</h3>
          <div className="shortcuts-list" role="list">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.keys} className="shortcut-row" role="listitem">
                <kbd className="shortcut-keys">{shortcut.keys}</kbd>
                <span className="shortcut-desc">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </section>
        <p className="shortcuts-hint">Press <kbd>Esc</kbd> to close</p>
      </div>
    </div>
  );
}
