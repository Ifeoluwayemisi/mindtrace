import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool, neonConfig } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import ws from 'ws';
import dotenv from 'dotenv';
import * as pgSchema from './schema';
import * as sqliteSchema from './schema.sqlite';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || '';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!connectionString || connectionString.includes('example.neon.tech'))) {
  throw new Error('FATAL: DATABASE_URL environment variable is required in production for Neon PostgreSQL.');
}

const isPlaceholderDb = !isProduction;

export const pool = isPlaceholderDb ? null : new Pool({ connectionString });

// Helper function to test basic database connectivity
export async function checkDatabaseConnection(): Promise<{ ok: boolean; error?: string }> {
  if (isPlaceholderDb) {
    return { ok: true };
  }
  try {
    const client = await pool!.connect();
    await client.query('SELECT 1');
    client.release();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to connect to Neon PostgreSQL pool.' };
  }
}

// Initialize SQLite database instance for zero-bandwidth development
const sqlite = new Database('./mindtrace_dev.db');

// Execute DDL statement
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    username_normalized TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    must_change_password INTEGER NOT NULL DEFAULT 0,
    created_by_teacher_id TEXT,
    onboarding_method TEXT NOT NULL DEFAULT 'independent',
    account_status TEXT NOT NULL DEFAULT 'active',
    password_changed_at TEXT,
    temp_password_expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teacher_verifications (
    id TEXT PRIMARY KEY,
    school_name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    is_redeemed INTEGER NOT NULL DEFAULT 0,
    redeemed_by_teacher_id TEXT,
    created_by_admin_id TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS student_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    other_name TEXT,
    avatar_seed TEXT NOT NULL DEFAULT 'AD',
    grade_level TEXT NOT NULL DEFAULT 'SS2',
    target_exam TEXT NOT NULL DEFAULT 'WAEC',
    school_name TEXT,
    timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
    audio_support INTEGER NOT NULL DEFAULT 0,
    preferred_presentation TEXT NOT NULL DEFAULT '["visual","interactive"]',
    total_xp INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    mastery_percentage INTEGER,
    daily_goal_target INTEGER NOT NULL DEFAULT 3,
    daily_goal_completed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teacher_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    school_name TEXT NOT NULL,
    verification_id TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending',
    approved_by_admin_id TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL DEFAULT 'SS2',
    invite_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classroom_memberships (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT,
    subject TEXT NOT NULL DEFAULT 'Mathematics',
    grade_level TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    late_policy TEXT,
    retake_policy TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assignment_questions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    diagnostic_attempt_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    score INTEGER NOT NULL DEFAULT 0,
    total_marks INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_late INTEGER NOT NULL DEFAULT 0,
    attempt_number INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS diagnostic_attempts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question_version INTEGER NOT NULL DEFAULT 1,
    engine_version TEXT NOT NULL DEFAULT '1.2',
    equation TEXT NOT NULL,
    working_steps TEXT NOT NULL,
    final_answer TEXT,
    payload_hash TEXT NOT NULL,
    server_is_correct INTEGER,
    server_primary_misconception TEXT,
    validation_status TEXT NOT NULL DEFAULT 'PROVISIONAL',
    client_timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    server_timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS diagnostic_misconceptions (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL,
    misconception_code TEXT NOT NULL,
    confidence_score INTEGER NOT NULL DEFAULT 100,
    supporting_evidence TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reward_transactions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    reference_id TEXT NOT NULL UNIQUE,
    points_awarded INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    sid TEXT PRIMARY KEY NOT NULL,
    sess TEXT NOT NULL,
    expire TEXT NOT NULL
  );
`);

// Safe incremental column additions for pre-existing sqlite files
const alterStatements = [
  'ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;',
  'ALTER TABLE users ADD COLUMN created_by_teacher_id TEXT;',
  'ALTER TABLE users ADD COLUMN onboarding_method TEXT NOT NULL DEFAULT "independent";',
  'ALTER TABLE users ADD COLUMN account_status TEXT NOT NULL DEFAULT "active";',
  'ALTER TABLE users ADD COLUMN password_changed_at TEXT;',
  'ALTER TABLE users ADD COLUMN temp_password_expires_at TEXT;',
  'ALTER TABLE teacher_verifications ADD COLUMN created_by_admin_id TEXT;',
  'ALTER TABLE student_profiles ADD COLUMN first_name TEXT;',
  'ALTER TABLE student_profiles ADD COLUMN last_name TEXT;',
  'ALTER TABLE student_profiles ADD COLUMN other_name TEXT;',
  'ALTER TABLE teacher_profiles ADD COLUMN verification_status TEXT NOT NULL DEFAULT "pending";',
  'ALTER TABLE teacher_profiles ADD COLUMN approved_by_admin_id TEXT;',
  'ALTER TABLE teacher_profiles ADD COLUMN approved_at TEXT;',
  'ALTER TABLE teacher_profiles ADD COLUMN rejection_reason TEXT;',
  'ALTER TABLE classrooms ADD COLUMN subject TEXT NOT NULL DEFAULT "Mathematics";',
  'ALTER TABLE classrooms ADD COLUMN status TEXT NOT NULL DEFAULT "active";',
  'ALTER TABLE classrooms ADD COLUMN enrollment_method TEXT NOT NULL DEFAULT "invite_code";',
  'ALTER TABLE classrooms ADD COLUMN description TEXT;',
  'ALTER TABLE classroom_memberships ADD COLUMN status TEXT NOT NULL DEFAULT "active";',
];

for (const stmt of alterStatements) {
  try {
    sqlite.exec(stmt);
  } catch {
    // Column already exists
  }
}

export const db: any = isPlaceholderDb
  ? drizzleSqlite(sqlite, { schema: sqliteSchema })
  : drizzleNeon(pool!, { schema: pgSchema });

export const users = isPlaceholderDb ? sqliteSchema.users : (pgSchema.users as any);
export const teacherVerifications = isPlaceholderDb ? sqliteSchema.teacherVerifications : (pgSchema.teacherVerifications as any);
export const studentProfiles = isPlaceholderDb ? sqliteSchema.studentProfiles : (pgSchema.studentProfiles as any);
export const teacherProfiles = isPlaceholderDb ? sqliteSchema.teacherProfiles : (pgSchema.teacherProfiles as any);
export const classrooms = isPlaceholderDb ? sqliteSchema.classrooms : (pgSchema.classrooms as any);
export const classroomMemberships = isPlaceholderDb ? sqliteSchema.classroomMemberships : (pgSchema.classroomMemberships as any);
export const assignments = isPlaceholderDb ? sqliteSchema.assignments : (pgSchema.assignments as any);
export const assignmentQuestions = isPlaceholderDb ? sqliteSchema.assignmentQuestions : (pgSchema.assignmentQuestions as any);
export const assignmentSubmissions = isPlaceholderDb ? sqliteSchema.assignmentSubmissions : (pgSchema.assignmentSubmissions as any);
export const diagnosticAttempts = isPlaceholderDb ? sqliteSchema.diagnosticAttempts : (pgSchema.diagnosticAttempts as any);
export const diagnosticMisconceptions = isPlaceholderDb ? sqliteSchema.diagnosticMisconceptions : (pgSchema.diagnosticMisconceptions as any);
export const rewardTransactions = isPlaceholderDb ? sqliteSchema.rewardTransactions : (pgSchema.rewardTransactions as any);
export const userSessions = isPlaceholderDb ? sqliteSchema.userSessions : (pgSchema.userSessions as any);
