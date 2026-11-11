import React, { useState, useEffect } from 'react';
import {
  Plus,
  Copy,
  RefreshCw,
  Archive,
  UserPlus,
  Trash2,
  X,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { getInitials } from '../../utils/avatar';

interface ClassroomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomManagerModal: React.FC<ClassroomManagerModalProps> = ({ isOpen, onClose }) => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Classroom Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('SS2');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newDescription, setNewDescription] = useState('');

  // Onboard Student Form state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardName, setOnboardName] = useState('');
  const [onboardUsername, setOnboardUsername] = useState('');
  const [onboardGrade, setOnboardGrade] = useState('SS2');
  const [onboardResult, setOnboardResult] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClassrooms = async () => {
    setLoading(true);
    const res = await apiRequest('/api/teacher/classrooms');
    if (res.ok && res.data?.classrooms) {
      setClassrooms(res.data.classrooms);
      if (res.data.classrooms.length > 0 && !selectedClass) {
        selectClassroom(res.data.classrooms[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchClassrooms();
    }
  }, [isOpen]);

  const selectClassroom = async (cls: any) => {
    setSelectedClass(cls);
    setLoadingRoster(true);
    const res = await apiRequest(`/api/teacher/classrooms/${cls.id}`);
    if (res.ok && res.data?.success) {
      setRoster(res.data.roster || []);
    }
    setLoadingRoster(false);
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const res = await apiRequest('/api/teacher/classrooms', {
      method: 'POST',
      body: JSON.stringify({
        name: newClassName.trim(),
        gradeLevel: newGradeLevel,
        subject: newSubject,
        description: newDescription.trim(),
      }),
    });

    if (res.ok && res.data?.success) {
      showToast('Classroom created successfully!');
      setShowCreateModal(false);
      setNewClassName('');
      setNewDescription('');
      fetchClassrooms();
    } else {
      showToast(res.message || 'Failed to create classroom.');
    }
  };

  const handleRegenerateCode = async (classId: string) => {
    const res = await apiRequest(`/api/teacher/classrooms/${classId}/regenerate-code`, {
      method: 'POST',
    });
    if (res.ok && res.data?.success) {
      showToast('Invite code regenerated!');
      fetchClassrooms();
      if (selectedClass?.id === classId) {
        setSelectedClass({ ...selectedClass, inviteCode: res.data.inviteCode });
      }
    } else {
      showToast(res.message || 'Failed to regenerate code.');
    }
  };

  const handleArchiveClassroom = async (classId: string) => {
    if (!confirm('Are you sure you want to archive this classroom?')) return;
    const res = await apiRequest(`/api/teacher/classrooms/${classId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      showToast('Classroom archived.');
      fetchClassrooms();
      setSelectedClass(null);
    } else {
      showToast(res.message || 'Failed to archive classroom.');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass || !confirm('Remove student from this classroom?')) return;
    const res = await apiRequest(`/api/teacher/classrooms/${selectedClass.id}/students/${studentId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      showToast('Student removed from classroom.');
      selectClassroom(selectedClass);
    } else {
      showToast(res.message || 'Failed to remove student.');
    }
  };

  const handleOnboardStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName.trim() || !onboardUsername.trim()) return;

    const res = await apiRequest('/api/teacher/students/onboard', {
      method: 'POST',
      body: JSON.stringify({
        fullName: onboardName.trim(),
        username: onboardUsername.trim(),
        gradeLevel: onboardGrade,
        classroomId: selectedClass?.id,
      }),
    });

    if (res.ok && res.data?.success) {
      setOnboardResult(res.data.student);
      showToast('Student successfully onboarded with temporary password!');
      if (selectedClass) selectClassroom(selectedClass);
    } else {
      showToast(res.message || 'Failed to onboard student.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="classroom-manager-title"
    >
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-[80] px-4 py-3 rounded-xl bg-white border border-[#A7F3D0] shadow-lg text-[13px] font-semibold text-[#065F46] flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}

      <div className="modal-surface max-w-4xl">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="classroom-manager-title" className="section-title">
                Classroom management
              </h2>
              <p className="text-[13px] text-[#475569]">
                Create classes, manage invite codes and onboard students.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowCreateModal(true)} className="btn-primary min-h-[40px] px-3">
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">New classroom</span>
            </button>
            <button onClick={onClose} aria-label="Close classroom manager" className="icon-btn">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Classrooms list */}
          <section className="space-y-3" aria-labelledby="your-classrooms-heading">
            <h3 id="your-classrooms-heading" className="eyebrow">
              Your classrooms
            </h3>
            {loading ? (
              <p className="text-[13px] text-[#64748B] py-6 text-center">Loading classrooms…</p>
            ) : classrooms.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-3">
                <p className="text-[13px] text-[#475569]">No classrooms created yet.</p>
                <button onClick={() => setShowCreateModal(true)} className="btn-secondary min-h-[36px] px-3 text-[12px]">
                  Create first classroom
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {classrooms.map((cls) => {
                  const active = selectedClass?.id === cls.id;
                  return (
                    <li key={cls.id}>
                      <button
                        onClick={() => selectClassroom(cls)}
                        aria-pressed={active}
                        className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                          active
                            ? 'bg-[#EFF6FF] border-[#2563EB]'
                            : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#0F172A] text-[13px] truncate">{cls.name}</span>
                          <span className="badge badge-neutral">{cls.gradeLevel}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#475569]">
                          <span className="truncate">{cls.subject || 'Mathematics'}</span>
                          <span className="font-mono text-[#1D4ED8] font-semibold whitespace-nowrap">
                            {cls.inviteCode}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Selected classroom */}
          <div className="md:col-span-2 space-y-4">
            {selectedClass ? (
              <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 sm:p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-[#0F172A] truncate">{selectedClass.name}</h3>
                    <p className="text-[12px] text-[#475569] mt-0.5">
                      {selectedClass.subject} · Grade {selectedClass.gradeLevel} · Invite code:{' '}
                      <span className="font-mono font-semibold text-[#1D4ED8]">{selectedClass.inviteCode}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClass.inviteCode);
                        showToast('Invite code copied to clipboard!');
                      }}
                      className="btn-secondary min-h-[34px] px-3 text-[12px]"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
                      <span>Copy code</span>
                    </button>
                    <button
                      onClick={() => handleRegenerateCode(selectedClass.id)}
                      className="icon-btn w-9 h-9"
                      title="Generate new invite code"
                      aria-label="Generate new invite code"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setShowOnboardModal(true)}
                      className="btn-primary min-h-[34px] px-3 text-[12px]"
                    >
                      <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Onboard student</span>
                    </button>
                    <button
                      onClick={() => handleArchiveClassroom(selectedClass.id)}
                      className="icon-btn w-9 h-9 text-[#B91C1C] border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#991B1B]"
                      title="Archive classroom"
                      aria-label="Archive classroom"
                    >
                      <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Roster */}
                <div className="space-y-2">
                  <h4 className="eyebrow">
                    Enrolled roster ({roster.length})
                  </h4>
                  {loadingRoster ? (
                    <p className="text-[13px] text-[#64748B] py-4 text-center">Loading roster…</p>
                  ) : roster.length === 0 ? (
                    <div className="p-5 text-center text-[12px] text-[#475569] bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      No students enrolled yet. Share invite code{' '}
                      <span className="font-mono text-[#1D4ED8] font-semibold">{selectedClass.inviteCode}</span>{' '}
                      with your students or use Onboard student.
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#F1F5F9] max-h-64 overflow-y-auto">
                      {roster.map((st) => (
                        <li key={st.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-semibold flex items-center justify-center text-[10px] shrink-0">
                              {getInitials(st.fullName)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#0F172A] block text-[12px] truncate">
                                {st.fullName}
                              </span>
                              <span className="text-[11px] text-[#64748B]">
                                XP: {st.totalXp || 0} · Streak: {st.streakDays || 0}d
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(st.id)}
                            className="p-2 rounded-lg text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors shrink-0"
                            title="Remove student"
                            aria-label={`Remove ${st.fullName} from classroom`}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] flex flex-col items-center justify-center space-y-2">
                <BookOpen className="w-7 h-7 text-[#94A3B8]" aria-hidden="true" />
                <p className="text-[13px] text-[#475569] max-w-xs">
                  Select a classroom on the left to inspect its roster and manage invite codes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="modal-backdrop z-[70]" role="dialog" aria-modal="true" aria-labelledby="new-classroom-title">
          <form onSubmit={handleCreateClassroom} className="modal-surface max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 id="new-classroom-title" className="section-title">
                Create new classroom
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create classroom dialog"
                className="icon-btn w-9 h-9 shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="new-class-name" className="label-modern">
                  Classroom name
                </label>
                <input
                  id="new-class-name"
                  type="text"
                  required
                  placeholder="e.g. SS2 Science A — Mathematics"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="input-modern"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-class-grade" className="label-modern">
                    Grade level
                  </label>
                  <select
                    id="new-class-grade"
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="input-modern font-semibold cursor-pointer"
                  >
                    <option value="SS1">SS1</option>
                    <option value="SS2">SS2</option>
                    <option value="SS3">SS3</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="new-class-subject" className="label-modern">
                    Subject
                  </label>
                  <input
                    id="new-class-subject"
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="input-modern"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="new-class-description" className="label-modern">
                  Description (optional)
                </label>
                <input
                  id="new-class-description"
                  type="text"
                  placeholder="e.g. Preparing for WAEC 2026 Mathematics Paper 1 & 2"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input-modern"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create classroom
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Onboard Student Modal */}
      {showOnboardModal && (
        <div className="modal-backdrop z-[70]" role="dialog" aria-modal="true" aria-labelledby="onboard-student-title">
          <div className="modal-surface max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 id="onboard-student-title" className="section-title">
                Onboard new student
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowOnboardModal(false);
                  setOnboardResult(null);
                }}
                aria-label="Close onboard student dialog"
                className="icon-btn w-9 h-9 shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {onboardResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[13px] text-[#047857]">
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
                    <span>Student onboarded successfully</span>
                  </div>
                  <p className="text-[12px] text-[#065F46]">
                    Provide the following temporary credentials to{' '}
                    <span className="font-semibold text-[#0F172A]">{onboardResult.fullName}</span>:
                  </p>
                  <div className="bg-white p-3 rounded-lg font-mono text-[12px] space-y-1 text-[#334155] border border-[#A7F3D0]">
                    <div>
                      Username:{' '}
                      <span className="text-[#0F172A] font-semibold">{onboardResult.username}</span>
                    </div>
                    <div>
                      Temp password:{' '}
                      <span className="text-[#92400E] font-semibold">{onboardResult.temporaryPassword}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOnboardResult(null);
                    setShowOnboardModal(false);
                  }}
                  className="btn-primary w-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardStudent} className="space-y-3">
                <div>
                  <label htmlFor="onboard-name" className="label-modern">
                    Student full name
                  </label>
                  <input
                    id="onboard-name"
                    type="text"
                    required
                    placeholder="e.g. Oluwaseun Adeleke"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label htmlFor="onboard-username" className="label-modern">
                    Username
                  </label>
                  <input
                    id="onboard-username"
                    type="text"
                    required
                    placeholder="e.g. oluwaseun_a"
                    value={onboardUsername}
                    onChange={(e) => setOnboardUsername(e.target.value)}
                    autoComplete="off"
                    className="input-modern font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="onboard-grade" className="label-modern">
                    Grade level
                  </label>
                  <select
                    id="onboard-grade"
                    value={onboardGrade}
                    onChange={(e) => setOnboardGrade(e.target.value)}
                    className="input-modern font-semibold cursor-pointer"
                  >
                    <option value="SS1">SS1</option>
                    <option value="SS2">SS2</option>
                    <option value="SS3">SS3</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowOnboardModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Generate credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
