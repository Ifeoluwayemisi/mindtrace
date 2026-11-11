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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3F1FF] border border-[#E4E0FD] text-xs text-[#5140CA] font-bold tracking-wide">
            <span>WAEC & JAMB Senior Secondary Mathematics</span>
            <span aria-hidden="true">·</span>
            <span>Offline-First Diagnostic Learning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#252641] tracking-tight leading-[1.15]">
            Master Secondary Mathematics Without Data Barriers.
          </h1>

          <p className="text-sm sm:text-base text-[#4A4D68] max-w-xl leading-relaxed">
            MindTrace is an AI-assisted, offline-first mathematics diagnostic platform for secondary school STEM students (SS1–SS3).
            It parses your line-by-line working, pinpoints the root algebraic misconception, and guides you to mastery with interactive visual models — even with zero internet.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white font-bold text-sm shadow-xl shadow-[#6755E8]/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-[#F8F9FF] border border-[#E9EAF3] hover:border-[#D4D7E8] text-[#252641] font-bold text-sm shadow-sm transition cursor-pointer"
            >
              Sign In / Evaluator Demo
            </button>
          </div>
        </div>

        {/* Right Column: Hero Illustration */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative p-3 rounded-3xl bg-white border border-[#E9EAF3] shadow-xl">
            <HeroStudentIllustration className="w-full max-w-[380px] h-auto drop-shadow-sm" />
          </div>
        </div>
      </div>

      {/* 3 Academic Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left pt-6 border-t border-[#E9EAF3]">
        <div className="p-6 rounded-2xl bg-white border border-[#E9EAF3] shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3F1FF] text-[#6755E8] flex items-center justify-center text-xs font-bold">
            <Zap className="w-5 h-5 text-[#6755E8]" />
          </div>
          <h2 className="text-sm font-display font-bold text-[#252641]">Cognitive Error Diagnosis</h2>
          <p className="text-xs text-[#74788E] leading-relaxed">
            Diagnoses sign reversals on transposition, incomplete bracket distribution, and precedence slips in &lt;50ms.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E9EAF3] shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F8F4] text-[#1B886B] flex items-center justify-center text-xs font-bold">
            <ShieldCheck className="w-5 h-5 text-[#1B886B]" />
          </div>
          <h2 className="text-sm font-display font-bold text-[#252641]">100% Offline Edge Execution</h2>
          <p className="text-xs text-[#74788E] leading-relaxed">
            Runs entirely on-device via IndexedDB & Service Worker caching. Zero cellular data consumed during homework practice.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E9EAF3] shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF8FB] text-[#167E96] flex items-center justify-center text-xs font-bold">
            <BookOpen className="w-5 h-5 text-[#167E96]" />
          </div>
          <h2 className="text-sm font-display font-bold text-[#252641]">Interactive Visual Models</h2>
          <p className="text-xs text-[#74788E] leading-relaxed">
            Interactive balance scales and rainbow multiplier guides replace dry multiple-choice feedback with deep conceptual understanding.
          </p>
        </div>
      </div>
    </div>
  );
};
