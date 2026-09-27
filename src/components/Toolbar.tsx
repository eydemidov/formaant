import {
  Play, Pause, Square, Circle,
  AudioLines, Waves, Activity, Languages, Hash,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ToolbarProps {
  hasAudio: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  onRecord: () => void;
  onStopRecord: () => void;
  onPlay: () => void;
  onPause: () => void;
  // Overlay toggles
  showPitch: boolean;
  showFormants: boolean;
  showIntensity: boolean;
  showIpa: boolean;
  showIpaFormants: boolean;
  onTogglePitch: () => void;
  onToggleFormants: () => void;
  onToggleIntensity: () => void;
  onToggleIpa: () => void;
  onToggleIpaFormants: () => void;
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
    onRecord, onStopRecord, onPlay, onPause,
    showPitch, showFormants, showIntensity, showIpa, showIpaFormants,
    onTogglePitch, onToggleFormants, onToggleIntensity, onToggleIpa, onToggleIpaFormants,
  } = props;

  return (
    <div className="toolbar" role="toolbar" aria-label="Tools">
      <div className="toolbar-group">
        <IconBtn
          icon={isRecording ? Square : Circle}
          label={isRecording ? 'Stop Recording' : 'Record'}
          onClick={isRecording ? onStopRecord : onRecord}
          danger={!isRecording}
          active={isRecording}
        />
        <IconBtn
          icon={isPlaying ? Pause : Play}
          label={isPlaying ? 'Pause' : 'Play'}
          onClick={isPlaying ? onPause : onPlay}
          disabled={!hasAudio}
        />
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <IconBtn icon={AudioLines} label="Pitch" onClick={onTogglePitch} active={showPitch} color="#89b4fa" />
        <IconBtn icon={Waves} label="Formants" onClick={onToggleFormants} active={showFormants} color="#f38ba8" />
        <IconBtn icon={Activity} label="Intensity" onClick={onToggleIntensity} active={showIntensity} color="#a6e3a1" />
        <IconBtn icon={Languages} label="IPA Vowels" onClick={onToggleIpa} active={showIpa} color="#fab387" />
        <IconBtn icon={Hash} label="Vowel F1/F2" onClick={onToggleIpaFormants} active={showIpaFormants} color="#fab387" />
      </div>
    </div>
  );
}
