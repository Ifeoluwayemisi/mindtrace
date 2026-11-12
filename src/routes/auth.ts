import { Router, Request, Response } from 'express';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';
import { db, users, studentProfiles, teacherProfiles, teacherVerifications } from '../db/index';
import { hashPassword, verifyPassword, generateUUID } from '../services/serverAuth';
import { requireAuth, authRateLimiter } from '../middleware/authMiddleware';
import { isDemoModeEnabled } from '../config/demoMode';

export const authRouter = Router();

/**
 * In server-controlled demo mode, authenticated teachers are treated as
 * accredited so evaluators can explore the classroom workspace. The real
 * verification gate remains active whenever MINDTRACE_DEMO_MODE is not true.
 */
function effectiveTeacherVerification(
  status: 'pending' | 'approved' | 'rejected' | undefined
): 'pending' | 'approved' | 'rejected' | undefined {
  if (isDemoModeEnabled() && status) return 'approved';
  return status;
}

/**
 * GET /api/auth/csrf-token
 * Issues or retrieves a session CSRF token
 */
authRouter.get('/csrf-token', (req: Request, res: Response) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  res.json({ csrfToken: req.session.csrfToken });
});

/**
 * POST /api/auth/register-student
 * Registers an independent student user with Argon2id password hashing and student profile
 */
authRouter.post('/register-student', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { username, fullName, password, email, gradeLevel, targetExam, schoolName } = req.body;

    if (!username || !fullName || !password) {
      res.status(400).json({ error: 'Missing Required Fields', message: 'Username, full name, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Weak Password', message: 'Password must be at least 6 characters long.' });
      return;
    }

    const usernameNormalized = username.trim().toLowerCase();

    // Check existing username
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.usernameNormalized, usernameNormalized))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: 'Conflict', message: 'Username is already registered.' });
      return;
    }

    const userId = generateUUID();
    const passwordHash = await hashPassword(password);
    const resolvedSchool = schoolName && schoolName.trim() ? schoolName.trim() : 'Independent Learner';
    const computedInitials = (() => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return fullName.trim().substring(0, 2).toUpperCase();
    })();

    // Insert user row
    await db.insert(users).values({
      id: userId,
      username: username.trim(),
      usernameNormalized,
      email: email ? email.trim() : null,
      passwordHash,
      role: 'student',
      mustChangePassword: false,
      onboardingMethod: 'independent',
      accountStatus: 'active',
    });

    // Insert student profile row
    await db.insert(studentProfiles).values({
      id: userId,
      fullName: fullName.trim(),
      schoolName: resolvedSchool,
      avatarSeed: computedInitials,
      gradeLevel: gradeLevel || 'SS2',
      targetExam: targetExam || 'WAEC',
      totalXp: 0,
      streakDays: 0,
      masteryPercentage: null,
      dailyGoalTarget: 3,
      dailyGoalCompleted: 0,
    });

    // Regenerate session to avoid session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
      req.session.userId = userId;
      req.session.userRole = 'student';
      req.session.mustChangePassword = false;
      req.session.csrfToken = crypto.randomBytes(24).toString('hex');

      res.status(201).json({
        success: true,
        message: 'Student account created successfully.',
        user: {
          id: userId,
          username: username.trim(),
          fullName: fullName.trim(),
          role: 'student',
          schoolName: resolvedSchool,
          avatarSeed: '/src/assets/images/student_avatar_female_1_1794394445859.jpg',
          gradeLevel: gradeLevel || 'SS2',
          targetExam: targetExam || 'WAEC',
          totalXp: 0,
          streakDays: 0,
          mustChangePassword: false,
        },
        csrfToken: req.session.csrfToken,
      });
    });
  } catch (err: any) {
    console.error('Error in /register-student:', err);
    res.status(500).json({ error: 'Server Error', message: err?.message || 'Failed to create student account.' });
  }
});

/**
 * POST /api/auth/register-teacher
 * Registers a teacher. Default status is 'pending'.
 * Only teachers providing a valid, unredeemed, unexpired single-use token become 'approved'.
 */
authRouter.post('/register-teacher', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { username, fullName, password, schoolName, verificationToken, email, designation, subjects } = req.body;

    if (!username || !fullName || !password || !schoolName) {
      res.status(400).json({
        error: 'Missing Fields',
        message: 'Username, full name, password, and school name are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Weak Password', message: 'Password must be at least 6 characters long.' });
      return;
    }

    let verificationId: string | null = null;
    let verificationStatus: 'pending' | 'approved' | 'rejected' = 'pending';

    // If an optional token was provided, validate it strictly
    if (verificationToken && verificationToken.trim().length > 0) {
      const tokenHash = crypto.createHash('sha256').update(verificationToken.trim()).digest('hex');
      const verifications = await db
        .select()
        .from(teacherVerifications)
        .where(eq(teacherVerifications.tokenHash, tokenHash))
        .limit(1);

      if (verifications.length === 0) {
        res.status(400).json({
          error: 'Invalid Token',
          code: 'TOKEN_INVALID',
          message: 'The provided teacher accreditation token does not exist.',
        });
        return;
      }

      const ver = verifications[0];
      if (ver.isRedeemed) {
        res.status(400).json({
          error: 'Token Redeemed',
          code: 'TOKEN_ALREADY_REDEEMED',
          message: 'This teacher verification token has already been redeemed.',
        });
        return;
      }

      const now = new Date();
      const expiresAt = new Date(ver.expiresAt);
      if (expiresAt < now) {
        res.status(400).json({
          error: 'Token Expired',
          code: 'TOKEN_EXPIRED',
          message: 'This teacher verification token has expired.',
        });
        return;
      }

      verificationId = ver.id;
      verificationStatus = 'approved';
    }

    const usernameNormalized = username.trim().toLowerCase();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.usernameNormalized, usernameNormalized))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: 'Conflict', message: 'Username is already taken.' });
      return;
    }

    const userId = generateUUID();
    const passwordHash = await hashPassword(password);

    // Atomically create teacher user and profile
    await db.insert(users).values({
      id: userId,
      username: username.trim(),
      usernameNormalized,
      email: email ? email.trim() : null,
      passwordHash,
      role: 'teacher',
      mustChangePassword: false,
      onboardingMethod: 'independent',
      accountStatus: 'active',
    });

    await db.insert(teacherProfiles).values({
      id: userId,
      fullName: fullName.trim(),
      schoolName: schoolName.trim(),
      designation: designation || null,
      subjects: subjects || ['Mathematics'],
      verificationId,
      verificationStatus,
      approvedAt: verificationStatus === 'approved' ? new Date().toISOString() : null,
    });

    // Mark verification token as redeemed if valid token was provided
    if (verificationId) {
      await db
        .update(teacherVerifications)
        .set({ isRedeemed: true, redeemedByTeacherId: userId })
        .where(eq(teacherVerifications.id, verificationId));
    }

    req.session.regenerate((err) => {
      if (err) console.error('Session regeneration error:', err);
      req.session.userId = userId;
      req.session.userRole = 'teacher';
      req.session.mustChangePassword = false;
      req.session.verificationStatus = verificationStatus;
      req.session.csrfToken = crypto.randomBytes(24).toString('hex');

      res.status(201).json({
        success: true,
        message:
          verificationStatus === 'approved'
            ? 'Teacher account verified and registered successfully.'
            : 'Teacher account registered in Pending Verification state. An administrator will review your account.',
        user: {
          id: userId,
          username: username.trim(),
          fullName: fullName.trim(),
          role: 'teacher',
          schoolName: schoolName.trim(),
          verificationStatus,
        },
        csrfToken: req.session.csrfToken,
      });
    });
  } catch (err: any) {
    console.error('Error in /register-teacher:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create teacher account.' });
  }
});

/**
 * POST /api/auth/login
 * Verifies Argon2id password, sets HTTP-only session cookie, regenerates session
 */
authRouter.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Missing Fields', message: 'Username and password are required.' });
      return;
    }

    const normalized = identifier.trim().toLowerCase();

    // Query user by username or email
    const foundUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.usernameNormalized, normalized), eq(users.email, normalized)))
      .limit(1);

    if (foundUsers.length === 0) {
      res.status(401).json({ error: 'Invalid Credentials', message: 'Invalid username or password.' });
      return;
    }

    const user = foundUsers[0];
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid Credentials', message: 'Invalid username or password.' });
      return;
    }

    // Fetch role-specific profile
    let profileData: any = null;
    let verificationStatus: 'pending' | 'approved' | 'rejected' | undefined = undefined;

    if (user.role === 'student') {
      const profs = await db.select().from(studentProfiles).where(eq(studentProfiles.id, user.id)).limit(1);
      if (profs.length > 0) profileData = profs[0];
    } else if (user.role === 'teacher') {
      const profs = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, user.id)).limit(1);
      if (profs.length > 0) {
        profileData = profs[0];
        verificationStatus = profs[0].verificationStatus as any;
      }
      verificationStatus = effectiveTeacherVerification(verificationStatus);
    }

    // Regenerate session to protect against session fixation
    req.session.regenerate((err) => {
      if (err) console.error('Session regeneration error on login:', err);

      req.session.userId = user.id;
      req.session.userRole = user.role as 'student' | 'teacher' | 'admin';
      req.session.mustChangePassword = Boolean(user.mustChangePassword);
      req.session.verificationStatus = verificationStatus;
      req.session.csrfToken = crypto.randomBytes(24).toString('hex');

      res.json({
        success: true,
        message: 'Signed in successfully.',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          mustChangePassword: Boolean(user.mustChangePassword),
          verificationStatus,
          profile: profileData,
        },
        csrfToken: req.session.csrfToken,
      });
    });
  } catch (err: any) {
    console.error('Error in /login:', err);
    res.status(500).json({ error: 'Server Error', message: 'Login failed due to a server error.' });
  }
});

/**
 * POST /api/auth/change-password
 * Required for school-managed students upon initial login
 */
authRouter.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash,
        mustChangePassword: false,
        accountStatus: 'active',
        passwordChangedAt: new Date().toISOString(),
        tempPasswordExpiresAt: null,
      })
      .where(eq(users.id, userId));

    req.session.mustChangePassword = false;

    res.json({
      success: true,
      message: 'Password changed successfully. Your account is now fully active.',
    });
  } catch (err: any) {
    console.error('Error in /change-password:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update password.' });
  }
});

/**
 * POST /api/auth/redeem-teacher-token
 * Allows a pending teacher to redeem a single-use accreditation token
 */
authRouter.post('/redeem-teacher-token', requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.session.userRole !== 'teacher') {
      res.status(403).json({ error: 'Forbidden', message: 'Only teacher accounts can redeem accreditation tokens.' });
      return;
    }

    const { token } = req.body;
    if (!token || !token.trim()) {
      res.status(400).json({ error: 'Missing Token', message: 'Accreditation token is required.' });
      return;
    }

    const teacherId = req.session.userId!;

    // Check if already approved
    const profs = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, teacherId)).limit(1);
    if (profs.length > 0 && profs[0].verificationStatus === 'approved') {
      res.status(400).json({ error: 'Already Approved', message: 'Your teacher account is already accredited and approved.' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const verifications = await db
      .select()
      .from(teacherVerifications)
      .where(eq(teacherVerifications.tokenHash, tokenHash))
      .limit(1);

    if (verifications.length === 0) {
      res.status(400).json({ error: 'Invalid Token', code: 'TOKEN_INVALID', message: 'Invalid teacher accreditation token.' });
      return;
    }

    const ver = verifications[0];
    if (ver.isRedeemed) {
      res.status(400).json({ error: 'Token Redeemed', code: 'TOKEN_ALREADY_REDEEMED', message: 'This token has already been redeemed.' });
      return;
    }

    if (new Date(ver.expiresAt) < new Date()) {
      res.status(400).json({ error: 'Token Expired', code: 'TOKEN_EXPIRED', message: 'This accreditation token has expired.' });
      return;
    }

    // Atomic update
    await db
      .update(teacherVerifications)
      .set({ isRedeemed: true, redeemedByTeacherId: teacherId })
      .where(eq(teacherVerifications.id, ver.id));

    await db
      .update(teacherProfiles)
      .set({
        verificationStatus: 'approved',
        verificationId: ver.id,
        approvedAt: new Date().toISOString(),
      })
      .where(eq(teacherProfiles.id, teacherId));

    req.session.verificationStatus = 'approved';

    res.json({
      success: true,
      message: 'Teacher accreditation token successfully redeemed. Classroom privileges granted.',
      verificationStatus: 'approved',
    });
  } catch (err: any) {
    console.error('Error in /redeem-teacher-token:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to redeem token.' });
  }
});

/**
 * POST /api/auth/logout
 * Invalidates and destroys HTTP-only session
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout Failed', message: 'Could not destroy session.' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

/**
 * GET /api/auth/me
 * Returns current authenticated session details and role profile
 */
authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const foundUsers = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (foundUsers.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'User record not found.' });
      return;
    }

    const user = foundUsers[0];

    let profileData: any = null;
    let verificationStatus: 'pending' | 'approved' | 'rejected' | undefined = undefined;

    if (user.role === 'student') {
      const profs = await db.select().from(studentProfiles).where(eq(studentProfiles.id, userId)).limit(1);
      if (profs.length > 0) profileData = profs[0];
    } else if (user.role === 'teacher') {
      const profs = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, userId)).limit(1);
      if (profs.length > 0) {
        profileData = profs[0];
        verificationStatus = profs[0].verificationStatus as any;
      }
      verificationStatus = effectiveTeacherVerification(verificationStatus);
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        mustChangePassword: Boolean(user.mustChangePassword),
        verificationStatus,
        profile: profileData,
      },
      csrfToken: req.session.csrfToken,
    });
  } catch (err: any) {
    console.error('Error in /me:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve profile.' });
  }
});
