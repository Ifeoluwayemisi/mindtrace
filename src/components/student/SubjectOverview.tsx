import React from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Zap, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Question } from '../../types';
import { QUESTION_BANK } from '../../data/questionBank';

interface SubjectOverviewProps {
  onSelectQuestion: (question: Question) => void;
  onBack: () => void;
}

export const SubjectOverview: React.FC<SubjectOverviewProps> = ({
  onSelectQuestion,
  onBack,
}) => {
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
          WAEC / JAMB Secondary Math Curriculum
        </span>
      </div>

      {/* Hero card */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Senior Secondary STEM Curriculum</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Algebra & Linear Transformations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Foundational algebra accounts for up to 35% of marks in WAEC General Mathematics Paper 1 & 2.
          Mastering single-variable transposition, distributive expansion, and fraction clearing guarantees passing marks.
        </p>
      </div>

      {/* Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUESTION_BANK.map((q, idx) => (
          <div
            key={q.id}
            onClick={() => onSelectQuestion(q)}
            className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/60 transition-all hover:bg-slate-900 cursor-pointer space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-400 font-semibold">{q.topicTitle}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {q.difficulty}
              </span>
            </div>

            <div className="py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
              {q.equation}
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {q.prompt}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
              <span className="text-slate-500 text-[11px]">{q.contextNote || 'WAEC Standard'}</span>
              <span className="font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Start Diagnostic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
