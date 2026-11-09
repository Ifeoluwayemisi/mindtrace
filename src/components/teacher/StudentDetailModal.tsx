import React from 'react';
import { X, CheckCircle2, AlertTriangle, Send, Clock, BookOpen } from 'lucide-react';
import { StudentRosterItem } from '../../data/mockTeacherData';

interface StudentDetailModalProps {
  student: StudentRosterItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPushRemedy: (studentName: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onPushRemedy,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-sm">
              {student.avatar}
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">{student.name}</h2>
              <p className="text-xs text-slate-400">
                Class {student.classSection} · Last active {student.lastActive}
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

        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Overall Score</span>
            <div className="text-xl font-bold text-white font-mono">{student.overallScore}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Time Spent</span>
            <div className="text-xl font-bold text-white font-mono">{student.timeSpentMinutes}m</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Hints Requested</span>
            <div className="text-xl font-bold text-white font-mono">{student.hintsUsed}</div>
          </div>
        </div>

        {/* Detected Misconceptions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detected Misconceptions
          </h3>
          {student.detectedMisconceptions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No active misconceptions detected. Student has mastered standard linear equations.</span>
            </div>
          ) : (
            student.detectedMisconceptions.map((mis, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">{mis.label}</span>
                    <span className="text-[11px] font-mono text-slate-400">{mis.code}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    mis.remediated
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {mis.remediated ? 'Remediated' : 'Needs Intervention'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onPushRemedy(student.name);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Push 2-Minute Targeted Remedy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
