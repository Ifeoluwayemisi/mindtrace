import { Router, Request, Response } from 'express';
import { eq, and, inArray, sql, desc } from 'drizzle-orm';
import {
  db,
  classrooms,
  classroomMemberships,
  studentProfiles,
  diagnosticAttempts,
  diagnosticMisconceptions,
  teacherProfiles,
  users,
} from '../db/index';
import { requireAuth, requireRole, requireApprovedTeacher } from '../middleware/authMiddleware';
import { isDemoModeEnabled } from '../config/demoMode';
import { generateUUID, hashPassword } from '../services/serverAuth';
import { analyticsService } from '../services/analyticsService';
import { isDemoMode } from '../config/demoMode';

export const teacherRouter = Router();

/**
 * GET /api/teacher/verification-status
 * Checks the verification state of the currently authenticated teacher
 */
teacherRouter.get('/verification-status', requireAuth, requireRole('teacher'), async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const profs = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.id, teacherId))
      .limit(1);

    if (profs.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Teacher profile record not found.' });
      return;
    }

    const prof = profs[0];
    const demoActive = isDemoModeEnabled();
    res.json({
      success: true,
      verificationStatus: demoActive ? 'approved' : prof.verificationStatus || 'pending',
      fullName: prof.fullName,
      schoolName: prof.schoolName,
      approvedAt: demoActive ? (prof.approvedAt || new Date().toISOString()) : prof.approvedAt,
      rejectionReason: demoActive ? null : prof.rejectionReason,
    });
  } catch (err: any) {
    console.error('Error in /verification-status:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve verification status.' });
  }
});

/**
 * GET /api/teacher/classrooms
 * Retrieves classrooms owned by the authenticated teacher with student counts.
 */
teacherRouter.get('/classrooms', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const list = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.teacherId, teacherId));

    // Attach student count for each classroom
    const classroomsWithCounts = await Promise.all(
      list.map(async (cls: any) => {
        const members = await db
          .select({ count: sql<number>`count(*)` })
          .from(classroomMemberships)
          .where(
            and(
              eq(classroomMemberships.classroomId, cls.id),
              eq(classroomMemberships.status, 'active')
            )
          );

        return {
          ...cls,
          studentCount: Number(members[0]?.count || 0),
        };
      })
    );

    res.json({ classrooms: classroomsWithCounts });
  } catch (err: any) {
    console.error('Error in GET /api/teacher/classrooms:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve classrooms.' });
  }
});

/**
 * POST /api/teacher/classrooms
 * Creates a new classroom owned by the teacher with a unique 6-char invite code.
 */
teacherRouter.post('/classrooms', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { name, gradeLevel, subject, enrollmentMethod, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Missing Fields', message: 'Classroom name is required.' });
      return;
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const classId = generateUUID();

    await db.insert(classrooms).values({
      id: classId,
      teacherId,
      name: name.trim(),
      gradeLevel: gradeLevel || 'SS2',
      subject: subject || 'Mathematics',
      enrollmentMethod: enrollmentMethod || 'invite_code',
      description: description ? description.trim() : null,
      status: 'active',
      inviteCode,
    });

    res.status(201).json({
      success: true,
      classroom: {
        id: classId,
        name: name.trim(),
        gradeLevel: gradeLevel || 'SS2',
        subject: subject || 'Mathematics',
        enrollmentMethod: enrollmentMethod || 'invite_code',
        description: description ? description.trim() : null,
        status: 'active',
        inviteCode,
        studentCount: 0,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/teacher/classrooms:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create classroom.' });
  }
});

/**
 * GET /api/teacher/classrooms/:id
 * Retrieves specific classroom details and its active student roster
 */
teacherRouter.get('/classrooms/:id', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const classroomId = req.params.id;

    const classList = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
      .limit(1);

    if (classList.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Classroom not found.' });
      return;
    }

    const cls = classList[0];

    const members = await db
      .select({
        studentId: classroomMemberships.studentId,
        joinedAt: classroomMemberships.joinedAt,
      })
      .from(classroomMemberships)
      .where(
        and(
          eq(classroomMemberships.classroomId, classroomId),
          eq(classroomMemberships.status, 'active')
        )
      );

    let roster: any[] = [];
    if (members.length > 0) {
      const studentIds = members.map((m: { studentId: string }) => m.studentId);
      roster = await db
        .select()
        .from(studentProfiles)
        .where(inArray(studentProfiles.id, studentIds));
    }

    res.json({
      success: true,
      classroom: cls,
      roster,
      studentCount: roster.length,
    });
  } catch (err: any) {
    console.error('Error in GET /api/teacher/classrooms/:id:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve classroom details.' });
  }
});

/**
 * PATCH /api/teacher/classrooms/:id
 * Updates classroom metadata (name, gradeLevel, subject, enrollmentMethod, status, description)
 */
teacherRouter.patch('/classrooms/:id', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const classroomId = req.params.id;
    const { name, gradeLevel, subject, enrollmentMethod, status, description } = req.body;

    const classList = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
      .limit(1);

    if (classList.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Classroom not found.' });
      return;
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (gradeLevel !== undefined) updates.gradeLevel = gradeLevel;
    if (subject !== undefined) updates.subject = subject;
    if (enrollmentMethod !== undefined) updates.enrollmentMethod = enrollmentMethod;
    if (status !== undefined) updates.status = status;
    if (description !== undefined) updates.description = description ? description.trim() : null;

    await db
      .update(classrooms)
      .set(updates)
      .where(eq(classrooms.id, classroomId));

    const updated = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.id, classroomId))
      .limit(1);

    res.json({ success: true, classroom: updated[0] });
  } catch (err: any) {
    console.error('Error in PATCH /api/teacher/classrooms/:id:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update classroom.' });
  }
});

/**
 * POST /api/teacher/classrooms/:id/regenerate-code
 * Generates a fresh unique invite code for the classroom
 */
teacherRouter.post('/classrooms/:id/regenerate-code', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const classroomId = req.params.id;

    const classList = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
      .limit(1);

    if (classList.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Classroom not found.' });
      return;
    }

    const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await db
      .update(classrooms)
      .set({ inviteCode: newInviteCode })
      .where(eq(classrooms.id, classroomId));

    res.json({ success: true, inviteCode: newInviteCode });
  } catch (err: any) {
    console.error('Error in POST /api/teacher/classrooms/:id/regenerate-code:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to regenerate invite code.' });
  }
});

/**
 * DELETE /api/teacher/classrooms/:id
 * Archives a classroom
 */
teacherRouter.delete('/classrooms/:id', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const classroomId = req.params.id;

    await db
      .update(classrooms)
      .set({ status: 'archived' })
      .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)));

    res.json({ success: true, message: 'Classroom successfully archived.' });
  } catch (err: any) {
    console.error('Error in DELETE /api/teacher/classrooms/:id:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to archive classroom.' });
  }
});

/**
 * DELETE /api/teacher/classrooms/:id/students/:studentId
 * Removes / unenrolls a student from the teacher's classroom
 */
teacherRouter.delete('/classrooms/:id/students/:studentId', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { id: classroomId, studentId } = req.params;

    // Verify classroom belongs to teacher
    const classList = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
      .limit(1);

    if (classList.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Classroom not found.' });
      return;
    }

    await db
      .update(classroomMemberships)
      .set({ status: 'removed' })
      .where(
        and(
          eq(classroomMemberships.classroomId, classroomId),
          eq(classroomMemberships.studentId, studentId)
        )
      );

    res.json({ success: true, message: 'Student successfully removed from classroom.' });
  } catch (err: any) {
    console.error('Error in DELETE student from classroom:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to remove student.' });
  }
});

/**
 * POST /api/teacher/students/onboard
 * School-managed student onboarding: creates a student account with secure temporary password
 */
teacherRouter.post('/students/onboard', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { fullName, username, gradeLevel, classroomId } = req.body;

    if (!fullName || !username) {
      res.status(400).json({ error: 'Missing Fields', message: 'Full name and username are required.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const normalizedUsername = cleanUsername.replace(/[^a-z0-9_]/g, '');

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.usernameNormalized, normalizedUsername))
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: 'Conflict', message: 'Username is already taken.' });
      return;
    }

    const teacherProf = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.id, teacherId))
      .limit(1);

    const schoolName = teacherProf[0]?.schoolName || 'Secondary School';

    const tempPassword = 'MT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
    const passwordHash = await hashPassword(tempPassword);
    const studentUserId = generateUUID();

    await db.insert(users).values({
      id: studentUserId,
      username: cleanUsername,
      usernameNormalized: normalizedUsername,
      passwordHash,
      role: 'student',
      mustChangePassword: true,
      createdByTeacherId: teacherId,
      onboardingMethod: 'school_managed',
      accountStatus: 'active',
    });

    await db.insert(studentProfiles).values({
      id: studentUserId,
      fullName: fullName.trim(),
      firstName: fullName.split(' ')[0] || fullName,
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      gradeLevel: gradeLevel || 'SS2',
      schoolName,
      totalXp: 0,
      streakDays: 0,
    });

    if (classroomId) {
      const cls = await db
        .select()
        .from(classrooms)
        .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
        .limit(1);

      if (cls.length > 0) {
        await db.insert(classroomMemberships).values({
          id: generateUUID(),
          classroomId,
          studentId: studentUserId,
          status: 'active',
        });
      }
    }

    res.status(201).json({
      success: true,
      student: {
        id: studentUserId,
        username: cleanUsername,
        fullName: fullName.trim(),
        gradeLevel: gradeLevel || 'SS2',
        temporaryPassword: tempPassword,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/teacher/students/onboard:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to onboard student.' });
  }
});

/**
 * GET /api/teacher/roster
 * Retrieves student roster and performance summary for teacher's active classroom
 */
teacherRouter.get('/roster', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;

    const teacherClassList = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.teacherId, teacherId), eq(classrooms.status, 'active')))
      .limit(1);

    if (teacherClassList.length === 0) {
      res.json({ roster: [], totalStudents: 0 });
      return;
    }

    const activeClass = teacherClassList[0];

    const members = await db
      .select({
        studentId: classroomMemberships.studentId,
        joinedAt: classroomMemberships.joinedAt,
      })
      .from(classroomMemberships)
      .where(
        and(
          eq(classroomMemberships.classroomId, activeClass.id),
          eq(classroomMemberships.status, 'active')
        )
      );

    if (members.length === 0) {
      res.json({ classroom: activeClass, roster: [], totalStudents: 0 });
      return;
    }

    const studentIds = members.map((m: { studentId: string }) => m.studentId);

    const profiles = await db
      .select()
      .from(studentProfiles)
      .where(inArray(studentProfiles.id, studentIds));

    res.json({
      classroom: activeClass,
      roster: profiles,
      totalStudents: profiles.length,
    });
  } catch (err: any) {
    console.error('Error in GET /api/teacher/roster:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to load roster.' });
  }
});

/**
 * GET /api/teacher/analytics
 * Returns comprehensive class-wide performance metrics and misconception heatmaps
 */
teacherRouter.get('/analytics', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { classroomId } = req.query;

    if (!classroomId) {
      res.status(400).json({ error: 'Missing Classroom ID' });
      return;
    }

    // Verify ownership
    const classRow = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.id, classroomId as string), eq(classrooms.teacherId, teacherId)))
      .limit(1);

    if (classRow.length === 0) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    const overview = await analyticsService.getClassroomOverview(classroomId as string);
    const insights = await analyticsService.getMisconceptionInsights(classroomId as string);

    res.json({
      success: true,
      overview,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in GET /api/teacher/analytics:', err);
    res.status(500).json({ error: 'Failed to compute class analytics.', message: err?.message });
  }
});

/**
 * GET /api/teacher/students/:studentId/details
 * Retrieves detailed performance metrics and misconception history for a specific student
 */
teacherRouter.get('/students/:studentId/details', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { studentId } = req.params;

    // 1. Verify student belongs to a classroom owned by this teacher
    const ownership = await db
      .select({ id: classrooms.id })
      .from(classrooms)
      .innerJoin(classroomMemberships, eq(classrooms.id, classroomMemberships.classroomId))
      .where(
        and(
          eq(classrooms.teacherId, teacherId),
          eq(classroomMemberships.studentId, studentId),
          eq(classroomMemberships.status, 'active')
        )
      )
      .limit(1);

    if (ownership.length === 0) {
      res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to view this student\'s details.' });
      return;
    }

    // 2. Fetch student profile
    const profiles = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentId))
      .limit(1);

    if (profiles.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Student profile not found.' });
      return;
    }

    const student = profiles[0];

    // 3. Fetch recent diagnostic attempts
    const attempts = await db
      .select()
      .from(diagnosticAttempts)
      .where(eq(diagnosticAttempts.studentId, studentId))
      .orderBy(desc(diagnosticAttempts.clientTimestamp))
      .limit(10);

    // 4. Fetch all active misconceptions
    const misconceptions = await db
      .select({
        code: diagnosticMisconceptions.misconceptionCode,
        confidence: diagnosticMisconceptions.confidenceScore,
        createdAt: diagnosticMisconceptions.createdAt,
        attemptId: diagnosticMisconceptions.attemptId,
      })
      .from(diagnosticMisconceptions)
      .innerJoin(diagnosticAttempts, eq(diagnosticMisconceptions.attemptId, diagnosticAttempts.id))
      .where(eq(diagnosticAttempts.studentId, studentId))
      .orderBy(desc(diagnosticMisconceptions.createdAt));

    res.json({
      success: true,
      student,
      attempts,
      misconceptions,
    });
  } catch (err: any) {
    console.error('Error fetching student details:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve student details.' });
  }
});
