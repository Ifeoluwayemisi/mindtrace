import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Copy,
  RefreshCw,
  Archive,
  UserPlus,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-3 rounded-2xl bg-indigo-600 text-white shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">Classroom Management & Roster</h2>
              <p className="text-xs text-slate-400">Create classes, manage invite codes & onboard students</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Classroom</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Classrooms List Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Classrooms</h3>
            {loading ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading classrooms...</p>
            ) : classrooms.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                <p className="text-xs text-slate-400">No classrooms created yet.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Create First Classroom
                </button>
              </div>
            ) : (
              classrooms.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => selectClassroom(cls)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                    selectedClass?.id === cls.id
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{cls.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {cls.gradeLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{cls.subject || 'Mathematics'}</span>
                    <span className="font-mono text-indigo-300 font-semibold">Code: {cls.inviteCode}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Classroom Roster & Details Column */}
          <div className="md:col-span-2 space-y-4">
            {selectedClass ? (
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">{selectedClass.name}</h3>
                    <p className="text-xs text-slate-400">
                      {selectedClass.subject} · Grade {selectedClass.gradeLevel} · Invite Code:{' '}
                      <span className="font-mono font-bold text-indigo-400">{selectedClass.inviteCode}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClass.inviteCode);
                        showToast('Invite code copied to clipboard!');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Copy Code</span>
                    </button>
                    <button
                      onClick={() => handleRegenerateCode(selectedClass.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                      title="Generate new invite code"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => setShowOnboardModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Onboard Student</span>
                    </button>
                    <button
                      onClick={() => handleArchiveClassroom(selectedClass.id)}
                      className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition cursor-pointer"
                      title="Archive Classroom"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Roster list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Enrolled Student Roster ({roster.length})
                  </h4>
                  {loadingRoster ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Loading roster...</p>
                  ) : roster.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl">
                      No students enrolled yet. Share invite code <span className="font-mono text-indigo-400">{selectedClass.inviteCode}</span> with your students or use Onboard Student.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                      {roster.map((st) => (
                        <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                              {st.fullName?.substring(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <div>
                              <span className="font-semibold text-white block">{st.fullName}</span>
                              <span className="text-[10px] text-slate-400">XP: {st.totalXp || 0} · Streak: {st.streakDays || 0}d</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(st.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition"
                            title="Remove student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-600 mb-1" />
                <p>Select a classroom on the left to inspect its roster and manage invite codes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleCreateClassroom} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create New Classroom</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Classroom Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SS2 Science A — Mathematics"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Grade Level</label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                  >
                    <option value="SS1">SS1</option>
                    <option value="SS2">SS2</option>
                    <option value="SS3">SS3</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Preparing for WAEC 2026 Mathematics Paper 1 & 2"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create Classroom
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Onboard Student Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Onboard New Student</h3>
              <button
                type="button"
                onClick={() => {
                  setShowOnboardModal(false);
                  setOnboardResult(null);
                }}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {onboardResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Student Onboarded Successfully</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80">
                    Provide the following temporary credentials to <span className="font-bold text-white">{onboardResult.fullName}</span>:
                  </p>
                  <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs space-y-1 text-slate-300">
                    <div>Username: <span className="text-white font-bold">{onboardResult.username}</span></div>
                    <div>Temp Password: <span className="text-amber-300 font-bold">{onboardResult.temporaryPassword}</span></div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOnboardResult(null);
                    setShowOnboardModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardStudent} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oluwaseun Adeleke"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. oluwaseun_a"
                    value={onboardUsername}
                    onChange={(e) => setOnboardUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Grade Level</label>
                  <select
                    value={onboardGrade}
                    onChange={(e) => setOnboardGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                  >
                    <option value="SS1">SS1</option>
                    <option value="SS2">SS2</option>
                    <option value="SS3">SS3</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Generate Credentials
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
