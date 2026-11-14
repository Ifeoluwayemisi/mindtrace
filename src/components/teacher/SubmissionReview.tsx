import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface SubmissionReviewProps {
  assignmentId: string;
  onBack: () => void;
}

export const SubmissionReview: React.FC<SubmissionReviewProps> = ({
  assignmentId,
  onBack
}) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    // Fetch submissions using the teacher-specific endpoint to ensure ownership verification.
    const res = await apiRequest(`/api/teacher/assignments/${assignmentId}/submissions`);
    if (res.ok && res.data) {
      setSubmissions(res.data.submissions || []);
      setAssignment(res.data.assignment);
      setTotalStudents(
        typeof res.data.totalStudents === 'number' ? res.data.totalStudents : null
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <Clock className="w-8 h-8 text-[#2563EB] animate-spin" aria-hidden="true" />
        <span className="text-[13px] text-[#475569] font-medium">Loading submissions…</span>
      </div>
    );
  }

  const attempt = selectedSubmission?.attempt || null;
  let workingSteps: any[] = [];
  if (attempt) {
    const raw = attempt.workingSteps;
    if (Array.isArray(raw)) {
      workingSteps = raw;
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) workingSteps = parsed;
      } catch {
        // Leave as empty when the stored working is unreadable.
      }
    }
  }
  const misconceptions: any[] = selectedSubmission?.misconceptions || [];
  const isCorrect = attempt?.serverIsCorrect;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} aria-label="Back to assignments" className="icon-btn shrink-0">
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h2 className="page-title truncate">{assignment?.title || 'Submission review'}</h2>
          <p className="text-[11px] text-[#64748B] uppercase tracking-[0.08em] font-semibold">
            Classwide submission summary
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-modern p-5 space-y-2">
          <span className="eyebrow">Total enrolled</span>
          <div className="text-2xl font-display font-bold text-[#0F172A] tabular-nums">
            {totalStudents === null ? '--' : totalStudents}
          </div>
        </div>
        <div className="card-modern p-5 space-y-2">
          <span className="eyebrow text-[#047857]">Submitted</span>
          <div className="text-2xl font-display font-bold text-[#0F172A] tabular-nums">
            {submissions.length}
          </div>
        </div>
        <div className="card-modern p-5 space-y-2">
          <span className="eyebrow text-[#92400E]">Avg. score</span>
          <div className="text-2xl font-display font-bold text-[#0F172A] tabular-nums">
            {submissions.length > 0
              ? Math.round(submissions.reduce((acc, s) => acc + (s.score / s.totalMarks), 0) / submissions.length * 100) + '%'
              : '--'
            }
          </div>
        </div>
        <div className="card-modern p-5 space-y-2 border-[#FDE68A]">
          <span className="eyebrow text-[#92400E]">At risk</span>
          <div className="text-2xl font-display font-bold text-[#0F172A] tabular-nums">
            {submissions.filter(s => (s.score / s.totalMarks) < 0.6).length}
          </div>
        </div>
      </div>

      <section className="card-modern overflow-hidden" aria-labelledby="submissions-heading">
        <div className="p-5 border-b border-[#E2E8F0]">
          <h3 id="submissions-heading" className="section-title">
            Student submissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern min-w-[640px]">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Score</th>
                <th scope="col">Submitted</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[13px] text-[#64748B]">
                    No submissions recorded for this assignment yet.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-semibold text-[#0F172A]">
                      {sub.studentName || 'Student'}
                    </td>
                    <td className="font-mono font-semibold text-[#0F172A] tabular-nums">
                      {Math.round((sub.score / sub.totalMarks) * 100)}%
                    </td>
                    <td className="text-[#64748B]">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${sub.isLate ? 'badge-diagnostic' : 'badge-mastery'}`}>
                        {sub.isLate ? 'Late' : 'On time'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="btn-secondary min-h-[34px] px-3 text-[12px]"
                      >
                        Review work
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div
          className="modal-backdrop animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-review-title"
        >
          <div className="modal-surface max-w-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 id="work-review-title" className="section-title">
                  Student work review
                </h3>
                <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-[0.08em] mt-0.5">
                  {selectedSubmission.studentName}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                aria-label="Close work review"
                className="icon-btn shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4 overflow-y-auto">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b border-[#E2E8F0]">
                <div className="text-[11px] text-[#475569] font-semibold uppercase tracking-[0.08em]">
                  Question diagnostics
                </div>
                <span className="badge badge-ai">
                  Attempt #{selectedSubmission.attemptNumber || 1}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-[#E2E8F0]">
                  <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-[0.08em] mb-2">
                    Equation solved
                  </div>
                  <div className="font-mono text-xl font-semibold text-[#0F172A]">
                    {attempt?.equation || 'Diagnostic attempt not available'}
                  </div>
                  {attempt?.finalAnswer && (
                    <div className="mt-2 text-[12px] text-[#475569]">
                      Submitted answer:{' '}
                      <span className="font-mono font-semibold text-[#0F172A]">
                        {attempt.finalAnswer}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-[0.08em]">
                    Working steps provided
                  </div>
                  {workingSteps.length === 0 ? (
                    <p className="text-[12px] text-[#64748B]">
                      No working steps were recorded for this attempt.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {workingSteps.map((step, idx) => (
                        <div
                          key={`${step.stepNumber ?? idx}-${idx}`}
                          className="math-step math-step-completed px-3 py-2.5 flex justify-between items-center gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="math-step-badge math-step-badge-completed">
                              {step.stepNumber ?? idx + 1}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-mono text-[13px] text-[#0F172A] truncate">
                                {step.mathExpression || '—'}
                              </span>
                              {step.actionDescription && (
                                <span className="block text-[11px] text-[#64748B] truncate">
                                  {step.actionDescription}
                                </span>
                              )}
                            </span>
                          </div>
                          <CheckCircle2
                            className="w-4 h-4 text-[#059669] shrink-0"
                            aria-label="Step recorded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {misconceptions.length > 0 ? (
                  <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2">
                    <div className="flex items-center gap-2 text-[13px] text-[#92400E] font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Misconception detected</span>
                    </div>
                    <ul className="space-y-1">
                      {misconceptions.map((mis: any) => (
                        <li
                          key={mis.code}
                          className="text-[12px] text-[#92400E] flex justify-between gap-3"
                        >
                          <span className="font-mono font-semibold">{mis.code.replace(/_/g, ' ')}</span>
                          <span>Confidence: {mis.confidence}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : isCorrect === true ? (
                  <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" aria-hidden="true" />
                    <div className="text-[13px] text-[#065F46] font-semibold">
                      Correct working: no misconception detected.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#475569]">
                    This attempt was not marked correct, but no misconception pattern was matched.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-[12px] text-[#64748B] inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                Diagnostic working shown above
              </span>
              <button onClick={() => setSelectedSubmission(null)} className="btn-primary">
                Close review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
