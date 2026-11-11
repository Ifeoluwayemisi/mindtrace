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
      visualIcon: <Zap className="w-10 h-10 text-[#6755E8]" />,
      badge: 'Step 1 of 3: Cognitive Analysis',
      cardDetail: 'Traces your line-by-line transitions without punitive grading.',
    },
    {
      title: 'Fix the Root Cause in 2 Minutes',
      subtitle: 'Targeted Visual Metaphors',
      description:
        'Instead of reading 10 pages of confusing textbook proofs, MindTrace shows you interactive models: two-pan balance scales for transpositions and rainbow arrows for bracket distribution.',
      visualIcon: <Scale className="w-10 h-10 text-[#49C6A3]" />,
      badge: 'Step 2 of 3: Visual Models',
      cardDetail: 'Interactive simulations calibrate your intuition permanently.',
    },
    {
      title: 'Zero Data. Zero Lost Progress.',
      subtitle: '100% Offline with Micro-Sync',
      description:
        'Solve questions offline in public transit or at home with zero mobile internet. When you connect for even 5 seconds, MindTrace synchronizes lightweight batches (<15 KB) to your teacher’s class dashboard.',
      visualIcon: <Layers className="w-10 h-10 text-[#36B8D8]" />,
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
    <div className="max-w-lg mx-auto my-auto min-h-[70vh] flex flex-col justify-between p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-xl animate-fade-in">
      {/* Top Header with Progress & Skip */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-[#5140CA] px-3 py-1 rounded-full bg-[#F3F1FF] border border-[#E4E0FD]">
          {slide.badge}
        </span>
        <button
          onClick={onSkip}
          className="text-xs font-bold text-[#74788E] hover:text-[#252641] transition cursor-pointer"
        >
          Skip Intro
        </button>
      </div>

      {/* Slide Content */}
      <div className="my-8 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F8F9FF] border border-[#E9EAF3] flex items-center justify-center shadow-xs">
          {slide.visualIcon}
        </div>

        <h2 className="text-2xl font-display font-extrabold text-[#252641]">
          {slide.title}
        </h2>
        <p className="text-xs uppercase font-bold tracking-wider text-[#6755E8]">
          {slide.subtitle}
        </p>

        <p className="text-sm text-[#4A4D68] leading-relaxed max-w-md mx-auto">
          {slide.description}
        </p>

        <div className="p-3 rounded-2xl bg-[#F5F6FC] border border-[#E9EAF3] text-xs text-[#252641] font-medium italic">
          💡 {slide.cardDetail}
        </div>
      </div>

      {/* Bottom Navigation with Dots and Action Buttons */}
      <div className="space-y-4 pt-4 border-t border-[#E9EAF3]">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide
                  ? 'w-8 bg-[#6755E8]'
                  : 'w-2 bg-[#D4D7E8] hover:bg-[#B8BCD4]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={currentSlide === 0}
            className="px-4 py-2.5 rounded-xl border border-[#E9EAF3] text-[#74788E] hover:text-[#252641] hover:bg-[#F8F9FF] text-xs font-semibold transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white text-xs font-bold shadow-md shadow-[#6755E8]/30 transition cursor-pointer"
          >
            <span>{currentSlide === slides.length - 1 ? 'Select Your Role' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
