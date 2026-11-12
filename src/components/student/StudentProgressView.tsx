import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to dashboard</span>
        </button>
        <span className="badge badge-mastery">Cognitive mastery profile</span>
      </div>

      {/* Mastery banner */}
      <section className="card-modern p-5 sm:p-7 space-y-4" aria-labelledby="trajectory-heading">
        <div>
          <h1 id="trajectory-heading" className="page-title">
            {student.name}'s learning trajectory
          </h1>
          <p className="body-text mt-1">
            Class {student.classSection} · {student.school} · Goal: WAEC distinction
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E2E8F0]">
          <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
            <span className="text-[11px] font-semibold text-[#1D4ED8] block mb-1">Overall algebra mastery</span>
            <div className="text-2xl font-bold text-[#1E40AF] font-display tabular-nums">
              {student.masteryPercentage}%
            </div>
            <div className="progress-track mt-2 bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={student.masteryPercentage} aria-label="Algebra mastery">
              <div className="progress-fill" style={{ width: `${student.masteryPercentage}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="text-[11px] font-semibold text-[#92400E] block mb-1">Consistency streak</span>
            <div className="text-2xl font-bold text-[#92400E] font-display tabular-nums">
              {student.streakDays} days
            </div>
            <p className="text-[11px] text-[#92400E] mt-2">Consecutive daily problem solving</p>
          </div>

          <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
            <span className="text-[11px] font-semibold text-[#065F46] block mb-1">Total diagnosed attempts</span>
            <div className="text-2xl font-bold text-[#065F46] font-display tabular-nums">
              {student.totalDiagnosed}
            </div>
            <p className="text-[11px] text-[#047857] mt-2">Stored offline in IndexedDB</p>
          </div>
        </div>
      </section>

      {/* Topic competencies */}
      <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="section-title">Algebraic topic competencies</h2>
        <div className="space-y-2.5">
          {[
            { topic: 'Linear Equations: Transposition', score: 85, status: 'Strong', code: 'ALG_SIGN_FLIP' },
            { topic: 'Distributive Law & Expanding Brackets', score: 72, status: 'Developing', code: 'ALG_INVALID_DISTRIB' },
            { topic: 'Equations with Variables on Both Sides', score: 68, status: 'Needs review', code: 'ALG_VARIABLE_DROPPED' },
            { topic: 'Algebraic Fractions with Linear Numerators', score: 62, status: 'In progress', code: 'ALG_PRECEDENCE_VIOLATION' },
          ].map((item) => {
            const tone =
              item.score >= 80
                ? 'badge-mastery'
                : item.score >= 70
                ? 'badge-primary'
                : 'badge-diagnostic';
            const barTone =
              item.score >= 80
                ? 'progress-fill progress-fill-mastery'
                : item.score >= 70
                ? 'progress-fill'
                : 'progress-fill progress-fill-diagnostic';

            return (
              <div
                key={item.topic}
                className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#0F172A]">{item.topic}</span>
                    <span className={`badge ${tone}`}>{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#64748B] font-mono w-12">{item.score}%</span>
                    <div className="progress-track flex-1 max-w-[220px]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.score} aria-label={`${item.topic} score`}>
                      <div className={barTone} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onLaunchRemedy(item.code)}
                  className="btn-secondary self-start sm:self-center min-h-[36px] px-3 py-1.5 text-[12px]"
                >
                  Review remedy
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Diagnostic log */}
      <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="log-heading">
        <h2 id="log-heading" className="section-title">Recent edge diagnostic log</h2>

        {history.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
            No submissions recorded yet in this session. Solve an equation to generate diagnostic history.
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((record, idx) => (
              <div
                key={record.id || idx}
                className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      record.isCorrect
                        ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
                        : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                    }`}
                  >
                    {record.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5" aria-label="Correct" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" aria-label="Misconception detected" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold text-[#0F172A] truncate">{record.title}</h3>
                    <p className="text-[11px] text-[#64748B] truncate">{record.summary}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-[#065F46] block">
                    {record.parsingDurationMs}ms
                  </span>
                  <span className="text-[10px] text-[#64748B]">Local rule</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
