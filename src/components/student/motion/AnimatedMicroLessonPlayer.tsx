import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Download,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  ListChecks,
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

type PlayerTab = 'animated' | 'breakdown' | 'why_fails' | 'check';

const TAB_ITEMS: Array<{ id: PlayerTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'animated', label: 'Animated lesson', icon: Play },
  { id: 'breakdown', label: 'Step breakdown', icon: Lightbulb },
  { id: 'why_fails', label: 'Why it fails', icon: AlertTriangle },
  { id: 'check', label: 'Quick check', icon: HelpCircle },
];

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
  const [activeTab, setActiveTab] = useState<PlayerTab>('animated');

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
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in pb-8">
      {/* Toast feedback */}
      {saveToast && (
        <div
          role="status"
          className="fixed bottom-20 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-white border border-[#A7F3D0] shadow-xl text-[12px] font-semibold text-[#065F46] flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Lesson header */}
      <section className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow text-[#2563EB]">
              Motion micro-remedy · {lesson.durationMinutes} min
            </span>
            <span className="badge badge-mastery">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
              100% offline ready
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveOffline}
              className={`text-[11px] px-2.5 py-1.5 min-h-[36px] rounded-xl border transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                isSavedOffline
                  ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
              title="Save lesson to on-device memory"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isSavedOffline ? 'Saved on-device' : `Save offline (${lesson.downloadSizeKb}KB)`}</span>
            </button>

            <AudioPlayerControl
              textToSpeak={stepSpeechText}
              label="Listen"
              variant="compact"
              hasAudioPreference={hasAudioPreference}
            />
          </div>
        </div>

        <div>
          <h1 className="page-title">{lesson.title}</h1>
          <p className="body-text mt-1">{lesson.subtitle}</p>
        </div>

        {/* MindTrace axiom */}
        <div className="math-step math-step-ai p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#6366F1] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="text-[11px] uppercase tracking-[0.08em] font-bold text-[#4338CA] block mb-0.5">
              The MindTrace axiom
            </strong>
            <p className="text-[13px] sm:text-sm text-[#3730A3] font-medium leading-relaxed">
              {lesson.axiom}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl overflow-x-auto no-scrollbar"
        role="tablist"
        aria-label="Lesson sections"
      >
        {TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] min-h-[40px] py-2 px-3 text-[12px] font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                selected
                  ? 'bg-white text-[#1D4ED8] shadow-sm border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODE 1: animated stage */}
      {activeTab === 'animated' && (
        <div className="space-y-4">
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

          {/* Step narrative */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-mono font-bold text-[#2563EB]">
                Step {currentStep.stepNumber} of {totalSteps}: {currentStep.title}
              </span>

              {currentStep.operationBadge && (
                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    currentStep.operationBadge.type === 'add'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                      : currentStep.operationBadge.type === 'divide'
                      ? 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]'
                      : currentStep.operationBadge.type === 'cancel'
                      ? 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]'
                      : 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
                  }`}
                >
                  {currentStep.operationBadge.text}
                </span>
              )}
            </div>

            {/* Current equation */}
            <div className="py-4 px-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-center gap-3 math-expression text-xl sm:text-2xl font-bold text-[#0F172A]">
              <span>{currentStep.equationLhs}</span>
              <span className="text-[#2563EB]">=</span>
              <span>{currentStep.equationRhs}</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-[#334155] uppercase tracking-[0.08em]">
                Action: {currentStep.actionText}
              </h2>
              <p className="body-text">{currentStep.explanation}</p>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <AudioPlayerControl
                textToSpeak={stepSpeechText}
                label="Listen to step explanation"
                variant="card"
                hasAudioPreference={hasAudioPreference}
              />
            </div>
          </section>

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

      {/* MODE 2: full walkthrough */}
      {activeTab === 'breakdown' && (
        <section className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
            <h2 className="section-title">Full step-by-step proof sequence</h2>
          </div>
          <div className="space-y-2.5">
            {lesson.steps.map((st, idx) => {
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setActiveTab('animated');
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-[#EFF6FF] border-[#2563EB] shadow-sm'
                      : 'bg-white border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                        }`}
                      >
                        {st.stepNumber}
                      </span>
                      <h3 className="text-[13px] font-bold text-[#0F172A]">{st.title}</h3>
                      {isCurrent && <span className="badge badge-primary">Current</span>}
                    </div>
                    <p className="text-[12px] text-[#475569] pl-8">{st.explanation}</p>
                  </div>

                  <div className="pl-8 sm:pl-0 math-expression text-sm font-bold text-[#1D4ED8] shrink-0">
                    {st.equationLhs} = {st.equationRhs}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* MODE 3: why the misconception fails */}
      {activeTab === 'why_fails' && (
        <section className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
            <h2 className="section-title">Deconstructing the misconception</h2>
          </div>

          <div className="math-step math-step-misconception p-4 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-[#92400E]">
              The false transition
            </span>
            <div className="math-expression text-xl font-bold text-[#78350F] break-words">
              {lesson.whyIncorrectFails.incorrectStep}
            </div>
            <p className="text-[12px] text-[#92400E] leading-relaxed">
              Leading to: <span className="math-expression font-bold text-[#78350F]">{lesson.whyIncorrectFails.result}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <span className="text-[11px] uppercase tracking-[0.08em] font-bold text-[#64748B]">
              Why it breaks mathematical law
            </span>
            <p className="body-text">{lesson.whyIncorrectFails.explanation}</p>
          </div>
        </section>
      )}

      {/* MODE 4: comprehension check */}
      {activeTab === 'check' && (
        <ComprehensionCheckCard
          check={lesson.comprehensionCheck}
          onPassed={() => {
            // Student passed quick check
          }}
        />
      )}

      {/* Bottom CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
        <button
          onClick={onBack}
          className="text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer min-h-[40px]"
        >
          ← Return to dashboard
        </button>

        <button
          onClick={onProceedToFollowUp}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
        >
          <ListChecks className="w-4 h-4" aria-hidden="true" />
          <span>Prove mastery: take single follow-up check</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
