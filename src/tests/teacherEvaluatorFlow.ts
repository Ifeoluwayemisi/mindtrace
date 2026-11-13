import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import {
  db,
  users,
  teacherProfiles,
  classrooms,
  classroomMemberships,
  assignments,
  assignmentQuestions,
  diagnosticAttempts,
} from '../db/index';
import { DEMO_CLASSROOM_ID, DEMO_TEACHER_ID, seedDemoTeacherData } from '../db/seedDemoTeacher';

async function runTeacherEvaluatorFlowTest() {
  await seedDemoTeacherData();
  await seedDemoTeacherData(); // repeat startup seeding to verify it is idempotent

  const teacher = await db.select().from(users).where(eq(users.usernameNormalized, 'chinedu_okafor')).limit(1);
  assert.equal(teacher.length, 1, 'demo teacher should exist exactly once');
  assert.equal(teacher[0].role, 'teacher');

  const profile = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, teacher[0].id)).limit(1);
  assert.equal(profile[0]?.verificationStatus, 'approved', 'demo teacher should skip approval screen');

  const ownedClass = await db.select().from(classrooms).where(eq(classrooms.id, DEMO_CLASSROOM_ID)).limit(1);
  assert.equal(ownedClass[0]?.teacherId, teacher[0].id, 'demo classroom should belong to the demo teacher');

  const roster = await db.select().from(classroomMemberships).where(eq(classroomMemberships.classroomId, DEMO_CLASSROOM_ID));
  assert.ok(roster.length >= 3, 'demo classroom should have a populated student roster');

  const demoAssignments = await db.select().from(assignments).where(eq(assignments.classroomId, DEMO_CLASSROOM_ID));
  assert.ok(demoAssignments.some((assignment) => assignment.published), 'demo teacher should have a published assignment');
  const questions = await db.select().from(assignmentQuestions).where(eq(assignmentQuestions.assignmentId, 'demo-assignment-linear-equations-2026'));
  assert.ok(questions.length >= 2, 'demo assignment should include sample questions');

  const attempts = await db.select().from(diagnosticAttempts).where(eq(diagnosticAttempts.studentId, roster[0].studentId));
  assert.ok(attempts.length > 0, 'demo roster should have diagnostic activity for evaluator review');

  const fixtureTeacher = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, DEMO_TEACHER_ID)).limit(1);
  assert.ok(fixtureTeacher.length > 0, 'seeded teacher fixture should have a profile');
  console.log('PASS: teacher/evaluator account opens an approved, populated classroom workspace');
}

runTeacherEvaluatorFlowTest().catch((error) => {
  console.error('FAIL: teacher/evaluator flow', error);
  process.exitCode = 1;
});
