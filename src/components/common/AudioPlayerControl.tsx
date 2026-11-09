/**
 * MindTrace Accessible Audio Read-Aloud Player Component
 * Zero-bandwidth, native Web Speech API controls with Play, Pause, Resume, Replay, and animated voice visualizer.
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  Info,
  AlertCircle,
  Headphones,
} from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export interface AudioPlayerControlProps {
  /** The text or math statement to read aloud */
  textToSpeak: string;
  /** Label describing the content (e.g. "Question Instructions", "Diagnostic Explanation", "Remedy Axiom") */
  label?: string;
  /** Whether the current student has enabled the Audio Read-Aloud preference */
  hasAudioPreference?: boolean;
  /** Visual variant: 'compact' (inline button/strip) | 'card' (full control bar with waveform) */
  variant?: 'compact' | 'card';
  /** Optional custom class name */
  className?: string;
}

export const AudioPlayerControl: React.FC<AudioPlayerControlProps> = ({
  textToSpeak,
  label = 'Listen Aloud',
  hasAudioPreference = false,
  variant = 'card',
  className = '',
}) => {
  const {
    state,
    isPlaying,
    isPaused,
    isSupported,
    voiceStatus,
    speak,
    pause,
    resume,
    replay,
    stop,
  } = useSpeechSynthesis();

  const [showVoiceInfo, setShowVoiceInfo] = useState(false);

  // If the browser completely lacks Web Speech API support
  if (!isSupported) {
    return (
      <div
        role="region"
        aria-label="Audio Read-Aloud Status"
        className={`rounded-2xl bg-slate-900/60 border border-slate-800 p-3 text-xs text-slate-400 flex items-center gap-2.5 ${className}`}
      >
        <VolumeX className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        <span className="text-[11px] leading-relaxed">
          Audio Read-Aloud is unavailable on this browser. Mathematical text remains fully accessible.
        </span>
      </div>
    );
  }

  const handlePrimaryClick = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(textToSpeak);
    }
  };

  // Compact Pill Variant (e.g., for inline placement beside headings)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handlePrimaryClick}
          aria-label={
            isPlaying
              ? `Pause ${label}`
              : isPaused
              ? `Resume ${label}`
              : `Listen to ${label}`
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-indigo-400 ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : isPaused
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
              : hasAudioPreference
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:text-white'
          }`}
        >
          {isPlaying ? (
            <>
              {/* Equalizer Waveform indicator */}
              <span className="flex items-end gap-0.5 h-3 w-3.5 mr-0.5" aria-hidden="true">
                <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              <span>Pause</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" aria-hidden="true" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span>{label}</span>
            </>
          )}
        </button>

        {/* Secondary Stop/Replay buttons when active */}
        {(isPlaying || isPaused) && (
          <div className="flex items-center gap-1 animate-fade-in">
            <button
              type="button"
              onClick={replay}
              aria-label={`Replay ${label}`}
              title="Replay from beginning"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label={`Stop ${label}`}
              title="Stop playback"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full Card Control Bar Variant (for Question Interface, Diagnosis Results & Interventions)
  return (
    <section
      role="region"
      aria-label={`${label} audio controls`}
      className={`rounded-2xl border transition-all p-3.5 sm:p-4 ${
        isPlaying
          ? 'bg-gradient-to-r from-indigo-950/90 via-slate-900 to-amber-950/40 border-amber-500/50 shadow-lg shadow-indigo-950/40'
          : isPaused
          ? 'bg-slate-900/90 border-indigo-700/60'
          : hasAudioPreference
          ? 'bg-slate-900/90 border-indigo-500/40'
          : 'bg-slate-900/70 border-slate-800'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Indicator, Title & Waveform */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : isPaused
                ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                : 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/60'
            }`}
          >
            {isPlaying ? (
              <span className="flex items-end gap-0.5 h-4 w-4" aria-hidden="true">
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms] h-4/5" />
              </span>
            ) : isPaused ? (
              <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
            ) : (
              <Headphones className="w-4 h-4" aria-hidden="true" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                {label}
              </span>

              {hasAudioPreference && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" aria-hidden="true" />
                  Your Preference Active
                </span>
              )}

              {isPlaying && (
                <span
                  aria-live="polite"
                  className="text-[10px] font-mono text-amber-300 font-semibold uppercase tracking-wider animate-pulse"
                >
                  Speaking Aloud...
                </span>
              )}

              {isPaused && (
                <span
                  aria-live="polite"
                  className="text-[10px] font-mono text-indigo-300 font-semibold uppercase tracking-wider"
                >
                  Paused
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Offline voice synthesis via native Web Speech API (0 KB network data used).
            </p>
          </div>
        </div>

        {/* Right: Playback Buttons & Voice Info Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Primary Action Button (Play / Pause / Resume) */}
          <button
            type="button"
            onClick={handlePrimaryClick}
            aria-label={
              isPlaying
                ? `Pause ${label}`
                : isPaused
                ? `Resume ${label}`
                : `Play ${label}`
            }
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md select-none focus:outline-hidden focus:ring-2 focus:ring-indigo-400 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : isPaused
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                : hasAudioPreference
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.02]'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-indigo-200" aria-hidden="true" />
                <span>Listen Aloud</span>
              </>
            )}
          </button>

          {/* Replay Button (Always visible once playback starts) */}
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={replay}
              aria-label={`Replay ${label}`}
              title="Replay from start"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={stop}
              aria-label={`Stop ${label}`}
              title="Stop playback"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            </button>
          )}

          {/* Device Voice Info Disclosure Button */}
          <button
            type="button"
            onClick={() => setShowVoiceInfo(!showVoiceInfo)}
            aria-label="Speech Synthesis Device Info"
            title="Speech synthesis & offline voice details"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Honest Voice Disclosure Accordion */}
      {showVoiceInfo && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold text-slate-200">Device Speech Synthesizer:</span>
            <span className="font-mono text-indigo-400">
              {voiceStatus.selectedVoiceName || 'Default System Voice'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            {voiceStatus.hasVoices ? (
              <span>
                Speech is generated locally on your device. Offline speech depends on installed OS voice packs. If your device has no installed offline voice, you can download one for free in your device's Accessibility / Text-to-Speech settings.
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                No local voice detected yet. The browser will use your default system voice synthesizer.
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
