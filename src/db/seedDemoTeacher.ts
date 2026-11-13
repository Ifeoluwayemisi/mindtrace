import { eq } from 'drizzle-orm';
import {
  db,
  users,
  teacherProfiles,
  studentProfiles,
  classrooms,
  classroomMemberships,
  assignments,
  assignmentQuestions,
  diagnosticAttempts,
  diagnosticMisconceptions,
} from './index';
import { generateUUID, hashPassword } from '../services/serverAuth';

/** Stable local-only fixture IDs keep demo seeding safe to repeat across restarts. */
export const DEMO_TEACHER_ID = 'demo-teacher-chinedu-2026';
export const DEMO_CLASSROOM_ID = 'demo-classroom-ss2-algebra-2026';

const DEMO_STUDENTS = [
  { id: 'demo-student-aminat-2026', username: 'aminat_diallo', name: 'Aminat Diallo', mastery: 74, xp: 285 },
  { id: 'demo-student-tobi-2026', username: 'tobi_adeyemi', name: 'Tobi Adeyemi', mastery: 48, xp: 140 },
  { id: 'demo-student-zainab-2026', username: 'zainab_bello', name: 'Zainab Bello', mastery: 91, xp: 420 },
];

/**
 * Seed fictional classroom data for local evaluator walkthroughs. Never invoke
 * this against a production database; the caller also enforces that boundary.
 */
export async function seedDemoTeacherData(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo teacher fixtures must never be seeded in production.');
  }

  const existingTeachers = await db.select().from(users).where(eq(users.usernameNormalized, 'chinedu_okafor')).limit(1);
  let teacherId = DEMO_TEACHER_ID;

  if (existingTeachers.length > 0) {
    if (existingTeachers[0].role !== 'teacher') {
      throw new Error('The demo teacher username is already used by a non-teacher account.');
    }
    teacherId = existingTeachers[0].id;
  } else {
    await db.insert(users).values({
      id: teacherId,
      username: 'chinedu_okafor',
      usernameNormalized: 'chinedu_okafor',
      email: 'c.okafor@agegehigh.edu.ng',
      passwordHash: await hashPassword('teacher123'),
      role: 'teacher',
      mustChangePassword: false,
      onboardingMethod: 'independent',
      accountStatus: 'active',
    });
  }

  const existingTeacherProfile = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, teacherId)).limit(1);
  if (existingTeacherProfile.length === 0) {
    await db.insert(teacherProfiles).values({
      id: teacherId,
      fullName: 'Mr. Chinedu Okafor',
      schoolName: 'Agege Comprehensive Senior High, Lagos',
      verificationStatus: 'approved',
      approvedAt: new Date().toISOString(),
    });
  } else if (existingTeacherProfile[0].verificationStatus !== 'approved') {
    await db.update(teacherProfiles)
      .set({ verificationStatus: 'approved', approvedAt: new Date().toISOString(), rejectionReason: null })
      .where(eq(teacherProfiles.id, teacherId));
  }

  const existingClassrooms = await db.select().from(classrooms).where(eq(classrooms.id, DEMO_CLASSROOM_ID)).limit(1);
  if (existingClassrooms.length === 0) {
    await db.insert(classrooms).values({
      id: DEMO_CLASSROOM_ID,
      teacherId,
      name: 'Class A - Algebra I',
      gradeLevel: 'SS2',
      subject: 'Mathematics',
      status: 'active',
      enrollmentMethod: 'invite_code',
      description: 'Sample class for exploring the MindTrace teacher and evaluator workspace.',
      inviteCode: 'MTR26A',
    });
  }

  for (const [index, student] of DEMO_STUDENTS.entries()) {
    const existingStudent = await db.select().from(users).where(eq(users.id, student.id)).limit(1);
    if (existingStudent.length === 0) {
      await db.insert(users).values({
        id: student.id,
        username: student.username,
        usernameNormalized: student.username,
        email: `${student.username}@demo.mindtrace.local`,
        passwordHash: await hashPassword('pass1234'),
        role: 'student',
        mustChangePassword: false,
        onboardingMethod: 'independent',
        accountStatus: 'active',
      });
      await db.insert(studentProfiles).values({
        id: student.id,
        fullName: student.name,
        schoolName: 'Agege Comprehensive Senior High, Lagos',
        avatarSeed: student.name.split(' ').map((part) => part[0]).join('').toUpperCase(),
        gradeLevel: 'SS2',
        targetExam: 'WAEC',
        totalXp: student.xp,
        streakDays: [4, 1, 7][index],
        masteryPercentage: student.mastery,
        dailyGoalTarget: 3,
        dailyGoalCompleted: [2, 1, 3][index],
        lastActiveDate: new Date().toISOString().slice(0, 10),
      });
    }

    const memberships = await db.select().from(classroomMemberships)
      .where(eq(classroomMemberships.id, `demo-membership-${student.id}`)).limit(1);
    if (memberships.length === 0) {
      await db.insert(classroomMemberships).values({
        id: `demo-membership-${student.id}`,
        classroomId: DEMO_CLASSROOM_ID,
        studentId: student.id,
        status: 'active',
      });
    }
  }

  const assignmentId = 'demo-assignment-linear-equations-2026';
  const existingAssignment = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
  if (existingAssignment.length === 0) {
    await db.insert(assignments).values({
      id: assignmentId,
      classroomId: DEMO_CLASSROOM_ID,
      teacherId,
      title: 'Linear Equations Diagnostic',
      instructions: 'Solve each equation and show every step so misconceptions can be identified.',
      subject: 'Mathematics',
      gradeLevel: 'SS2',
      published: true,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      latePolicy: { allowed: true, deductionPercentage: 10 },
      retakePolicy: { allowed: true, attempts: 2 },
    });
    await db.insert(assignmentQuestions).values([
      { id: 'demo-assignment-question-1', assignmentId, questionId: 'q-lin-01', displayOrder: 1, marks: 5 },
      { id: 'demo-assignment-question-2', assignmentId, questionId: 'q-dist-02', displayOrder: 2, marks: 5 },
    ]);
  }

  // A small synthetic misconception sample makes roster details and insight views useful.
  const diagnosticFixtures = [
    { attemptId: 'demo-attempt-aminat-2026', student: DEMO_STUDENTS[0], code: 'ALG_ARITHMETIC_ERROR', correct: true },
    { attemptId: 'demo-attempt-tobi-2026', student: DEMO_STUDENTS[1], code: 'ALG_SIGN_FLIP', correct: false },
    { attemptId: 'demo-attempt-zainab-2026', student: DEMO_STUDENTS[2], code: 'CORRECT', correct: true },
  ];
  for (const fixture of diagnosticFixtures) {
    const existingAttempt = await db.select().from(diagnosticAttempts)
      .where(eq(diagnosticAttempts.id, fixture.attemptId)).limit(1);
    if (existingAttempt.length === 0) {
      const timestamp = new Date().toISOString();
      await db.insert(diagnosticAttempts).values({
        id: fixture.attemptId,
        studentId: fixture.student.id,
        questionId: 'q-lin-01',
        questionVersion: 1,
        engineVersion: '1.2',
        equation: '3x - 7 = 14',
        workingSteps: ['3x = 14 - 7', '3x = 7', 'x = 7 / 3'],
        finalAnswer: fixture.correct ? '7' : '7/3',
        payloadHash: `demo-${fixture.attemptId}`,
        serverIsCorrect: fixture.correct,
        serverPrimaryMisconception: fixture.code,
        validationStatus: 'VALIDATED',
        clientTimestamp: timestamp,
        serverTimestamp: timestamp,
      });
      await db.insert(diagnosticMisconceptions).values({
        id: generateUUID(),
        attemptId: fixture.attemptId,
        misconceptionCode: fixture.code,
        confidenceScore: fixture.correct ? 88 : 96,
        supportingEvidence: { source: 'synthetic demo fixture' },
      });
    }
  }
}
