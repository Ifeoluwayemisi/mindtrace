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
import { authService, TEACHER_ACCREDITATION_CODE } from '../../services/authService';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  student?: StudentProfile;
  teacher?: TeacherProfile;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeView,
  onViewChange,
  student,
  teacher,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState(false);
  const [teacherPasscode, setTeacherPasscode] = useState('');
  const [teacherAuthError, setTeacherAuthError] = useState<string | null>(null);

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  const handleTeacherSwitchClick = () => {
    if (currentRole === 'teacher') return;
    const active = authService.getActiveUser();
    if (active && active.role === 'teacher') {
      onRoleChange('teacher');
      handleNavClick('teacher-dashboard');
    } else {
      setShowTeacherAuthModal(true);
      setTeacherAuthError(null);
      setTeacherPasscode('');
    }
  };

  const handleVerifyTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (authService.verifyTeacherAccess(teacherPasscode)) {
      setShowTeacherAuthModal(false);
      onRoleChange('teacher');
      handleNavClick('teacher-dashboard');
    } else {
      setTeacherAuthError(`Invalid accreditation code. For testing, use: ${TEACHER_ACCREDITATION_CODE}`);
    }
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
                Insights Heatmap
              </button>
              <button
                onClick={() => handleNavClick('teacher-students')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-students'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Student Roster
              </button>
              <button
                onClick={() => handleNavClick('teacher-problems')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-problems'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Curriculum Problems
              </button>
              <button
                onClick={() => handleNavClick('teacher-chalkboard')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                  activeView === 'teacher-chalkboard'
                    ? 'text-white border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Chalkboard Scripts
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

          {/* Role Switcher Button */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => {
                onRoleChange('student');
                handleNavClick('student-dashboard');
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                currentRole === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>
            <button
              onClick={handleTeacherSwitchClick}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                currentRole === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Teacher</span>
            </button>
          </div>

          {/* Logout / Switch User */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Sign Out / Switch Demo Profile"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Quick-Nav Scroll Strip (Always visible on mobile viewports) */}
      <div className="lg:hidden w-full border-t border-slate-800/80 bg-slate-950/95 px-3 py-2 overflow-x-auto no-scrollbar shadow-inner">
        <div className="flex items-center gap-1.5 min-w-max text-xs">
          {currentRole === 'student' ? (
            <>
              <button
                onClick={() => handleNavClick('student-dashboard')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'student-dashboard'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('question-solve')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  ['question-solve', 'diagnosis-result', 'follow-up', 'session-summary'].includes(activeView)
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Practice</span>
              </button>
              <button
                onClick={() => handleNavClick('subject-overview')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'subject-overview'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => handleNavClick('remedy-library')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  ['remedy-library', 'intervention'].includes(activeView)
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2-Min Remedies</span>
              </button>
              <button
                onClick={() => handleNavClick('gamification')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'gamification'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Badges & XP</span>
              </button>
              <button
                onClick={() => handleNavClick('student-history')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'student-history'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                History
              </button>
              <button
                onClick={() => handleNavClick('student-profile')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'student-profile'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Profile
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('teacher-dashboard')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'teacher-dashboard'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Insights Heatmap
              </button>
              <button
                onClick={() => handleNavClick('teacher-students')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'teacher-students'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Student Roster
              </button>
              <button
                onClick={() => handleNavClick('teacher-problems')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'teacher-problems'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Curriculum Problems
              </button>
              <button
                onClick={() => handleNavClick('teacher-chalkboard')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeView === 'teacher-chalkboard'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Chalkboard Scripts
              </button>
            </>
          )}
        </div>
      </div>
      {showTeacherAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <button
                onClick={() => setShowTeacherAuthModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-display font-bold text-white">Teacher Authorization Required</h3>
              <p className="text-xs text-slate-400 mt-1">
                Teacher analytics and student diagnostics require verification. Enter your school teacher code.
              </p>
            </div>

            {teacherAuthError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-200">
                {teacherAuthError}
              </div>
            )}

            <form onSubmit={handleVerifyTeacher} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Accreditation Code</label>
                <input
                  type="text"
                  required
                  value={teacherPasscode}
                  onChange={(e) => setTeacherPasscode(e.target.value.toUpperCase())}
                  placeholder="MINDTRACE-TEACHER-2026"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTeacherAuthModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Verify Access
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTeacherPasscode(TEACHER_ACCREDITATION_CODE)}
                className="w-full text-center text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Insert Demo Code (Evaluator Testing)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2 animate-fade-in">
          {currentRole === 'student' ? (
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleNavClick('student-dashboard')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'student-dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('subject-overview')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'subject-overview' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Topics Syllabus
              </button>
              <button
                onClick={() => handleNavClick('question-solve')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'question-solve' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Practice Questions
              </button>
              <button
                onClick={() => handleNavClick('remedy-library')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'remedy-library' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Micro-Remedies
              </button>
              <button
                onClick={() => handleNavClick('gamification')}
                className={`p-2.5 rounded-xl text-left flex items-center justify-between ${
                  activeView === 'gamification' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <span>Badges & XP</span>
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => handleNavClick('student-history')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'student-history' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                History Timeline
              </button>
              <button
                onClick={() => handleNavClick('student-profile')}
                className={`col-span-2 p-2.5 rounded-xl text-left flex items-center justify-between ${
                  activeView === 'student-profile' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <span>Profile & Preferences</span>
                <User className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleNavClick('teacher-dashboard')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'teacher-dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Insights Heatmap
              </button>
              <button
                onClick={() => handleNavClick('teacher-students')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'teacher-students' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Student Roster
              </button>
              <button
                onClick={() => handleNavClick('teacher-problems')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'teacher-problems' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Curriculum Problems
              </button>
              <button
                onClick={() => handleNavClick('teacher-chalkboard')}
                className={`p-2.5 rounded-xl text-left ${
                  activeView === 'teacher-chalkboard' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Chalkboard Scripts
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
