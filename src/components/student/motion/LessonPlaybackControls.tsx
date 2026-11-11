import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Zap,
} from 'lucide-react';

interface LessonPlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  autoPlay: boolean;
  onPlayPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReplay: () => void;
  onStepSelect: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  onToggleAutoPlay: () => void;
}

export const LessonPlaybackControls: React.FC<LessonPlaybackControlsProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  autoPlay,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReplay,
  onStepSelect,
  onSpeedChange,
  onToggleAutoPlay,
}) => {
  // Keyboard navigation support: Space = Play/Pause, ArrowLeft = Prev, ArrowRight = Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onNextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onNextStep, onPrevStep]);

  const speedOptions = [0.75, 1, 1.25, 1.5];

  return (
    <div
      role="region"
      aria-label="Lesson Animation Playback Controls"
      className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3"
    >
      {/* Top scrub bar with step nodes */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono font-bold text-[#1D4ED8]">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onToggleAutoPlay}
              aria-pressed={autoPlay}
              className={`text-[11px] font-semibold px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 border ${
                autoPlay
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
              title="Toggle automatic advance through animation steps"
            >
              <Zap className={`w-3 h-3 ${autoPlay ? 'text-[#D97706]' : 'text-[#94A3B8]'}`} aria-hidden="true" />
              <span>Auto-advance: {autoPlay ? 'on' : 'off'}</span>
            </button>

            {/* Speed selector */}
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  aria-pressed={speed === s}
                  className={`text-[10px] font-mono font-semibold px-1.5 py-1 rounded transition cursor-pointer ${
                    speed === s
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step progress nodes */}
        <div className="flex items-center gap-1.5 pt-1">
          {Array.from({ length: totalSteps }, (_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                onClick={() => onStepSelect(stepNum)}
                className={`flex-1 h-2 rounded-full transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'bg-[#2563EB] shadow-sm scale-y-125'
                    : isCompleted
                    ? 'bg-[#059669] hover:bg-[#047857]'
                    : 'bg-[#E2E8F0] hover:bg-[#CBD5E1]'
                }`}
                title={`Jump to step ${stepNum}`}
                aria-label={`Jump to step ${stepNum}`}
                aria-current={isCurrent ? 'step' : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Main playback actions */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1">
        <button
          onClick={onReplay}
          className="btn-secondary min-h-[44px] px-3 text-xs"
          title="Replay from step 1"
          aria-label="Replay lesson from beginning"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
          <span className="hidden sm:inline">Restart</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevStep}
            disabled={currentStep === 1}
            className="icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous step (or Left Arrow)"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onPlayPause}
            className="btn-primary px-5 py-2.5 text-xs"
            title="Play or pause demonstration (Spacebar)"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>{currentStep === totalSteps ? 'Replay' : 'Play step'}</span>
              </>
            )}
          </button>

          <button
            onClick={onNextStep}
            disabled={currentStep === totalSteps}
            className="icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next step (or Right Arrow)"
            aria-label="Next step"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#64748B] hidden sm:block">
          Use ← / → keys
        </div>
      </div>
    </div>
  );
};
