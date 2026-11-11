import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. USERS TABLE
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull(),
    usernameNormalized: text('username_normalized').notNull(),
    email: text('email'),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull(), // 'student' | 'teacher' | 'admin'
    mustChangePassword: integer('must_change_password', { mode: 'boolean' }).default(false).notNull(),
    createdByTeacherId: text('created_by_teacher_id'),
    onboardingMethod: text('onboarding_method').default('independent').notNull(),
    accountStatus: text('account_status').default('active').notNull(),
    passwordChangedAt: text('password_changed_at'),
    tempPasswordExpiresAt: text('temp_password_expires_at'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    usernameNormIdx: uniqueIndex('idx_users_username_norm').on(table.usernameNormalized),
  })
);

// 2. TEACHER VERIFICATIONS
export const teacherVerifications = sqliteTable('teacher_verifications', {
  id: text('id').primaryKey(),
  schoolName: text('school_name').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  isRedeemed: integer('is_redeemed', { mode: 'boolean' }).default(false).notNull(),
  redeemedByTeacherId: text('redeemed_by_teacher_id'),
  createdByAdminId: text('created_by_admin_id'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 3. STUDENT PROFILES
export const studentProfiles = sqliteTable('student_profiles', {
  id: text('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  otherName: text('other_name'),
  avatarSeed: text('avatar_seed').default('AD').notNull(),
  gradeLevel: text('grade_level').default('SS2').notNull(),
  targetExam: text('target_exam').default('WAEC').notNull(),
  schoolName: text('school_name'),
  timezone: text('timezone').default('Africa/Lagos').notNull(),
  audioSupport: integer('audio_support', { mode: 'boolean' }).default(false).notNull(),
  preferredPresentation: text('preferred_presentation', { mode: 'json' })
    .default(sql`'["visual","interactive"]'`)
    .notNull(),
  totalXp: integer('total_xp').default(0).notNull(),
  streakDays: integer('streak_days').default(0).notNull(),
  lastActiveDate: text('last_active_date'),
  masteryPercentage: integer('mastery_percentage'),
  dailyGoalTarget: integer('daily_goal_target').default(3).notNull(),
  dailyGoalCompleted: integer('daily_goal_completed').default(0).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 4. TEACHER PROFILES
export const teacherProfiles = sqliteTable('teacher_profiles', {
  id: text('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  schoolName: text('school_name').notNull(),
  verificationId: text('verification_id').references(() => teacherVerifications.id),
  verificationStatus: text('verification_status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  approvedByAdminId: text('approved_by_admin_id'),
  approvedAt: text('approved_at'),
  rejectionReason: text('rejection_reason'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 5. CLASSROOMS
export const classrooms = sqliteTable('classrooms', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').notNull().references(() => teacherProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  gradeLevel: text('grade_level').notNull(),
  subject: text('subject').default('Mathematics').notNull(),
  status: text('status').default('active').notNull(),
  enrollmentMethod: text('enrollment_method').default('invite_code').notNull(),
  description: text('description'),
  inviteCode: text('invite_code').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 6. CLASSROOM MEMBERSHIPS
export const classroomMemberships = sqliteTable('classroom_memberships', {
  id: text('id').primaryKey(),
  classroomId: text('classroom_id').notNull().references(() => classrooms.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  status: text('status').default('active').notNull(),
  joinedAt: text('joined_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 7. ASSIGNMENTS
export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey(),
  classroomId: text('classroom_id').notNull().references(() => classrooms.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  topicId: text('topic_id').notNull(),
  dueDate: text('due_date'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 8. DIAGNOSTIC ATTEMPTS
export const diagnosticAttempts = sqliteTable(
  'diagnostic_attempts',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
    questionId: text('question_id').notNull(),
    questionVersion: integer('question_version').default(1).notNull(),
    engineVersion: text('engine_version').default('1.2').notNull(),
    equation: text('equation').notNull(),
    workingSteps: text('working_steps', { mode: 'json' }).notNull(),
    finalAnswer: text('final_answer'),
    payloadHash: text('payload_hash').notNull(),
    serverIsCorrect: integer('server_is_correct', { mode: 'boolean' }),
    serverPrimaryMisconception: text('server_primary_misconception'),
    validationStatus: text('validation_status').default('PROVISIONAL').notNull(),
    clientTimestamp: text('client_timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
    serverTimestamp: text('server_timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    studentIdx: index('idx_attempts_student').on(table.studentId),
  })
);

// 9. DIAGNOSTIC MISCONCEPTIONS
export const diagnosticMisconceptions = sqliteTable('diagnostic_misconceptions', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').notNull().references(() => diagnosticAttempts.id, { onDelete: 'cascade' }),
  misconceptionCode: text('misconception_code').notNull(),
  confidenceScore: integer('confidence_score').default(100).notNull(),
  supportingEvidence: text('supporting_evidence', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 10. REWARD TRANSACTIONS
export const rewardTransactions = sqliteTable(
  'reward_transactions',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
    activityType: text('activity_type').notNull(),
    referenceId: text('reference_id').notNull().unique(),
    pointsAwarded: integer('points_awarded').notNull(),
    description: text('description').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    uniqueRewardKey: uniqueIndex('idx_student_reward_unique').on(
      table.studentId,
      table.activityType,
      table.referenceId
    ),
  })
);

// 11. USER SESSIONS
export const userSessions = sqliteTable('user_sessions', {
  sid: text('sid').primaryKey(),
  sess: text('sess', { mode: 'json' }).notNull(),
  expire: text('expire').notNull(),
});
