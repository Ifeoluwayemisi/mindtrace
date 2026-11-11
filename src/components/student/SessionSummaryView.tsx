import React from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Target,
  BookOpen,
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
  diagnosis,
  earnedPoints,
  onContinue,
  onBackToDashboard,
}) => {
  return (
    <div className="max-w-lg mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 animate-fade-in space-y-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xl">
        <Trophy className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
          Session Complete
        </span>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Diagnostic Session Complete
        </h1>
        <p className="text-xs text-slate-300 max-w-sm mx-auto">
          Every misconception identified strengthens your problem-solving foundation for WAEC and JAMB examinations.
        </p>
      </div>

      {/* Reward Breakdown Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-white">Session XP Summary</span>
          <span className="font-mono text-base font-bold text-amber-300">+{earnedPoints} XP</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Diagnostic Reasoning Completed</span>
            </span>
            <span className="font-mono font-semibold">+10 XP</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Intermediate Steps Provided</span>
            </span>
            <span className="font-mono font-semibold">+5 XP</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Targeted Remediation & Recovery</span>
            </span>
            <span className="font-mono font-semibold">+15 XP</span>
          </div>
        </div>

        {/* Progress Toward Daily Goal */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Daily Goal Target</span>
            <span className="font-mono text-indigo-400">
              {Math.min(student.dailyGoalTarget, student.dailyGoalCompleted)} / {student.dailyGoalTarget} Solved
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (student.dailyGoalCompleted / student.dailyGoalTarget) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
        >
          Return to Dashboard
        </button>
        <button
          onClick={onContinue}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <span>Continue to Next Problem</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
