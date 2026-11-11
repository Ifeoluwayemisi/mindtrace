import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Filter,
  Zap,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { DiagnosisResult, StudentProfile } from '../../types';
import { storageService } from '../../services/storageService';

interface LearningHistoryViewProps {
  student: StudentProfile;
  onReviewRemedy: (misconceptionCode: string) => void;
  onBack: () => void;
}

type HistoryFilter = 'all' | 'correct' | 'misconception';

export const LearningHistoryView: React.FC<LearningHistoryViewProps> = ({
  student,
  onReviewRemedy,
  onBack,
}) => {
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    const list = storageService.getRecentDiagnoses();
    setHistory(list);
  }, []);

  const filtered = history.filter((item) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'misconception') return !item.isCorrect;
    return true;
  });

  const filters: Array<{ key: HistoryFilter; label: string; count: number }> = [
    { key: 'all', label: 'All', count: history.length },
    { key: 'correct', label: 'Mastered', count: history.filter((item) => item.isCorrect).length },
    {
      key: 'misconception',
      label: 'Misconceptions',
      count: history.filter((item) => !item.isCorrect).length,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to dashboard</span>
        </button>

        <span className="badge badge-neutral">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          Saved on this device · IndexedDB
        </span>
      </div>

      {/* Header */}
      <section className="card-modern p-5 sm:p-7" aria-labelledby="history-heading">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="max-w-xl">
            <span className="eyebrow">Your attempt log</span>
            <h1 id="history-heading" className="page-title mt-1">
              Learning history
            </h1>
            <p className="body-text mt-1.5">
              Every diagnostic attempt, the reasoning step that went wrong, and the remedy you can
              revisit — in reverse chronological order.
            </p>
          </div>

          {/* Filters */}
          <div
            role="group"
            aria-label="Filter attempts"
            className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] self-start shrink-0"
          >
            {filters.map(({ key, label, count }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  aria-pressed={active}
                  className={`px-3 min-h-[36px] rounded-lg text-[12px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                      : 'text-[#475569] hover:text-[#0F172A] border border-transparent'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      active ? 'text-[#2563EB]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="card-muted p-10 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#94A3B8]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-[15px] font-semibold text-[#0F172A]">No attempts here yet</p>
            <p className="text-[13px] text-[#475569] max-w-sm mx-auto">
              {filter === 'all'
                ? 'Solve your first equation to start building your learning history.'
                : `You have no ${filter === 'correct' ? 'mastered' : 'misconception'} attempts matching this filter.`}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Try a different filter above</span>
          </span>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item, idx) => (
            <li
              key={item.id || idx}
              className="card-modern p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.isCorrect
                      ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                      : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                  }`}
                >
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-[#0F172A]">{item.title}</h2>
                    <span
                      className={`badge ${item.isCorrect ? 'badge-mastery' : 'badge-diagnostic'}`}
                    >
                      {item.isCorrect ? 'Mastered' : 'Misconception'}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#4338CA] px-1.5 py-0.5 rounded bg-[#EEF2FF] border border-[#C7D2FE]">
                      {item.misconceptionCode}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#475569] leading-relaxed">{item.summary}</p>
                  {item.faultyExpression && (
                    <p className="text-[12px] font-mono text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-md px-2 py-1 inline-block">
                      Faulty line {item.faultyStepNumber || 1}: {item.faultyExpression}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 sm:text-right">
                <span className="text-[11px] font-mono text-[#64748B] inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#D97706]" aria-hidden="true" />
                  <span>{item.parsingDurationMs}ms parse</span>
                </span>
                {!item.isCorrect && (
                  <button
                    onClick={() => onReviewRemedy(item.misconceptionCode)}
                    className="btn-secondary min-h-[36px] px-3 text-[12px]"
                  >
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Open remedy</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[12px] text-[#64748B] inline-flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>
          Showing {filtered.length} of {history.length} saved attempts for {student.name}.
        </span>
      </p>
    </div>
  );
};
