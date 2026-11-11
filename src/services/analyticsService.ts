import { db, classrooms, classroomMemberships, assignments, assignmentSubmissions, diagnosticAttempts, diagnosticMisconceptions, studentProfiles } from '../db/index';
import { eq, and, sql, count, avg } from 'drizzle-orm';

export const analyticsService = {
  async getClassroomOverview(classroomId: string) {
    const [totalStudents] = await db
      .select({ count: count() })
      .from(classroomMemberships)
      .where(and(eq(classroomMemberships.classroomId, classroomId), eq(classroomMemberships.status, 'active')));

    const classAssignments = await db.select().from(assignments).where(eq(assignments.classroomId, classroomId));
    
    // Simple overview
    return {
      totalStudents: totalStudents.count,
      totalAssignments: classAssignments.length,
    };
  },

  async getAssignmentAnalytics(assignmentId: string) {
    const submissions = await db
      .select({
        score: assignmentSubmissions.score,
        totalMarks: assignmentSubmissions.totalMarks,
        isLate: assignmentSubmissions.isLate,
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.assignmentId, assignmentId));

    const totalSubmissions = submissions.length;
    const avgScore = totalSubmissions > 0 
      ? submissions.reduce((sum: number, s: { score: number, totalMarks: number }) => sum + (s.score / s.totalMarks), 0) / totalSubmissions 
      : 0;
    const lateSubmissions = submissions.filter((s: { isLate: boolean }) => s.isLate).length;

    return {
      totalSubmissions,
      avgScore: Math.round(avgScore * 100),
      lateSubmissions,
    };
  },

  async getMisconceptionInsights(classroomId: string) {
    // Aggregation of top misconceptions for students in this classroom
    return await db
      .select({
        code: diagnosticMisconceptions.misconceptionCode,
        count: count(),
      })
      .from(diagnosticMisconceptions)
      .leftJoin(diagnosticAttempts, eq(diagnosticMisconceptions.attemptId, diagnosticAttempts.id))
      .leftJoin(classroomMemberships, eq(diagnosticAttempts.studentId, classroomMemberships.studentId))
      .where(eq(classroomMemberships.classroomId, classroomId))
      .groupBy(diagnosticMisconceptions.misconceptionCode)
      .orderBy(sql`count DESC`)
      .limit(5);
  }
};
