import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { HeroStudentIllustration } from '../common/MathVisuals';
import { PWAInstallButton } from '../common/PWAInstallButton';

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1D4ED8] font-bold tracking-wide">
            <span>WAEC & JAMB Senior Secondary Mathematics</span>
            <span aria-hidden="true">·</span>
            <span>Offline-First Diagnostic Learning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
            Master Secondary Mathematics Without Data Barriers.
          </h1>

          <p className="text-sm sm:text-base text-[#475569] max-w-xl leading-relaxed">
            MindTrace is an AI-assisted, offline-first mathematics diagnostic platform for secondary school STEM students (SS1–SS3).
            It parses your line-by-line working, pinpoints root algebraic misconceptions, and guides you to mastery with interactive visual models — even with zero internet.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-[#2563EB]/25 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#0F172A] font-bold text-sm shadow-xs transition cursor-pointer"
            >
              Sign In / Evaluator Demo
            </button>

            <div className="w-full sm:w-auto">
              <PWAInstallButton />
            </div>
          </div>
        </div>

        {/* Right Column: Hero Illustration */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl">
            <HeroStudentIllustration className="w-full max-w-[380px] h-auto drop-shadow-sm" />
          </div>
        </div>
      </div>

      {/* 3 Academic Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left pt-6 border-t border-[#E2E8F0]">
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#BFDBFE] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-xs font-bold">
            <Zap className="w-5 h-5 text-[#2563EB]" />
          </div>
          <h2 className="text-sm font-display font-bold text-[#0F172A]">Cognitive Error Diagnosis</h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            Diagnoses sign reversals on transposition, incomplete bracket distribution, and precedence slips in &lt;50ms.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#A7F3D0] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] text-[#065F46] flex items-center justify-center text-xs font-bold">
            <ShieldCheck className="w-5 h-5 text-[#059669]" />
          </div>
          <h2 className="text-sm font-display font-bold text-[#0F172A]">100% Offline Edge Execution</h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            Runs entirely on-device via IndexedDB & Service Worker caching. Zero cellular data consumed during homework practice.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#BAE6FD] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-xs font-bold">
            <BookOpen className="w-5 h-5 text-[#0EA5E9]" />
          </div>
          <h2 className="text-sm font-display font-bold text-[#0F172A]">Interactive Visual Models</h2>
          <p className="text-xs text-[#475569] leading-relaxed">
            Interactive balance scales and rainbow multiplier guides replace dry multiple-choice feedback with deep conceptual understanding.
          </p>
        </div>
      </div>
    </div>
  );
};
