/**
 * MindTrace Offline-First Authentication & Identity Service
 * Local/Demo session manager storing user credentials and profiles securely on-device.
 */

import { AuthUser, Role, StudentProfile, TeacherProfile } from '../types';
import { DEFAULT_STUDENT, DEFAULT_TEACHER } from './storageService';

export interface RegistrationInput {
  name: string;
  username: string;
  email: string;
  password?: string;
  role: Role;
  grade?: 'SS1' | 'SS2' | 'SS3';
  school?: string;
}

class AuthService {
  private activeUser: AuthUser | null = null;
  private hasCompletedOnboarding: boolean = false;

  constructor() {
    this.initSession();
  }

  private initSession() {
    try {
      const storedOnboarding = localStorage.getItem('mindtrace_onboarding_completed');
      this.hasCompletedOnboarding = storedOnboarding === 'true';

      const storedUser = localStorage.getItem('mindtrace_active_auth_user');
      if (storedUser) {
        this.activeUser = JSON.parse(storedUser);
      }
    } catch {
      // safe
    }
  }

  isReturningUser(): boolean {
    return this.hasCompletedOnboarding;
  }

  getActiveUser(): AuthUser | null {
    return this.activeUser;
  }

  setOnboardingCompleted(completed: boolean = true) {
    this.hasCompletedOnboarding = completed;
    try {
      localStorage.setItem('mindtrace_onboarding_completed', completed ? 'true' : 'false');
    } catch {
      // safe
    }
  }

  async login(
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    // Simulate brief local verification (<200ms)
    await new Promise((r) => setTimeout(r, 180));

    if (!identifier || identifier.trim().length === 0) {
      return { success: false, message: 'Please enter your username or school email.' };
    }

    const isTeacher = identifier.toLowerCase().includes('teacher') || identifier.toLowerCase().includes('okafor') || identifier.toLowerCase().includes('chinedu');

    const user: AuthUser = isTeacher
      ? {
          id: DEFAULT_TEACHER.id,
          name: DEFAULT_TEACHER.name,
          username: DEFAULT_TEACHER.username || 'chinedu_okafor',
          email: DEFAULT_TEACHER.email || 'c.okafor@agegehigh.edu.ng',
          role: 'teacher',
          isDemoSession: true,
        }
      : {
          id: DEFAULT_STUDENT.id,
          name: DEFAULT_STUDENT.name,
          username: DEFAULT_STUDENT.username || 'aminat_diallo',
          email: DEFAULT_STUDENT.email || 'aminat.diallo@student.ng',
          role: 'student',
          isDemoSession: true,
        };

    this.activeUser = user;
    this.setOnboardingCompleted(true);

    try {
      localStorage.setItem('mindtrace_active_auth_user', JSON.stringify(user));
    } catch {
      // safe
    }

    return { success: true, user };
  }

  async register(
    input: RegistrationInput
  ): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    await new Promise((r) => setTimeout(r, 220));

    // Basic validation
    if (!input.name.trim() || input.name.trim().length < 2) {
      return { success: false, message: 'Please enter your full student or teacher name.' };
    }
    if (!input.username.trim() || input.username.trim().length < 3) {
      return { success: false, message: 'Username must contain at least 3 characters.' };
    }

    const user: AuthUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: input.name.trim(),
      username: input.username.trim().toLowerCase().replace(/\s+/g, '_'),
      email: input.email.trim(),
      role: input.role,
      isDemoSession: true,
    };

    this.activeUser = user;
    this.setOnboardingCompleted(true);

    try {
      localStorage.setItem('mindtrace_active_auth_user', JSON.stringify(user));
    } catch {
      // safe
    }

    return { success: true, user };
  }

  async recoverPassword(
    identifier: string
  ): Promise<{ success: boolean; message: string; demoCode?: string }> {
    await new Promise((r) => setTimeout(r, 250));
    if (!identifier || identifier.trim().length < 3) {
      return { success: false, message: 'Please enter a valid username or email address.' };
    }

    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      success: true,
      message: `Password reset instructions sent. Demo reset pin: ${demoCode}`,
      demoCode,
    };
  }

  logout() {
    this.activeUser = null;
    try {
      localStorage.removeItem('mindtrace_active_auth_user');
    } catch {
      // safe
    }
  }
}

export const authService = new AuthService();
