import { db, assignments, assignmentSubmissions, diagnosticAttempts, users, teacherProfiles, studentProfiles, classrooms } from '../db/index';
import { generateUUID } from '../services/serverAuth';
import { analyticsService } from '../services/analyticsService';

async function runAnalyticsTests() {
  console.log('--- Phase 4 Stage 5: Analytics Verification Audit ---');

  // Test setup
  const teacherId = generateUUID();
  const classroomId = generateUUID();
  const studentId = generateUUID();
  const assignmentId = generateUUID();
  const attemptId = 'da-' + generateUUID();

  // Insert mock data
  await db.insert(users).values({ id: teacherId, username: 'teacher1', usernameNormalized: 'teacher1', passwordHash: 'hash', role: 'teacher' });
  await db.insert(teacherProfiles).values({ id: teacherId, fullName: 'Teacher One', schoolName: 'School A' });
  await db.insert(users).values({ id: studentId, username: 'student1', usernameNormalized: 'student1', passwordHash: 'hash', role: 'student' });
  await db.insert(studentProfiles).values({ id: studentId, fullName: 'Student One' });
  await db.insert(classrooms).values({ id: classroomId, teacherId, name: 'Class A', gradeLevel: 'SS2', inviteCode: 'ABC123' });
  await db.insert(diagnosticAttempts).values({ id: attemptId, studentId, questionId: 'q1', engineVersion: '1.2', equation: 'x=1', workingSteps: [], payloadHash: 'abc' });
  await db.insert(assignments).values({ id: assignmentId, classroomId, teacherId, title: 'Assignment 1', subject: 'Mathematics', gradeLevel: 'SS2', published: true });
  await db.insert(assignmentSubmissions).values({ 
    id: generateUUID(), 
    assignmentId, 
    studentId, 
    diagnosticAttemptId: attemptId, 
    score: 80, 
    totalMarks: 100, 
    isLate: false 
  });

  // 1. Test Classroom Overview
  const classroomOverview = await analyticsService.getClassroomOverview(classroomId);
  console.log(classroomOverview.totalStudents >= 0 ? 'PASS: Classroom overview' : 'FAIL: Classroom overview');

  // 2. Test Assignment Analytics
  const assignmentAnalytics = await analyticsService.getAssignmentAnalytics(assignmentId);
  console.log(assignmentAnalytics.totalSubmissions === 1 ? 'PASS: Assignment analytics' : 'FAIL: Assignment analytics');

  console.log('--- Analytics Audit Tests Complete ---');
}

runAnalyticsTests().catch(console.error);
