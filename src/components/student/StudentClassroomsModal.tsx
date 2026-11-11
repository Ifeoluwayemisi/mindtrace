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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-3 rounded-2xl bg-indigo-600 text-white shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">My Enrolled Classrooms</h2>
              <p className="text-xs text-slate-400">Join teacher classes with 6-digit invite codes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Join Classroom Form */}
          <form onSubmit={handleJoinClassroom} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              placeholder="Enter 6-digit Invite Code (e.g. AB72XY)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase().trim())}
              className="w-full sm:flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl font-mono text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={joining || !inviteCode.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition shrink-0 cursor-pointer"
            >
              {joining ? 'Joining...' : 'Join Classroom'}
            </button>
          </form>

          {/* Enrolled List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Classes</h3>
            {loading ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading classrooms...</p>
            ) : classrooms.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                <p className="text-xs">You are not enrolled in any classrooms yet.</p>
                <p className="text-[11px] text-slate-600">Ask your mathematics teacher for an invite code.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classrooms.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{cls.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {cls.gradeLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Teacher: <span className="text-slate-300 font-semibold">{cls.teacher?.fullName}</span> ·{' '}
                        {cls.teacher?.schoolName}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLeaveClassroom(cls.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold transition shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Leave</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
