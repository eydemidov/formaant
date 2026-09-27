import { useState } from 'react';
import {
  Play, Pause, Square, Circle,
  AudioLines, Waves, Activity, Languages, Hash, Filter, FolderOpen, CircleHelp, Settings,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ToolbarProps {
  hasAudio: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  onOpenAudio: () => void;
  onRecord: () => void;
  onStopRecord: () => void;
  onPlay: () => void;
  onPause: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  onHelp: () => void;
  activePanel: 'settings' | 'vowels' | null;
  onToggleSettings: () => void;
  onToggleVowelSpace: () => void;
  // Overlay toggles
  showPitch: boolean;
  showFormants: boolean;
  showIntensity: boolean;
  showIpa: boolean;
  showIpaFormants: boolean;
  filterConsonants: boolean;
  onTogglePitch: () => void;
  onToggleFormants: () => void;
  onToggleIntensity: () => void;
  onToggleIpa: () => void;
  onToggleIpaFormants: () => void;
  onToggleConsonantFilter: () => void;
}

function IconBtn({ icon: Icon, label, onClick, disabled, active, danger, color }: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  color?: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`toolbar-btn${active ? ' toolbar-btn-active' : ''}${danger ? ' toolbar-btn-danger' : ''}`}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            style={active && color ? { color, borderColor: color } : undefined}
          >
            <Icon size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Toolbar(props: ToolbarProps) {
  const {
    hasAudio, isPlaying, isRecording,
    onOpenAudio, onRecord, onStopRecord, onPlay, onPause, onHelp,
    playbackSpeed, onPlaybackSpeedChange,
    activePanel, onToggleSettings, onToggleVowelSpace,
    showPitch, showFormants, showIntensity, showIpa, showIpaFormants, filterConsonants,
    onTogglePitch, onToggleFormants, onToggleIntensity, onToggleIpa, onToggleIpaFormants, onToggleConsonantFilter,
  } = props;
  const [speedInput, setSpeedInput] = useState(playbackSpeed.toFixed(1));

  const handleSpeedInput = (value: string) => {
    setSpeedInput(value);
    const speed = Number(value);
    if (value.trim() !== '' && speed >= 0.2 && speed <= 2) onPlaybackSpeedChange(Math.round(speed * 10) / 10);
  };

  return (
    <div className="toolbar" role="toolbar" aria-label="Tools">
      <div className="toolbar-group">
        <IconBtn icon={FolderOpen} label="Open Audio (O)" onClick={onOpenAudio} />
        <IconBtn
          icon={isRecording ? Square : Circle}
          label={isRecording ? 'Stop Recording (R)' : 'Record (R)'}
          onClick={isRecording ? onStopRecord : onRecord}
          danger={!isRecording}
          active={isRecording}
        />
        <IconBtn
          icon={isPlaying ? Pause : Play}
          label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          onClick={isPlaying ? onPause : onPlay}
          disabled={!hasAudio}
        />
        <label className="toolbar-speed" title="Playback speed">
          <input
            type="number"
            min="0.2"
            max="2"
            step="0.1"
            value={speedInput}
            onChange={(event) => handleSpeedInput(event.target.value)}
            onBlur={() => setSpeedInput(playbackSpeed.toFixed(1))}
            aria-label="Playback speed"
          />
          <span>×</span>
        </label>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <IconBtn icon={AudioLines} label="Pitch" onClick={onTogglePitch} active={showPitch} color="#89b4fa" />
        <IconBtn icon={Waves} label="Formants" onClick={onToggleFormants} active={showFormants} color="#f38ba8" />
        <IconBtn icon={Activity} label="Intensity" onClick={onToggleIntensity} active={showIntensity} color="#a6e3a1" />
        <IconBtn icon={Languages} label="IPA Vowels" onClick={onToggleIpa} active={showIpa} color="#fab387" />
        <IconBtn icon={Hash} label="Vowel F1/F2" onClick={onToggleIpaFormants} active={showIpaFormants} color="#fab387" />
        <IconBtn icon={Filter} label="Filter Out Consonants" onClick={onToggleConsonantFilter} active={filterConsonants} color="#fab387" />
      </div>

      <div className="toolbar-group toolbar-actions">
        <IconBtn icon={Settings} label="Settings" onClick={onToggleSettings} active={activePanel === 'settings'} />
        <IconBtn icon={Circle} label="Vowel Space" onClick={onToggleVowelSpace} active={activePanel === 'vowels'} />
        <IconBtn icon={CircleHelp} label="Help" onClick={onHelp} />
      </div>
    </div>
  );
}
