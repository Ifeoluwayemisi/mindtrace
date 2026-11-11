# Architecture Assessment: Phase 4 Stage 4 (Assignments & Submissions)

## 1. Current State Audit
- **Assignments Table (`src/db/schema.ts`)**: Exists but lacks critical fields (`instructions`, `published`, `subject`, `gradeLevel`, `due_date` is present but needs `status`, `latePolicy`, `retakePolicy`).
- **Submission Tracking**: No `assignment_submissions` table exists.
- **Diagnostic Engine**: `aiReasoningService` and `edgeRuleEngine` are mature and server-authoritative.
- **Classroom Membership**: Supports student-classroom relationship.

## 2. Proposed Schema Extensions
### `assignments` (Table Update)
- Add: `instructions`, `published` (boolean), `subject` (varchar), `grade_level` (varchar), `late_policy` (json), `retake_policy` (json), `updated_at`.

### `assignment_questions` (New Table)
- Fields: `id`, `assignment_id` (FK), `question_id` (string), `display_order` (int), `marks` (int).

### `assignment_submissions` (New Table)
- Fields: `id`, `assignment_id` (FK), `student_id` (FK), `diagnostic_attempt_id` (FK), `status` ('pending' | 'submitted' | 'graded'), `score` (int), `total_marks` (int), `xp_earned` (int), `submitted_at` (timestamp), `is_late` (boolean).

## 3. Implementation Strategy
- **Idempotency**: Use `assignment_id` + `student_id` + `attempt_number` for `assignment_submissions` unique constraint to prevent duplicate XP/submissions.
- **Offline-First**: Submissions from the client will be added to the `syncQueue` if offline, then processed by the server with re-validation of `diagnostic_attempt_id` (idempotency key) against the authoritative diagnostic engine.
- **Authorization**:
    - `requireApprovedTeacher` for assignment management.
    - `requireAuth` + `Student Enrolled` check for assignment completion.
- **Diagnostic Engine Integration**: Reuse `diagnosticAttempts` record linking, ensuring that the student *cannot* modify the score. The server will re-calculate the grade based on `diagnostic_attempts` and `assignment_questions` table.

## 4. API & UI
- **Teacher API**: `teacher.ts` will house assignment CRUD.
- **Student API**: `student.ts` will handle assignment fetching and submission endpoints.
- **UI**: 
    - Teacher: Re-use classroom UI components for assignment list/creation.
    - Student: Add assignment view to student dashboard.
