import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Send, Clock, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { resolveAvatarSrc, getInitials } from '../../utils/avatar';

interface StudentDetailModalProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPushRemedy: (studentName: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  isOpen,
  onClose,
  onPushRemedy,
}) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      const fetchDetails = async () => {
        setLoading(true);
        const res = await apiRequest(`/api/teacher/students/${studentId}/details`);
        if (res.ok) {
          setDetails(res.data);
        }
        setLoading(false);
      };
      fetchDetails();
    }
  }, [isOpen, studentId]);

  if (!isOpen || !studentId) return null;

  if (loading) {
    return (
      <div className="modal-backdrop animate-fade-in">
        <div className="modal-surface max-w-xl items-center justify-center gap-3 p-12">
          <RefreshCw className="w-7 h-7 text-[#2563EB] animate-spin" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475569]">
            Loading student diagnostics…
          </span>
        </div>
      </div>
    );
  }

  const { student, attempts, misconceptions } = details || {};
  if (!student) return null;

  const avatarSrc = resolveAvatarSrc(student.avatarSeed);
  const safeAttempts = Array.isArray(attempts) ? attempts : [];
  const safeMisconceptions = Array.isArray(misconceptions) ? misconceptions : [];

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-surface max-w-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] p-5 sm:p-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 overflow-hidden rounded-full border border-[#E2E8F0] bg-[#F1F5F9] flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[13px] font-bold text-[#475569]">
                  {getInitials(student.fullName)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-display font-bold text-[#0F172A] truncate">
                {student.fullName}
              </h2>
              <p className="text-[12px] text-[#475569]">
                Grade {student.gradeLevel} · Last active {student.lastActiveDate || 'Never'}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close student details" className="icon-btn shrink-0">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Performance metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card-muted p-3">
              <span className="eyebrow block mb-1">Mastery</span>
              <div className="text-xl font-display font-bold text-[#0F172A] tabular-nums">
                {student.masteryPercentage ?? '--'}%
              </div>
            </div>
            <div className="card-muted p-3">
              <span className="eyebrow block mb-1">Total XP</span>
              <div className="text-xl font-display font-bold text-[#0F172A] tabular-nums">
                {student.totalXp ?? '--'}
              </div>
            </div>
            <div className="card-muted p-3">
              <span className="eyebrow block mb-1">Streak</span>
              <div className="text-xl font-display font-bold text-[#0F172A] tabular-nums">
                {student.streakDays ?? 0}d
              </div>
            </div>
          </div>

          {/* Detected Misconceptions */}
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2 text-[13px] uppercase tracking-[0.08em] text-[#475569]">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
              <span>Identified misconceptions</span>
            </h3>

            {safeMisconceptions.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#059669]" aria-hidden="true" />
                <p className="text-[13px] text-[#065F46]">
                  No active misconceptions detected. Student is performing at grade level.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {safeMisconceptions.slice(0, 3).map((mis: any, idx: number) => (
                  <li
                    key={mis.id ?? mis.code ?? idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-lg border border-[#FDE68A] bg-[#FEF3C7] flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[13px] font-semibold text-[#0F172A]">
                          {String(mis.code || 'Misconception').replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748B] tabular-nums">
                          Confidence: {mis.confidence}%
                        </span>
                      </div>
                    </div>
                    <span className="badge badge-diagnostic shrink-0">Needs review</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2 text-[13px] uppercase tracking-[0.08em] text-[#475569]">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Recent diagnostic activity</span>
            </h3>

            {safeAttempts.length === 0 ? (
              <p className="text-[13px] italic text-[#64748B]">No recent activity recorded.</p>
            ) : (
              <ul className="space-y-2">
                {safeAttempts.map((att: any) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        aria-hidden="true"
                        className={`w-2 h-2 shrink-0 rounded-full ${
                          att.serverIsCorrect ? 'bg-[#059669]' : 'bg-[#94A3B8]'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="math-expression truncate text-[13px] font-medium text-[#0F172A]">
                          {att.equation}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {att.clientTimestamp
                            ? new Date(att.clientTimestamp).toLocaleDateString()
                            : '—'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`badge shrink-0 ${
                        att.serverIsCorrect ? 'badge-mastery' : 'badge-neutral'
                      }`}
                    >
                      {att.serverIsCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
          <button onClick={onClose} className="btn-ghost">
            Close
          </button>

          <button
            onClick={() => {
              onPushRemedy(student.fullName);
              onClose();
            }}
            className="btn-primary"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Push targeted remedy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
