import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  Play,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
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
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>All Lessons 100% Offline</span>
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-800/60 p-6 md:p-8 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
          <Play className="w-4 h-4" />
          <span>Interactive Motion Micro-Remedies</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          Step-by-Step Animated Mathematical Lessons
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Visual demonstrations designed specifically for Nigerian secondary students (SS1–SS3).
          Watch algebraic transformations unfold step-by-step with balanced physics, rainbow distribution arcs, and audio guidance.
        </p>

        {/* Offline Cache Telemetry Status */}
        {storageInfo && (
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-t border-indigo-900/40">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>On-Device Storage: <strong className="text-white">{storageInfo.usedKb} KB</strong></span>
            </div>
            <span>·</span>
            <div>
              <span>Pre-Cached Lessons: <strong className="text-emerald-400">{storageInfo.cachedCount} of {lessons.length}</strong></span>
            </div>
            <span>·</span>
            <div>
              <span className="text-indigo-300">0 KB Cellular Data Required</span>
            </div>
          </div>
        )}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => onSelectRemedy(lesson.misconceptionCode)}
            className="group rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 p-6 transition-all hover:bg-slate-900 cursor-pointer space-y-4 shadow-sm hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/60">
                {lesson.misconceptionCode}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  {lesson.downloadSizeKb} KB · In Bundle
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lesson.durationMinutes} min</span>
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-display font-bold text-white group-hover:text-indigo-300 transition-colors">
                {lesson.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {lesson.subtitle}
              </p>
            </div>

            {/* Starting Equation Preview Pill */}
            <div className="py-2.5 px-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Example:</span>
              <span className="font-mono font-bold text-white text-sm">
                {lesson.originalEquation}
              </span>
              <span className="text-[10px] font-mono text-indigo-400">
                {lesson.steps.length} Steps
              </span>
            </div>

            {/* Axiom Preview */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
              <strong className="text-amber-400 block mb-0.5">The Axiom:</strong>
              <span className="line-clamp-2 text-slate-400">{lesson.axiom}</span>
            </div>

            {/* Card Footer with Play CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <span className="text-slate-400 font-medium capitalize flex items-center gap-1">
                <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                <span>{lesson.visualModel.replace('_', ' ')}</span>
              </span>
              <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Start Animated Lesson
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
