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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E9EAF3] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Minimalist Emblem Logo */}
        <div
          onClick={() => handleNavClick(currentRole === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
          className="flex items-center cursor-pointer whitespace-nowrap shrink-0 group"
          title="Return to Dashboard"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6755E8] to-[#5140CA] flex items-center justify-center shadow-md shadow-[#6755E8]/20 border border-[#6755E8]/30 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-white text-xl">M</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#74788E]">
          {currentRole === 'student' ? (
            <>
              <button
                onClick={() => handleNavClick('student-dashboard')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'student-dashboard'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('subject-overview')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'subject-overview'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => handleNavClick('question-solve')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'question-solve'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => handleNavClick('remedy-library')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'remedy-library'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                Micro-Remedies
              </button>
              <button
                onClick={() => handleNavClick('gamification')}
                className={`inline-flex items-center gap-1.5 hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'gamification'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-[#FFC85A]" />
                <span>Badges & XP</span>
              </button>
              <button
                onClick={() => handleNavClick('student-history')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'student-history'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                History
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('teacher-dashboard')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-dashboard'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => handleNavClick('teacher-students')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-students'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => handleNavClick('teacher-assignments')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-assignments'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
                }`}
              >
                Homework & Assignments
              </button>
              <button
                onClick={() => handleNavClick('teacher-problems')}
                className={`hover:text-[#252641] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-problems'
                    ? 'text-[#6755E8] border-b-2 border-[#6755E8] font-bold'
                    : 'text-[#74788E]'
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
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F5F6FC] border border-[#E9EAF3] hover:border-[#6755E8]/40 hover:bg-[#F3F1FF] transition cursor-pointer text-left"
              title="View student profile & preferences"
            >
              <div className="w-7 h-7 rounded-lg bg-[#EAE6FE] border border-[#E4E0FD] overflow-hidden shrink-0 flex items-center justify-center">
                <img 
                  src={student.avatarSeed} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-bold text-white bg-[#6755E8] w-full h-full flex items-center justify-center">
                  {student.name.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] font-bold text-[#252641] truncate max-w-[90px]">
                  {student.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#5140CA] font-mono flex items-center gap-0.5 font-bold">
                  <Zap className="w-2.5 h-2.5 text-[#FFC85A] fill-[#FFC85A]" />
                  {student.totalPoints || 0} XP
                </span>
              </div>
            </button>
          )}

          {currentRole === 'teacher' && teacher && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F6FC] border border-[#E9EAF3] text-left">
              <div className="w-6 h-6 rounded-lg bg-[#6755E8] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                TC
              </div>
              <span className="text-[11px] font-semibold text-[#252641] truncate max-w-[100px]">
                {teacher.name.split(' ')[1] || 'Teacher'}
              </span>
            </div>
          )}

          {/* Logout / Switch User */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-[#F5F6FC] border border-[#E9EAF3] hover:bg-[#FFF1EE] hover:border-[#FF9078] text-[#74788E] hover:text-[#D64D31] transition cursor-pointer"
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
