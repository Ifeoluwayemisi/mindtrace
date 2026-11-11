import React from 'react';
import {
  Trophy,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { StudentProfile, DiagnosisResult } from '../../types';

interface SessionSummaryViewProps {
  student: StudentProfile;
  diagnosis: DiagnosisResult;
  earnedPoints: number;
  onContinue: () => void;
  onBackToDashboard: () => void;
}

export const SessionSummaryView: React.FC<SessionSummaryViewProps> = ({
  student,
  earnedPoints,
  onContinue,
  onBackToDashboard,
}) => {
  const goalPercent = Math.min(
    100,
    (student.dailyGoalCompleted / Math.max(1, student.dailyGoalTarget)) * 100
  );

  return (
    <div className="max-w-lg mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 animate-fade-in space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center justify-center mx-auto shadow-sm">
        <Trophy className="w-8 h-8" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <span className="eyebrow text-[#2563EB]">Session complete</span>
        <h1 className="page-title">Diagnostic session complete</h1>
        <p className="body-text max-w-sm mx-auto">
          Every misconception identified strengthens your problem-solving foundation for WAEC and JAMB examinations.
        </p>
      </div>

      {/* Reward breakdown */}
      <section className="card-modern p-5 space-y-4 text-left" aria-labelledby="xp-summary">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h2 id="xp-summary" className="text-[13px] font-bold text-[#0F172A]">Session XP summary</h2>
          <span className="math-expression text-base font-bold text-[#92400E]">+{earnedPoints} XP</span>
        </div>

        <div className="space-y-2.5 text-[13px]">
          <div className="flex items-center justify-between text-[#475569]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
              <span>Diagnostic reasoning completed</span>
            </span>
            <span className="font-mono font-semibold text-[#0F172A]">+10 XP</span>
          </div>

          <div className="flex items-center justify-between text-[#475569]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
              <span>Intermediate steps provided</span>
            </span>
            <span className="font-mono font-semibold text-[#0F172A]">+5 XP</span>
          </div>

          <div className="flex items-center justify-between text-[#475569]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
              <span>Targeted remediation & recovery</span>
            </span>
            <span className="font-mono font-semibold text-[#0F172A]">+15 XP</span>
          </div>
        </div>

        {/* Daily goal */}
        <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5">
          <div className="flex items-center justify-between text-[12px] font-semibold text-[#475569]">
            <span>Daily goal target</span>
            <span className="font-mono text-[#1D4ED8]">
              {Math.min(student.dailyGoalTarget, student.dailyGoalCompleted)} / {student.dailyGoalTarget} solved
            </span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(goalPercent)} aria-label="Daily goal progress">
            <div className="progress-fill progress-fill-mastery" style={{ width: `${goalPercent}%` }} />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button onClick={onBackToDashboard} className="btn-secondary w-full sm:w-auto text-[13px]">
          Return to dashboard
        </button>
        <button onClick={onContinue} className="btn-primary w-full sm:w-auto text-[13px]">
          <span>Continue to next problem</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
