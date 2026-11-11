import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { HeroStudentIllustration } from '../common/MathVisuals';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <div className="max-w-5xl mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 py-8 animate-fade-in space-y-10">
      {/* 2-Column Split Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & Academic Context */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold tracking-wide">
            <span>WAEC & JAMB Senior Secondary Mathematics</span>
            <span aria-hidden="true">·</span>
            <span>Offline-First Diagnostic Learning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
            Master Secondary Mathematics Without Data Barriers.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            MindTrace is an AI-assisted, offline-first mathematics diagnostic platform for secondary school STEM students (SS1–SS3).
            It parses your line-by-line working, pinpoints the root algebraic misconception, and guides you to mastery with interactive visual models — even with zero internet.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Get Started as Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm transition cursor-pointer"
            >
              Sign In / Evaluator Demo
            </button>
          </div>
        </div>

        {/* Right Column: Hero Illustration */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative p-2 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-xs">
            <HeroStudentIllustration className="w-full max-w-[380px] h-auto drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* 3 Academic Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4 border-t border-slate-800/80">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center text-xs font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-display font-bold text-white">Cognitive Error Diagnosis</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Diagnoses sign reversals on transposition, incomplete bracket distribution, and precedence slips in &lt;50ms.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-display font-bold text-white">100% Offline Edge Execution</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Runs entirely on-device via IndexedDB & Service Worker caching. Zero cellular data consumed during homework practice.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-violet-950 text-violet-400 flex items-center justify-center text-xs font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-display font-bold text-white">Interactive Visual Models</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive balance scales and rainbow multiplier guides replace dry multiple-choice feedback with deep conceptual understanding.
          </p>
        </div>
      </div>
    </div>
  );
};

