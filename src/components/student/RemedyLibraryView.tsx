import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  Play,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import { ANIMATED_MICRO_LESSONS } from '../../data/animatedLessons';
import { lessonStorageService, LessonStorageInfo } from '../../services/lessonStorageService';

interface RemedyLibraryViewProps {
  onSelectRemedy: (code: string) => void;
  onBack: () => void;
}

export const RemedyLibraryView: React.FC<RemedyLibraryViewProps> = ({
  onSelectRemedy,
  onBack,
}) => {
  const lessons = Object.values(ANIMATED_MICRO_LESSONS);
  const [storageInfo, setStorageInfo] = useState<LessonStorageInfo | null>(null);

  useEffect(() => {
    lessonStorageService.getStorageUsage().then(setStorageInfo);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to dashboard</span>
        </button>

        <span className="badge badge-mastery">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          All lessons 100% offline
        </span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-white to-[#E0F2FE] p-6 md:p-8 space-y-3">
        <div className="absolute inset-0 bg-math-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1D4ED8]">
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>Interactive motion micro-remedies</span>
          </div>
          <h1 className="page-title">Step-by-step animated mathematical lessons</h1>
          <p className="body-text max-w-2xl">
            Visual demonstrations designed for Nigerian secondary students (SS1–SS3). Watch algebraic
            transformations unfold step-by-step with balanced physics, rainbow distribution arcs, and audio guidance.
          </p>

          {storageInfo && (
            <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono text-[#475569] border-t border-[#BFDBFE]">
              <span className="inline-flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
                On-device storage: <strong className="text-[#0F172A]">{storageInfo.usedKb} KB</strong>
              </span>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <span>
                Pre-cached lessons: <strong className="text-[#065F46]">{storageInfo.cachedCount} of {lessons.length}</strong>
              </span>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <span className="text-[#1D4ED8]">0 KB cellular data required</span>
            </div>
          )}
        </div>
      </section>

      {/* Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectRemedy(lesson.misconceptionCode)}
            className="group card-modern card-interactive p-5 sm:p-6 text-left space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-bold text-[#4338CA] px-2 py-0.5 rounded bg-[#EEF2FF] border border-[#C7D2FE]">
                {lesson.misconceptionCode}
              </span>
              <div className="flex items-center gap-2">
                <span className="badge badge-mastery">{lesson.downloadSizeKb} KB · in bundle</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B]">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{lesson.durationMinutes} min</span>
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-display font-bold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                {lesson.title}
              </h2>
              <p className="text-[13px] text-[#475569] mt-1 line-clamp-2 leading-relaxed">
                {lesson.subtitle}
              </p>
            </div>

            {/* Equation preview */}
            <div className="py-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs">
              <span className="text-[#64748B] font-mono">Example</span>
              <span className="math-expression font-bold text-[#0F172A] text-sm truncate">
                {lesson.originalEquation}
              </span>
              <span className="text-[10px] font-mono text-[#2563EB] shrink-0">
                {lesson.steps.length} steps
              </span>
            </div>

            {/* Axiom preview */}
            <div className="p-3 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] text-xs">
              <strong className="text-[#4338CA] block mb-0.5 text-[11px] uppercase tracking-wide">The axiom</strong>
              <span className="line-clamp-2 text-[#475569]">{lesson.axiom}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
              <span className="text-[#64748B] font-medium capitalize flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#6366F1]" aria-hidden="true" />
                <span>{lesson.visualModel.replace('_', ' ')}</span>
              </span>
              <span className="text-[#2563EB] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Start animated lesson
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
