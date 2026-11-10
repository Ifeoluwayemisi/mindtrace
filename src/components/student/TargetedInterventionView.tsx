import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Scale,
  CheckCircle2,
  Play,
  Sliders,
  Clock,
  BookOpen,
} from 'lucide-react';
import { TargetedIntervention } from '../../types';
import { TARGETED_INTERVENTIONS } from '../../data/questionBank';
import { ANIMATED_MICRO_LESSONS } from '../../data/animatedLessons';
import { storageService } from '../../services/storageService';
import { AnimatedMicroLessonPlayer } from './motion/AnimatedMicroLessonPlayer';
import { BalanceScaleVisual, RainbowDistributionVisual } from '../common/MathVisuals';

interface TargetedInterventionViewProps {
  misconceptionCode: string;
  onProceedToFollowUp: () => void;
  onCancel: () => void;
}

export const TargetedInterventionView: React.FC<TargetedInterventionViewProps> = ({
  misconceptionCode,
  onProceedToFollowUp,
  onCancel,
}) => {
  const animatedLesson =
    ANIMATED_MICRO_LESSONS[misconceptionCode] || ANIMATED_MICRO_LESSONS.ALG_SIGN_FLIP;
  const legacyIntervention: TargetedIntervention =
    TARGETED_INTERVENTIONS[misconceptionCode] || TARGETED_INTERVENTIONS.ALG_SIGN_FLIP;

  const [viewMode, setViewMode] = useState<'animated_lesson' | 'manual_sandbox'>('animated_lesson');

  // Interactive Balance Scale state for manual sandbox mode
  const [scaleLeft, setScaleLeft] = useState(14);
  const [scaleRight, setScaleRight] = useState(14);
  const [addedNumber, setAddedNumber] = useState<number | null>(null);

  const isBalanced = scaleLeft === scaleRight;

  const savedStudent = storageService.getSavedStudentProfile();
  const hasAudioPreference = Boolean(
    savedStudent.audioSupport ||
      savedStudent.preferredPresentation?.includes('audio') ||
      savedStudent.learningPreferences?.includes('audio')
  );

  return (
    <div className="space-y-4">
      {/* Top Experience Switcher: Animated Motion Lesson vs Free Sandbox */}
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 px-2">
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('animated_lesson')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              viewMode === 'animated_lesson'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Animated Motion Lesson</span>
          </button>
          <button
            onClick={() => setViewMode('manual_sandbox')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              viewMode === 'manual_sandbox'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          WAEC Syllabus Aligned Micro-Module
        </span>
      </div>

      {viewMode === 'animated_lesson' ? (
        <AnimatedMicroLessonPlayer
          lesson={animatedLesson}
          hasAudioPreference={hasAudioPreference}
          onProceedToFollowUp={onProceedToFollowUp}
          onBack={onCancel}
        />
      ) : (
        /* Manual Sandbox Mode */
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-8">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
            <div>
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <span>Manual Sandbox: {legacyIntervention.metaphorTitle}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {legacyIntervention.metaphorDescription}
              </p>
            </div>

            {legacyIntervention.interactiveModel === 'balance_scale' && (
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-6">
                <BalanceScaleVisual
                  isBalanced={isBalanced}
                  leftExpression={scaleLeft === 21 ? '3x - 7 + 7' : '3x - 7'}
                  rightExpression={scaleRight === 21 ? '14 + 7' : scaleRight === 7 ? '14 - 7' : '14'}
                  tiltAngle={scaleLeft > scaleRight ? -6 : scaleLeft < scaleRight ? 6 : 0}
                />

                <div className="flex justify-center">
                  <div
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                      isBalanced
                        ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800'
                        : 'text-amber-300 bg-amber-950/60 border border-amber-800'
                    }`}
                  >
                    {isBalanced
                      ? 'Equality holds: Adding +7 to BOTH sides leaves 3x = 21.'
                      : 'Scale tilted! Performing an operation on only one side breaks equality.'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setScaleLeft(21);
                      setScaleRight(21);
                      setAddedNumber(7);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer min-h-[44px]"
                  >
                    Apply Correct Action: Add +7 to BOTH Sides
                  </button>
                  <button
                    onClick={() => {
                      setScaleLeft(14);
                      setScaleRight(7);
                      setAddedNumber(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900/80 border border-rose-800 text-rose-200 text-xs font-semibold transition cursor-pointer min-h-[44px]"
                  >
                    Observe Sign Error: Subtract 7 from Right Only
                  </button>
                  <button
                    onClick={() => {
                      setScaleLeft(14);
                      setScaleRight(14);
                      setAddedNumber(null);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer min-h-[44px]"
                  >
                    Reset Scale
                  </button>
                </div>
              </div>
            )}

            {legacyIntervention.interactiveModel === 'rainbow_expansion' && (
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-6 text-center">
                <RainbowDistributionVisual />
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 font-medium">
                  Resulting equation:{' '}
                  <span className="font-mono font-bold text-white">8x - 12 = 28</span> (Not 8x - 3!)
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={onCancel}
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
      )}
    </div>
  );
};
