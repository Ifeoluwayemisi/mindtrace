import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { DiagnosisResult, Question } from '../../types';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';
import { BalanceScaleVisual, RainbowDistributionVisual } from '../common/MathVisuals';

interface DiagnosisResultViewProps {
  diagnosis: DiagnosisResult;
  question: Question;
  onStartIntervention: () => void;
  onTryAgain: () => void;
  onNextQuestion: () => void;
  onViewSummary?: () => void;
}

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  diagnosis,
  question,
  onStartIntervention,
  onTryAgain,
  onNextQuestion,
  onViewSummary,
}) => {
  const isCorrect = diagnosis.isCorrect;
  const isAmbiguous = diagnosis.misconceptionCode === 'INSUFFICIENT_EVIDENCE';
  const savedStudent = storageService.getSavedStudentProfile();
  const hasAudioPreference = Boolean(
    savedStudent.audioSupport ||
      savedStudent.preferredPresentation?.includes('audio') ||
      savedStudent.learningPreferences?.includes('audio')
  );

  const speechExplanationText = `Diagnosis result: ${diagnosis.title}. ${diagnosis.summary}. Detailed explanation: ${diagnosis.explanation}. Pedagogical guidance: ${diagnosis.pedagogicalEmpathyNote}`;

  const bannerTone = isCorrect
    ? 'bg-[#ECFDF5] border-[#A7F3D0]'
    : isAmbiguous
    ? 'bg-[#F8FAFC] border-[#E2E8F0]'
    : 'bg-[#FFFBEB] border-[#FDE68A]';

  const iconTone = isCorrect
    ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
    : isAmbiguous
    ? 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
    : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Status banner */}
      <section className={`rounded-3xl p-5 sm:p-7 border ${bannerTone}`} aria-labelledby="diagnosis-title">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0F172A]/8">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${iconTone}`}>
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              ) : isAmbiguous ? (
                <HelpCircle className="w-6 h-6" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-medium text-[#64748B]">
                  Edge diagnostic output · {diagnosis.misconceptionCode}
                </span>
                {diagnosis.earnedXp && diagnosis.earnedXp > 0 && (
                  <span className="badge badge-diagnostic font-mono">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    +{diagnosis.earnedXp} XP earned
                  </span>
                )}
              </div>
              <h1 id="diagnosis-title" className="text-xl sm:text-2xl font-display font-bold text-[#0F172A] mt-0.5">
                {diagnosis.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <AudioPlayerControl
              textToSpeak={speechExplanationText}
              label="Listen"
              variant="compact"
              hasAudioPreference={hasAudioPreference}
            />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-mono text-[#065F46]">
              <Zap className="w-3 h-3" aria-hidden="true" />
              <span>{diagnosis.parsingDurationMs}ms</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-mono text-[#4338CA]">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
              <span>0 KB used</span>
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="body-text font-medium text-[#0F172A]">{diagnosis.summary}</p>

          <div className="text-[13px] text-[#475569] leading-relaxed bg-white/70 p-3.5 rounded-xl border border-[#E2E8F0]">
            <strong className="text-[#4338CA] font-semibold">Pedagogical note: </strong>
            {diagnosis.pedagogicalEmpathyNote}
          </div>

          <AudioPlayerControl
            textToSpeak={speechExplanationText}
            label="Listen to full diagnostic analysis"
            variant="card"
            hasAudioPreference={hasAudioPreference}
          />
        </div>
      </section>

      {/* Visual model for cognitive correction */}
      {!isCorrect && diagnosis.misconceptionCode === 'ALG_SIGN_FLIP' && (
        <BalanceScaleVisual
          leftExpression={diagnosis.faultyExpression || '3x = 14 - 7'}
          rightExpression="Equality broken! (≠)"
          isBalanced={false}
          tiltAngle={-8}
        />
      )}

      {!isCorrect && diagnosis.misconceptionCode === 'ALG_INVALID_DISTRIB' && (
        <RainbowDistributionVisual multiplier="2" term1="4x" term2="- 3" />
      )}

      {/* Evidence comparison */}
      {!isCorrect && !isAmbiguous && diagnosis.faultyExpression && (
        <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="evidence-heading">
          <div>
            <h2 id="evidence-heading" className="section-title">Mathematical evidence</h2>
            <p className="meta-text mt-0.5">Your line compared with the expected WAEC method.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student's faulty transition — amber, never red */}
            <div className="math-step math-step-misconception p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-[#92400E] inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  Your step (line {diagnosis.faultyStepNumber || 1})
                </span>
                <span className="badge badge-diagnostic">Misconception</span>
              </div>
              <div className="math-expression text-lg font-bold text-[#78350F] py-1 break-words">
                {diagnosis.faultyExpression}
              </div>
              <p className="text-[12px] text-[#92400E]/85">
                Transposed without inverting the operational sign.
              </p>
            </div>

            {/* Expected transition */}
            <div className="rounded-xl bg-white border border-[#A7F3D0] border-l-4 border-l-[#059669] p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-[#065F46] inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Expected WAEC method
                </span>
                <span className="badge badge-mastery">Standard rule</span>
              </div>
              <div className="math-expression text-lg font-bold text-[#064E3B] py-1 break-words">
                {diagnosis.expectedExpression}
              </div>
              <p className="text-[12px] text-[#047857]">
                Maintains balance-scale equality on both sides.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#475569] leading-relaxed">
            <strong className="text-[#0F172A] block mb-1">Why this happened</strong>
            {diagnosis.explanation}
          </div>
        </section>
      )}

      {/* Line-by-line assessment */}
      {diagnosis.stepEvaluation && (
        <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="steps-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 id="steps-heading" className="section-title flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
                Line-by-line assessment
              </h2>
              <p className="meta-text mt-0.5">Transformation validity and mathematical rigour per line.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-right">
                <div className="text-[10px] text-[#1D4ED8] uppercase tracking-wider font-semibold">Academic score</div>
                <div className="text-lg font-mono font-bold text-[#1E40AF]">
                  {diagnosis.stepEvaluation.academicScorePercentage}%
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-right">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Valid steps</div>
                <div className="text-lg font-mono font-bold text-[#0F172A]">
                  {diagnosis.stepEvaluation.validStepsCount} / {diagnosis.stepEvaluation.totalSteps}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {diagnosis.stepEvaluation.stepAnalysis.map((step) => (
              <div
                key={step.stepNumber}
                className={`math-step p-3.5 ${
                  step.isCorrect ? 'math-step-completed' : 'math-step-misconception'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`math-step-badge ${
                        step.isCorrect ? 'math-step-badge-completed' : 'math-step-badge-misconception'
                      }`}
                      aria-hidden="true"
                    >
                      L{step.stepNumber}
                    </span>
                    <span className="math-expression text-[14px] font-semibold text-[#0F172A] break-words">
                      {step.mathExpression}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {step.isCorrect ? (
                      <span className="badge badge-mastery">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Valid step
                      </span>
                    ) : (
                      <span className="badge badge-diagnostic">
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Faulty transition
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-[13px] text-[#475569] space-y-1.5 pl-1 sm:pl-10">
                  <p>{step.feedbackNote}</p>
                  {!step.isCorrect && step.expectedExpression && (
                    <div className="text-[12px] math-expression text-[#065F46] bg-white p-2 rounded-lg border border-[#A7F3D0]">
                      Expected correct step: <span className="font-bold">{step.expectedExpression}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <button onClick={onTryAgain} className="btn-secondary w-full sm:w-auto text-[13px]">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Try this equation again</span>
        </button>

        {!isCorrect && !isAmbiguous && (
          <button
            onClick={onStartIntervention}
            className="btn-primary w-full sm:w-auto px-6 py-3 text-[13px]"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Launch animated remedy (+10 XP)</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        {isCorrect && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {onViewSummary && (
              <button onClick={onViewSummary} className="btn-secondary text-[13px]">
                View session summary
              </button>
            )}
            <button
              onClick={onNextQuestion}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[13px] font-bold shadow-sm transition-colors cursor-pointer"
            >
              <span>Next equation</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
