import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Clock,
  AlertCircle,
  ChevronRight,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface AssignmentManagerProps {
  classroomId: string;
  onViewSubmissions: (assignmentId: string) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  classroomId,
  onViewSubmissions
}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    const res = await apiRequest(`/api/teacher/classrooms/${classroomId}/assignments`);
    if (res.ok && res.data?.assignments) {
      setAssignments(res.data.assignments);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const res = await apiRequest(`/api/teacher/classrooms/${classroomId}/assignments`, {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        instructions: instructions.trim(),
        dueDate,
        gradeLevel: 'SS2', // Defaulting for now
        subject: 'Mathematics',
        questions: [
          { questionId: 'q-lin-01', displayOrder: 1, marks: 10 },
          { questionId: 'q-lin-02', displayOrder: 2, marks: 10 },
          { questionId: 'q-lin-03', displayOrder: 3, marks: 10 },
        ]
      }),
    });

    setIsSubmitting(false);
    if (res.ok) {
      setShowCreateModal(false);
      setTitle('');
      setInstructions('');
      setDueDate('');
      fetchAssignments();
    }
  };

  const handlePublish = async (id: string) => {
    const res = await apiRequest(`/api/teacher/assignments/${id}/publish`, {
      method: 'PATCH',
    });
    if (res.ok) {
      fetchAssignments();
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <Clock className="w-8 h-8 text-[#2563EB] animate-pulse" aria-hidden="true" />
        <span className="text-[13px] text-[#475569] font-medium">Loading assignments…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
          <span>Active assignments</span>
        </h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New assignment</span>
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="p-10 sm:p-12 text-center rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center mx-auto text-[#94A3B8]">
            <FileText className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-[15px] text-[#0F172A] font-semibold">No assignments yet</p>
            <p className="text-[13px] text-[#475569] max-w-sm mx-auto">
              Create your first diagnostic assignment to start tracking student mastery.
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-secondary">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Create assignment</span>
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="card-modern p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[#0F172A] text-[14px]">{assignment.title}</h3>
                  <span className={`badge ${assignment.published ? 'badge-mastery' : 'badge-diagnostic'}`}>
                    {assignment.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}
                  </span>
                  <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
                  <span>{assignment.subject}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {!assignment.published && (
                  <button onClick={() => handlePublish(assignment.id)} className="btn-secondary min-h-[36px] px-3 text-[12px]">
                    Publish now
                  </button>
                )}
                <button
                  onClick={() => onViewSubmissions(assignment.id)}
                  className="btn-primary min-h-[36px] px-3 text-[12px]"
                >
                  <span>View submissions</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create Assignment Modal */}
      {showCreateForm && (
        <div
          className="modal-backdrop animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-assignment-title"
        >
          <form onSubmit={handleCreateAssignment} className="modal-surface max-w-lg p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="create-assignment-title" className="section-title">
                  Create assignment
                </h3>
                <p className="text-[13px] text-[#475569] mt-0.5">
                  Assign curriculum questions to your students.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create assignment dialog"
                className="icon-btn shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto">
              <div>
                <label htmlFor="assignment-title" className="label-modern">
                  Assignment title
                </label>
                <input
                  id="assignment-title"
                  type="text"
                  required
                  placeholder="e.g. Weekly quiz: Linear Equations I"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div>
                <label htmlFor="assignment-instructions" className="label-modern">
                  Instructions (optional)
                </label>
                <textarea
                  id="assignment-instructions"
                  placeholder="Explain line-by-line working requirements…"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="input-modern min-h-[96px] resize-none py-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignment-due-date" className="label-modern">
                    Due date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="assignment-due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="input-modern pl-10"
                    />
                  </div>
                </div>
                <div>
                  <span className="label-modern">Target grade</span>
                  <div className="px-3.5 py-2.5 min-h-[44px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13px] text-[#475569] font-semibold flex items-center">
                    SS2 (Nigeria)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#4F46E5] shrink-0" aria-hidden="true" />
                <p className="text-[12px] text-[#4338CA] leading-relaxed">
                  Defaulting to{' '}
                  <span className="font-semibold text-[#312E81]">WAEC-aligned linear equations</span>{' '}
                  question set. Advanced question selection arrives in the next release.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Creating…' : 'Create assignment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
