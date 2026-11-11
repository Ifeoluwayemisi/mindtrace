import { Router, Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db, classrooms } from '../db/index';
import { requireAuth, requireApprovedTeacher } from '../middleware/authMiddleware';
import { analyticsService } from '../services/analyticsService';

export const analyticsRouter = Router();

const verifyClassroomAccess = async (req: Request, res: Response, classroomId: string) => {
  const teacherId = req.session.userId!;
  const classroom = await db
    .select()
    .from(classrooms)
    .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId)))
    .limit(1);

  if (classroom.length === 0) {
    res.status(404).json({ error: 'Not Found', message: 'Classroom not found or access denied.' });
    return false;
  }
  return true;
};

analyticsRouter.get('/classroom/:classroomId', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  const { classroomId } = req.params;
  if (!(await verifyClassroomAccess(req, res, classroomId))) return;

  const data = await analyticsService.getClassroomOverview(classroomId);
  res.json({ success: true, data });
});

analyticsRouter.get('/assignment/:assignmentId', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const data = await analyticsService.getAssignmentAnalytics(assignmentId);
  res.json({ success: true, data });
});

analyticsRouter.get('/misconceptions/:classroomId', requireAuth, requireApprovedTeacher, async (req: Request, res: Response) => {
  const { classroomId } = req.params;
  if (!(await verifyClassroomAccess(req, res, classroomId))) return;

  const data = await analyticsService.getMisconceptionInsights(classroomId);
  res.json({ success: true, data });
});
