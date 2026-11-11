# Architecture Assessment: Phase 4 Stage 5 (Real Teacher Analytics)

## 1. Existing Architecture Audit
- **Data Integrity**: The database (`pgSchema`, `sqliteSchema`) currently holds all necessary records (`classrooms`, `classroomMemberships`, `assignments`, `assignmentSubmissions`, `diagnosticAttempts`, `diagnosticMisconceptions`).
- **Authorization**: `requireApprovedTeacher` and classroom-ownership middleware are robust.
- **Diagnostics**: `diagnosticAttempts` contains `serverIsCorrect`, `serverPrimaryMisconception`.
- **Score Integrity**: `assignmentSubmissions` already contains `score` (adjusted) and `total_marks` (authoritative).

## 2. Dashboard Sections
### A. Classroom Overview
- **Metrics**: Total Students, Active Students (submitted >= 1 assignment), Published Assignments, Assignment Completion Rate (avg of assignment rates), Class Performance (Avg of students' best scores).
- **Visualization**: Simple KPI cards.

### B. Assignment Performance
- **Metrics per Assignment**: Submission Rate, Avg Score, Late Submissions, Missing Submissions.
- **List view**: Table with detailed submission status per student.

### C. Topic Mastery & Misconceptions
- **Mastery**: Avg correctness percentage per topic across the classroom.
- **Misconceptions**: Top frequent `diagnosticMisconceptions` linked to `diagnosticAttempts`.
- **Visualization**: Bar charts for topic performance, list for top misconceptions.

### D. Individual Progress
- **Metrics**: Completion History, Performance Trend (line chart), Misconception Frequency.

## 3. Metric Calculations (Authoritative)
- **Classroom Completion Rate**: `(Count of unique submitted students / Count of unique enrolled students) * 100` (for a specific assignment).
- **Student Assignment Score**: `(submission.score / submission.total_marks) * 100` (uses server-adjusted late-penalty score).
- **Retake Handling**: Metrics will use the **Highest Score** attained by the student on any attempt to calculate progress, but show **Latest Attempt** in status tables.
- **Offline Integrity**: Only `assignment_submissions` marked as successfully processed by the server are included in aggregate analytics.

## 4. API Proposals
- `GET /api/teacher/analytics/classroom/:classroomId`
- `GET /api/teacher/analytics/assignment/:assignmentId`
- `GET /api/teacher/analytics/student/:studentId`
- `GET /api/teacher/analytics/misconceptions`

*All endpoints require `requireApprovedTeacher` and `classroom_id` validation against `teacher_id`.*

## 5. Security & Performance
- **Isolation**: Every query must join `classrooms` to ensure the teacher owns the data.
- **Efficiency**: Use Drizzle ORM aggregation functions (`sum`, `avg`, `count`) rather than pulling raw rows. 
- **Pagination**: Use `limit` and `offset` for roster and submission lists.

## 6. Implementation Order
1. Aggregation services in `src/services/analyticsService.ts`.
2. Backend API routes in `src/routes/analytics.ts`.
3. Teacher Dashboard UI enhancements.

---
## Approval Checklist
- [ ] Approve metric definitions and calculation rules.
- [ ] Approve API structure.
- [ ] Approve no new database schema changes.
