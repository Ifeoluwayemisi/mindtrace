import { Router, Request, Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import {
  db,
  classrooms,
  classroomMemberships,
  studentProfiles,
  teacherProfiles,
  users,
} from '../db/index';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { generateUUID } from '../services/serverAuth';

export const studentRouter = Router();

/**
 * POST /api/student/classrooms/join
 * Enrolls student in a classroom using a 6-character invite code
 */
studentRouter.post('/classrooms/join', requireAuth, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const studentUserId = req.session.userId!;
    const { inviteCode } = req.body;

    if (!inviteCode || typeof inviteCode !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'Invite code is required.' });
      return;
    }

    const cleanCode = inviteCode.trim().toUpperCase();

    // Find student profile id (studentProfile.id = users.id)
    const studentProfs = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentUserId))
      .limit(1);

    if (studentProfs.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Student profile record not found.' });
      return;
    }

    // Find classroom by inviteCode
    const foundClasses = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.inviteCode, cleanCode))
      .limit(1);

    if (foundClasses.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Invalid or expired classroom invite code.' });
      return;
    }

    const targetClass = foundClasses[0];

    if (targetClass.status === 'archived') {
      res.status(400).json({ error: 'Forbidden', message: 'This classroom is archived and no longer accepting enrollments.' });
      return;
    }

    // Check if membership already exists
    const existingMembership = await db
      .select()
      .from(classroomMemberships)
      .where(
        and(
          eq(classroomMemberships.classroomId, targetClass.id),
          eq(classroomMemberships.studentId, studentUserId)
        )
      )
      .limit(1);

    if (existingMembership.length > 0) {
      // Update status to active if previously left/removed
      await db
        .update(classroomMemberships)
        .set({ status: 'active' })
        .where(eq(classroomMemberships.id, existingMembership[0].id));
    } else {
      await db.insert(classroomMemberships).values({
        id: generateUUID(),
        classroomId: targetClass.id,
        studentId: studentUserId,
        status: 'active',
      });
    }

    // Fetch teacher details for response
    const teacherInfo = await db
      .select({ fullName: teacherProfiles.fullName, schoolName: teacherProfiles.schoolName })
      .from(teacherProfiles)
      .where(eq(teacherProfiles.id, targetClass.teacherId))
      .limit(1);

    res.json({
      success: true,
      classroom: {
        ...targetClass,
        teacher: teacherInfo[0] || { fullName: 'Teacher', schoolName: '' },
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/student/classrooms/join:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to join classroom.' });
  }
});

/**
 * GET /api/student/classrooms
 * Lists all active classrooms the authenticated student is enrolled in
 */
studentRouter.get('/classrooms', requireAuth, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const studentUserId = req.session.userId!;

    const memberships = await db
      .select({
        classroomId: classroomMemberships.classroomId,
        joinedAt: classroomMemberships.joinedAt,
      })
      .from(classroomMemberships)
      .where(
        and(
          eq(classroomMemberships.studentId, studentUserId),
          eq(classroomMemberships.status, 'active')
        )
      );

    if (memberships.length === 0) {
      res.json({ classrooms: [] });
      return;
    }

    const classIds = memberships.map((m: { classroomId: string }) => m.classroomId);

    const enrolledClasses = await db
      .select()
      .from(classrooms)
      .where(sql`${classrooms.id} IN (${sql.join(classIds.map((id: string) => sql`${id}`), sql`, `)})`);

    // Attach teacher info
    const classroomsWithTeacher = await Promise.all(
      enrolledClasses.map(async (cls: any) => {
        const teacher = await db
          .select({ fullName: teacherProfiles.fullName, schoolName: teacherProfiles.schoolName })
          .from(teacherProfiles)
          .where(eq(teacherProfiles.id, cls.teacherId))
          .limit(1);

        return {
          ...cls,
          teacher: teacher[0] || { fullName: 'Teacher', schoolName: '' },
        };
      })
    );

    res.json({ classrooms: classroomsWithTeacher });
  } catch (err: any) {
    console.error('Error in GET /api/student/classrooms:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve enrolled classrooms.' });
  }
});

/**
 * DELETE /api/student/classrooms/:id/leave
 * Student leaves/unenrolls from a classroom
 */
studentRouter.delete('/classrooms/:id/leave', requireAuth, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const studentUserId = req.session.userId!;
    const classroomId = req.params.id;

    await db
      .update(classroomMemberships)
      .set({ status: 'left' })
      .where(
        and(
          eq(classroomMemberships.classroomId, classroomId),
          eq(classroomMemberships.studentId, studentUserId)
        )
      );

    res.json({ success: true, message: 'Successfully left classroom.' });
  } catch (err: any) {
    console.error('Error in DELETE /api/student/classrooms/:id/leave:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to leave classroom.' });
  }
});
