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
  ShieldAlert,
  Key,
} from 'lucide-react';
import { Role, StudentProfile, TeacherProfile } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

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
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Minimalist Emblem Logo (MindTrace text and WAEC·JAMB badge removed per request) */}
        <div
          onClick={() => handleNavClick(currentRole === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
          className="flex items-center cursor-pointer whitespace-nowrap shrink-0 group"
          title="Return to Dashboard"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-white text-xl">M</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
          {currentRole === 'student' ? (
            <>
              <button
                onClick={() => handleNavClick('student-dashboard')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'student-dashboard'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('subject-overview')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'subject-overview'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => handleNavClick('question-solve')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'question-solve'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => handleNavClick('remedy-library')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'remedy-library'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Micro-Remedies
              </button>
              <button
                onClick={() => handleNavClick('gamification')}
                className={`inline-flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'gamification'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Badges & XP</span>
              </button>
              <button
                onClick={() => handleNavClick('student-history')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'student-history'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                History
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('teacher-dashboard')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-dashboard'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => handleNavClick('teacher-students')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-students'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => handleNavClick('teacher-assignments')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-assignments'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Homework & Assignments
              </button>
              <button
                onClick={() => handleNavClick('teacher-problems')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-problems'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
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
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition cursor-pointer text-left"
              title="View student profile & preferences"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                {student.avatarSeed || 'AD'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] font-semibold text-white truncate max-w-[90px]">
                  {student.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  {student.totalPoints || 0} XP
                </span>
              </div>
            </button>
          )}

          {currentRole === 'teacher' && teacher && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <div className="w-6 h-6 rounded-lg bg-violet-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                TC
              </div>
              <span className="text-[11px] font-semibold text-white truncate max-w-[100px]">
                {teacher.name.split(' ')[1] || 'Teacher'}
              </span>
            </div>
          )}

          {/* Logout / Switch User */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
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
