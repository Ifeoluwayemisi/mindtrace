import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Zap,
  Target,
  Layers,
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
import { resolveAvatarSrc, getInitials } from '../../utils/avatar';

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
  const avatarSrc = resolveAvatarSrc(student.avatarSeed);
  const dailyPercent = Math.min(
    100,
    ((student.dailyGoalCompleted || 0) / (student.dailyGoalTarget || 3)) * 100
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <StudentClassroomsModal
        isOpen={isClassroomsModalOpen}
        onClose={() => setIsClassroomsModalOpen(false)}
      />

      {/* Welcome hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-white to-[#E0F2FE] p-6 md:p-8">
        <div className="absolute inset-0 bg-math-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-primary">{student.classSection || 'SS2 B'}</span>
              <span className="text-[12px] text-[#475569] font-medium">{student.school || 'Comprehensive Senior High'}</span>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <span className="badge badge-mastery">{student.targetExam || 'WAEC & JAMB'} track</span>
              <span className="badge badge-diagnostic">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                Level {level} scholar
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#BFDBFE] overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[#2563EB]">{getInitials(student.name)}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight leading-tight text-[#0F172A]">
                Ready to level up your Mathematics, {student.name ? student.name.split(' ')[0] : 'Scholar'}?
              </h1>
            </div>

            <p className="body-text max-w-xl">
              MindTrace analyses each line of your mathematical working to reveal the exact misconception, then helps you turn weak areas into confident mastery — completely offline.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] text-[#475569] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#2563EB]" aria-hidden="true" /> Visual models
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" /> Audio assist
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#6366F1]" aria-hidden="true" /> Interactive
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectQuestion(QUESTION_BANK[0])}
              className="btn-primary px-6 py-3.5 text-sm shadow-md"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
              <span>Start diagnostic practice</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button onClick={onViewGamification} className="card-modern card-interactive p-4 sm:p-5 text-left">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase tracking-wide mb-2">
            <span>Cognitive XP</span>
            <span className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-display tabular-nums">
            {totalPoints} <span className="text-[13px] font-semibold text-[#64748B]">XP</span>
          </div>
          <div className="progress-track mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pointsInCurrentLevel} aria-label="Progress to next level">
            <div className="progress-fill" style={{ width: `${pointsInCurrentLevel}%` }} />
          </div>
        </button>

        <div className="card-modern p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase tracking-wide mb-2">
            <span>Daily goal</span>
            <span className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center">
              <Target className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-display tabular-nums">
            {student.dailyGoalCompleted || 0} <span className="text-[13px] font-semibold text-[#64748B]">/ {student.dailyGoalTarget || 3}</span>
          </div>
          <div className="progress-track mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(dailyPercent)} aria-label="Daily goal progress">
            <div className="progress-fill progress-fill-mastery" style={{ width: `${dailyPercent}%` }} />
          </div>
        </div>

        <div className="card-modern p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase tracking-wide mb-2">
            <span>Streak</span>
            <span className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-display tabular-nums">
            {student.streakDays || 1} <span className="text-[13px] font-semibold text-[#64748B]">days</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-2 font-medium">Consecutive learning momentum</p>
        </div>

        <button onClick={onViewHistory} className="card-modern card-interactive p-4 sm:p-5 text-left">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase tracking-wide mb-2">
            <span>Sync queue</span>
            <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-display tabular-nums">
            {pendingSyncCount}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2 font-medium">
            {pendingSyncCount > 0 ? 'Upload pending' : 'All synced'}
          </p>
        </button>
      </div>

      {/* Quick links */}
      <nav aria-label="Quick links" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: School, title: 'My classrooms', desc: 'Join with code', onClick: () => setIsClassroomsModalOpen(true) },
          { icon: BookOpen, title: 'WAEC syllabus', desc: 'All math modules', onClick: onViewSubjectOverview },
          { icon: Award, title: 'Badges & ranks', desc: 'Leaderboard', onClick: onViewGamification },
          { icon: Play, title: 'Motion lessons', desc: 'Micro-remedies', onClick: onViewRemedyLibrary },
          { icon: History, title: 'History', desc: 'Diagnostic logs', onClick: onViewHistory },
        ].map((item) => (
          <button key={item.title} onClick={item.onClick} className="card-modern card-interactive p-4 text-left flex flex-col gap-2">
            <item.icon className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
            <div>
              <h3 className="text-[13px] font-bold text-[#0F172A]">{item.title}</h3>
              <p className="text-[11px] text-[#64748B]">{item.desc}</p>
            </div>
          </button>
        ))}
      </nav>

      {/* Practice sets */}
      <section className="space-y-4" aria-labelledby="practice-sets">
        <div className="flex items-center justify-between gap-3">
          <h2 id="practice-sets" className="section-title">Practice sets</h2>
          <button onClick={onViewProgress} className="btn-ghost text-[12px]">
            View progress
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUESTION_BANK.map((q) => (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="card-modern card-interactive p-5 sm:p-6 text-left group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[12px] font-bold text-[#2563EB]">{q.topicTitle}</span>
                <span className="badge badge-neutral">{q.difficulty}</span>
              </div>
              <div className="my-4 py-4 px-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center math-expression text-2xl font-bold text-[#0F172A] group-hover:border-[#BFDBFE] transition-colors">
                {q.equation}
              </div>
              <p className="text-[13px] text-[#475569] mb-5 line-clamp-2">{q.prompt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] text-[12px] font-bold text-[#2563EB]">
                <span className="text-[#64748B] font-medium">{q.contextNote || 'WAEC standard'}</span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Solve now <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
