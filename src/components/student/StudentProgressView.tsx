import React, { useEffect, useState } from 'react';
import {
  Award,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { StudentProfile, DiagnosisResult } from '../../types';
import { storageService } from '../../services/storageService';

interface StudentProgressViewProps {
  student: StudentProfile;
  onLaunchRemedy: (misconceptionCode: string) => void;
  onBackToDashboard: () => void;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  student,
  onLaunchRemedy,
  onBackToDashboard,
}) => {
  const [history, setHistory] = useState<DiagnosisResult[]>([]);

  useEffect(() => {
    const list = storageService.getRecentDiagnoses();
    setHistory(list);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Cognitive Mastery Profile
            </span>
            <h1 className="text-2xl font-display font-bold text-white">
              {student.name}'s Learning Trajectory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Class {student.classSection} · {student.school} · Goal: WAEC Distinction
            </p>
          </div>

          <button
            onClick={onBackToDashboard}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        {/* 3 Core Competency Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Overall Algebra Mastery</span>
            <div className="text-2xl font-bold text-indigo-400 font-display tabular-nums">
              {student.masteryPercentage}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${student.masteryPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Consistency Streak</span>
            <div className="text-2xl font-bold text-amber-400 font-display tabular-nums">
              {student.streakDays} Days
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Consecutive daily problem solving</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Total Diagnosed Attempts</span>
            <div className="text-2xl font-bold text-emerald-400 font-display tabular-nums">
              {student.totalDiagnosed}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Stored offline in IndexedDB</p>
          </div>
        </div>
      </div>

      {/* Topic Mastery Matrix */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-display font-bold text-white">
          Algebraic Topic Competencies
        </h2>
        <div className="space-y-3">
          {[
            { topic: 'Linear Equations: Transposition', score: 85, status: 'Strong', code: 'ALG_SIGN_FLIP' },
            { topic: 'Distributive Law & Expanding Brackets', score: 72, status: 'Developing', code: 'ALG_INVALID_DISTRIB' },
            { topic: 'Equations with Variables on Both Sides', score: 68, status: 'Needs Review', code: 'ALG_VARIABLE_DROPPED' },
            { topic: 'Algebraic Fractions with Linear Numerators', score: 62, status: 'In Progress', code: 'ALG_PRECEDENCE_VIOLATION' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white">{item.topic}</span>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Score: {item.score}%</span>
                  <span>·</span>
                  <span
                    className={
                      item.score >= 80
                        ? 'text-emerald-400'
                        : item.score >= 70
                        ? 'text-indigo-400'
                        : 'text-amber-400'
                    }
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onLaunchRemedy(item.code)}
                className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-medium transition cursor-pointer"
              >
                Review Remedy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Diagnostic Submissions History */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-display font-bold text-white">
          Recent Edge Diagnostic Log
        </h2>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No submissions recorded yet in this session. Solve an equation to generate diagnostic history!
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record, idx) => (
              <div
                key={record.id || idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      record.isCorrect
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                    }`}
                  >
                    {record.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{record.title}</h3>
                    <p className="text-[11px] text-slate-400">{record.summary}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-emerald-400 block">
                    {record.parsingDurationMs}ms
                  </span>
                  <span className="text-[10px] text-slate-500">Local Rule</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
