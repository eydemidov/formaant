import React from 'react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from './ui/menubar';

interface MenuBarProps {
  onLoadFile: (file: File) => void;
  onOpenCommandPalette?: () => void;
}

function FileInput({ accept, onFile, children }: { accept: string; onFile: (f: File) => void; children: React.ReactNode }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Render input via portal to document.body so it persists after menu closes
  React.useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    input.addEventListener('change', () => {
      if (input.files?.[0]) onFile(input.files[0]);
      input.value = '';
    });
    (inputRef as React.MutableRefObject<HTMLInputElement>).current = input;
    document.body.appendChild(input);
    return () => { document.body.removeChild(input); };
  }, [accept, onFile]);

  return (
    <MenubarItem onClick={() => inputRef.current?.click()}>{children}</MenubarItem>
  );
}

export function MenuBar(props: MenuBarProps) {
  const {
    onLoadFile,
    onOpenCommandPalette,
  } = props;

  return (
    <div className="menubar-row">
    <Menubar>
      {/* File */}
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <FileInput accept="audio/*" onFile={onLoadFile}>Open Audio…</FileInput>
        </MenubarContent>
      </MenubarMenu>

      {/* Help */}
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => document.dispatchEvent(new CustomEvent('open-shortcuts-dialog'))}>
            Keyboard Shortcuts
          </MenubarItem>
          <MenubarItem onClick={() => document.dispatchEvent(new CustomEvent('open-about-dialog'))}>
            About Web-Praat
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
    <button className="command-palette-trigger" onClick={onOpenCommandPalette} title="Command Palette (⌘⇧P)">
      ⌘⇧P
    </button>
    </div>
  );
}
