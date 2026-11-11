import React from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to dashboard</span>
        </button>

        <span className="text-[12px] text-[#64748B] font-medium">
          WAEC / JAMB secondary math curriculum
        </span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-white to-[#E0F2FE] p-6 md:p-8 space-y-2">
        <div className="absolute inset-0 bg-math-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1D4ED8]">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Senior secondary STEM curriculum</span>
          </div>
          <h1 className="page-title">Algebra & linear transformations</h1>
          <p className="body-text max-w-2xl">
            Foundational algebra accounts for up to 35% of marks in WAEC General Mathematics Paper 1 & 2.
            Mastering single-variable transposition, distributive expansion, and fraction clearing guarantees passing marks.
          </p>
        </div>
      </section>

      {/* Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUESTION_BANK.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q)}
            className="group card-modern card-interactive p-5 sm:p-6 text-left space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-[#2563EB]">{q.topicTitle}</span>
              <span className="badge badge-neutral">{q.difficulty}</span>
            </div>

            <div className="py-3 px-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center math-expression text-xl font-bold text-[#0F172A] group-hover:border-[#BFDBFE] transition-colors">
              {q.equation}
            </div>

            <p className="text-[13px] text-[#475569] line-clamp-2 leading-relaxed">
              {q.prompt}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-[12px]">
              <span className="text-[#64748B] text-[11px]">{q.contextNote || 'WAEC standard'}</span>
              <span className="font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Start diagnostic</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
