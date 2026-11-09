import React from 'react';
import { Sparkles, ArrowRight, BookOpen, ShieldCheck, Wifi, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <div className="max-w-xl mx-auto my-auto min-h-[75vh] flex flex-col justify-center text-center px-4 animate-fade-in space-y-8">
      {/* Brand & Badge */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Wale Lab NextGen AI Hackathon · Track 1</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Master Secondary Mathematics Without Data Barriers.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
          MindTrace is not another generic chatbot or multiple-choice quiz. It reads your step-by-step
          reasoning, finds the silent mathematical misconception, and fixes it in 2 minutes — even with 0 KB of internet.
        </p>
      </div>

      {/* 3 Pillar Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center text-xs font-bold mb-2">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white">Cognitive Diagnosis</h2>
          <p className="text-[11px] text-slate-400 leading-normal">
            Identifies sign reversals, bracket distribution errors, and precedence slips.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white">100% Offline Edge</h2>
          <p className="text-[11px] text-slate-400 leading-normal">
            Runs completely on your device in airplane mode with zero mobile data expenses.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="w-8 h-8 rounded-xl bg-violet-950 text-violet-400 flex items-center justify-center text-xs font-bold mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-white">Targeted Remedies</h2>
          <p className="text-[11px] text-slate-400 leading-normal">
            2-minute visual explanations with balance scales and rainbow multipliers.
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onGetStarted}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>Get Started (New Learner)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onSignIn}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition cursor-pointer"
        >
          Sign In / Demo Login
        </button>
      </div>
    </div>
  );
};
