/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * MindTrace: AI-assisted, offline-first mathematics learning diagnostic platform
 * Wale Lab NextGen AI Hackathon (Track 1: AI for Zero-Bandwidth & Localized Learning)
 */

import React, { useState, useEffect } from 'react';
import { Role, StudentProfile, TeacherProfile, Question, DiagnosisResult } from './types';
import { DEFAULT_STUDENT, DEFAULT_TEACHER, storageService } from './services/storageService';
import { syncService } from './services/syncService';
import { authService } from './services/authService';
import { gamificationService } from './services/gamificationService';
import { QUESTION_BANK } from './data/questionBank';

// Layout & Common Components
import { Header } from './components/layout/Header';
import { NetworkStatusBar } from './components/common/NetworkStatusBar';

// Auth & Onboarding Components
import { SplashScreen } from './components/auth/SplashScreen';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { OnboardingCarousel } from './components/auth/OnboardingCarousel';
import { RoleSelectionScreen } from './components/auth/RoleSelectionScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegistrationScreen } from './components/auth/RegistrationScreen';
import { PasswordRecoveryScreen } from './components/auth/PasswordRecoveryScreen';

// Profile Setup & View
import { StudentProfileSetup } from './components/profile/StudentProfileSetup';
import { StudentProfileView } from './components/profile/StudentProfileView';

// Gamification & Student Components
import { GamificationHub } from './components/gamification/GamificationHub';
import { SubjectOverview } from './components/student/SubjectOverview';
import { StudentDashboard } from './components/student/StudentDashboard';
import { QuestionInterface } from './components/student/QuestionInterface';
import { DiagnosisResultView } from './components/student/DiagnosisResultView';
import { TargetedInterventionView } from './components/student/TargetedInterventionView';
import { FollowUpAssessmentView } from './components/student/FollowUpAssessmentView';
import { SessionSummaryView } from './components/student/SessionSummaryView';
import { StudentProgressView } from './components/student/StudentProgressView';
import { LearningHistoryView } from './components/student/LearningHistoryView';
import { RemedyLibraryView } from './components/student/RemedyLibraryView';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';

export default function App() {
  // Determine initial entry view based on returning user status
  const [activeView, setActiveView] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashView = window.location.hash.replace('#', '');
      if (hashView) return hashView;
    }
    return authService.isReturningUser() ? 'student-dashboard' : 'splash';
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const active = authService.getActiveUser();
    return active?.role || 'student';
  });

  // Load profiles from storage
  const [student, setStudent] = useState<StudentProfile>(() => {
    return storageService.getSavedStudentProfile();
  });
  const [teacher, setTeacher] = useState<TeacherProfile>(DEFAULT_TEACHER);

  const [selectedQuestion, setSelectedQuestion] = useState<Question>(QUESTION_BANK[0]);
  const [lastDiagnosis, setLastDiagnosis] = useState<DiagnosisResult | null>(null);
  const [targetMisconception, setTargetMisconception] = useState<string>('ALG_SIGN_FLIP');
  const [earnedPointsInSession, setEarnedPointsInSession] = useState<number>(25);

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [classAnalytics, setClassAnalytics] = useState(syncService.getCurrentAnalytics());

  // Sync active view with window.location.hash for smooth bookmarking & refresh
  const changeView = (view: string) => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
    }
  };

  // Listen to hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== activeView) {
        setActiveView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);

  // Subscribe to sync service
  useEffect(() => {
    const unsubscribe = syncService.subscribe((state) => {
      setPendingSyncCount(state.pendingCount);
      setClassAnalytics(syncService.getCurrentAnalytics());
    });
    return unsubscribe;
  }, []);

  // Handlers for Student Navigation Flow
  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    changeView('question-solve');
  };

  const handleDiagnosisCompleted = (diagnosis: DiagnosisResult) => {
    setLastDiagnosis(diagnosis);
    setTargetMisconception(diagnosis.misconceptionCode);

    // Refresh student from storage to update points and level
    const refreshed = storageService.getSavedStudentProfile();
    setStudent(refreshed);

    changeView('diagnosis-result');
  };

  const handleStartIntervention = () => {
    changeView('intervention');
  };

  const handleProceedToFollowUp = () => {
    changeView('follow-up');
  };

  const handleFollowUpMastery = () => {
    // Refresh student state after mastery
    const refreshed = storageService.getSavedStudentProfile();
    setStudent(refreshed);
    setEarnedPointsInSession(25);
    changeView('session-summary');
  };

  const handleLaunchDirectRemedy = (code: string) => {
    setTargetMisconception(code);
    changeView('intervention');
  };

  const handleLogout = () => {
    authService.logout();
    changeView('welcome');
  };

  // Check if current view is an auth / onboarding flow
  const isAuthOrOnboarding = [
    'splash',
    'welcome',
    'onboarding',
    'role-select',
    'login',
    'register',
    'recovery',
    'profile-setup',
  ].includes(activeView);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Offline / Airplane Mode Simulation Bar (Zero-Bandwidth Verification) */}
      <NetworkStatusBar
        onSyncCompleted={() => {
          setClassAnalytics({ ...syncService.getCurrentAnalytics() });
        }}
      />

      {/* 2. Top Navigation Bar (Only displayed during main application views) */}
      {!isAuthOrOnboarding ? (
        <Header
          currentRole={currentRole}
          onRoleChange={(newRole) => {
            setCurrentRole(newRole);
            if (newRole === 'student') {
              changeView('student-dashboard');
            } else {
              changeView('teacher-dashboard');
            }
          }}
          activeView={activeView}
          onViewChange={changeView}
          student={student}
          teacher={teacher}
          onLogout={handleLogout}
        />
      ) : (
        /* Minimal header during auth/onboarding */
        <div className="w-full bg-slate-950 border-b border-slate-900/60 py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div
              onClick={() => changeView('welcome')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-bold text-white text-sm">
                M
              </div>
              <span className="font-display font-extrabold text-white text-base tracking-tight">
                MindTrace
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  authService.setOnboardingCompleted(true);
                  changeView('student-dashboard');
                }}
                className="text-xs text-slate-400 hover:text-indigo-400 transition cursor-pointer px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                Skip to Demo Learner →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dynamic Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col">
        {/* ===================== AUTH & ONBOARDING VIEWS ===================== */}
        {activeView === 'splash' && (
          <SplashScreen onInitialized={() => changeView('welcome')} />
        )}

        {activeView === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => changeView('onboarding')}
            onSignIn={() => changeView('login')}
          />
        )}

        {activeView === 'onboarding' && (
          <OnboardingCarousel
            onComplete={() => changeView('role-select')}
            onSkip={() => changeView('role-select')}
          />
        )}

        {activeView === 'role-select' && (
          <RoleSelectionScreen
            onSelectRole={(role) => {
              setCurrentRole(role);
              if (role === 'student') {
                changeView('profile-setup');
              } else {
                changeView('teacher-dashboard');
              }
            }}
            onBack={() => changeView('welcome')}
          />
        )}

        {activeView === 'login' && (
          <LoginScreen
            onLoginSuccess={(role) => {
              setCurrentRole(role);
              if (role === 'student') {
                setStudent(storageService.getSavedStudentProfile());
                changeView('student-dashboard');
              } else {
                changeView('teacher-dashboard');
              }
            }}
            onGoToRegister={() => changeView('register')}
            onGoToRecovery={() => changeView('recovery')}
            onBack={() => changeView('welcome')}
          />
        )}

        {activeView === 'register' && (
          <RegistrationScreen
            initialRole={currentRole}
            onRegisterSuccess={(role, isStudent) => {
              setCurrentRole(role);
              if (isStudent) {
                changeView('profile-setup');
              } else {
                changeView('teacher-dashboard');
              }
            }}
            onGoToLogin={() => changeView('login')}
            onBack={() => changeView('role-select')}
          />
        )}

        {activeView === 'recovery' && (
          <PasswordRecoveryScreen onBackToLogin={() => changeView('login')} />
        )}

        {activeView === 'profile-setup' && (
          <StudentProfileSetup
            initialProfile={student}
            onSetupCompleted={(updated) => {
              storageService.saveStudentProfile(updated);
              authService.setOnboardingCompleted(true);
              setStudent(updated);
              changeView('student-dashboard');
            }}
          />
        )}

        {/* ===================== STUDENT EXPERIENCE VIEWS ===================== */}
        {currentRole === 'student' && !isAuthOrOnboarding && (
          <>
            {activeView === 'student-dashboard' && (
              <StudentDashboard
                student={student}
                onSelectQuestion={handleSelectQuestion}
                onViewRemedyLibrary={() => changeView('remedy-library')}
                onViewProgress={() => changeView('student-progress')}
                onViewSubjectOverview={() => changeView('subject-overview')}
                onViewGamification={() => changeView('gamification')}
                onViewHistory={() => changeView('student-history')}
                pendingSyncCount={pendingSyncCount}
              />
            )}

            {activeView === 'subject-overview' && (
              <SubjectOverview
                onSelectQuestion={handleSelectQuestion}
                onBack={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'question-solve' && (
              <QuestionInterface
                question={selectedQuestion}
                student={student}
                onBack={() => changeView('student-dashboard')}
                onDiagnosisCompleted={handleDiagnosisCompleted}
              />
            )}

            {activeView === 'diagnosis-result' && lastDiagnosis && (
              <DiagnosisResultView
                diagnosis={lastDiagnosis}
                question={selectedQuestion}
                onStartIntervention={handleStartIntervention}
                onTryAgain={() => changeView('question-solve')}
                onNextQuestion={() => {
                  const nextIdx =
                    (QUESTION_BANK.findIndex((q) => q.id === selectedQuestion.id) + 1) %
                    QUESTION_BANK.length;
                  setSelectedQuestion(QUESTION_BANK[nextIdx]);
                  changeView('question-solve');
                }}
              />
            )}

            {activeView === 'intervention' && (
              <TargetedInterventionView
                misconceptionCode={targetMisconception}
                onProceedToFollowUp={handleProceedToFollowUp}
                onCancel={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'follow-up' && (
              <FollowUpAssessmentView
                question={selectedQuestion}
                student={student}
                onMasteryAchieved={handleFollowUpMastery}
                onReturnToDashboard={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'session-summary' && lastDiagnosis && (
              <SessionSummaryView
                student={student}
                diagnosis={lastDiagnosis}
                earnedPoints={earnedPointsInSession}
                onContinue={() => {
                  const nextIdx =
                    (QUESTION_BANK.findIndex((q) => q.id === selectedQuestion.id) + 1) %
                    QUESTION_BANK.length;
                  setSelectedQuestion(QUESTION_BANK[nextIdx]);
                  changeView('question-solve');
                }}
                onBackToDashboard={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'gamification' && (
              <GamificationHub
                student={student}
                onGoToSolve={() => changeView('question-solve')}
                onBackToDashboard={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'student-history' && (
              <LearningHistoryView
                student={student}
                onReviewRemedy={handleLaunchDirectRemedy}
                onBack={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'student-progress' && (
              <StudentProgressView
                student={student}
                onLaunchRemedy={handleLaunchDirectRemedy}
                onBackToDashboard={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'remedy-library' && (
              <RemedyLibraryView
                onSelectRemedy={handleLaunchDirectRemedy}
                onBack={() => changeView('student-dashboard')}
              />
            )}

            {activeView === 'student-profile' && (
              <StudentProfileView
                student={student}
                onProfileUpdated={(updated) => {
                  setStudent(updated);
                  storageService.saveStudentProfile(updated);
                }}
                onLogout={handleLogout}
              />
            )}
          </>
        )}

        {/* ===================== TEACHER EXPERIENCE VIEWS ===================== */}
        {currentRole === 'teacher' && !isAuthOrOnboarding && (
          <TeacherDashboard
            teacher={teacher}
            analytics={classAnalytics}
            onRefreshAnalytics={() => {
              setClassAnalytics({ ...syncService.getCurrentAnalytics() });
            }}
            activeTab={
              activeView === 'teacher-students'
                ? 'students'
                : activeView === 'teacher-problems'
                ? 'problems'
                : 'insights'
            }
            onTabChange={(tab) => {
              if (tab === 'students') changeView('teacher-students');
              else if (tab === 'problems') changeView('teacher-problems');
              else changeView('teacher-dashboard');
            }}
            openChalkboardOnMount={activeView === 'teacher-chalkboard'}
          />
        )}
      </main>

      {/* 4. Footer with zero fake telemetry tickers */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-slate-300">MindTrace</span>
            <span>·</span>
            <span>Wale Lab NextGen AI Hackathon 2026 (Track 1)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Deterministic Edge Parser (&lt;50ms)</span>
            <span>·</span>
            <span>100% Offline IndexedDB</span>
            <span>·</span>
            <span>Micro-Sync (&le;15KB JSON)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
