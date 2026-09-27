/**
 * @vitest-environment jsdom
 */
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VowelSpace } from '../src/components/VowelSpace';
import type { CustomVowelProfile } from '../src/audio/vowelProfiles';

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('custom voice profile editor', () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.unstubAllGlobals();
  });

  it('copies the selected profile, supports add/remove, and saves it', () => {
    let nextId = 0;
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => String(++nextId)) });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    cleanup = () => act(() => { root.unmount(); container.remove(); });
    const savedProfiles: CustomVowelProfile[] = [];
    const deletedProfiles: string[] = [];

    act(() => root.render(createElement(VowelSpace, {
      analysis: null,
      selection: null,
      currentTime: 0,
      profile: 'japanese-male',
      customProfiles: [],
      onProfileChange: () => {},
      onSaveCustomProfile: (profile) => savedProfiles.push(profile),
      onDeleteCustomProfile: (id) => deletedProfiles.push(id),
      targetVowel: 'i',
      onTargetVowelChange: () => {},
    })));

    act(() => (container.querySelector('[aria-label="Add voice profile"]') as HTMLButtonElement).click());
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.querySelector('.custom-profile-delete')).toBeNull();
    expect((dialog.querySelector('.custom-profile-name input') as HTMLInputElement).value).toBe('Japanese male copy');
    expect(dialog.querySelectorAll('.custom-profile-vowel')).toHaveLength(5);
    expect((dialog.querySelector('[aria-label="Vowel 1 F1"]') as HTMLInputElement).value).toBe('301');

    act(() => (dialog.querySelector('[aria-label="Remove vowel 1"]') as HTMLButtonElement).click());
    expect(dialog.querySelectorAll('.custom-profile-vowel')).toHaveLength(4);
    act(() => (dialog.querySelector('.custom-profile-add') as HTMLButtonElement).click());
    expect(dialog.querySelectorAll('.custom-profile-vowel')).toHaveLength(5);

    act(() => {
      setInputValue(dialog.querySelector('[aria-label="Vowel 5 symbol"]') as HTMLInputElement, 'ɒ');
      setInputValue(dialog.querySelector('[aria-label="Vowel 5 F1"]') as HTMLInputElement, '620');
      setInputValue(dialog.querySelector('[aria-label="Vowel 5 F2"]') as HTMLInputElement, '980');
    });
    act(() => (dialog.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

    expect(savedProfiles).toHaveLength(1);
    expect(savedProfiles[0].name).toBe('Japanese male copy');
    expect(savedProfiles[0].vowels).toHaveLength(5);
    expect(savedProfiles[0].vowels[savedProfiles[0].vowels.length - 1]).toMatchObject({ symbol: 'ɒ', f1: 620, f2: 980 });
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    act(() => root.render(createElement(VowelSpace, {
      analysis: null,
      selection: null,
      currentTime: 0,
      profile: savedProfiles[0].id,
      customProfiles: savedProfiles,
      onProfileChange: () => {},
      onSaveCustomProfile: (profile) => savedProfiles.push(profile),
      onDeleteCustomProfile: (id) => deletedProfiles.push(id),
      targetVowel: 'ɒ',
      onTargetVowelChange: () => {},
    })));
    act(() => (container.querySelector('[aria-label="Edit voice profile"]') as HTMLButtonElement).click());
    const editDialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect((editDialog.querySelector('.custom-profile-name input') as HTMLInputElement).value).toBe('Japanese male copy');
    act(() => setInputValue(editDialog.querySelector('.custom-profile-name input') as HTMLInputElement, 'Practice profile'));
    act(() => (editDialog.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(savedProfiles[1]).toMatchObject({ id: savedProfiles[0].id, name: 'Practice profile' });

    act(() => (container.querySelector('[aria-label="Edit voice profile"]') as HTMLButtonElement).click());
    const deleteDialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(deleteDialog.querySelector('.custom-profile-actions')?.firstElementChild?.textContent).toBe('Delete profile');
    act(() => (deleteDialog.querySelector('.custom-profile-delete') as HTMLButtonElement).click());
    expect(deletedProfiles).toEqual([savedProfiles[0].id]);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
