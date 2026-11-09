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

export const LearningHistoryView: React.FC<LearningHistoryViewProps> = ({
  student,
  onReviewRemedy,
  onBack,
}) => {
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'correct' | 'misconception'>('all');

  useEffect(() => {
    const list = storageService.getRecentDiagnoses();
    setHistory(list);
  }, []);

  const filtered = history.filter((item) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'misconception') return !item.isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs text-indigo-400 font-medium">
          Persisted Attempt Log · IndexedDB Store
        </span>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Learning History Timeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete record of your diagnostic steps and recovered mathematical misconceptions.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mastered
          </button>
          <button
            onClick={() => setFilter('misconception')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === 'misconception' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Misconceptions
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-slate-600" />
          <p>No diagnostic attempts matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.isCorrect
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                  }`}
                >
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    <span className="text-[10px] font-mono text-indigo-400 px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-800/50">
                      {item.misconceptionCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">{item.summary}</p>
                  {item.faultyExpression && (
                    <p className="text-[11px] font-mono text-rose-300">
                      Faulty Line {item.faultyStepNumber || 1}: {item.faultyExpression}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center sm:flex-col items-end gap-2 shrink-0">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>{item.parsingDurationMs}ms</span>
                </span>
                {!item.isCorrect && (
                  <button
                    onClick={() => onReviewRemedy(item.misconceptionCode)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium transition cursor-pointer"
                  >
                    Open Remedy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
