import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { parseCustomVowelProfile, type CustomVowelProfile, type ProfileVowel } from '../audio/vowelProfiles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface DraftVowel {
  id: string;
  symbol: string;
  description: string;
  f1: string;
  f2: string;
  f1Min: string;
  f1Max: string;
  f2Min: string;
  f2Max: string;
}

function toDraft(vowel: ProfileVowel): DraftVowel {
  return {
    id: crypto.randomUUID(),
    symbol: vowel.symbol,
    description: vowel.description,
    f1: String(vowel.f1),
    f2: String(vowel.f2),
    f1Min: vowel.f1Min == null ? '' : String(vowel.f1Min),
    f1Max: vowel.f1Max == null ? '' : String(vowel.f1Max),
    f2Min: vowel.f2Min == null ? '' : String(vowel.f2Min),
    f2Max: vowel.f2Max == null ? '' : String(vowel.f2Max),
  };
}

function emptyVowel(): DraftVowel {
  return { id: crypto.randomUUID(), symbol: '', description: '', f1: '', f2: '', f1Min: '', f1Max: '', f2Min: '', f2Max: '' };
}

interface CustomProfileDialogProps {
  initialProfile: CustomVowelProfile;
  editing: boolean;
  onSave: (profile: CustomVowelProfile) => void;
  onDelete: (id: CustomVowelProfile['id']) => void;
  onClose: () => void;
}

export function CustomProfileDialog({ initialProfile, editing, onSave, onDelete, onClose }: CustomProfileDialogProps) {
  const [name, setName] = useState(initialProfile.name);
  const [vowels, setVowels] = useState(() => initialProfile.vowels.map(toDraft));
  const [error, setError] = useState('');

  const updateVowel = (id: string, field: keyof Omit<DraftVowel, 'id'>, value: string) => {
    setVowels((current) => current.map((vowel) => vowel.id === id ? { ...vowel, [field]: value } : vowel));
    setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseCustomVowelProfile({
      id: initialProfile.id,
      name,
      vowels: vowels.map((vowel) => ({
        symbol: vowel.symbol,
        description: vowel.description,
        f1: Number(vowel.f1),
        f2: Number(vowel.f2),
        f1Min: vowel.f1Min === '' ? undefined : Number(vowel.f1Min),
        f1Max: vowel.f1Max === '' ? undefined : Number(vowel.f1Max),
        f2Min: vowel.f2Min === '' ? undefined : Number(vowel.f2Min),
        f2Max: vowel.f2Max === '' ? undefined : Number(vowel.f2Max),
      })),
    });
    if (!parsed) {
      setError('Add at least one vowel with a unique symbol, positive F1/F2 values, and valid ranges.');
      return;
    }
    onSave(parsed);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="custom-profile-dialog">
        <DialogHeader><DialogTitle>{editing ? 'Edit voice profile' : 'New voice profile'}</DialogTitle></DialogHeader>
        <form className="custom-profile-form" onSubmit={handleSubmit}>
          <label className="custom-profile-name">
            Profile name
            <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} />
          </label>
          <div className="custom-profile-list" aria-label="Profile vowels">
            {vowels.map((vowel, index) => (
              <div className="custom-profile-vowel" key={vowel.id}>
                <div className="custom-profile-vowel-heading">
                  <span>Vowel {index + 1}</span>
                  <button type="button" aria-label={`Remove vowel ${index + 1}`} onClick={() => setVowels((current) => current.filter((item) => item.id !== vowel.id))}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="custom-profile-vowel-fields">
                  <label>Symbol<input aria-label={`Vowel ${index + 1} symbol`} value={vowel.symbol} onChange={(event) => updateVowel(vowel.id, 'symbol', event.target.value)} required /></label>
                  <label>Description<input aria-label={`Vowel ${index + 1} description`} value={vowel.description} onChange={(event) => updateVowel(vowel.id, 'description', event.target.value)} /></label>
                  {(['f1', 'f2'] as const).map((formant) => (
                    <div className="custom-profile-formant" key={formant}>
                      <label>{formant.toUpperCase()}<input aria-label={`Vowel ${index + 1} ${formant.toUpperCase()}`} type="number" min="1" step="any" value={vowel[formant]} onChange={(event) => updateVowel(vowel.id, formant, event.target.value)} required /></label>
                      <label>Min<input aria-label={`Vowel ${index + 1} ${formant.toUpperCase()} minimum`} type="number" min="1" step="any" value={vowel[`${formant}Min`]} onChange={(event) => updateVowel(vowel.id, `${formant}Min`, event.target.value)} /></label>
                      <label>Max<input aria-label={`Vowel ${index + 1} ${formant.toUpperCase()} maximum`} type="number" min="1" step="any" value={vowel[`${formant}Max`]} onChange={(event) => updateVowel(vowel.id, `${formant}Max`, event.target.value)} /></label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="custom-profile-add" type="button" onClick={() => setVowels((current) => [...current, emptyVowel()])}><Plus size={15} /> Add vowel</button>
          {error && <p className="custom-profile-error" role="alert">{error}</p>}
          <div className="custom-profile-actions">
            {editing && <button className="custom-profile-delete" type="button" onClick={() => { onDelete(initialProfile.id); onClose(); }}>Delete profile</button>}
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save profile</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
