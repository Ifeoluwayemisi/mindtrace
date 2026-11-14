import {
  db,
  classroomMemberships,
  assignments,
  assignmentSubmissions,
  diagnosticAttempts,
  diagnosticMisconceptions,
  studentProfiles,
} from '../db/index';
import { eq, and, inArray, sql, desc } from 'drizzle-orm';

const MISCONCEPTION_LABELS: Record<string, string> = {
  ALG_SIGN_FLIP: 'Sign reversal on transposition',
  ALG_INVALID_DISTRIB: 'Incomplete bracket distribution',
  ALG_PRECEDENCE_VIOLATION: 'Precedence slip before isolating',
  ALG_VARIABLE_DROPPED: 'Variable dropped during subtraction',
};

function labelForCode(code: string): string {
  return MISCONCEPTION_LABELS[code] || code.replace(/^ALG_/, '').replace(/_/g, ' ').toLowerCase();
}

function percentage(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

function bucketise(values: number[], buckets: Array<{ range: string; min: number; max: number }>) {
  const total = values.length;
  return buckets.map(({ range, min, max }) => ({
    range,
    percentage: total ? Math.round((values.filter((v) => v >= min && v <= max).length / total) * 100) : 0,
  }));
}

async function misconceptionInsights(classroomId: string) {
  return db
    .select({
      code: diagnosticMisconceptions.misconceptionCode,
      count: sql<number>`count(*)`,
      studentCount: sql<number>`count(distinct ${diagnosticAttempts.studentId})`,
    })
    .from(diagnosticMisconceptions)
    .innerJoin(diagnosticAttempts, eq(diagnosticMisconceptions.attemptId, diagnosticAttempts.id))
    .innerJoin(
      classroomMemberships,
      and(
        eq(diagnosticAttempts.studentId, classroomMemberships.studentId),
        eq(classroomMemberships.classroomId, classroomId),
        eq(classroomMemberships.status, 'active')
      )
    )
    .groupBy(diagnosticMisconceptions.misconceptionCode)
    .orderBy(desc(sql`count(*)`))
    .limit(6);
}

export const analyticsService = {
  async getClassroomOverview(classroomId: string) {
    const members = await db
      .select({ studentId: classroomMemberships.studentId })
      .from(classroomMemberships)
      .where(
        and(
          eq(classroomMemberships.classroomId, classroomId),
          eq(classroomMemberships.status, 'active')
        )
      );

    const studentIds = members.map((m: { studentId: string }) => m.studentId);
    const totalStudents = studentIds.length;

    const profiles = studentIds.length
      ? await db.select().from(studentProfiles).where(inArray(studentProfiles.id, studentIds))
      : [];

    const classAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.classroomId, classroomId));

    const published = classAssignments.filter((a: any) => a.published);
    const assignmentIds = published.map((a: any) => a.id);

    const submissions = assignmentIds.length
      ? await db
          .select()
          .from(assignmentSubmissions)
          .where(inArray(assignmentSubmissions.assignmentId, assignmentIds))
      : [];

    const attempts = studentIds.length
      ? await db
          .select()
          .from(diagnosticAttempts)
          .where(inArray(diagnosticAttempts.studentId, studentIds))
      : [];

    const expectedSubmissions = published.length * totalStudents;
    const submissionRate = percentage(submissions.length, expectedSubmissions);
    const studentsWhoSubmitted = new Set(
      submissions.map((s: any) => s.studentId)
    ).size;
    const avgCompletion = percentage(studentsWhoSubmitted, totalStudents);
    const avgCorrectness = submissions.length
      ? Math.round(
          submissions.reduce((sum: number, s: any) => {
            const total = Number(s.totalMarks) || 0;
            return sum + (total > 0 ? (Number(s.score) / total) * 100 : 0);
          }, 0) / submissions.length
        )
      : 0;

    const atRiskCount = profiles.filter(
      (p: any) => (p.masteryPercentage ?? 0) < 60
    ).length;
    const averageMastery = profiles.length
      ? Math.round(
          profiles.reduce((sum: number, p: any) => sum + (p.masteryPercentage ?? 0), 0) /
            profiles.length
        )
      : 0;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeStudents = profiles.filter((p: any) => {
      if (!p.lastActiveDate) return false;
      const ts = new Date(p.lastActiveDate).getTime();
      return Number.isFinite(ts) && ts >= weekAgo;
    }).length;

    // Working-step counts come from the stored workingSteps JSON on each attempt.
    const stepCounts = attempts
      .map((a: any) => {
        try {
          const steps = Array.isArray(a.workingSteps)
            ? a.workingSteps
            : JSON.parse(a.workingSteps || '[]');
          return Array.isArray(steps) ? steps.length : 0;
        } catch {
          return 0;
        }
      })
      .filter((n: number) => n > 0);

    const workingStepsDistribution = bucketise(stepCounts, [
      { range: '1–2 steps', min: 1, max: 2 },
      { range: '3–4 steps', min: 3, max: 4 },
      { range: '5–6 steps', min: 5, max: 6 },
      { range: '7–8 steps', min: 7, max: 8 },
      { range: '9+ steps', min: 9, max: Number.MAX_SAFE_INTEGER },
    ]);

    const attemptCountsByStudent = studentIds.map(
      (id: string) => attempts.filter((a: any) => a.studentId === id).length
    );

    const attemptsPerStudentDistribution = bucketise(attemptCountsByStudent, [
      { range: 'No attempts', min: 0, max: 0 },
      { range: '1–2 attempts', min: 1, max: 2 },
      { range: '3–4 attempts', min: 3, max: 4 },
      { range: '5–6 attempts', min: 5, max: 6 },
      { range: '7+ attempts', min: 7, max: Number.MAX_SAFE_INTEGER },
    ]);

    // Performance trend per submission day (most recent seven days of activity).
    const byDay = new Map<string, { submissions: number; scoreSum: number; marked: number }>();
    for (const submission of submissions as any[]) {
      const day = String(submission.submittedAt || '').slice(0, 10);
      if (!day) continue;
      const entry = byDay.get(day) || { submissions: 0, scoreSum: 0, marked: 0 };
      entry.submissions += 1;
      const total = Number(submission.totalMarks) || 0;
      if (total > 0) {
        entry.scoreSum += (Number(submission.score) / total) * 100;
        entry.marked += 1;
      }
      byDay.set(day, entry);
    }

    const performanceTrends = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([day, entry]) => ({
        date: day.slice(5).replace('-', '/'),
        submissionRate: percentage(entry.submissions, totalStudents || entry.submissions),
        correctness: entry.marked ? Math.round(entry.scoreSum / entry.marked) : 0,
      }));

    const insights = await misconceptionInsights(classroomId);

    const microSkills = insights.slice(0, 6).map((row: any) => ({
      skill: labelForCode(row.code),
      score: Math.max(0, 100 - percentage(Number(row.studentCount), totalStudents || 1)),
    }));

    const topMisconceptions = insights.slice(0, 4).map((row: any) => ({
      code: row.code,
      title: labelForCode(row.code),
      affectedPercentage: percentage(Number(row.studentCount), totalStudents || 1),
      studentCount: Number(row.studentCount),
      severity:
        percentage(Number(row.studentCount), totalStudents || 1) >= 40
          ? 'high'
          : 'medium',
    }));

    return {
      totalStudents,
      activeStudents,
      totalAssignments: classAssignments.length,
      publishedAssignments: published.length,
      submissionRate,
      avgCompletion,
      avgCorrectness,
      atRiskCount,
      averageMastery,
      microSkills,
      performanceTrends,
      workingStepsDistribution,
      attemptsPerStudentDistribution,
      topMisconceptions,
      attemptCount: attempts.length,
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
    const avgScore =
      totalSubmissions > 0
        ? submissions.reduce(
            (sum: number, s: { score: number; totalMarks: number }) =>
              sum + (s.totalMarks ? s.score / s.totalMarks : 0),
            0
          ) / totalSubmissions
        : 0;
    const lateSubmissions = submissions.filter((s: { isLate: boolean }) => s.isLate).length;

    return {
      totalSubmissions,
      avgScore: Math.round(avgScore * 100),
      lateSubmissions,
    };
  },

  async getMisconceptionInsights(classroomId: string) {
    return misconceptionInsights(classroomId);
  },
};
