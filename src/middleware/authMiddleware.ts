import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { eq } from 'drizzle-orm';
import { db, users, teacherProfiles } from '../db/index';
import { isDemoModeEnabled } from '../config/demoMode';

// Extend Express Session declaration
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userRole?: 'student' | 'teacher' | 'admin';
    mustChangePassword?: boolean;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    csrfToken?: string;
  }
}

/**
 * Middleware: Ensure request is authenticated with an active session.
 * Also strictly enforces must_change_password constraint at the backend.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      error: 'Unauthorized',
      code: 'SESSION_EXPIRED',
      message: 'Authentication session expired or invalid. Please sign in to proceed.',
    });
    return;
  }

  // If user must change password, restrict all endpoints except password change, me, and logout
  if (req.session.mustChangePassword) {
    const allowedPaths = ['/change-password', '/me', '/logout', '/csrf-token'];
    const isAllowed = allowedPaths.some((p) => req.path.endsWith(p));
    if (!isAllowed) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'PASSWORD_CHANGE_REQUIRED',
        message: 'You must change your temporary password before accessing application features.',
      });
      return;
    }
  }

  next();
}

/**
 * Middleware: Ensure authenticated user possesses specific role.
 * Demo mode does not modify the role stored in the HTTP-only session.
 */
export function requireRole(allowedRole: 'student' | 'teacher' | 'admin') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !req.session.userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'SESSION_EXPIRED',
        message: 'Authentication required.',
      });
      return;
    }

    if (req.session.userRole !== allowedRole && req.session.userRole !== 'admin') {
      res.status(403).json({
        error: 'Forbidden',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Action requires ${allowedRole} role authorization.`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Check teacher role and profile before enforcing accreditation.
 * In explicitly enabled demo mode, authenticated teachers (including existing
 * pending or rejected accounts) can use teacher workspace endpoints. The role
 * and profile checks remain authoritative and classroom ownership checks in
 * each endpoint are unaffected.
 */
export async function requireApprovedTeacher(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      error: 'Unauthorized',
      code: 'SESSION_EXPIRED',
      message: 'Authentication required.',
    });
    return;
  }

  if (req.session.userRole !== 'teacher' && req.session.userRole !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      code: 'INSUFFICIENT_PERMISSIONS',
      message: 'Action requires teacher role authorization.',
    });
    return;
  }

  if (req.session.userRole === 'admin') {
    return next();
  }

  try {
    const profs = await db
      .select({ verificationStatus: teacherProfiles.verificationStatus })
      .from(teacherProfiles)
      .where(eq(teacherProfiles.id, req.session.userId))
      .limit(1);

    if (profs.length === 0) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'TEACHER_PROFILE_NOT_FOUND',
        message: 'Teacher profile record not found.',
      });
      return;
    }

    const status = profs[0].verificationStatus;
    req.session.verificationStatus = status as 'pending' | 'approved' | 'rejected';

    if (isDemoModeEnabled()) {
      return next();
    }

    if (status === 'pending') {
      res.status(403).json({
        error: 'Forbidden',
        code: 'TEACHER_VERIFICATION_PENDING',
        message: 'Teacher account is pending administrator accreditation approval.',
      });
      return;
    }

    if (status === 'rejected') {
      res.status(403).json({
        error: 'Forbidden',
        code: 'TEACHER_VERIFICATION_REJECTED',
        message: 'Teacher verification has been rejected. Classroom features are disabled.',
      });
      return;
    }

    if (status !== 'approved') {
      res.status(403).json({
        error: 'Forbidden',
        code: 'TEACHER_NOT_APPROVED',
        message: 'Teacher verification status is unapproved.',
      });
      return;
    }

    next();
  } catch (err: any) {
    console.error('Error in requireApprovedTeacher middleware:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to verify teacher authorization.' });
  }
}

/**
 * Middleware: Administrative authorization check (role='admin' or valid internal admin key)
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const adminKeyHeader = req.headers['x-admin-key'] as string;
  const configuredAdminKey = process.env.ADMIN_API_KEY || 'mindtrace-internal-admin-sec-key-2026';

  if (adminKeyHeader && adminKeyHeader === configuredAdminKey) {
    return next();
  }

  if (req.session && req.session.userId) {
    if (req.session.userRole === 'admin') {
      return next();
    }
  }

  res.status(403).json({
    error: 'Forbidden',
    code: 'ADMIN_ACCESS_REQUIRED',
    message: 'Action requires platform administrator authorization.',
  });
}

/**
 * CSRF Protection Middleware: Verifies x-csrf-token header against session
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Read-only HTTP methods skip CSRF validation
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const clientCsrfToken = (req.headers['x-csrf-token'] as string) || req.body?._csrf;
  const sessionCsrfToken = req.session?.csrfToken;

  if (!sessionCsrfToken || !clientCsrfToken || clientCsrfToken !== sessionCsrfToken) {
    res.status(403).json({
      error: 'CSRF Validation Failed',
      code: 'CSRF_INVALID',
      message: 'Invalid or missing CSRF security token.',
    });
    return;
  }

  next();
}

/** Rate limiting for authentication routes. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
