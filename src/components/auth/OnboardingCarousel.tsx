import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Zap, Scale, Layers } from 'lucide-react';

interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'A Wrong Answer is Just a Symptom',
      subtitle: 'Evidence-Based Diagnostic Reasoning',
      description:
        'When you get 3x = 14 - 7 instead of 14 + 7, standard tests mark you zero without explaining why. MindTrace analyzes each line of your mathematical working to reveal the exact misconception.',
      visualIcon: <Zap className="w-10 h-10 text-[#2563EB]" />,
      badge: 'Step 1 of 3: Cognitive Analysis',
      cardDetail: 'Traces your line-by-line transitions without punitive grading.',
    },
    {
      title: 'Fix the Root Cause in 2 Minutes',
      subtitle: 'Targeted Visual Metaphors',
      description:
        'Instead of reading 10 pages of confusing textbook proofs, MindTrace shows you interactive models: two-pan balance scales for transpositions and rainbow arrows for bracket distribution.',
      visualIcon: <Scale className="w-10 h-10 text-[#059669]" />,
      badge: 'Step 2 of 3: Visual Models',
      cardDetail: 'Interactive simulations calibrate your intuition permanently.',
    },
    {
      title: 'Zero Data. Zero Lost Progress.',
      subtitle: '100% Offline with Micro-Sync',
      description:
        'Solve questions offline in public transit or at home with zero mobile internet. When you connect for even 5 seconds, MindTrace synchronizes lightweight batches (<15 KB) to your teacher’s class dashboard.',
      visualIcon: <Layers className="w-10 h-10 text-[#0EA5E9]" />,
      badge: 'Step 3 of 3: Offline Freedom',
      cardDetail: 'IndexedDB ensures not a single step of your work is lost.',
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-auto min-h-[70vh] flex flex-col justify-between p-7 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm animate-fade-in">
      {/* Top Header with Progress & Skip */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-[#1D4ED8] px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]">
          {slide.badge}
        </span>
        <button
          onClick={onSkip}
          className="text-xs font-bold text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
        >
          Skip Intro
        </button>
      </div>

      {/* Slide Content */}
      <div className="my-8 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shadow-xs">
          {slide.visualIcon}
        </div>

        <h2 className="text-2xl font-display font-extrabold text-[#0F172A]">
          {slide.title}
        </h2>
        <p className="text-xs uppercase font-bold tracking-wider text-[#2563EB]">
          {slide.subtitle}
        </p>

        <p className="text-sm text-[#475569] leading-relaxed max-w-md mx-auto">
          {slide.description}
        </p>

        <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-xs text-[#0F172A] font-medium italic">
          💡 {slide.cardDetail}
        </div>
      </div>

      {/* Bottom Navigation with Dots and Action Buttons */}
      <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide
                  ? 'w-8 bg-[#2563EB]'
                  : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={currentSlide === 0}
            className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm shadow-[#2563EB]/25 transition cursor-pointer"
          >
            <span>{currentSlide === slides.length - 1 ? 'Select Your Role' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
