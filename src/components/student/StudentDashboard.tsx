import React, { useState } from 'react';
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
  Play,
  School,
} from 'lucide-react';
import { StudentProfile, Question } from '../../types';
import { QUESTION_BANK } from '../../data/questionBank';
import { gamificationService } from '../../services/gamificationService';
import { StudentClassroomsModal } from './StudentClassroomsModal';

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
  const [isClassroomsModalOpen, setIsClassroomsModalOpen] = useState(false);
  const totalPoints = gamificationService.calculateTotalPoints(student.id);
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsInCurrentLevel = totalPoints % 100;

  return (
    <div className="space-y-8 animate-fade-in">
      <StudentClassroomsModal
        isOpen={isClassroomsModalOpen}
        onClose={() => setIsClassroomsModalOpen(false)}
      />
      {/* Top Welcome & Identity Card with Authentic Visual Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-900/50 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-300 font-medium">
              <span>{student.classSection || 'SS2 B'}</span>
              <span aria-hidden="true">·</span>
              <span>{student.school || 'Comprehensive Senior High'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">{student.targetExam || 'WAEC & JAMB'} Track</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-300 font-bold">Level {level} Scholar</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Ready to level up your Mathematics, {student.name ? student.name.split(' ')[0] : 'Scholar'}?
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Every incorrect step has a specific algebraic reason. MindTrace analyzes your line-by-line working, isolates the exact misconception, and helps you turn weak areas into confident exam problem-solving — completely offline.
            </p>

            {/* Presentation Modes Active */}
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="text-slate-500 font-medium">Diagnostic Modes:</span>
              <span className="inline-flex items-center gap-1 text-indigo-300 font-medium">
                <Eye className="w-3.5 h-3.5" /> Visual Balance Models
              </span>
              <span className="text-slate-700">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                <Volume2 className="w-3.5 h-3.5" /> Web Speech Read-Aloud
              </span>
              <span className="text-slate-700">·</span>
              <span className="inline-flex items-center gap-1 text-violet-300 font-medium">
                <Sliders className="w-3.5 h-3.5" /> Interactive Sandbox
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectQuestion(QUESTION_BANK[0])}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Start Diagnostic Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewGamification}
              className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition cursor-pointer flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>XP & Badges</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid with Tabular Numerals */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-slate-800/80">
          <div
            onClick={onViewGamification}
            className="bg-slate-900/80 hover:bg-slate-900 rounded-2xl p-4 border border-slate-800/80 cursor-pointer transition shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
              <span>Cognitive XP</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {totalPoints} XP
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pointsInCurrentLevel}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              {100 - pointsInCurrentLevel} XP to Level {level + 1}
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
              <span>Daily Practice Goal</span>
              <Target className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {student.dailyGoalCompleted || 0} / {student.dailyGoalTarget || 3}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    ((student.dailyGoalCompleted || 0) / (student.dailyGoalTarget || 3)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {(student.dailyGoalCompleted || 0) >= (student.dailyGoalTarget || 3)
                ? 'Daily practice target achieved'
                : `${(student.dailyGoalTarget || 3) - (student.dailyGoalCompleted || 0)} equations to complete target`}
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
              <span>Practice Streak</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {student.streakDays || 1} Day{student.streakDays !== 1 ? 's' : ''}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Consecutive learning momentum</p>
          </div>

          <div
            onClick={onViewHistory}
            className="bg-slate-900/80 hover:bg-slate-900 rounded-2xl p-4 border border-slate-800/80 cursor-pointer transition shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
              <span>Offline Sync Queue</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-display tabular-nums">
              {pendingSyncCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {pendingSyncCount > 0 ? `${pendingSyncCount} attempts ready for upload` : 'All records synchronized'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Quick Links Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setIsClassroomsModalOpen(true)}
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition cursor-pointer space-y-1"
        >
          <School className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold text-white">My Classrooms</h3>
          <p className="text-[11px] text-slate-400">Join with code</p>
        </button>

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
          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition cursor-pointer space-y-1"
        >
          <Play className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
          <h3 className="text-xs font-bold text-white">Motion Lessons</h3>
          <p className="text-[11px] text-slate-400">Animated micro-remedies</p>
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
