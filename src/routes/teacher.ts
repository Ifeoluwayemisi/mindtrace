import { Router, Request, Response } from 'express';
import { eq, inArray, sql } from 'drizzle-orm';
import {
  db,
  classrooms,
  classroomMemberships,
  studentProfiles,
  diagnosticAttempts,
  teacherProfiles,
} from '../db/index';
import { requireAuth, requireRole, requireApprovedTeacher } from '../middleware/authMiddleware';
import { generateUUID } from '../services/serverAuth';

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
    res.json({
      success: true,
      verificationStatus: prof.verificationStatus || 'pending',
      fullName: prof.fullName,
      schoolName: prof.schoolName,
      approvedAt: prof.approvedAt,
      rejectionReason: prof.rejectionReason,
    });
  } catch (err: any) {
    console.error('Error in /verification-status:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve verification status.' });
  }
});

/**
 * GET /api/teacher/classrooms
 * Retrieves classrooms owned by the authenticated teacher. Requires approved verification status.
 */
teacherRouter.get('/classrooms', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const list = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.teacherId, teacherId));

    res.json({ classrooms: list });
  } catch (err: any) {
    console.error('Error in GET /api/teacher/classrooms:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve classrooms.' });
  }
});

/**
 * POST /api/teacher/classrooms
 * Creates a new classroom owned by the teacher with a unique 6-char invite code.
 * Requires approved teacher accreditation.
 */
teacherRouter.post('/classrooms', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { name, gradeLevel } = req.body;

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
      inviteCode,
    });

    res.status(201).json({
      success: true,
      classroom: {
        id: classId,
        name: name.trim(),
        gradeLevel: gradeLevel || 'SS2',
        inviteCode,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/teacher/classrooms:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create classroom.' });
  }
});

/**
 * GET /api/teacher/roster
 * Retrieves student roster and performance summary for teacher's active classroom
 */
teacherRouter.get('/roster', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;

    // Find teacher's classrooms
    const teacherClassList = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.teacherId, teacherId))
      .limit(1);

    if (teacherClassList.length === 0) {
      res.json({ roster: [], totalStudents: 0 });
      return;
    }

    const activeClass = teacherClassList[0];

    // Find student members
    const members = await db
      .select({
        studentId: classroomMemberships.studentId,
        joinedAt: classroomMemberships.joinedAt,
      })
      .from(classroomMemberships)
      .where(eq(classroomMemberships.classroomId, activeClass.id));

    if (members.length === 0) {
      res.json({ roster: [], totalStudents: 0 });
      return;
    }

    const studentIds = members.map((m: any) => m.studentId);

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
 * Returns class-wide aggregated misconception heatmaps from verified attempts
 */
teacherRouter.get('/analytics', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;

    // Aggregate primary misconceptions across all attempts
    const misconceptionsQuery = await db
      .select({
        misconceptionCode: diagnosticAttempts.serverPrimaryMisconception,
        count: sql<number>`COUNT(*)`,
      })
      .from(diagnosticAttempts)
      .where(sql`${diagnosticAttempts.serverPrimaryMisconception} IS NOT NULL`)
      .groupBy(diagnosticAttempts.serverPrimaryMisconception);

    res.json({
      success: true,
      misconceptionHeatmap: misconceptionsQuery,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in GET /api/teacher/analytics:', err);
    res.status(500).json({ error: 'Failed to compute class analytics.', message: err?.message });
  }
});
