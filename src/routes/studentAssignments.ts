import { Router, Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import {
  db,
  assignments,
  assignmentSubmissions,
  classroomMemberships,
  studentProfiles,
  diagnosticAttempts,
} from '../db/index';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { generateUUID } from '../services/serverAuth';

export const studentAssignmentRouter = Router();

/**
 * GET /api/student/assignments
 * List published assignments for enrolled classrooms
 */
studentAssignmentRouter.get('/', requireAuth, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const studentId = req.session.userId!;

    // 1. Get enrolled classrooms
    const memberships = await db
      .select({ classroomId: classroomMemberships.classroomId })
      .from(classroomMemberships)
      .where(and(eq(classroomMemberships.studentId, studentId), eq(classroomMemberships.status, 'active')));

    if (memberships.length === 0) {
      res.json({ assignments: [] });
      return;
    }

    const classroomIds = memberships.map((m: { classroomId: string }) => m.classroomId);

    // 2. Fetch published assignments for these classrooms
    const assignmentList = await db
      .select()
      .from(assignments)
      .where(and(
        ...[assignments.classroomId.inArray(classroomIds)],
        eq(assignments.published, true)
      ));

    res.json({ success: true, assignments: assignmentList });
  } catch (err: any) {
    console.error('Error fetching student assignments:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch assignments.' });
  }
});

/**
 * POST /api/student/assignments/:assignmentId/submit
 * Submit work for an assignment
 */
studentAssignmentRouter.post('/:assignmentId/submit', requireAuth, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const studentId = req.session.userId!;
    const { assignmentId } = req.params;
    const { diagnosticAttemptId, score, totalMarks, xpEarned } = req.body;

    // Verify submission against attempt and assignment
    const attempt = await db
      .select()
      .from(diagnosticAttempts)
      .where(and(eq(diagnosticAttempts.id, diagnosticAttemptId), eq(diagnosticAttempts.studentId, studentId)))
      .limit(1);

    if (attempt.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Diagnostic attempt not found.' });
      return;
    }

    const assignmentRow = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (assignmentRow.length === 0 || !assignmentRow[0].published) {
      res.status(404).json({ error: 'Not Found', message: 'Assignment not found or not published.' });
      return;
    }

    const assignment = assignmentRow[0];
    const latePolicy = (assignment.latePolicy as any) || { type: 'ACCEPT_WITHOUT_PENALTY', deductionPercentage: 0 };
    const retakePolicy = (assignment.retakePolicy as any) || { allowed: false, attempts: 1 };

    // Idempotency: Check submissions
    const existingSubmissions = await db
      .select()
      .from(assignmentSubmissions)
      .where(and(eq(assignmentSubmissions.assignmentId, assignmentId), eq(assignmentSubmissions.studentId, studentId)))
      .orderBy(desc(assignmentSubmissions.attemptNumber));

    // Retake Policy Enforcement
    if (!retakePolicy.allowed && existingSubmissions.length > 0) {
      res.status(403).json({ error: 'Forbidden', message: 'Retakes not allowed for this assignment.' });
      return;
    }
    if (retakePolicy.allowed && existingSubmissions.length >= retakePolicy.attempts) {
      res.status(403).json({ error: 'Forbidden', message: 'Maximum attempts reached.' });
      return;
    }

    // Late Submission Enforcement
    let finalScore = score;
    let isLate = false;
    
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      isLate = true;
      if (latePolicy.type === 'REJECT_AFTER_DEADLINE') {
        res.status(403).json({ error: 'Deadline Passed', message: 'Late submissions are not accepted.' });
        return;
      }
      if (latePolicy.type === 'ACCEPT_WITH_DEDUCTION') {
        const deduction = score * (latePolicy.deductionPercentage / 100);
        finalScore = score - deduction;
      }
    }

    const attemptNumber = existingSubmissions.length > 0 ? existingSubmissions[0].attemptNumber + 1 : 1;

    await db.insert(assignmentSubmissions).values({
      id: generateUUID(),
      assignmentId,
      studentId,
      diagnosticAttemptId,
      status: 'submitted',
      score: finalScore, // Authoritative adjusted score
      totalMarks,
      xpEarned,
      attemptNumber,
      isLate,
    });

    res.status(201).json({ success: true, finalScore, isLate });
  } catch (err: any) {
    console.error('Error submitting assignment:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to submit assignment.' });
  }
});
