import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';

type Tab = 'settings' | 'vowels';

interface RightSidebarProps {
  activeTab: Tab | null;
  children: {
    settings: ReactNode;
    vowels: ReactNode;
  };
}

const FALLBACK_WIDTH = 320;

export function RightSidebar({ activeTab, children }: RightSidebarProps) {
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;

    const handleMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const delta = startX.current - ev.clientX;
      setWidth(Math.max(280, Math.min(800, startWidth.current + delta)));
    };
    const handleUp = () => {
      resizing.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [width]);

  const isOpen = activeTab !== null;

  return (
    <div className="right-sidebar" data-open={isOpen} style={isOpen ? { width: `${width}px` } : undefined}>
      {isOpen && (
        <div className="right-sidebar-resize" onMouseDown={handleResizeStart} />
      )}
      {isOpen && (
        <div className="right-sidebar-content">
          {children[activeTab!]}
        </div>
      )}
    </div>
  );
}
