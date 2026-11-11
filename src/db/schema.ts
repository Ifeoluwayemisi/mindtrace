import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. USERS TABLE
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    username: varchar('username', { length: 50 }).notNull(),
    usernameNormalized: varchar('username_normalized', { length: 50 }).notNull(),
    email: varchar('email', { length: 255 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull(), // 'student' | 'teacher' | 'admin'
    mustChangePassword: boolean('must_change_password').default(false).notNull(),
    createdByTeacherId: varchar('created_by_teacher_id', { length: 36 }),
    onboardingMethod: varchar('onboarding_method', { length: 20 }).default('independent').notNull(),
    accountStatus: varchar('account_status', { length: 20 }).default('active').notNull(),
    passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }),
    tempPasswordExpiresAt: timestamp('temp_password_expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    usernameNormIdx: uniqueIndex('idx_users_username_norm').on(table.usernameNormalized),
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    roleCheck: check('chk_users_role', sql`${table.role} IN ('student', 'teacher', 'admin')`),
    accountStatusCheck: check('chk_users_status', sql`${table.accountStatus} IN ('active', 'pending_activation', 'suspended')`),
    onboardingMethodCheck: check('chk_users_onboarding', sql`${table.onboardingMethod} IN ('independent', 'school_managed')`),
  })
);

// 2. TEACHER VERIFICATIONS
export const teacherVerifications = pgTable('teacher_verifications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  schoolName: varchar('school_name', { length: 255 }).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  isRedeemed: boolean('is_redeemed').default(false).notNull(),
  redeemedByTeacherId: varchar('redeemed_by_teacher_id', { length: 36 }),
  createdByAdminId: varchar('created_by_admin_id', { length: 36 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. STUDENT PROFILES (Supports No-Data State for Mastery & Nullable School)
export const studentProfiles = pgTable(
  'student_profiles',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 100 }).notNull(),
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    otherName: varchar('other_name', { length: 50 }),
    avatarSeed: varchar('avatar_seed', { length: 255 }).default('/src/assets/images/student_avatar_female_1_1794394445859.jpg').notNull(),
    gradeLevel: varchar('grade_level', { length: 10 }).default('SS2').notNull(),
    targetExam: varchar('target_exam', { length: 20 }).default('WAEC').notNull(),
    schoolName: varchar('school_name', { length: 255 }), // Nullable: no fake default
    timezone: varchar('timezone', { length: 50 }).default('Africa/Lagos').notNull(),
    audioSupport: boolean('audio_support').default(false).notNull(),
    preferredPresentation: jsonb('preferred_presentation')
      .default(['visual', 'interactive'])
      .notNull(),

    // Authoritative Aggregate Summary Fields
    totalXp: integer('total_xp').default(0).notNull(),
    streakDays: integer('streak_days').default(0).notNull(),
    lastActiveDate: varchar('last_active_date', { length: 10 }), // Format: 'YYYY-MM-DD'
    masteryPercentage: integer('mastery_percentage'), // Nullable: supports no-data state
    dailyGoalTarget: integer('daily_goal_target').default(3).notNull(),
    dailyGoalCompleted: integer('daily_goal_completed').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    totalXpNonNegative: check('chk_student_xp_non_negative', sql`${table.totalXp} >= 0`),
    streakNonNegative: check('chk_student_streak_non_negative', sql`${table.streakDays} >= 0`),
  })
);

// 4. TEACHER PROFILES
export const teacherProfiles = pgTable(
  'teacher_profiles',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 100 }).notNull(),
    schoolName: varchar('school_name', { length: 255 }).notNull(),
    verificationId: varchar('verification_id', { length: 36 }).references(
      () => teacherVerifications.id
    ),
    verificationStatus: varchar('verification_status', { length: 20 })
      .default('pending')
      .notNull(), // 'pending' | 'approved' | 'rejected'
    approvedByAdminId: varchar('approved_by_admin_id', { length: 36 }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    designation: varchar('designation', { length: 100 }), // e.g. "Senior Mathematics Lead"
    subjects: jsonb('subjects').default(['Mathematics']).notNull(), // array of strings
    rejectionReason: varchar('rejection_reason', { length: 255 }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    verificationStatusCheck: check(
      'chk_teacher_verification_status',
      sql`${table.verificationStatus} IN ('pending', 'approved', 'rejected')`
    ),
  })
);

// 5. CLASSROOMS
export const classrooms = pgTable(
  'classrooms',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    teacherId: varchar('teacher_id', { length: 36 })
      .notNull()
      .references(() => teacherProfiles.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    gradeLevel: varchar('grade_level', { length: 10 }).notNull(),
    subject: varchar('subject', { length: 50 }).default('Mathematics').notNull(),
    status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'archived'
    enrollmentMethod: varchar('enrollment_method', { length: 20 }).default('invite_code').notNull(), // 'invite_code' | 'open'
    description: varchar('description', { length: 255 }),
    inviteCode: varchar('invite_code', { length: 10 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusCheck: check('chk_classroom_status', sql`${table.status} IN ('active', 'archived')`),
    enrollmentMethodCheck: check('chk_classroom_enrollment', sql`${table.enrollmentMethod} IN ('invite_code', 'open')`),
  })
);

// 6. CLASSROOM MEMBERSHIPS
export const classroomMemberships = pgTable(
  'classroom_memberships',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    classroomId: varchar('classroom_id', { length: 36 })
      .notNull()
      .references(() => classrooms.id, { onDelete: 'cascade' }),
    studentId: varchar('student_id', { length: 36 })
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'removed' | 'left'
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueMembership: uniqueIndex('idx_classroom_student').on(table.classroomId, table.studentId),
  })
);

// 7. ASSIGNMENTS
export const assignments = pgTable('assignments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  classroomId: varchar('classroom_id', { length: 36 })
    .notNull()
    .references(() => classrooms.id, { onDelete: 'cascade' }),
  teacherId: varchar('teacher_id', { length: 36 })
    .notNull()
    .references(() => teacherProfiles.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  instructions: text('instructions'),
  subject: varchar('subject', { length: 50 }).default('Mathematics').notNull(),
  gradeLevel: varchar('grade_level', { length: 10 }).notNull(),
  published: boolean('published').default(false).notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  latePolicy: jsonb('late_policy'), // { allowed: boolean, penalty: number }
  retakePolicy: jsonb('retake_policy'), // { allowed: boolean, attempts: number }
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. ASSIGNMENT QUESTIONS
export const assignmentQuestions = pgTable('assignment_questions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  assignmentId: varchar('assignment_id', { length: 36 })
    .notNull()
    .references(() => assignments.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 50 }).notNull(),
  displayOrder: integer('display_order').notNull(),
  marks: integer('marks').default(1).notNull(),
});

// 9. ASSIGNMENT SUBMISSIONS
export const assignmentSubmissions = pgTable(
  'assignment_submissions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    assignmentId: varchar('assignment_id', { length: 36 })
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    studentId: varchar('student_id', { length: 36 })
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'cascade' }),
    diagnosticAttemptId: varchar('diagnostic_attempt_id', { length: 36 })
      .notNull()
      .references(() => diagnosticAttempts.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).default('submitted').notNull(), // 'submitted' | 'graded'
    score: integer('score').default(0).notNull(),
    totalMarks: integer('total_marks').default(0).notNull(),
    xpEarned: integer('xp_earned').default(0).notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
    isLate: boolean('is_late').default(false).notNull(),
    attemptNumber: integer('attempt_number').default(1).notNull(),
  },
  (table) => ({
    uniqueAttempt: uniqueIndex('idx_assignment_student_attempt').on(
      table.assignmentId,
      table.studentId,
      table.attemptNumber
    ),
  })
);

// 8. DIAGNOSTIC ATTEMPTS (Supports Nullable Final Answer for Incomplete Attempts)
export const diagnosticAttempts = pgTable(
  'diagnostic_attempts',
  {
    id: varchar('id', { length: 36 }).primaryKey(), // Client-generated UUID
    studentId: varchar('student_id', { length: 36 })
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'cascade' }),
    questionId: varchar('question_id', { length: 50 }).notNull(),
    questionVersion: integer('question_version').default(1).notNull(),
    engineVersion: varchar('engine_version', { length: 20 }).default('1.2').notNull(),
    equation: varchar('equation', { length: 255 }).notNull(),
    workingSteps: jsonb('working_steps').notNull(), // Raw JSON array
    finalAnswer: varchar('final_answer', { length: 100 }), // Nullable for incomplete attempts
    payloadHash: varchar('payload_hash', { length: 64 }).notNull(), // Server-computed SHA-256

    // Server Independent Re-Validation Outcomes
    serverIsCorrect: boolean('server_is_correct'),
    serverPrimaryMisconception: varchar('server_primary_misconception', { length: 50 }),
    validationStatus: varchar('validation_status', { length: 20 })
      .default('PROVISIONAL')
      .notNull(),

    clientTimestamp: timestamp('client_timestamp', { withTimezone: true }).notNull(),
    serverTimestamp: timestamp('server_timestamp', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    studentIdx: index('idx_attempts_student').on(table.studentId),
    clientTsIdx: index('idx_attempts_client_ts').on(table.clientTimestamp),
    hashIdx: index('idx_attempts_payload_hash').on(table.payloadHash),
    validationStatusCheck: check(
      'chk_attempts_validation_status',
      sql`${table.validationStatus} IN ('PROVISIONAL', 'VALIDATED', 'REJECTED')`
    ),
  })
);

// 9. DIAGNOSTIC MISCONCEPTIONS (With Confidence Constraint 0..100)
export const diagnosticMisconceptions = pgTable(
  'diagnostic_misconceptions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    attemptId: varchar('attempt_id', { length: 36 })
      .notNull()
      .references(() => diagnosticAttempts.id, { onDelete: 'cascade' }),
    misconceptionCode: varchar('misconception_code', { length: 50 }).notNull(),
    confidenceScore: integer('confidence_score').default(100).notNull(),
    supportingEvidence: jsonb('supporting_evidence'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    confidenceCheck: check(
      'chk_misconception_confidence',
      sql`${table.confidenceScore} >= 0 AND ${table.confidenceScore} <= 100`
    ),
  })
);

// 10. REWARD TRANSACTIONS (Idempotent Ledger with Non-Negative Constraint)
export const rewardTransactions = pgTable(
  'reward_transactions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    studentId: varchar('student_id', { length: 36 })
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'cascade' }),
    activityType: varchar('activity_type', { length: 50 }).notNull(),
    referenceId: varchar('reference_id', { length: 100 }).notNull(),
    pointsAwarded: integer('points_awarded').notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueRewardKey: uniqueIndex('idx_student_reward_unique').on(
      table.studentId,
      table.activityType,
      table.referenceId
    ),
    pointsNonNegative: check('chk_reward_points_non_negative', sql`${table.pointsAwarded} >= 0`),
  })
);

// 11. CONNECT-PG-SIMPLE USER SESSIONS TABLE
// Exact structure expected by connect-pg-simple store
export const userSessions = pgTable(
  'user_sessions',
  {
    sid: varchar('sid', { length: 255 }).primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire', { precision: 6 }).notNull(),
  },
  (table) => ({
    expireIdx: index('idx_sessions_expire').on(table.expire),
  })
);
