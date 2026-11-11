import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  School,
  BookOpen,
  Trophy,
  History,
  Layers,
  User,
  Menu,
  X,
  LogOut,
  Flame,
  Zap,
} from 'lucide-react';
import { Role, StudentProfile, TeacherProfile } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { resolveAvatarSrc, getInitials } from '../../utils/avatar';

interface HeaderProps {
  currentRole: Role;
  onRoleChange?: (role: Role) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  student?: StudentProfile;
  teacher?: TeacherProfile;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  activeView,
  onViewChange,
  student,
  teacher,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Minimalist Brand Emblem Logo */}
        <div
          onClick={() => handleNavClick(currentRole === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
          className="flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0 group"
          title="Return to Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-sm shadow-[#2563EB]/25 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-white text-xl">M</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-black text-[#0F172A] text-lg tracking-tight leading-none">MindTrace</span>
            <span className="text-[10px] text-[#475569] font-medium tracking-wide">MATH DIAGNOSTICS</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#475569]">
          {currentRole === 'student' ? (
            <>
              <button
                onClick={() => handleNavClick('student-dashboard')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'student-dashboard'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('subject-overview')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'subject-overview'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => handleNavClick('question-solve')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'question-solve'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => handleNavClick('remedy-library')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'remedy-library'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Micro-Remedies
              </button>
              <button
                onClick={() => handleNavClick('gamification')}
                className={`inline-flex items-center gap-1.5 hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'gamification'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Badges & XP</span>
              </button>
              <button
                onClick={() => handleNavClick('student-history')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'student-history'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                History
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('teacher-dashboard')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-dashboard'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => handleNavClick('teacher-students')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-students'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => handleNavClick('teacher-assignments')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-assignments'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Homework & Assignments
              </button>
              <button
                onClick={() => handleNavClick('teacher-problems')}
                className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-problems'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold'
                    : 'text-[#475569]'
                }`}
              >
                Curriculum
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions, User Profile & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <PWAInstallButton />

          {/* User Profile Badge / Quick Access */}
          {currentRole === 'student' && student && (
            <button
              onClick={() => handleNavClick('student-profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#EFF6FF] transition cursor-pointer text-left"
              title="View student profile & preferences"
            >
              <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={resolveAvatarSrc(student.avatarSeed) ?? undefined}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-bold text-[#1D4ED8] w-full h-full flex items-center justify-center">
                  {getInitials(student.name)}
                </span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] font-bold text-[#0F172A] truncate max-w-[90px]">
                  {student.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#2563EB] font-mono flex items-center gap-0.5 font-bold">
                  <Zap className="w-2.5 h-2.5 text-[#D97706] fill-[#D97706]" />
                  {student.totalPoints || 0} XP
                </span>
              </div>
            </button>
          )}

          {currentRole === 'teacher' && teacher && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-left">
              <div className="w-6 h-6 rounded-lg bg-[#2563EB] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                TC
              </div>
              <span className="text-[11px] font-semibold text-[#0F172A] truncate max-w-[100px]">
                {teacher.name.split(' ')[1] || 'Teacher'}
              </span>
            </div>
          )}

          {/* Logout / Switch User */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] hover:bg-red-50 hover:border-red-200 text-[#475569] hover:text-red-600 transition cursor-pointer"
              title="Sign Out / Switch Profile"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
