import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Award,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Question, StudentProfile } from '../../types';
import { cleanMathStr } from '../../services/edgeRuleEngine';
import { storageService } from '../../services/storageService';
import { gamificationService } from '../../services/gamificationService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface FollowUpAssessmentViewProps {
  question: Question;
  student: StudentProfile;
  onMasteryAchieved: () => void;
  onReturnToDashboard: () => void;
}

export const FollowUpAssessmentView: React.FC<FollowUpAssessmentViewProps> = ({
  question,
  student,
  onMasteryAchieved,
}) => {
  const followUp = question.followUpQuestion || {
    equation: '4x - 9 = 15',
    prompt: 'Check your mastery: Solve 4x - 9 = 15. What is the value of x?',
    expectedFinalAnswer: '6',
    expectedSteps: ['4x = 15 + 9', '4x = 24', 'x = 6'],
  };

  const [workingStep, setWorkingStep] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [earnedBonusXp, setEarnedBonusXp] = useState(0);

  const handleSubmit = async () => {
    setIsEvaluating(true);
    const cleaned = cleanMathStr(finalAnswer);
    const expected = cleanMathStr(followUp.expectedFinalAnswer);

    await new Promise((r) => setTimeout(r, 200));
    setIsEvaluating(false);

    // 1. Award +10 XP for attempting the follow-up assessment (idempotent)
    let bonus = 0;
    const attemptReward = gamificationService.awardPoints(
      student,
      'followup_complete',
      followUp.equation,
      10,
      `Completed follow-up verification: ${followUp.equation}`
    );
    if (attemptReward.awarded) bonus += 10;

    if (cleaned === expected) {
      setIsSuccess(true);
      // 2. Award +15 XP for demonstrating conceptual improvement on follow-up!
      const improveReward = gamificationService.awardPoints(
        student,
        'followup_improved',
        followUp.equation,
        15,
        `Demonstrated improvement on follow-up: ${followUp.equation}`
      );
      if (improveReward.awarded) bonus += 15;

      // Persist mastery update
      student.masteryPercentage = Math.min(100, student.masteryPercentage + 4);
      student.streakDays = student.streakDays + 1;
      gamificationService.evaluateBadges(student);
      await storageService.saveStudentProfile(student);
    } else {
      setIsSuccess(false);
    }

    setEarnedBonusXp(bonus);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <section className="card-modern p-5 sm:p-7 space-y-5" aria-labelledby="followup-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="eyebrow text-[#059669]">Immediate follow-up mastery check</span>
          <span className="badge badge-diagnostic font-mono">+25 XP opportunity</span>
        </div>

        <div>
          <h1 id="followup-heading" className="page-title">Verify concept mastery</h1>
          <p className="body-text mt-1">
            Solve this follow-up equation independently to confirm that the algebraic principle is understood.
          </p>
        </div>

        <AudioPlayerControl
          textToSpeak={`Follow-up mastery check. Solve the equation: ${followUp.equation}. Instructions: ${followUp.prompt}`}
          label="Listen to follow-up equation"
          variant="card"
          hasAudioPreference={Boolean(
            student.audioSupport ||
              student.preferredPresentation?.includes('audio') ||
              student.learningPreferences?.includes('audio')
          )}
        />

        {/* Follow-up equation */}
        <div className="py-5 px-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] bg-math-grid text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748B] mb-1">Solve for x</p>
          <div className="math-expression text-3xl font-bold text-[#0F172A] break-words">
            {followUp.equation}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label htmlFor="followup-step" className="label-modern">
              Your transition step <span className="font-normal text-[#64748B]">(optional but recommended)</span>
            </label>
            <input
              id="followup-step"
              type="text"
              value={workingStep}
              onChange={(e) => setWorkingStep(e.target.value)}
              placeholder="e.g. 4x = 15 + 9"
              className="input-modern input-mono"
            />
          </div>

          <div>
            <label htmlFor="followup-answer" className="label-modern">Final value of x</label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15">
              <span className="math-expression font-bold text-[#2563EB] text-sm">x =</span>
              <input
                id="followup-answer"
                type="text"
                value={finalAnswer}
                onChange={(e) => setFinalAnswer(e.target.value)}
                placeholder="e.g. 6"
                className="flex-1 min-h-[32px] bg-transparent math-expression text-base font-bold text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>
          </div>
        </div>

        {/* Result */}
        {isSuccess === true && (
          <div role="status" className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 space-y-2 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#065F46]">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" aria-hidden="true" />
                <span>Misconception resolved — correct solution</span>
              </div>
              {earnedBonusXp > 0 && (
                <span className="badge badge-diagnostic font-mono">+{earnedBonusXp} XP earned</span>
              )}
            </div>
            <p className="text-[13px] text-[#047857] leading-relaxed">
              You applied the inverse sign transposition correctly. Your algebra mastery has
              increased to <strong className="text-[#064E3B]">{student.masteryPercentage}%</strong> and
              your practice streak is now <strong className="text-[#064E3B]">{student.streakDays} days</strong>.
            </p>
          </div>
        )}

        {isSuccess === false && (
          <div role="status" className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-4 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-bold text-[#92400E]">
              <AlertTriangle className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
              <span>Check step: transposition sign reversal</span>
            </div>
            <p className="text-[13px] text-[#92400E] leading-relaxed">
              In 4x - 9 = 15, applying the additive inverse (+9) to both sides yields 4x = 15 + 9 = 24. Dividing by coefficient 4 yields x = 6.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isSuccess !== true ? (
            <button
              onClick={handleSubmit}
              disabled={isEvaluating || !finalAnswer.trim()}
              className="btn-primary w-full px-6 py-3 text-[13px]"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
              <span>{isEvaluating ? 'Evaluating…' : 'Verify answer'}</span>
            </button>
          ) : (
            <button
              onClick={onMasteryAchieved}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#FDE68A]" aria-hidden="true" />
              <span>Record mastery & complete session</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
