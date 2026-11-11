import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db, teacherProfiles, teacherVerifications, users } from '../db/index';
import { requireAdmin } from '../middleware/authMiddleware';
import { generateUUID } from '../services/serverAuth';

export const adminRouter = Router();

// Apply requireAdmin to all routes in adminRouter
adminRouter.use(requireAdmin);

/**
 * POST /api/admin/issue-teacher-token
 * Generates a single-use cryptographically secure accreditation token for a school.
 */
adminRouter.post('/issue-teacher-token', async (req: Request, res: Response) => {
  try {
    const { schoolName, validityDays } = req.body;

    if (!schoolName || !schoolName.trim()) {
      res.status(400).json({ error: 'Missing Fields', message: 'School name is required.' });
      return;
    }

    const days = typeof validityDays === 'number' && validityDays > 0 ? validityDays : 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const token = 'MTR-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenId = generateUUID();
    const adminId = req.session?.userId || 'system-admin';

    await db.insert(teacherVerifications).values({
      id: tokenId,
      schoolName: schoolName.trim(),
      tokenHash,
      isRedeemed: false,
      createdByAdminId: adminId,
      expiresAt: expiresAt.toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Single-use teacher accreditation token issued.',
      token,
      schoolName: schoolName.trim(),
      expiresAt: expiresAt.toISOString(),
      expiresInDays: days,
    });
  } catch (err: any) {
    console.error('Error in /issue-teacher-token:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to issue token.' });
  }
});

/**
 * POST /api/admin/approve-teacher
 * Directly approves a teacher account by ID
 */
adminRouter.post('/approve-teacher', async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      res.status(400).json({ error: 'Missing Fields', message: 'Teacher ID is required.' });
      return;
    }

    const profs = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, teacherId)).limit(1);
    if (profs.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Teacher profile not found.' });
      return;
    }

    const adminId = req.session?.userId || 'system-admin';

    await db
      .update(teacherProfiles)
      .set({
        verificationStatus: 'approved',
        approvedByAdminId: adminId,
        approvedAt: new Date().toISOString(),
        rejectionReason: null,
      })
      .where(eq(teacherProfiles.id, teacherId));

    res.json({
      success: true,
      message: `Teacher ${profs[0].fullName} approved successfully.`,
      teacherId,
      verificationStatus: 'approved',
    });
  } catch (err: any) {
    console.error('Error in /approve-teacher:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to approve teacher.' });
  }
});

/**
 * POST /api/admin/reject-teacher
 * Rejects a teacher account with a stated reason
 */
adminRouter.post('/reject-teacher', async (req: Request, res: Response) => {
  try {
    const { teacherId, reason } = req.body;

    if (!teacherId || !reason) {
      res.status(400).json({ error: 'Missing Fields', message: 'Teacher ID and rejection reason are required.' });
      return;
    }

    await db
      .update(teacherProfiles)
      .set({
        verificationStatus: 'rejected',
        rejectionReason: reason.trim(),
      })
      .where(eq(teacherProfiles.id, teacherId));

    res.json({
      success: true,
      message: 'Teacher account rejected.',
      teacherId,
      verificationStatus: 'rejected',
    });
  } catch (err: any) {
    console.error('Error in /reject-teacher:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to reject teacher.' });
  }
});

/**
 * GET /api/admin/pending-teachers
 * Lists all pending teacher applications
 */
adminRouter.get('/pending-teachers', async (_req: Request, res: Response) => {
  try {
    const pendingList = await db
      .select({
        id: teacherProfiles.id,
        fullName: teacherProfiles.fullName,
        schoolName: teacherProfiles.schoolName,
        verificationStatus: teacherProfiles.verificationStatus,
        createdAt: teacherProfiles.updatedAt,
      })
      .from(teacherProfiles)
      .where(eq(teacherProfiles.verificationStatus, 'pending'));

    res.json({
      success: true,
      pendingTeachers: pendingList,
      count: pendingList.length,
    });
  } catch (err: any) {
    console.error('Error in /pending-teachers:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to list pending teachers.' });
  }
});
