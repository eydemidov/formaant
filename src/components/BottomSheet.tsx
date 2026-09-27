import type { ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  open: boolean;
  title: string;
  onClose: () => void;
}

export function BottomSheet({ children, open, title, onClose }: BottomSheetProps) {
  if (!open) return null;

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label={`${title} panel`}>
        <div className="bottom-sheet-handle" />
        <button className="bottom-sheet-close" onClick={onClose} aria-label="Close panel">×</button>
        {children}
      </div>
    </>
  );
}
