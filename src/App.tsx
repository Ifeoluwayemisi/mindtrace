/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * MindTrace: AI-assisted, offline-first mathematics learning diagnostic platform
 * Wale Lab NextGen AI Hackathon (Track 1: AI for Zero-Bandwidth & Localized Learning)
 */

import React, { useState, useEffect } from 'react';
import { Role, StudentProfile, TeacherProfile, Question, DiagnosisResult, AuthUser } from './types';
import { DEFAULT_STUDENT, DEFAULT_TEACHER, storageService } from './services/storageService';
import { syncService } from './services/syncService';
import { authService } from './services/authService';
import { gamificationService } from './services/gamificationService';
import { QUESTION_BANK } from './data/questionBank';

// Layout & Common Components
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { NetworkStatusBar } from './components/common/NetworkStatusBar';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';

// Auth & Onboarding Components
import { SplashScreen } from './components/auth/SplashScreen';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { OnboardingCarousel } from './components/auth/OnboardingCarousel';
import { RoleSelectionScreen } from './components/auth/RoleSelectionScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegistrationScreen } from './components/auth/RegistrationScreen';
import { PasswordRecoveryScreen } from './components/auth/PasswordRecoveryScreen';
import { PasswordChangeScreen } from './components/auth/PasswordChangeScreen';

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
    if (authService.isReturningUser()) {
      const active = authService.getActiveUser();
      return active?.role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard';
    }
    return 'splash';
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getActiveUser());

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const active = authService.getActiveUser();
    return active?.role || 'student';
  });

  // Load profiles from storage
  const [student, setStudent] = useState<StudentProfile>(() => {
    return storageService.getSavedStudentProfile();
  });
  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    return storageService.getSavedTeacherProfile();
  });

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

  // Keep profiles in sync with current user session
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'student') {
        setStudent(storageService.getSavedStudentProfile());
      } else if (currentUser.role === 'teacher') {
        setTeacher(storageService.getSavedTeacherProfile());
      }
    }
  }, [currentUser]);

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

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setCurrentRole('student');
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB] selection:text-white">
      {/* 1. Offline / Airplane Mode Simulation Bar (Zero-Bandwidth Verification) */}
      <NetworkStatusBar
        onSyncCompleted={() => {
          setClassAnalytics({ ...syncService.getCurrentAnalytics() });
        }}
      />

      {/* 2. Top Navigation Bar (Only displayed during main application views) */}
      {!isAuthOrOnboarding && !currentUser?.mustChangePassword ? (
        <Header
          currentRole={currentRole}
          activeView={activeView}
          onViewChange={changeView}
          student={student}
          teacher={teacher}
          onLogout={handleLogout}
        />
      ) : (
        /* Minimal header during auth/onboarding or password change */
        <div className="w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] py-3.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div
              onClick={() => changeView('welcome')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center font-display font-black text-white text-base shadow-sm shadow-[#2563EB]/25 group-hover:scale-105 transition-transform">
                M
              </div>
              <span className="font-display font-black text-[#0F172A] text-lg tracking-tight">
                MindTrace
              </span>
            </div>

            {!currentUser?.mustChangePassword && (
              <div className="flex items-center gap-2">
                <PWAInstallButton />
                <button
                  onClick={() => {
                    authService.setOnboardingCompleted(true);
                    changeView('student-dashboard');
                  }}
                  className="text-xs text-[#475569] hover:text-[#2563EB] transition cursor-pointer px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB]/30 font-medium"
                >
                  Skip to Demo Learner →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Dynamic Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 pb-24 lg:pb-8 flex flex-col">
        {currentUser?.mustChangePassword ? (
          <PasswordChangeScreen
            onPasswordChanged={() => {
              const refreshed = authService.getActiveUser();
              setCurrentUser(refreshed);
              if (refreshed?.role === 'teacher') {
                changeView('teacher-dashboard');
              } else {
                changeView('student-dashboard');
              }
            }}
            onLogout={handleLogout}
          />
        ) : (
          <>
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
                  changeView('register');
                }}
                onBack={() => changeView('welcome')}
              />
            )}

            {activeView === 'login' && (
              <LoginScreen
                onLoginSuccess={(role) => {
                  const u = authService.getActiveUser();
                  setCurrentUser(u);
                  setCurrentRole(u?.role || role);
                  if (role === 'student') {
                    setStudent(storageService.getSavedStudentProfile());
                    changeView('student-dashboard');
                  } else {
                    setTeacher(storageService.getSavedTeacherProfile());
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
                  const u = authService.getActiveUser();
                  setCurrentUser(u);
                  setCurrentRole(u?.role || role);
                  if (isStudent) {
                    setStudent(storageService.getSavedStudentProfile());
                    changeView('profile-setup');
                  } else {
                    setTeacher(storageService.getSavedTeacherProfile());
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
                : activeView === 'teacher-assignments'
                ? 'assignments'
                : activeView === 'teacher-problems'
                ? 'problems'
                : 'insights'
            }
            onTabChange={(tab) => {
              if (tab === 'students') changeView('teacher-students');
              else if (tab === 'assignments') changeView('teacher-assignments');
              else if (tab === 'problems') changeView('teacher-problems');
              else changeView('teacher-dashboard');
            }}
            openChalkboardOnMount={activeView === 'teacher-chalkboard'}
          />
        )}
          </>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 px-4 sm:px-6 text-xs text-[#475569] mb-14 lg:mb-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#0F172A]">MindTrace</span>
            <span className="text-[#E2E8F0]">|</span>
            <span className="text-[#475569]">Secondary Mathematics Diagnostic Platform</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] font-mono text-[#4338CA] font-medium">Edge Parser &lt;50ms</span>
            <span className="px-2 py-0.5 rounded-md bg-[#D1FAE5] border border-[#A7F3D0] font-mono text-[#065F46] font-medium">100% Offline IndexedDB</span>
            <span className="px-2 py-0.5 rounded-md bg-[#E0F2FE] border border-[#BAE6FD] font-mono text-[#0369A1] font-medium">Micro-Sync &le;15KB</span>
          </div>
        </div>
      </footer>

      {/* 5. Mobile Bottom Navigation Bar (Persistent 1-tap mobile navigation) */}
      {!isAuthOrOnboarding && !currentUser?.mustChangePassword && (
        <MobileBottomNav
          currentRole={currentRole}
          activeView={activeView}
          onViewChange={changeView}
          student={student}
          teacher={teacher}
        />
      )}

      {/* 6. PWA Installation Prompt Banner / Modal */}
      <PWAInstallBanner />
    </div>
  );
}
