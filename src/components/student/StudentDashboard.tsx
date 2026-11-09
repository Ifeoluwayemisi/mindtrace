import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  Zap,
  Target,
  Layers,
  Trophy,
  History,
  Sliders,
  Volume2,
  Eye,
} from 'lucide-react';
import { StudentProfile, Question } from '../../types';
import { QUESTION_BANK } from '../../data/questionBank';
import { gamificationService } from '../../services/gamificationService';

interface StudentDashboardProps {
  student: StudentProfile;
  onSelectQuestion: (question: Question) => void;
  onViewRemedyLibrary: () => void;
  onViewProgress: () => void;
  onViewSubjectOverview: () => void;
  onViewGamification: () => void;
  onViewHistory: () => void;
  pendingSyncCount: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onSelectQuestion,
  onViewRemedyLibrary,
  onViewProgress,
  onViewSubjectOverview,
  onViewGamification,
  onViewHistory,
  pendingSyncCount,
}) => {
  const totalPoints = gamificationService.calculateTotalPoints(student.id);
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsInCurrentLevel = totalPoints % 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome & Identity Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-900/40 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-300 font-medium">
              <span>{student.classSection}</span>
              <span aria-hidden="true">·</span>
              <span>{student.school}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">{student.targetExam} Target</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-300 font-bold">Level {level}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Hi, {student.name}! Let's isolate the math.
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              100% offline cognitive diagnostics. Every time an equation trips you up, MindTrace
              pinpoints the exact step and helps you fix the root misconception.
            </p>

            {/* Presentation preferences badge strip */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span>Active modes:</span>
              {(student.preferredPresentation?.includes('visual') ?? student.learningPreferences?.includes('visual')) && (
                <span className="inline-flex items-center gap-1 text-indigo-300">
                  <Eye className="w-3 h-3" /> Visual
                </span>
              )}
              {(student.audioSupport || student.preferredPresentation?.includes('audio') || student.learningPreferences?.includes('audio')) && (
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <Volume2 className="w-3 h-3" /> Audio Assistance
                </span>
              )}
              {(student.preferredPresentation?.includes('interactive') ?? student.learningPreferences?.includes('interactive')) && (
                <span className="inline-flex items-center gap-1 text-violet-300">
                  <Sliders className="w-3 h-3" /> Hands-On
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectQuestion(QUESTION_BANK[0])}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Start Quick Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onViewGamification}
              className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>XP & Badges</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
          <div
            onClick={onViewGamification}
            className="bg-slate-900/70 hover:bg-slate-900 rounded-2xl p-4 border border-slate-800/60 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Points & XP</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {totalPoints} XP
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${pointsInCurrentLevel}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Level {level} Explorer</span>
          </div>

          <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Daily Goal (Today)</span>
              <Target className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {student.dailyGoalCompleted || 0} / {student.dailyGoalTarget || 3}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((student.dailyGoalCompleted || 0) / (student.dailyGoalTarget || 3)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Equations solved</p>
          </div>

          <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Practice Streak</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {student.streakDays} Days
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Active practice streak</p>
          </div>

          <div
            onClick={onViewHistory}
            className="bg-slate-900/70 hover:bg-slate-900 rounded-2xl p-4 border border-slate-800/60 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Sync Queue</span>
              <Layers className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {pendingSyncCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {pendingSyncCount > 0 ? 'Queued offline' : 'Fully synchronized'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Quick Links Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onViewSubjectOverview}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition cursor-pointer space-y-1"
        >
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold text-white">WAEC Syllabus</h3>
          <p className="text-[11px] text-slate-400">Review all math modules</p>
        </button>

        <button
          onClick={onViewGamification}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer space-y-1"
        >
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-bold text-white">Badges & Ranks</h3>
          <p className="text-[11px] text-slate-400">Class weekly leaderboard</p>
        </button>

        <button
          onClick={onViewRemedyLibrary}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/50 text-left transition cursor-pointer space-y-1"
        >
          <Zap className="w-5 h-5 text-violet-400" />
          <h3 className="text-xs font-bold text-white">Visual Remedies</h3>
          <p className="text-[11px] text-slate-400">2-min models & scales</p>
        </button>

        <button
          onClick={onViewHistory}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition cursor-pointer space-y-1"
        >
          <History className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">Attempt History</h3>
          <p className="text-[11px] text-slate-400">Past diagnostic logs</p>
        </button>
      </div>

      {/* Available Offline Practice Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              Curated WAEC / JAMB Practice Sets
            </h2>
            <p className="text-xs text-slate-400">
              Select an equation to solve step-by-step with zero internet data
            </p>
          </div>
          <button
            onClick={onViewSubjectOverview}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Topics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUESTION_BANK.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="group rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 p-5 transition-all hover:bg-slate-900 cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                <span className="font-semibold text-indigo-400">{q.topicTitle}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                  {q.difficulty}
                </span>
              </div>

              <div className="my-3 py-3 px-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono text-xl font-bold text-indigo-200">
                {q.equation}
              </div>

              <p className="text-xs text-slate-300 mb-4 line-clamp-1">{q.prompt}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400">{q.contextNote || 'WAEC Standard'}</span>
                <span className="font-medium text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Solve Now (+15 XP)
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
