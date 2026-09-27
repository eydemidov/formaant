import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initGpuFft } from './utils/fft-gpu';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStreamingRecording } from './hooks/useStreamingRecording';
import { useAnalysisWorker } from './hooks/useAnalysisWorker';
import { useIsMobile } from './hooks/useIsMobile';
import { BottomSheet } from './components/BottomSheet';
import { applyBiquadFilter } from './audio/filters';
import { loadAudioFile } from './audio/recorder';
import { HelpDialog } from './components/HelpDialog';
import { RightSidebar } from './components/RightSidebar';
import { SettingsPanel } from './components/SettingsPanel';
import { Spectrogram } from './components/Spectrogram';
import { StatusBar } from './components/StatusBar';
import { TimeRuler } from './components/TimeRuler';
import { Toolbar } from './components/Toolbar';
import { VowelSpace } from './components/VowelSpace';
import { Waveform } from './components/Waveform';
import { DropOverlay, DropFileType } from './components/DropOverlay';
import { Minimap } from './components/Minimap';
import { FilterPanel } from './components/FilterPanel';
import { normalize as soundNormalize } from './audio/soundManipulation';
import type {
  AnalysisResult,
  AnalysisSettings,
  FilterSettings,
  TimeSelection,
} from './types';
import { fitToWindow, panViewRange, selectionToView, zoomAroundPoint } from './utils/view';
import { loadAppPreferences, saveAppPreferences } from './utils/preferences';

function createAudioBufferFromSamples(samples: Float32Array, sampleRate: number): AudioBuffer {
  const buffer = new AudioBuffer({ length: samples.length, sampleRate, numberOfChannels: 1 });
  buffer.getChannelData(0).set(samples);
  return buffer;
}

export default function App() {
  const [initialPreferences] = useState(loadAppPreferences);
  const isMobile = useIsMobile();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selection, setSelection] = useState<TimeSelection | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0);
  currentTimeRef.current = currentTime;
  const [showPitch, setShowPitch] = useState(initialPreferences.overlays.pitch);
  const [showFormants, setShowFormants] = useState(initialPreferences.overlays.formants);
  const [showIntensity, setShowIntensity] = useState(initialPreferences.overlays.intensity);
  const [showIpa, setShowIpa] = useState(initialPreferences.overlays.ipa);
  const [showIpaFormants, setShowIpaFormants] = useState(initialPreferences.overlays.ipaFormants);
  const [filterConsonants, setFilterConsonants] = useState(initialPreferences.filterConsonants);
  const [settings, setSettings] = useState<AnalysisSettings>(initialPreferences.settings);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(initialPreferences.filterSettings);
  const [vowelProfile, setVowelProfile] = useState(initialPreferences.vowelProfile);
  const [viewStart, setViewStart] = useState(0);
  const [viewEnd, setViewEnd] = useState(1);
  const [sampleRate, setSampleRate] = useState(44100);

  useEffect(() => {
    saveAppPreferences({
      settings,
      filterSettings,
      vowelProfile,
      filterConsonants,
      overlays: {
        pitch: showPitch,
        formants: showFormants,
        intensity: showIntensity,
        ipa: showIpa,
        ipaFormants: showIpaFormants,
      },
    });
  }, [settings, filterSettings, vowelProfile, filterConsonants, showPitch, showFormants, showIntensity, showIpa, showIpaFormants]);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;


  const streaming = useStreamingRecording(settings);
  const { analyze: analyzeInWorker } = useAnalysisWorker();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const playStartRef = useRef(0);
  const originalSamplesRef = useRef<Float32Array | null>(null);
  const currentSamplesRef = useRef<Float32Array | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const viewRange = useMemo(() => ({ start: viewStart, end: viewEnd }), [viewStart, viewEnd]);

  const pitchAtCursor = useMemo(() => {
    if (!analysis) return undefined;
    const p = analysis.pitch;
    if (p.times.length === 0) return undefined;
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < p.times.length; i++) {
      const d = Math.abs(p.times[i] - currentTime);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    return p.frequencies[bestIdx];
  }, [analysis, currentTime]);

  const formantsAtCursor = useMemo(() => {
    if (!analysis) return undefined;
    const f = analysis.formants;
    if (f.times.length === 0) return undefined;
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < f.times.length; i++) {
      const d = Math.abs(f.times[i] - currentTime);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    return { f1: f.f1[bestIdx], f2: f.f2[bestIdx] };
  }, [analysis, currentTime]);

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processSamples = useCallback(
    (samples: Float32Array, nextSampleRate: number) => {
      currentSamplesRef.current = Float32Array.from(samples);
      setSampleRate(nextSampleRate);
      setAnalyzing(true);
      setProgress(0);
      // Copy samples since we transfer the buffer to the worker
      const copy = Float32Array.from(samples);
      analyzeInWorker(copy, nextSampleRate, settingsRef.current, (v) => setProgress(v)).then((nextAnalysis) => {
        setAnalyzing(false);
        setProgress(100);
        setAnalysis(nextAnalysis);
        setSelection(null);
        setCurrentTime(0);
        const fitted = fitToWindow(nextAnalysis.duration);
        setViewStart(fitted.start);
        setViewEnd(fitted.end);
      }).catch((err) => {
        setAnalyzing(false);
        setProgress(0);
        console.error('Analysis failed:', err);
      });
    },
    [analyzeInWorker]
  );

  const processAudioBuffer = useCallback(
    (buffer: AudioBuffer) => {
      const samples = soundNormalize(buffer.getChannelData(0));
      originalSamplesRef.current = Float32Array.from(samples);
      // For long audio (>5 min), show waveform immediately without full analysis
      const LONG_THRESHOLD = 300; // seconds
      if (buffer.duration > LONG_THRESHOLD) {
        currentSamplesRef.current = samples;
        setSampleRate(buffer.sampleRate);
        const duration = buffer.duration;
        // Create minimal analysis with just waveform data
        const emptyAnalysis: AnalysisResult = {
          waveform: samples,
          sampleRate: buffer.sampleRate,
          duration,
          spectrogram: { magnitudes: [], timeStep: 0.01, freqStep: 0, maxFreq: buffer.sampleRate / 2, frameTimes: [] },
          pitch: { frequencies: [], times: [] },
          formants: { tracked: [[], [], []], times: [], f1: [], f2: [], f3: [], candidates: [] },
          intensity: { values: [], times: [] },
          harmonicity: { values: [], times: [], meanHnrDb: 0, medianHnrDb: 0 },
          spectrumSlice: null,
          settings: settingsRef.current as AnalysisSettings,
        };
        setAnalysis(emptyAnalysis);
        setAnalyzing(false);
        setViewStart(0);
        setViewEnd(Math.min(30, duration)); // Show first 30s
        return;
      }
      processSamples(samples, buffer.sampleRate);
    },
    [processSamples]
  );

  // Preload WebGPU device at mount to avoid first-analysis delay
  useEffect(() => {
    initGpuFft();
  }, []);

  useEffect(() => {
    if (!currentSamplesRef.current) return;
    processSamples(currentSamplesRef.current, sampleRate);
  }, [processSamples, sampleRate, settings]);

  const handleLoadFile = useCallback(async (file: File) => {
    if (analysis) {
      const ok = confirm('Loading a new file will replace the current audio and analysis. Continue?');
      if (!ok) return;
    }
    try {
      const buffer = await loadAudioFile(file);
      // Warn for very long files
      if (buffer.duration > 300) {
        const proceed = confirm(
          `This file is ${Math.round(buffer.duration / 60)} minutes long.\n\n` +
          `It will load in waveform-only mode (no spectrogram/pitch/formant analysis).\n\n` +
          `Continue?`
        );
        if (!proceed) return;
      }
      processAudioBuffer(buffer);
    } catch (err) {
      alert(`Failed to load audio: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [processAudioBuffer, analysis]);

  const handleRecord = useCallback(async () => {
    if (analysis) {
      const ok = confirm('Starting a new recording will replace the current audio and analysis. Continue?');
      if (!ok) return;
    }
    await streaming.startStreaming();
    setIsRecording(true);
  }, [streaming, analysis]);

  const handleStopRecord = useCallback(() => {
    const { samples, sampleRate: sr } = streaming.stopStreaming();
    setIsRecording(false);
    if (samples.length > 0) {
      const normalized = soundNormalize(samples);
      originalSamplesRef.current = Float32Array.from(normalized);
      processSamples(normalized, sr);
    }
  }, [streaming, processSamples]);

  const handlePlay = useCallback(() => {
    if (!currentSamplesRef.current) return;
    const buffer = createAudioBufferFromSamples(currentSamplesRef.current, sampleRate);
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const startOffset = selection?.start ?? currentTimeRef.current;
    const duration = selection ? selection.end - selection.start : undefined;
    const selEnd = selection?.end;
    const looping = !!selection;

    function startSource() {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0, startOffset, duration);
      sourceRef.current = source;
      playStartRef.current = ctx.currentTime - startOffset;

      source.onended = () => {
        if (looping && audioCtxRef.current === ctx) {
          // Loop: restart from selection start
          startSource();
        } else {
          setIsPlaying(false);
          cancelAnimationFrame(animFrameRef.current);
          if (selEnd !== undefined) setCurrentTime(startOffset);
        }
      };
    }

    startSource();
    setIsPlaying(true);

    const updateTime = () => {
      if (!audioCtxRef.current || audioCtxRef.current !== ctx) return;
      let t = audioCtxRef.current.currentTime - playStartRef.current;
      // Clamp to selection bounds
      if (selEnd !== undefined && t > selEnd) t = selEnd;
      setCurrentTime(t);
      animFrameRef.current = requestAnimationFrame(updateTime);
    };
    updateTime();
  }, [sampleRate, selection]);

  const handlePause = useCallback(() => {
    sourceRef.current?.stop();
    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    ctx?.close();
    cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
  }, []);

  const applyEffect = useCallback((newSamples: Float32Array) => {
    processSamples(newSamples, sampleRate);
  }, [processSamples, sampleRate]);

  const handleApplyFilter = useCallback(() => {
    if (!currentSamplesRef.current) return;
    const filtered = applyBiquadFilter(currentSamplesRef.current, sampleRate, filterSettings);
    applyEffect(filtered);
  }, [applyEffect, filterSettings, sampleRate]);

  const handleResetFilter = useCallback(() => {
    if (!originalSamplesRef.current) return;
    processSamples(originalSamplesRef.current, sampleRate);
  }, [processSamples, sampleRate]);

  const handleWheelZoom = useCallback((pivotTime: number, zoomFactor: number) => {
    if (!analysis) return;
    const next = zoomAroundPoint(viewRange, pivotTime, zoomFactor, analysis.duration);
    setViewStart(next.start);
    setViewEnd(next.end);
  }, [analysis, viewRange]);

  const handlePan = useCallback((deltaTime: number) => {
    if (!analysis) return;
    const next = panViewRange(viewRange, deltaTime, analysis.duration);
    setViewStart(next.start);
    setViewEnd(next.end);
  }, [analysis, viewRange]);

  const handleZoomSelection = useCallback((nextSelection?: TimeSelection) => {
    if (!analysis) return;
    const target = nextSelection ?? selection;
    if (!target) return;
    const next = selectionToView(target, analysis.duration);
    setViewStart(next.start);
    setViewEnd(next.end);
  }, [analysis, selection]);

  const handleViewRangeChange = useCallback((start: number, end: number) => {
    setViewStart(start);
    setViewEnd(end);
  }, []);

  const handleFitToWindow = useCallback(() => {
    if (!analysis) return;
    const next = fitToWindow(analysis.duration);
    setViewStart(next.start);
    setViewEnd(next.end);
  }, [analysis]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [dragFileType, setDragFileType] = useState<DropFileType>('audio');
  const dragCounterRef = useRef(0);

  const detectFileType = useCallback((event: DragEvent): DropFileType => {
    const items = event.dataTransfer?.items;
    if (items && items.length > 0) {
      const item = items[0];
      if (item.type.startsWith('audio/') || /\.(wav|mp3|flac|ogg)$/i.test(item.type)) return 'audio';
      // Can't reliably read filename from items during dragenter, check type
      if (item.type === '' || item.type === 'text/plain') return 'audio'; // default guess
    }
    return 'audio';
  }, []);

  useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault();
      // Only show drop overlay for external file drops, not internal boundary drags
      if (!event.dataTransfer?.types.includes('Files')) return;
      dragCounterRef.current++;
      if (dragCounterRef.current === 1) {
        setDragFileType(detectFileType(event));
        setIsDragOver(true);
      }
    };
    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragOver(false);
      }
    };
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      const file = event.dataTransfer?.files[0];
      if (!file) return;
      if (file.type.startsWith('audio/') || /\.(wav|mp3|flac|ogg)$/i.test(file.name)) {
        void handleLoadFile(file);
      }
    };
    const prevent = (event: DragEvent) => event.preventDefault();
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', prevent);
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', prevent);
    };
  }, [handleLoadFile, detectFileType]);

  useEffect(() => () => {
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!analysis) return;
    setSelection({ start: 0, end: analysis.duration });
  }, [analysis]);

  const handleMoveSelectionLeft = useCallback(() => {
    if (!analysis) return;
    const step = (viewEnd - viewStart) * 0.05;
    if (selection) {
      const shift = Math.min(step, selection.start);
      setSelection({ start: selection.start - shift, end: selection.end - shift });
    } else {
      const next = panViewRange(viewRange, -step, analysis.duration);
      setViewStart(next.start);
      setViewEnd(next.end);
    }
  }, [analysis, selection, viewEnd, viewStart, viewRange]);

  const handleMoveSelectionRight = useCallback(() => {
    if (!analysis) return;
    const step = (viewEnd - viewStart) * 0.05;
    if (selection) {
      const shift = Math.min(step, analysis.duration - selection.end);
      setSelection({ start: selection.start + shift, end: selection.end + shift });
    } else {
      const next = panViewRange(viewRange, step, analysis.duration);
      setViewStart(next.start);
      setViewEnd(next.end);
    }
  }, [analysis, selection, viewEnd, viewStart, viewRange]);

  const handleZoomIn = useCallback(() => {
    if (!analysis) return;
    const center = (viewStart + viewEnd) / 2;
    const next = zoomAroundPoint(viewRange, center, 0.8, analysis.duration);
    setViewStart(next.start);
    setViewEnd(next.end);
  }, [analysis, viewEnd, viewStart, viewRange]);

  const handleZoomOut = useCallback(() => {
    if (!analysis) return;
    const center = (viewStart + viewEnd) / 2;
    const next = zoomAroundPoint(viewRange, center, 1.25, analysis.duration);
    setViewStart(next.start);
    setViewEnd(next.end);
  }, [analysis, viewEnd, viewStart, viewRange]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) handlePause();
    else handlePlay();
  }, [isPlaying, handlePause, handlePlay]);

  const shortcutHandlers = useMemo(() => ({
    onPlayPause: handlePlayPause,
    onSelectAll: handleSelectAll,
    onMoveSelectionLeft: handleMoveSelectionLeft,
    onMoveSelectionRight: handleMoveSelectionRight,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onFitToWindow: handleFitToWindow,
  }), [handlePlayPause, handleSelectAll, handleMoveSelectionLeft, handleMoveSelectionRight, handleZoomIn, handleZoomOut, handleFitToWindow]);

  useKeyboardShortcuts(shortcutHandlers, true);

  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== '?' || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      event.preventDefault();
      setHelpOpen((open) => !open);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-layout">
      <DropOverlay visible={isDragOver} fileType={dragFileType} />
      <input ref={audioFileInputRef} type="file" accept="audio/*" hidden onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file) void handleLoadFile(file);
      }} />
      <Toolbar
        hasAudio={!!analysis}
        isPlaying={isPlaying}
        isRecording={isRecording}
        onOpenAudio={() => audioFileInputRef.current?.click()}
        onRecord={handleRecord}
        onStopRecord={handleStopRecord}
        onPlay={handlePlay}
        onPause={handlePause}
        onHelp={() => setHelpOpen(true)}
        showPitch={showPitch}
        showFormants={showFormants}
        showIntensity={showIntensity}
        showIpa={showIpa}
        showIpaFormants={showIpaFormants}
        filterConsonants={filterConsonants}
        onTogglePitch={() => setShowPitch((v) => !v)}
        onToggleFormants={() => setShowFormants((v) => !v)}
        onToggleIntensity={() => setShowIntensity((v) => !v)}
        onToggleIpa={() => setShowIpa((v) => !v)}
        onToggleIpaFormants={() => setShowIpaFormants((v) => !v)}
        onToggleConsonantFilter={() => setFilterConsonants((v) => !v)}
      />

      <div className="app-body">
        <main className="main-area" role="main" aria-label="Audio editor">
          <div className="visualizations">
          {!analysis && !streaming.isStreaming && (
            <div className="empty-state">
              <div className="empty-icon">🎙️</div>
              <p>Drop audio here, or start recording.</p>
              <p className="empty-hint">Waveform, spectrogram, pitch, formants, intensity, editing, and filters are all live in this view.</p>
            </div>
          )}

          {streaming.isStreaming && (
            <>
              <div className="streaming-indicator">
                <span className="recording-dot" /> Recording — {streaming.streamDuration.toFixed(1)}s
              </div>
              {streaming.streamAnalysis && (
                <>
                  <TimeRuler duration={streaming.streamAnalysis.duration} viewRange={{ start: 0, end: streaming.streamAnalysis.duration }} />
                  <Waveform
                    analysis={streaming.streamAnalysis}
                    selection={null}
                    currentTime={streaming.streamAnalysis.duration}
                    viewRange={{ start: 0, end: streaming.streamAnalysis.duration }}
                    onSelectionChange={() => {}}
                    onCursorChange={() => {}}
                    onWheelZoom={() => {}}
                    onPan={() => {}}
                    onZoomSelection={() => {}}
                  />
                  <Spectrogram
                    analysis={streaming.streamAnalysis}
                    selection={null}
                    currentTime={streaming.streamAnalysis.duration}
                    viewRange={{ start: 0, end: streaming.streamAnalysis.duration }}
                    showPitch={showPitch}
                    showFormants={showFormants}
                    showIntensity={showIntensity}
                    showIpa={showIpa}
                    showIpaFormants={showIpaFormants}
                    filterConsonants={filterConsonants}
                    vowelProfile={vowelProfile}
                    onWheelZoom={() => {}}
                    onPan={() => {}}
                    onZoomSelection={() => {}}
                    onSelectionChange={() => {}}
                    onCursorChange={() => {}}
                  />
                </>
              )}
            </>
          )}

          {analyzing && (
            <div className="w-full px-4 py-2">
              <div className="relative w-full h-1 bg-zinc-700 rounded overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded transition-all duration-200 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #1e40af, #059669)',
                  }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1 text-center">Analyzing… {progress}%</p>
            </div>
          )}

          {analysis && !streaming.isStreaming && (
            <>
              <div className="audio-visualizations">
              <TimeRuler duration={analysis.duration} viewRange={viewRange} />
              <Waveform
                analysis={analysis}
                selection={selection}
                currentTime={currentTime}
                viewRange={viewRange}
                onSelectionChange={setSelection}
                onCursorChange={(time: number) => { setSelection(null); setCurrentTime(time); }}
                onWheelZoom={handleWheelZoom}
                onPan={handlePan}
                onZoomSelection={handleZoomSelection}
              />
              <Minimap
                analysis={analysis}
                viewRange={viewRange}
                selection={selection}
                onViewRangeChange={handleViewRangeChange}
              />
              <Spectrogram
                analysis={analysis}
                selection={selection}
                currentTime={currentTime}
                viewRange={viewRange}
                showPitch={showPitch}
                showFormants={showFormants}
                showIntensity={showIntensity}
                showIpa={showIpa}
                showIpaFormants={showIpaFormants}
                filterConsonants={filterConsonants}
                vowelProfile={vowelProfile}
                onWheelZoom={handleWheelZoom}
                onPan={handlePan}
                onZoomSelection={handleZoomSelection}
                onSelectionChange={setSelection}
                onCursorChange={(time) => { setSelection(null); setCurrentTime(time); }}
              />
              </div>
            </>
          )}
        </div>


        </main>

        {!isMobile && (
          <RightSidebar>
            {{
              settings: (
                <>
                  <SettingsPanel settings={settings} onChange={setSettings} />
                  <FilterPanel settings={filterSettings} onChange={setFilterSettings} onApply={handleApplyFilter} onReset={handleResetFilter} />
                </>
              ),
              vowels: <VowelSpace analysis={analysis} selection={selection} currentTime={currentTime} profile={vowelProfile} onProfileChange={setVowelProfile} />,
            }}
          </RightSidebar>
        )}
      </div>

      {isMobile && (
        <BottomSheet trigger="⚙️">
          <div className="bottom-sheet-content">
            <div className="sidebar-section">
              <h3>Overlays</h3>
              <label className="toggle-label">
                <input type="checkbox" checked={showPitch} onChange={() => setShowPitch((v) => !v)} />
                <span className="toggle-indicator pitch" />
                Pitch
              </label>
              <label className="toggle-label">
                <input type="checkbox" checked={showFormants} onChange={() => setShowFormants((v) => !v)} />
                <span className="toggle-indicator formants" />
                Formants
              </label>
              <label className="toggle-label">
                <input type="checkbox" checked={showIntensity} onChange={() => setShowIntensity((v) => !v)} />
                <span className="toggle-indicator intensity" />
                Intensity
              </label>
              <label className="toggle-label">
                <input type="checkbox" checked={showIpa} onChange={() => setShowIpa((v) => !v)} />
                <span className="toggle-indicator ipa" />
                IPA Vowels
              </label>
              <label className="toggle-label">
                <input type="checkbox" checked={showIpaFormants} onChange={() => setShowIpaFormants((v) => !v)} />
                <span className="toggle-indicator ipa" />
                Vowel F1/F2
              </label>
              <label className="toggle-label">
                <input type="checkbox" checked={filterConsonants} onChange={() => setFilterConsonants((v) => !v)} />
                <span className="toggle-indicator ipa" />
                Filter Out Consonants
              </label>
            </div>
            {analysis && (
              <div className="sidebar-section">
                <h3>Settings</h3>
                <SettingsPanel settings={settings} onChange={setSettings} />
                <FilterPanel settings={filterSettings} onChange={setFilterSettings} onApply={handleApplyFilter} onReset={handleResetFilter} />
              </div>
            )}
          </div>
        </BottomSheet>
      )}

            <StatusBar
        hasAudio={!!analysis}
        analysis={analysis}
        duration={analysis?.duration ?? 0}
        selection={selection}
        isRecording={isRecording}
        streamDuration={streaming.streamDuration}
        cursorTime={analysis ? currentTime : undefined}
        pitchAtCursor={pitchAtCursor}
        formantsAtCursor={formantsAtCursor}
      />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

    </div>
  );
}
