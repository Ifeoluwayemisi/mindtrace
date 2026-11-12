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
        className={`rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] p-3 text-xs text-[#475569] flex items-center gap-2.5 ${className}`}
      >
        <VolumeX className="w-4 h-4 text-[#94A3B8] shrink-0" aria-hidden="true" />
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
          className={`inline-flex min-h-[36px] items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 ${
            isPlaying
              ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
              : isPaused
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
              : hasAudioPreference
              ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
              : 'bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]'
          }`}
        >
          {isPlaying ? (
            <>
              {/* Equalizer Waveform indicator */}
              <span className="flex items-end gap-0.5 h-3 w-3.5 mr-0.5" aria-hidden="true">
                <span className="w-0.5 h-3 bg-[#D97706] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-0.5 h-2 bg-[#D97706] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-0.5 h-3 bg-[#D97706] rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              <span>Pause</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" aria-hidden="true" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
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
              className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label={`Stop ${label}`}
              title="Stop playback"
              className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition cursor-pointer"
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
      className={`rounded-2xl border p-3.5 sm:p-4 transition-colors ${
        isPlaying
          ? 'bg-[#FFFBEB] border-[#FDE68A]'
          : isPaused
          ? 'bg-[#EFF6FF] border-[#BFDBFE]'
          : 'bg-[#F8FAFC] border-[#E2E8F0]'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Indicator, Title & Waveform */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isPlaying
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
            }`}
          >
            {isPlaying ? (
              <span className="flex items-end gap-0.5 h-4 w-4" aria-hidden="true">
                <span className="w-1 bg-[#D97706] rounded-full animate-bounce [animation-delay:0ms] h-full" />
                <span className="w-1 bg-[#D97706] rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
                <span className="w-1 bg-[#D97706] rounded-full animate-bounce [animation-delay:300ms] h-4/5" />
              </span>
            ) : isPaused ? (
              <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
            ) : (
              <Headphones className="w-4 h-4" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold text-[#0F172A] tracking-tight">
                {label}
              </span>

              {hasAudioPreference && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                  <Sparkles className="w-2.5 h-2.5 text-[#6366F1]" aria-hidden="true" />
                  Your preference active
                </span>
              )}

              {isPlaying && (
                <span
                  aria-live="polite"
                  className="text-[10px] font-mono text-[#92400E] font-semibold uppercase tracking-wider"
                >
                  Speaking aloud…
                </span>
              )}

              {isPaused && (
                <span
                  aria-live="polite"
                  className="text-[10px] font-mono text-[#1D4ED8] font-semibold uppercase tracking-wider"
                >
                  Paused
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
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
                : `Listen aloud: ${label}`
            }
            className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shadow-sm ${
              isPlaying
                ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
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
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Listen aloud</span>
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
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] transition cursor-pointer"
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
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white hover:bg-[#FEF2F2] text-[#475569] hover:text-[#991B1B] border border-[#E2E8F0] transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            </button>
          )}

          {/* Device Voice Info Disclosure Button */}
          <button
            type="button"
            onClick={() => setShowVoiceInfo(!showVoiceInfo)}
            aria-label="Speech Synthesis Device Info"
            aria-expanded={showVoiceInfo}
            title="Speech synthesis & offline voice details"
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Honest Voice Disclosure Accordion */}
      {showVoiceInfo && (
        <div className="mt-3 pt-3 border-t border-[#E2E8F0] text-xs space-y-1.5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#475569]">
            <span className="font-semibold text-[#334155]">Device speech synthesizer:</span>
            <span className="font-mono text-[#1D4ED8]">
              {voiceStatus.selectedVoiceName || 'Default system voice'}
            </span>
          </div>

          <div className="text-[11px] text-[#64748B] leading-relaxed">
            {voiceStatus.hasVoices ? (
              <span>
                Speech is generated locally on your device. Offline speech depends on installed OS voice packs. If your device has no installed offline voice, you can download one for free in your device's Accessibility / Text-to-Speech settings.
              </span>
            ) : (
              <span className="text-[#92400E] flex items-center gap-1">
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
