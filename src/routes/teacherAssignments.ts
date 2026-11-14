import { Router, Request, Response } from 'express';
import { eq, and, desc, inArray } from 'drizzle-orm';
import {
  db,
  classrooms,
  classroomMemberships,
  assignments,
  assignmentQuestions,
  assignmentSubmissions,
  diagnosticAttempts,
  diagnosticMisconceptions,
  studentProfiles,
} from '../db/index';
import { requireAuth, requireApprovedTeacher } from '../middleware/authMiddleware';
import { generateUUID } from '../services/serverAuth';

export const teacherAssignmentRouter = Router();

/**
 * GET /api/teacher/classrooms/:classroomId/assignments
 * List assignments for a specific classroom
 */
teacherAssignmentRouter.get(
  ['/classrooms/:classroomId/assignments', '/:classroomId/assignments'],
  requireAuth,
  requireApprovedTeacher,
  async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { classroomId } = req.params;

    // Verify teacher owns the classroom
    const classroom = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
      .limit(1);

    if (classroom.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Classroom not found or access denied.' });
      return;
    }

    const assignmentList = await db
      .select()
      .from(assignments)
      .where(eq(assignments.classroomId, classroomId))
      .orderBy(desc(assignments.createdAt));

    res.json({ success: true, assignments: assignmentList });
  } catch (err: any) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch assignments.' });
  }
});

/**
 * POST /api/teacher/classrooms/:classroomId/assignments
 * Create a new assignment
 */
teacherAssignmentRouter.post(
  ['/classrooms/:classroomId/assignments', '/:classroomId/assignments'],
  requireAuth,
  requireApprovedTeacher,
  async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { classroomId } = req.params;
    const { title, instructions, subject, gradeLevel, dueDate, latePolicy, retakePolicy, questions } = req.body;

    // Verify ownership
    const classroom = await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
      .limit(1);

    if (classroom.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Classroom not found.' });
      return;
    }

    const assignmentId = generateUUID();
    await db.insert(assignments).values({
      id: assignmentId,
      classroomId,
      teacherId,
      title,
      instructions,
      subject,
      gradeLevel,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      latePolicy,
      retakePolicy,
    });

    if (Array.isArray(questions)) {
      for (const q of questions) {
        await db.insert(assignmentQuestions).values({
          id: generateUUID(),
          assignmentId,
          questionId: q.questionId,
          displayOrder: q.displayOrder,
          marks: q.marks || 1,
        });
      }
    }

    res.status(201).json({ success: true, assignmentId });
  } catch (err: any) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create assignment.' });
  }
});

/**
 * PATCH /api/teacher/assignments/:assignmentId/publish
 * Publish a draft assignment
 */
teacherAssignmentRouter.patch(
  ['/assignments/:assignmentId/publish', '/:assignmentId/publish'],
  requireAuth,
  requireApprovedTeacher,
  async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { assignmentId } = req.params;

    const assignment = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.id, assignmentId), eq(assignments.teacherId, teacherId)))
      .limit(1);

    if (assignment.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Assignment not found.' });
      return;
    }

    await db
      .update(assignments)
      .set({ published: true })
      .where(eq(assignments.id, assignmentId));

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error publishing assignment:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to publish assignment.' });
  }
});

/**
 * GET /api/teacher/assignments/:assignmentId/submissions
 * Retrieves all student submissions for a specific assignment
 */
teacherAssignmentRouter.get(
  ['/assignments/:assignmentId/submissions', '/:assignmentId/submissions'],
  requireAuth,
  requireApprovedTeacher,
  async (req: Request, res: Response) => {
  try {
    const teacherId = req.session.userId!;
    const { assignmentId } = req.params;

    // 1. Verify teacher owns this assignment
    const assignmentRow = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.id, assignmentId), eq(assignments.teacherId, teacherId)))
      .limit(1);

    if (assignmentRow.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Assignment not found or access denied.' });
      return;
    }

    // 2. Fetch submissions with student profiles
    const submissions = await db
      .select({
        id: assignmentSubmissions.id,
        studentId: assignmentSubmissions.studentId,
        studentName: studentProfiles.fullName,
        score: assignmentSubmissions.score,
        totalMarks: assignmentSubmissions.totalMarks,
        submittedAt: assignmentSubmissions.submittedAt,
        attemptNumber: assignmentSubmissions.attemptNumber,
        isLate: assignmentSubmissions.isLate,
        status: assignmentSubmissions.status,
        diagnosticAttemptId: assignmentSubmissions.diagnosticAttemptId,
      })
      .from(assignmentSubmissions)
      .innerJoin(studentProfiles, eq(assignmentSubmissions.studentId, studentProfiles.id))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.submittedAt));

    // 3. Fetch the real diagnostic attempts and misconceptions behind each submission
    const attemptIds = submissions.map((s: any) => s.diagnosticAttemptId).filter(Boolean);
    const attempts = attemptIds.length
      ? await db
          .select({
            id: diagnosticAttempts.id,
            equation: diagnosticAttempts.equation,
            workingSteps: diagnosticAttempts.workingSteps,
            finalAnswer: diagnosticAttempts.finalAnswer,
            serverIsCorrect: diagnosticAttempts.serverIsCorrect,
            serverPrimaryMisconception: diagnosticAttempts.serverPrimaryMisconception,
          })
          .from(diagnosticAttempts)
          .where(inArray(diagnosticAttempts.id, attemptIds))
      : [];

    const misconceptions = attemptIds.length
      ? await db
          .select({
            attemptId: diagnosticMisconceptions.attemptId,
            code: diagnosticMisconceptions.misconceptionCode,
            confidence: diagnosticMisconceptions.confidenceScore,
          })
          .from(diagnosticMisconceptions)
          .where(inArray(diagnosticMisconceptions.attemptId, attemptIds))
      : [];

    const attemptById = new Map(attempts.map((a: any) => [a.id, a]));
    const enrichedSubmissions = submissions.map((submission: any) => ({
      ...submission,
      attempt: attemptById.get(submission.diagnosticAttemptId) || null,
      misconceptions: misconceptions.filter(
        (m: any) => m.attemptId === submission.diagnosticAttemptId
      ),
    }));

    // 4. Active enrolment for the class, so the summary is not a placeholder.
    const members = await db
      .select({ studentId: classroomMemberships.studentId })
      .from(classroomMemberships)
      .where(
        and(
          eq(classroomMemberships.classroomId, assignmentRow[0].classroomId),
          eq(classroomMemberships.status, 'active')
        )
      );

    res.json({
      success: true,
      assignment: assignmentRow[0],
      totalStudents: members.length,
      submissions: enrichedSubmissions,
    });
  } catch (err: any) {
    console.error('Error fetching assignment submissions:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch submissions.' });
  }
});
