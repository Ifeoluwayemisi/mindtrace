import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Award,
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
      {/* Top Welcome & Identity Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6755E8] to-[#5140CA] p-6 md:p-8 shadow-2xl shadow-[#6755E8]/20 text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#F3F1FF]">
              <span className="bg-white/10 px-2 py-0.5 rounded-md">{student.classSection || 'SS2 B'}</span>
              <span>{student.school || 'Comprehensive Senior High'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#49C6A3]">{student.targetExam || 'WAEC & JAMB'} Track</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FFC85A]">Level {level} Scholar</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight leading-tight">
              Ready to level up your Mathematics, {student.name ? student.name.split(' ')[0] : 'Scholar'}?
            </h1>

            <p className="text-sm text-[#F3F1FF]/90 leading-relaxed max-w-xl">
              MindTrace analyzes each line of your mathematical working to reveal the exact misconception and helps you turn weak areas into confident mastery — completely offline.
            </p>

            {/* Presentation Modes */}
            <div className="flex items-center gap-4 pt-1 text-xs text-[#F3F1FF]/80 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Visual Models
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> Audio Assist
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Interactive
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectQuestion(QUESTION_BANK[0])}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-[#6755E8] font-bold text-sm shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#FFC85A] fill-[#FFC85A]" />
              <span>Start Diagnostic Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-modern p-5 cursor-pointer card-interactive" onClick={onViewGamification}>
          <div className="flex items-center justify-between text-[#74788E] text-xs font-bold mb-2">
            <span>Cognitive XP</span>
            <Sparkles className="w-4 h-4 text-[#FFC85A]" />
          </div>
          <div className="text-2xl font-black text-[#252641] font-display tabular-nums">
            {totalPoints} <span className="text-sm font-bold text-[#74788E]">XP</span>
          </div>
          <div className="w-full bg-[#E9EAF3] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#6755E8] h-full rounded-full transition-all duration-500" style={{ width: `${pointsInCurrentLevel}%` }} />
          </div>
        </div>

        <div className="card-modern p-5">
          <div className="flex items-center justify-between text-[#74788E] text-xs font-bold mb-2">
            <span>Daily Goal</span>
            <Target className="w-4 h-4 text-[#36B8D8]" />
          </div>
          <div className="text-2xl font-black text-[#252641] font-display tabular-nums">
            {student.dailyGoalCompleted || 0} <span className="text-sm font-bold text-[#74788E]">/ {student.dailyGoalTarget || 3}</span>
          </div>
          <div className="w-full bg-[#E9EAF3] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#49C6A3] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((student.dailyGoalCompleted || 0) / (student.dailyGoalTarget || 3)) * 100)}%` }} />
          </div>
        </div>

        <div className="card-modern p-5">
          <div className="flex items-center justify-between text-[#74788E] text-xs font-bold mb-2">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-[#FF9078] fill-[#FF9078]" />
          </div>
          <div className="text-2xl font-black text-[#252641] font-display tabular-nums">
            {student.streakDays || 1} <span className="text-sm font-bold text-[#74788E]">Days</span>
          </div>
          <p className="text-[11px] text-[#74788E] mt-2 font-medium">Consecutive learning momentum</p>
        </div>

        <div className="card-modern p-5 cursor-pointer card-interactive" onClick={onViewHistory}>
          <div className="flex items-center justify-between text-[#74788E] text-xs font-bold mb-2">
            <span>Sync Queue</span>
            <Layers className="w-4 h-4 text-[#6755E8]" />
          </div>
          <div className="text-2xl font-black text-[#252641] font-display tabular-nums">
            {pendingSyncCount}
          </div>
          <p className="text-[11px] text-[#74788E] mt-2 font-medium">
            {pendingSyncCount > 0 ? 'Upload pending' : 'All synced'}
          </p>
        </div>
      </div>

      {/* Action Quick Links Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: School, title: 'My Classrooms', desc: 'Join with code', onClick: () => setIsClassroomsModalOpen(true) },
          { icon: BookOpen, title: 'WAEC Syllabus', desc: 'All math modules', onClick: onViewSubjectOverview },
          { icon: Award, title: 'Badges & Ranks', desc: 'Leaderboard', onClick: onViewGamification },
          { icon: Play, title: 'Motion Lessons', desc: 'Micro-remedies', onClick: onViewRemedyLibrary },
          { icon: History, title: 'History', desc: 'Diagnostic logs', onClick: onViewHistory },
        ].map((item, i) => (
          <button key={i} onClick={item.onClick} className="card-modern p-4 text-left transition-all card-interactive flex flex-col gap-2 cursor-pointer">
            <item.icon className="w-5 h-5 text-[#6755E8]" />
            <div>
              <h3 className="text-xs font-bold text-[#252641]">{item.title}</h3>
              <p className="text-[10px] text-[#74788E]">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Available Practice Topics */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-[#252641]">Practice Sets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUESTION_BANK.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="card-modern p-6 cursor-pointer card-interactive group"
            >
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-[#6755E8]">{q.topicTitle}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F3F1FF] text-[10px] font-bold text-[#5140CA]">
                  {q.difficulty}
                </span>
              </div>
              <div className="my-4 py-4 px-6 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-center font-mono text-2xl font-bold text-[#252641]">
                {q.equation}
              </div>
              <p className="text-xs text-[#74788E] mb-5 line-clamp-2">{q.prompt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#E9EAF3] text-xs font-bold text-[#6755E8]">
                <span>{q.contextNote || 'WAEC Standard'}</span>
                <span className="group-hover:translate-x-1 transition-transform">Solve Now →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
