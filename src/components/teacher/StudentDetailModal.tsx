import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Send, Clock, BookOpen, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { StudentProfile, MisconceptionCode } from '../../types';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-12 flex flex-col items-center justify-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Fetching Student Diagnostics...</span>
        </div>
      </div>
    );
  }

  const { student, attempts, misconceptions } = details || {};
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shadow-sm">
              <img 
                src={student.avatarSeed} 
                alt="" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-sm font-bold text-white bg-indigo-600 w-full h-full flex items-center justify-center">
                {(student.fullName || 'ST').substring(0, 1).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">{student.fullName}</h2>
              <p className="text-xs text-slate-400">
                Grade {student.gradeLevel} · Last active {student.lastActiveDate || 'Never'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
          {/* Performance metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Mastery</span>
              <div className="text-xl font-bold text-white font-mono">{student.masteryPercentage ?? '--'}%</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total XP</span>
              <div className="text-xl font-bold text-white font-mono">{student.totalXp}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Streak</span>
              <div className="text-xl font-bold text-white font-mono">{student.streakDays}d</div>
            </div>
          </div>

          {/* Detected Misconceptions */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Identified Misconceptions</span>
            </h3>
            {misconceptions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p>No active misconceptions detected. Student is performing at grade level.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {misconceptions.slice(0, 3).map((mis: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">{mis.code.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] font-mono text-slate-500">Confidence: {mis.confidence}%</span>
                      </div>
                    </div>

                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-900/50 uppercase tracking-wider">
                      Needs Review
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Diagnostic Activity</span>
            </h3>
            <div className="space-y-2">
              {attempts.length === 0 ? (
                <p className="text-xs text-slate-600 italic px-4">No recent activity recorded.</p>
              ) : (
                attempts.map((att: any) => (
                  <div key={att.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${att.serverIsCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <div className="font-mono text-xs text-white">{att.equation}</div>
                        <div className="text-[10px] text-slate-500">{new Date(att.clientTimestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {att.serverIsCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onPushRemedy(student.fullName);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Push Targeted Remedy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
