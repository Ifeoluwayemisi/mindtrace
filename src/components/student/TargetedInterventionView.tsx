import React, { useState } from 'react';
import {
  ArrowRight,
  Scale,
  CheckCircle2,
  Play,
  Sliders,
  AlertTriangle,
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
      {/* Experience switcher */}
      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[12px]"
          role="tablist"
          aria-label="Intervention mode"
        >
          <button
            role="tab"
            aria-selected={viewMode === 'animated_lesson'}
            onClick={() => setViewMode('animated_lesson')}
            className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'animated_lesson'
                ? 'bg-white text-[#1D4ED8] shadow-sm border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Animated lesson</span>
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'manual_sandbox'}
            onClick={() => setViewMode('manual_sandbox')}
            className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'manual_sandbox'
                ? 'bg-white text-[#1D4ED8] shadow-sm border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Interactive sandbox</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#64748B] hidden sm:inline">
          WAEC syllabus aligned micro-module
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
        /* Manual sandbox */
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-8">
          <section className="card-modern p-5 sm:p-6 space-y-5" aria-labelledby="sandbox-heading">
            <div>
              <h2 id="sandbox-heading" className="section-title flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
                <span>Manual sandbox: {legacyIntervention.metaphorTitle}</span>
              </h2>
              <p className="body-text mt-1">{legacyIntervention.metaphorDescription}</p>
            </div>

            {legacyIntervention.interactiveModel === 'balance_scale' && (
              <div className="p-4 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-6">
                <BalanceScaleVisual
                  isBalanced={isBalanced}
                  leftExpression={scaleLeft === 21 ? '3x - 7 + 7' : '3x - 7'}
                  rightExpression={scaleRight === 21 ? '14 + 7' : scaleRight === 7 ? '14 - 7' : '14'}
                  tiltAngle={scaleLeft > scaleRight ? -6 : scaleLeft < scaleRight ? 6 : 0}
                />

                <div className="flex justify-center">
                  <div
                    role="status"
                    className={`text-[13px] px-3.5 py-2 rounded-xl font-medium inline-flex items-start gap-2 border ${
                      isBalanced
                        ? 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]'
                        : 'text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]'
                    }`}
                  >
                    {isBalanced ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <span>
                      {isBalanced
                        ? 'Equality holds: adding +7 to BOTH sides leaves 3x = 21.'
                        : 'Scale tilted! Performing an operation on only one side breaks equality.'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      setScaleLeft(21);
                      setScaleRight(21);
                      setAddedNumber(7);
                    }}
                    className="btn-primary text-[12px] px-4"
                  >
                    Apply correct action: add +7 to BOTH sides
                  </button>
                  <button
                    onClick={() => {
                      setScaleLeft(14);
                      setScaleRight(7);
                      setAddedNumber(null);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] text-[#92400E] text-[12px] font-semibold transition cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    Observe sign error: subtract 7 from right only
                  </button>
                  <button
                    onClick={() => {
                      setScaleLeft(14);
                      setScaleRight(14);
                      setAddedNumber(null);
                    }}
                    className="btn-secondary min-h-[44px] px-4 text-[12px]"
                  >
                    Reset scale
                  </button>
                </div>
              </div>
            )}

            {legacyIntervention.interactiveModel === 'rainbow_expansion' && (
              <div className="p-4 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-6 text-center">
                <RainbowDistributionVisual />
                <div className="p-3 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] text-[12px] text-[#4338CA] font-medium">
                  Resulting equation:{' '}
                  <span className="math-expression font-bold text-[#0F172A]">8x - 12 = 28</span> (not 8x - 3!)
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <button
              onClick={onCancel}
              className="text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer min-h-[40px]"
            >
              ← Return to dashboard
            </button>

            <button
              onClick={onProceedToFollowUp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Prove mastery: take single follow-up check</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
