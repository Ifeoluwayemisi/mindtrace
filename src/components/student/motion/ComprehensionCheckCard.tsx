import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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
    <div className="p-6 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <HelpCircle className="w-4 h-4" />
          <span>Quick Comprehension Check</span>
        </div>
        <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/60">
          Test Your Intuition
        </span>
      </div>

      <div>
        <h4 className="text-sm sm:text-base font-display font-bold text-white">
          {check.prompt}
        </h4>
        <div className="mt-2 py-2 px-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-base font-bold text-white">
          {check.equation}
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2.5 pt-1">
        {check.options.map((opt) => {
          const isChosen = selectedOptionId === opt.id;
          let style = 'bg-slate-950 border-slate-800 hover:border-indigo-500/80 text-slate-200';

          if (hasSubmitted && isChosen) {
            style = opt.isCorrect
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/30'
              : 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/30';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[48px] ${style}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {opt.id.slice(-1).toUpperCase()}
                </span>
                <span className="text-xs font-semibold leading-relaxed">{opt.label}</span>
              </div>

              {hasSubmitted && isChosen && (
                <div className="shrink-0">
                  {opt.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Card */}
      {hasSubmitted && selectedOption && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 animate-fade-in ${
            isCorrect
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/60 border-rose-700 text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Brilliant! Concept Mastered</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Not quite — Common Cognitive Trap</span>
                </>
              )}
            </span>

            {!isCorrect && (
              <button
                onClick={handleReset}
                className="text-[11px] underline font-semibold text-rose-300 hover:text-white cursor-pointer"
              >
                Try Again
              </button>
            )}
          </div>
          <p className="leading-relaxed text-slate-300">{selectedOption.feedback}</p>
        </div>
      )}
    </div>
  );
};
