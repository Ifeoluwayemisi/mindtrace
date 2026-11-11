import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  School,
  ArrowRight,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface StudentClassroomsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentClassroomsModal: React.FC<StudentClassroomsModalProps> = ({ isOpen, onClose }) => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEnrolledClassrooms = async () => {
    setLoading(true);
    const res = await apiRequest('/api/student/classrooms');
    if (res.ok && res.data?.classrooms) {
      setClassrooms(res.data.classrooms);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchEnrolledClassrooms();
    }
  }, [isOpen]);

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    const res = await apiRequest('/api/student/classrooms/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
    });
    setJoining(false);

    if (res.ok && res.data?.success) {
      showToast('Successfully joined classroom!');
      setInviteCode('');
      fetchEnrolledClassrooms();
    } else {
      showToast(res.message || 'Invalid or expired invite code.');
    }
  };

  const handleLeaveClassroom = async (classId: string) => {
    if (!confirm('Are you sure you want to leave this classroom?')) return;
    const res = await apiRequest(`/api/student/classrooms/${classId}/leave`, {
      method: 'DELETE',
    });
    if (res.ok) {
      showToast('Successfully left classroom.');
      fetchEnrolledClassrooms();
    } else {
      showToast(res.message || 'Failed to leave classroom.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="classrooms-title">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-[70] px-4 py-3 rounded-xl bg-white border border-[#A7F3D0] shadow-lg text-[13px] font-semibold text-[#065F46] flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}

      <div className="modal-surface max-w-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <School className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="classrooms-title" className="section-title">
                My classrooms
              </h2>
              <p className="text-[13px] text-[#475569]">
                Join a teacher's class with the invite code they shared.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close classrooms dialog"
            className="icon-btn shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Join form */}
          <form
            onSubmit={handleJoinClassroom}
            className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3"
          >
            <label htmlFor="invite-code" className="label-modern mb-0">
              Classroom invite code
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                id="invite-code"
                type="text"
                required
                placeholder="e.g. AB72XY"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase().trim())}
                autoComplete="off"
                className="input-modern input-mono w-full sm:flex-1 uppercase tracking-[0.15em] placeholder:tracking-normal placeholder:font-sans placeholder:font-normal"
              />
              <button
                type="submit"
                disabled={joining || !inviteCode.trim()}
                className="btn-primary shrink-0 sm:w-auto"
              >
                {joining ? (
                  <span>Joining…</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Join classroom</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[12px] text-[#64748B] inline-flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Codes are six characters and not case sensitive.</span>
            </p>
          </form>

          {/* Enrolled list */}
          <section aria-labelledby="enrolled-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="enrolled-heading" className="eyebrow">
                Enrolled classes
              </h3>
              {!loading && classrooms.length > 0 && (
                <span className="badge badge-neutral">{classrooms.length} joined</span>
              )}
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <p className="text-[13px] text-[#64748B]">Loading classrooms…</p>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] space-y-2">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E2E8F0] mx-auto flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#94A3B8]" aria-hidden="true" />
                </div>
                <p className="text-[14px] font-semibold text-[#0F172A]">No classrooms yet</p>
                <p className="text-[12px] text-[#475569] max-w-xs mx-auto">
                  Ask your mathematics teacher for an invite code to see class assignments here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {classrooms.map((cls) => (
                  <li
                    key={cls.id}
                    className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#0F172A] text-[14px] truncate">
                          {cls.name}
                        </span>
                        <span className="badge badge-primary">{cls.gradeLevel}</span>
                      </div>
                      <p className="text-[12px] text-[#475569]">
                        Teacher:{' '}
                        <span className="text-[#0F172A] font-semibold">{cls.teacher?.fullName}</span>
                        {cls.teacher?.schoolName ? ` · ${cls.teacher.schoolName}` : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLeaveClassroom(cls.id)}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-white hover:bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] text-[12px] font-semibold transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Leave</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
