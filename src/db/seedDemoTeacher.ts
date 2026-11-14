/**
 * Seeds a realistic demo classroom for the demo teacher account
 * (chinedu_okafor / teacher123).
 *
 * This module is the single source of truth for demo fixtures. It is invoked
 * automatically on local startup (see server.ts) and can also be run directly:
 *
 *   npx tsx scripts/seed-demo-teacher.ts
 *
 * Safe to run repeatedly: every academic row this module owns is namespaced
 * with `seed-chinedu-` and replaced on each run. It never overwrites existing
 * account passwords and refuses to run in production.
 */
import { eq, like } from 'drizzle-orm';
import {
  db,
  users,
  teacherProfiles,
  studentProfiles,
  classrooms,
  classroomMemberships,
  assignments,
  assignmentQuestions,
  assignmentSubmissions,
  diagnosticAttempts,
  diagnosticMisconceptions,
} from './index';
import { hashPassword, computeSHA256 } from '../services/serverAuth';

export const DEMO_TEACHER_USERNAME = 'chinedu_okafor';
export const DEMO_TEACHER_ID = 'tch-chinedu-01';
export const DEMO_CLASSROOM_ID = 'seed-chinedu-class-01';

/** Older fixture IDs created by an earlier seeding revision; cleaned up once. */
const LEGACY_CLASSROOM_ID = 'demo-classroom-ss2-algebra-2026';

const ASSIGNMENT_PUBLISHED = 'seed-chinedu-asg-01';
const ASSIGNMENT_DRAFT = 'seed-chinedu-asg-02';
const STUDENT_PASSWORD = 'pass1234';

const day = 24 * 60 * 60 * 1000;
const daysAgo = (n: number, hour = 9) => {
  const date = new Date(Date.now() - n * day);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

interface SeedStudent {
  id: string;
  name: string;
  username: string;
  mastery: number;
  xp: number;
  streak: number;
  activeDaysAgo: number;
  existingUser?: boolean;
  submits: boolean;
  score: number; // out of 30
  attempts: number;
  misconceptions: string[];
  /** Set while seeding when an existing account with the same username is reused. */
  resolvedId?: string;
}

const STUDENTS: SeedStudent[] = [
  {
    id: 'stu-aminat-01',
    name: 'Aminat Diallo',
    username: 'aminat_diallo',
    mastery: 74,
    xp: 285,
    streak: 6,
    activeDaysAgo: 1,
    existingUser: true,
    submits: true,
    score: 24,
    attempts: 2,
    misconceptions: [],
  },
  {
    id: 'seed-chinedu-stu-01',
    name: 'Chidi Okonkwo',
    username: 'chidi_okonkwo',
    mastery: 82,
    xp: 340,
    streak: 8,
    activeDaysAgo: 1,
    submits: true,
    score: 27,
    attempts: 2,
    misconceptions: [],
  },
  {
    id: 'seed-chinedu-stu-02',
    name: 'Fatima Bello',
    username: 'fatima_bello',
    mastery: 91,
    xp: 420,
    streak: 12,
    activeDaysAgo: 2,
    submits: true,
    score: 30,
    attempts: 3,
    misconceptions: [],
  },
  {
    id: 'seed-chinedu-stu-03',
    name: 'Tunde Bakare',
    username: 'tunde_bakare',
    mastery: 45,
    xp: 120,
    streak: 2,
    activeDaysAgo: 2,
    submits: true,
    score: 12,
    attempts: 2,
    misconceptions: ['ALG_SIGN_FLIP'],
  },
  {
    id: 'seed-chinedu-stu-04',
    name: 'Ngozi Eze',
    username: 'ngozi_eze',
    mastery: 58,
    xp: 190,
    streak: 4,
    activeDaysAgo: 3,
    submits: true,
    score: 15,
    attempts: 2,
    misconceptions: ['ALG_INVALID_DISTRIB'],
  },
  {
    id: 'seed-chinedu-stu-05',
    name: 'Ibrahim Musa',
    username: 'ibrahim_musa',
    mastery: 67,
    xp: 230,
    streak: 5,
    activeDaysAgo: 4,
    submits: true,
    score: 18,
    attempts: 1,
    misconceptions: ['ALG_PRECEDENCE_VIOLATION'],
  },
  {
    id: 'seed-chinedu-stu-06',
    name: 'Blessing Adeyemi',
    username: 'blessing_adeyemi',
    mastery: 38,
    xp: 95,
    streak: 1,
    activeDaysAgo: 5,
    submits: true,
    score: 9,
    attempts: 2,
    misconceptions: ['ALG_SIGN_FLIP', 'ALG_VARIABLE_DROPPED'],
  },
  {
    id: 'seed-chinedu-stu-07',
    name: 'Emeka Nwosu',
    username: 'emeka_nwosu',
    mastery: 78,
    xp: 300,
    streak: 7,
    activeDaysAgo: 6,
    submits: true,
    score: 21,
    attempts: 1,
    misconceptions: [],
  },
  {
    id: 'seed-chinedu-stu-08',
    name: 'Zainab Yusuf',
    username: 'zainab_yusuf',
    mastery: 63,
    xp: 175,
    streak: 3,
    activeDaysAgo: 9,
    submits: false,
    score: 0,
    attempts: 1,
    misconceptions: ['ALG_INVALID_DISTRIB'],
  },
  {
    id: 'seed-chinedu-stu-09',
    name: 'Kelechi Obi',
    username: 'kelechi_obi',
    mastery: 49,
    xp: 140,
    streak: 2,
    activeDaysAgo: 11,
    submits: false,
    score: 0,
    attempts: 1,
    misconceptions: ['ALG_SIGN_FLIP'],
  },
];

interface EquationSpec {
  questionId: string;
  equation: string;
  correct: string[];
  faulty: Record<string, string[]>;
}

const EQUATIONS: EquationSpec[] = [
  {
    questionId: 'q-lin-01',
    equation: '3x - 7 = 14',
    correct: ['3x - 7 = 14', '3x = 14 + 7', '3x = 21', 'x = 21 / 3', 'x = 7'],
    faulty: {
      ALG_SIGN_FLIP: ['3x - 7 = 14', '3x = 14 - 7', '3x = 7', 'x = 7 / 3'],
      ALG_VARIABLE_DROPPED: ['3x - 7 = 14', '3x = 14 + 7', '3 = 21', 'x = 21 / 3'],
    },
  },
  {
    questionId: 'q-lin-02',
    equation: '5(x + 2) = 35',
    correct: ['5(x + 2) = 35', 'x + 2 = 35 / 5', 'x + 2 = 7', 'x = 7 - 2', 'x = 5'],
    faulty: {
      ALG_INVALID_DISTRIB: ['5(x + 2) = 35', '5x + 2 = 35', '5x = 33', 'x = 33 / 5'],
    },
  },
  {
    questionId: 'q-lin-03',
    equation: '2x + 9 = 4x - 3',
    correct: ['2x + 9 = 4x - 3', '2x - 4x = -3 - 9', '-2x = -12', 'x = -12 / -2', 'x = 6'],
    faulty: {
      ALG_PRECEDENCE_VIOLATION: ['2x + 9 = 4x - 3', '2x - 4x = -3 + 9', '-2x = 6', 'x = -3'],
    },
  },
];

function buildWorkingSteps(questionIndex: number, misconceptionCode?: string) {
  const question = EQUATIONS[questionIndex % EQUATIONS.length];
  const trace = (misconceptionCode && question.faulty[misconceptionCode]) || question.correct;

  return trace.map((mathExpression, index) => ({
    stepNumber: index + 1,
    actionDescription:
      index === 0
        ? 'Copy the equation'
        : index === trace.length - 1
          ? 'State the final answer'
          : 'Apply the next algebraic operation',
    mathExpression,
  }));
}

const MISCONCEPTION_EVIDENCE: Record<string, object> = {
  ALG_SIGN_FLIP: {
    faultyStepNumber: 2,
    faultyExpression: '3x = 14 - 7',
    expectedExpression: '3x = 14 + 7',
  },
  ALG_INVALID_DISTRIB: {
    faultyStepNumber: 1,
    faultyExpression: '5x + 2 = 35',
    expectedExpression: '5x + 10 = 35',
  },
  ALG_PRECEDENCE_VIOLATION: {
    faultyStepNumber: 2,
    faultyExpression: '2x - 4x = -3 + 9',
    expectedExpression: '2x - 4x = -3 - 9',
  },
  ALG_VARIABLE_DROPPED: {
    faultyStepNumber: 3,
    faultyExpression: '3 = 21',
    expectedExpression: '3x = 21',
  },
};

/**
 * Removes fixtures created by the earlier `demo-*` seeding revision so the
 * evaluator workspace has one coherent classroom. Only touches rows whose IDs
 * belong to that fixture namespace.
 */
async function removeLegacyFixtures(teacherId: string): Promise<void> {
  const legacyClassrooms = await db
    .select()
    .from(classrooms)
    .where(eq(classrooms.id, LEGACY_CLASSROOM_ID))
    .limit(1);

  if (legacyClassrooms.length === 0 || legacyClassrooms[0].teacherId !== teacherId) {
    return;
  }

  await db.delete(diagnosticMisconceptions).where(like(diagnosticMisconceptions.attemptId, 'demo-attempt-%'));
  await db.delete(diagnosticAttempts).where(like(diagnosticAttempts.id, 'demo-attempt-%'));
  await db.delete(assignmentSubmissions).where(like(assignmentSubmissions.assignmentId, 'demo-assignment-%'));
  await db.delete(assignmentQuestions).where(like(assignmentQuestions.assignmentId, 'demo-assignment-%'));
  await db.delete(assignments).where(like(assignments.id, 'demo-assignment-%'));
  await db.delete(classroomMemberships).where(eq(classroomMemberships.classroomId, LEGACY_CLASSROOM_ID));
  await db.delete(classrooms).where(eq(classrooms.id, LEGACY_CLASSROOM_ID));
}

/**
 * Resolves the demo teacher account by username. Reuses an existing row (and its
 * password) when present, otherwise creates the account with the fixture ID.
 */
async function resolveDemoTeacher(): Promise<string> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.usernameNormalized, DEMO_TEACHER_USERNAME))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].role !== 'teacher') {
      throw new Error('The demo teacher username is already used by a non-teacher account.');
    }
    return existing[0].id;
  }

  await db.insert(users).values({
    id: DEMO_TEACHER_ID,
    username: DEMO_TEACHER_USERNAME,
    usernameNormalized: DEMO_TEACHER_USERNAME,
    email: 'chinedu.okafor@mindtrace.demo',
    passwordHash: await hashPassword('teacher123'),
    role: 'teacher',
    mustChangePassword: false,
    onboardingMethod: 'independent',
    accountStatus: 'active',
  });

  return DEMO_TEACHER_ID;
}

/**
 * Seeds the demo teacher's classroom, roster, assignments, submissions and
 * diagnostic attempts. Never runs in production.
 */
export async function seedDemoTeacherData(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production.');
  }

  const passwordHash = await hashPassword(STUDENT_PASSWORD);
  const teacherId = await resolveDemoTeacher();

  await removeLegacyFixtures(teacherId);

  // 1. Teacher profile (approved, never touches password or real profile data).
  await db
    .insert(teacherProfiles)
    .values({
      id: teacherId,
      fullName: 'Mr. Chinedu Okafor',
      schoolName: 'Government Secondary School, Wuse',
      verificationStatus: 'approved',
      approvedAt: daysAgo(30),
    })
    .onConflictDoUpdate({
      target: teacherProfiles.id,
      set: {
        fullName: 'Mr. Chinedu Okafor',
        schoolName: 'Government Secondary School, Wuse',
        verificationStatus: 'approved',
        approvedAt: daysAgo(30),
        rejectionReason: null,
      },
    });

  // 2. Classroom.
  await db
    .insert(classrooms)
    .values({
      id: DEMO_CLASSROOM_ID,
      teacherId,
      name: 'SS2 Gold — Algebra & Graphs',
      gradeLevel: 'SS2',
      subject: 'Mathematics',
      status: 'active',
      enrollmentMethod: 'invite_code',
      description: 'WAEC-aligned algebra diagnostic group for the 2026 cohort.',
      inviteCode: 'CHD4AL',
    })
    .onConflictDoUpdate({
      target: classrooms.id,
      set: {
        teacherId,
        name: 'SS2 Gold — Algebra & Graphs',
        gradeLevel: 'SS2',
        subject: 'Mathematics',
        status: 'active',
        description: 'WAEC-aligned algebra diagnostic group for the 2026 cohort.',
        inviteCode: 'CHD4AL',
      },
    });

  // 3. Clear previously seeded academic rows (namespaced only).
  await db.delete(diagnosticMisconceptions).where(like(diagnosticMisconceptions.id, 'seed-chinedu-%'));
  await db.delete(assignmentSubmissions).where(like(assignmentSubmissions.id, 'seed-chinedu-%'));
  await db.delete(diagnosticAttempts).where(like(diagnosticAttempts.id, 'seed-chinedu-%'));
  await db.delete(assignmentQuestions).where(like(assignmentQuestions.id, 'seed-chinedu-%'));
  await db.delete(assignments).where(like(assignments.id, 'seed-chinedu-%'));
  await db.delete(classroomMemberships).where(eq(classroomMemberships.classroomId, DEMO_CLASSROOM_ID));

  // 4. Students + profiles + memberships.
  for (const student of STUDENTS) {
    const [firstName, ...rest] = student.name.split(' ');
    const lastName = rest.join(' ');
    const avatarSeed = `${firstName[0]}${lastName[0] || ''}`.toUpperCase();

    // Reuse an existing account with this username so the seed stays idempotent
    // even if the roster was created by an earlier revision.
    const existingStudent = await db
      .select()
      .from(users)
      .where(eq(users.usernameNormalized, student.username))
      .limit(1);

    let studentId = student.id;
    if (existingStudent.length > 0) {
      studentId = existingStudent[0].id;
    } else {
      await db.insert(users).values({
        id: studentId,
        username: student.username,
        usernameNormalized: student.username,
        passwordHash,
        role: 'student',
        mustChangePassword: false,
        createdByTeacherId: student.existingUser ? null : teacherId,
        onboardingMethod: student.existingUser ? 'independent' : 'school_managed',
        accountStatus: 'active',
      });
    }

    await db
      .insert(studentProfiles)
      .values({
        id: studentId,
        fullName: student.name,
        firstName,
        lastName,
        avatarSeed,
        gradeLevel: 'SS2',
        targetExam: 'WAEC',
        schoolName: 'Government Secondary School, Wuse',
        totalXp: student.xp,
        streakDays: student.streak,
        lastActiveDate: daysAgo(student.activeDaysAgo, 18),
        masteryPercentage: student.mastery,
        dailyGoalTarget: 3,
        dailyGoalCompleted: Math.min(3, student.streak),
      })
      .onConflictDoUpdate({
        target: studentProfiles.id,
        set: {
          fullName: student.name,
          firstName,
          lastName,
          avatarSeed,
          gradeLevel: 'SS2',
          schoolName: 'Government Secondary School, Wuse',
          totalXp: student.xp,
          streakDays: student.streak,
          lastActiveDate: daysAgo(student.activeDaysAgo, 18),
          masteryPercentage: student.mastery,
        },
      });

    await db.insert(classroomMemberships).values({
      id: `seed-chinedu-member-${studentId}`,
      classroomId: DEMO_CLASSROOM_ID,
      studentId,
      status: 'active',
      joinedAt: daysAgo(20),
    });

    // Track the resolved ID for the activity fixtures below.
    student.resolvedId = studentId;
  }

  // 5. Assignments + questions.
  await db.insert(assignments).values([
    {
      id: ASSIGNMENT_PUBLISHED,
      classroomId: DEMO_CLASSROOM_ID,
      teacherId,
      title: 'Linear Equations — Step-by-Step Isolation',
      instructions:
        'Show every working step. Isolate the variable and check your answer by substitution.',
      subject: 'Mathematics',
      gradeLevel: 'SS2',
      published: true,
      dueDate: daysAgo(-2, 23),
      latePolicy: { allowLate: true, penaltyPercent: 10 },
      retakePolicy: { allowRetakes: true, maxAttempts: 3 },
      createdAt: daysAgo(9),
    },
    {
      id: ASSIGNMENT_DRAFT,
      classroomId: DEMO_CLASSROOM_ID,
      teacherId,
      title: 'Graphing Linear Equations — Gradient & Intercepts',
      instructions: 'Plot each line and label the gradient and both intercepts.',
      subject: 'Mathematics',
      gradeLevel: 'SS2',
      published: false,
      dueDate: daysAgo(-9, 23),
      createdAt: daysAgo(2),
    },
  ]);

  await db.insert(assignmentQuestions).values([
    { id: 'seed-chinedu-q-01', assignmentId: ASSIGNMENT_PUBLISHED, questionId: 'q-lin-01', displayOrder: 1, marks: 10 },
    { id: 'seed-chinedu-q-02', assignmentId: ASSIGNMENT_PUBLISHED, questionId: 'q-lin-02', displayOrder: 2, marks: 10 },
    { id: 'seed-chinedu-q-03', assignmentId: ASSIGNMENT_PUBLISHED, questionId: 'q-lin-03', displayOrder: 3, marks: 10 },
    { id: 'seed-chinedu-q-04', assignmentId: ASSIGNMENT_DRAFT, questionId: 'q-graph-01', displayOrder: 1, marks: 10 },
  ]);

  // 6. Diagnostic attempts, submissions and misconceptions.
  const submissionDays = [6, 5, 4, 3, 2, 1, 2, 1];
  let submissionIndex = 0;

  for (const student of STUDENTS) {
    const studentId = student.resolvedId || student.id;

    for (let attemptNumber = 1; attemptNumber <= student.attempts; attemptNumber += 1) {
      const attemptId = `seed-chinedu-att-${studentId}-${attemptNumber}`;
      const isFirstAttempt = attemptNumber === 1;
      const primaryMisconception =
        isFirstAttempt && student.misconceptions.length > 0 ? student.misconceptions[0] : null;

      // Match the diagnostic question to the misconception so the working trace
      // and the detected pattern tell the same story.
      let questionIndex = (attemptNumber - 1) % EQUATIONS.length;
      if (primaryMisconception === 'ALG_INVALID_DISTRIB') questionIndex = 1;
      if (primaryMisconception === 'ALG_PRECEDENCE_VIOLATION') questionIndex = 2;
      const question = EQUATIONS[questionIndex];

      const submittedDay = student.submits && isFirstAttempt ? submissionDays[submissionIndex] : null;
      const timestamp = daysAgo(submittedDay ?? student.activeDaysAgo, 10 + attemptNumber);

      const correct = student.misconceptions.length === 0 && (isFirstAttempt ? student.score >= 18 : true);
      const workingSteps = buildWorkingSteps(questionIndex, primaryMisconception || undefined);
      const finalStep = workingSteps[workingSteps.length - 1].mathExpression;
      const finalAnswer = finalStep.includes('x =') ? finalStep : correct ? 'x = 7' : 'x = 4';

      await db.insert(diagnosticAttempts).values({
        id: attemptId,
        studentId,
        questionId: question.questionId,
        questionVersion: 1,
        engineVersion: '1.2',
        equation: question.equation,
        workingSteps,
        finalAnswer,
        payloadHash: computeSHA256(`${attemptId}:${question.equation}:${workingSteps.length}`),
        serverIsCorrect: correct,
        serverPrimaryMisconception: primaryMisconception,
        validationStatus: 'VALIDATED',
        clientTimestamp: timestamp,
        serverTimestamp: timestamp,
      });

      if (isFirstAttempt && student.misconceptions.length > 0) {
        for (const code of student.misconceptions) {
          await db.insert(diagnosticMisconceptions).values({
            id: `seed-chinedu-mis-${studentId}-${code}`,
            attemptId,
            misconceptionCode: code,
            confidenceScore: 90 + ((student.xp + code.length) % 10),
            supportingEvidence: MISCONCEPTION_EVIDENCE[code] || {},
            createdAt: timestamp,
          });
        }
      }

      if (isFirstAttempt && student.submits && submittedDay !== null) {
        await db.insert(assignmentSubmissions).values({
          id: `seed-chinedu-sub-${studentId}-1`,
          assignmentId: ASSIGNMENT_PUBLISHED,
          studentId,
          diagnosticAttemptId: attemptId,
          status: 'submitted',
          score: student.score,
          totalMarks: 30,
          xpEarned: student.score * 2,
          submittedAt: timestamp,
          isLate: false,
          attemptNumber: 1,
        });
        submissionIndex += 1;
      }
    }
  }

  const counts = {
    students: STUDENTS.length,
    submitted: STUDENTS.filter((s) => s.submits).length,
    attempts: STUDENTS.reduce((sum, s) => sum + s.attempts, 0),
    misconceptions: STUDENTS.reduce((sum, s) => sum + s.misconceptions.length, 0),
  };

  console.log('Demo teacher data seeded.');
  console.log(`  Teacher:   ${teacherId} (${DEMO_TEACHER_USERNAME} / teacher123)`);
  console.log(`  Classroom: ${DEMO_CLASSROOM_ID} (invite code CHD4AL)`);
  console.log(`  Students:  ${counts.students} (${counts.submitted} submitted)`);
  console.log(`  Attempts:  ${counts.attempts}`);
  console.log(`  Misconceptions: ${counts.misconceptions}`);
  console.log(`  Student login example: aminat_diallo / ${STUDENT_PASSWORD}`);
}
