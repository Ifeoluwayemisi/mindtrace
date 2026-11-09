import React from 'react';
import { BookOpen, Sparkles, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { TARGETED_INTERVENTIONS } from '../../data/questionBank';

interface RemedyLibraryViewProps {
  onSelectRemedy: (code: string) => void;
  onBack: () => void;
}

export const RemedyLibraryView: React.FC<RemedyLibraryViewProps> = ({
  onSelectRemedy,
  onBack,
}) => {
  const remedies = Object.values(TARGETED_INTERVENTIONS);

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
          Offline Micro-Remedies Library
        </span>
      </div>

      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Evidence-Based Cognitive Interventions</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-white">
          2-Minute Mathematical Visual Remedies
        </h1>
        <p className="text-sm text-slate-300">
          Targeted conceptual models designed to eliminate stubborn algebraic traps before WAEC and JAMB examinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remedies.map((remedy) => (
          <div
            key={remedy.id}
            onClick={() => onSelectRemedy(remedy.misconceptionCode)}
            className="group rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/60 p-6 transition-all hover:bg-slate-900 cursor-pointer space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-indigo-400 font-semibold">{remedy.misconceptionCode}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{remedy.durationMinutes} min</span>
              </span>
            </div>

            <div>
              <h2 className="text-lg font-display font-bold text-white group-hover:text-indigo-300 transition-colors">
                {remedy.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{remedy.subtitle}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Metaphor: {remedy.metaphorTitle}</strong>
              <span className="line-clamp-2 text-slate-400">{remedy.metaphorDescription}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <span className="text-slate-500 font-medium capitalize">
                Model: {remedy.interactiveModel.replace('_', ' ')}
              </span>
              <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Open Remedy
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
