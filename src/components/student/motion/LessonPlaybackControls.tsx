import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Sparkles,
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
      className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3"
    >
      {/* Top Scrub Bar with Step Nodes */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-indigo-400">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleAutoPlay}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                autoPlay
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
              title="Toggle automatic advance through animation steps"
            >
              <Zap className={`w-3 h-3 ${autoPlay ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Auto-Advance: {autoPlay ? 'ON' : 'OFF'}</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded transition cursor-pointer ${
                    speed === s
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step Progress Dots */}
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
                    ? 'bg-indigo-500 shadow-md shadow-indigo-500/50 scale-y-125'
                    : isCompleted
                    ? 'bg-emerald-500/80 hover:bg-emerald-400'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Jump to step ${stepNum}`}
                aria-label={`Jump to step ${stepNum}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Playback Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer min-h-[44px]"
          title="Replay from Step 1"
          aria-label="Replay lesson from beginning"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Restart</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Previous Step Button */}
          <button
            onClick={onPrevStep}
            disabled={currentStep === 1}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Previous step (or Left Arrow)"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={onPlayPause}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer min-h-[44px]"
            title="Play or Pause demonstration (Spacebar)"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{currentStep === totalSteps ? 'Replay' : 'Play Step'}</span>
              </>
            )}
          </button>

          {/* Next Step Button */}
          <button
            onClick={onNextStep}
            disabled={currentStep === totalSteps}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Next step (or Right Arrow)"
            aria-label="Next step"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Use ← / → keys
        </div>
      </div>
    </div>
  );
};
