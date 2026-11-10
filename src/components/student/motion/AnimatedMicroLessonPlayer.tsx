import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Download,
  Check,
  Volume2,
  VolumeX,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Eye,
  Scale,
} from 'lucide-react';
import { AnimatedMicroLesson } from '../../../types/lesson';
import { LessonPlaybackControls } from './LessonPlaybackControls';
import { AnimatedBalanceScaleStage } from './AnimatedBalanceScaleStage';
import { AnimatedRainbowStage } from './AnimatedRainbowStage';
import { ComprehensionCheckCard } from './ComprehensionCheckCard';
import { AudioPlayerControl } from '../../common/AudioPlayerControl';
import { lessonStorageService } from '../../../services/lessonStorageService';

interface AnimatedMicroLessonPlayerProps {
  lesson: AnimatedMicroLesson;
  hasAudioPreference?: boolean;
  onProceedToFollowUp: () => void;
  onBack: () => void;
}

export const AnimatedMicroLessonPlayer: React.FC<AnimatedMicroLessonPlayerProps> = ({
  lesson,
  hasAudioPreference = false,
  onProceedToFollowUp,
  onBack,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [activeTab, setActiveTab] = useState<'animated' | 'breakdown' | 'why_fails' | 'check'>('animated');

  // Offline status & toast
  const [isSavedOffline, setIsSavedOffline] = useState(true);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const autoPlayTimerRef = useRef<number | null>(null);

  const currentStep = lesson.steps[currentStepIndex] || lesson.steps[0];
  const totalSteps = lesson.steps.length;

  useEffect(() => {
    lessonStorageService.isLessonOffline(lesson.id).then(setIsSavedOffline);
  }, [lesson.id]);

  // Handle auto-advance playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    const intervalMs = Math.round(3500 / speed);

    autoPlayTimerRef.current = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalMs);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  const handlePlayPause = () => {
    if (currentStepIndex === totalSteps - 1 && !isPlaying) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReplay = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleStepSelect = (stepNum: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(Math.max(0, Math.min(stepNum - 1, totalSteps - 1)));
  };

  const handleSaveOffline = async () => {
    const res = await lessonStorageService.saveLessonOffline(lesson);
    setIsSavedOffline(true);
    setSaveToast(res.message);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Text for current step speech
  const stepSpeechText = `${currentStep.title}. Equation: ${currentStep.equationLhs} equals ${currentStep.equationRhs}. ${currentStep.actionText}. ${currentStep.explanation}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Toast Feedback */}
      {saveToast && (
        <div className="fixed bottom-20 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-800/60 shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Motion Micro-Remedy · {lesson.durationMinutes} Min
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Offline Ready</span>
            </span>
          </div>

          {/* Offline Save & Audio Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOffline}
              className={`text-xs px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                isSavedOffline
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Save lesson to on-device memory"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isSavedOffline ? 'Saved On-Device' : `Save Offline (${lesson.downloadSizeKb}KB)`}</span>
            </button>

            <AudioPlayerControl
              textToSpeak={stepSpeechText}
              label="Listen"
              variant="compact"
              hasAudioPreference={hasAudioPreference}
            />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          {lesson.subtitle}
        </p>

        {/* The MindTrace Axiom Card */}
        <div className="p-4 rounded-2xl bg-indigo-900/30 border border-indigo-700/50 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-xs uppercase font-bold text-amber-300 block mb-0.5">
              The MindTrace Axiom:
            </strong>
            <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
              {lesson.axiom}
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Mode Navigation (Motion Stage, 8-Step Walkthrough, Why Wrong Fails, Check) */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('animated')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'animated' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Animated Lesson</span>
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'breakdown' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Step Breakdown</span>
        </button>
        <button
          onClick={() => setActiveTab('why_fails')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'why_fails' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Why It Fails</span>
        </button>
        <button
          onClick={() => setActiveTab('check')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'check' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Check</span>
        </button>
      </div>

      {/* MODE 1: Animated Interactive Lesson Stage */}
      {activeTab === 'animated' && (
        <div className="space-y-4">
          {/* Visual Model Canvas */}
          {lesson.visualModel === 'balance_scale' && (
            <AnimatedBalanceScaleStage
              leftExpression={currentStep.equationLhs}
              rightExpression={currentStep.equationRhs}
              isBalanced={currentStep.visualState.isBalanced ?? true}
              tiltAngle={currentStep.visualState.tiltAngle ?? 0}
              activeOperation={currentStep.operationBadge?.text}
              highlightLeft={Boolean(currentStep.highlightLhs?.length)}
              highlightRight={Boolean(currentStep.highlightRhs?.length)}
              scaleLeftWeight={currentStep.visualState.scaleLeftWeight}
              scaleRightWeight={currentStep.visualState.scaleRightWeight}
            />
          )}

          {lesson.visualModel === 'rainbow_expansion' && (
            <AnimatedRainbowStage
              multiplier={currentStep.visualState.activeMultiplier || 4}
              termA="2x"
              termB="- 3"
              stage={currentStep.visualState.rainbowStage || 0}
            />
          )}

          {/* Step Narrative Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400">
                Step {currentStep.stepNumber} of {totalSteps}: {currentStep.title}
              </span>

              {currentStep.operationBadge && (
                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    currentStep.operationBadge.type === 'add'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                      : currentStep.operationBadge.type === 'divide'
                      ? 'bg-violet-950 text-violet-300 border border-violet-700'
                      : currentStep.operationBadge.type === 'cancel'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {currentStep.operationBadge.text}
                </span>
              )}
            </div>

            {/* Current equation row with high contrast font */}
            <div className="py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-center gap-3 font-mono text-xl sm:text-2xl font-bold text-white">
              <span>{currentStep.equationLhs}</span>
              <span className="text-indigo-400">=</span>
              <span>{currentStep.equationRhs}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Action: {currentStep.actionText}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentStep.explanation}
              </p>
            </div>

            {/* In-Step Audio Player */}
            <div className="pt-2 border-t border-slate-800/80">
              <AudioPlayerControl
                textToSpeak={stepSpeechText}
                label="Listen to Step Explanation"
                variant="card"
                hasAudioPreference={hasAudioPreference}
              />
            </div>
          </div>

          {/* Playback Scrubber and Action Controls */}
          <LessonPlaybackControls
            isPlaying={isPlaying}
            currentStep={currentStep.stepNumber}
            totalSteps={totalSteps}
            speed={speed}
            autoPlay={autoPlay}
            onPlayPause={handlePlayPause}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReplay={handleReplay}
            onStepSelect={handleStepSelect}
            onSpeedChange={setSpeed}
            onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
          />
        </div>
      )}

      {/* MODE 2: Complete 8-Step Walkthrough Grid */}
      {activeTab === 'breakdown' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h2 className="text-base font-display font-bold text-white">
            Full 8-Step Mathematical Proof Sequence
          </h2>
          <div className="space-y-3">
            {lesson.steps.map((st, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setActiveTab('animated');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  idx === currentStepIndex
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300 flex items-center justify-center">
                      {st.stepNumber}
                    </span>
                    <h3 className="text-xs font-bold text-white">{st.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 pl-7">{st.explanation}</p>
                </div>

                <div className="pl-7 sm:pl-0 font-mono text-sm font-bold text-indigo-300 shrink-0">
                  {st.equationLhs} = {st.equationRhs}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: Why Incorrect Approach Fails */}
      {activeTab === 'why_fails' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 animate-fade-in">
          <h2 className="text-base font-display font-bold text-white flex items-center gap-2 text-rose-300">
            <span>Deconstructing the Misconception</span>
          </h2>

          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 space-y-3">
            <span className="text-xs uppercase font-bold text-rose-300">The False Transition:</span>
            <div className="font-mono text-xl font-bold text-rose-200">
              {lesson.whyIncorrectFails.incorrectStep}
            </div>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              Leading to: <span className="font-mono font-bold text-white">{lesson.whyIncorrectFails.result}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400">Why It Breaks Mathematical Law:</span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lesson.whyIncorrectFails.explanation}
            </p>
          </div>
        </div>
      )}

      {/* MODE 4: Quick Comprehension Check */}
      {activeTab === 'check' && (
        <ComprehensionCheckCard
          check={lesson.comprehensionCheck}
          onPassed={() => {
            // Student passed quick check
          }}
        />
      )}

      {/* Bottom CTA to Prove Mastery */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          ← Return to Dashboard
        </button>

        <button
          onClick={onProceedToFollowUp}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition hover:scale-[1.02] cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Prove Mastery: Take Single Follow-Up Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
