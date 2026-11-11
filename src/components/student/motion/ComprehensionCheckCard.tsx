import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { InteractiveComprehensionCheck, ComprehensionOption } from '../../../types/lesson';

interface ComprehensionCheckCardProps {
  check: InteractiveComprehensionCheck;
  onPassed?: () => void;
}

export const ComprehensionCheckCard: React.FC<ComprehensionCheckCardProps> = ({
  check,
  onPassed,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const selectedOption = check.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect === true;

  const handleSelect = (opt: ComprehensionOption) => {
    setSelectedOptionId(opt.id);
    setHasSubmitted(true);
    if (opt.isCorrect && onPassed) {
      onPassed();
    }
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
  };

  return (
    <section
      className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4"
      aria-labelledby="check-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2563EB]">
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          <span>Concept check</span>
        </div>
        <span className="badge badge-diagnostic">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          Active check
        </span>
      </div>

      <div>
        <h2 id="check-heading" className="section-title">{check.prompt}</h2>
        <div className="mt-2 py-2.5 px-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center math-expression text-base font-bold text-[#0F172A]">
          {check.equation}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5 pt-1">
        {check.options.map((opt) => {
          const isChosen = selectedOptionId === opt.id;
          let style = 'bg-white border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#F8FAFC] text-[#0F172A]';

          if (hasSubmitted && isChosen) {
            style = opt.isCorrect
              ? 'bg-[#ECFDF5] border-[#059669] text-[#065F46] ring-2 ring-[#059669]/20'
              : 'bg-[#FFFBEB] border-[#D97706] text-[#78350F] ring-2 ring-[#D97706]/20';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              aria-pressed={isChosen}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[48px] ${style}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[11px] font-bold text-[#475569] shrink-0">
                  {opt.id.slice(-1).toUpperCase()}
                </span>
                <span className="text-[13px] font-semibold leading-relaxed">{opt.label}</span>
              </div>

              {hasSubmitted && isChosen && (
                <div className="shrink-0">
                  {opt.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" aria-label="Correct answer" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#D97706]" aria-label="Misconception detected" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {hasSubmitted && selectedOption && (
        <div
          role="status"
          className={`p-4 rounded-xl border text-[13px] space-y-2 animate-fade-in ${
            isCorrect
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
                  <span>Correct: principle applied accurately</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                  <span>Not yet: cognitive trap identified</span>
                </>
              )}
            </span>

            {!isCorrect && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#92400E] hover:text-[#78350F] underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Retry check
              </button>
            )}
          </div>
          <p className="leading-relaxed text-[#475569]">{selectedOption.feedback}</p>
        </div>
      )}
    </section>
  );
};
