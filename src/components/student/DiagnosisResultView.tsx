import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DiagnosisResult, Question } from '../../types';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface DiagnosisResultViewProps {
  diagnosis: DiagnosisResult;
  question: Question;
  onStartIntervention: () => void;
  onTryAgain: () => void;
  onNextQuestion: () => void;
  onViewSummary?: () => void;
}

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  diagnosis,
  question,
  onStartIntervention,
  onTryAgain,
  onNextQuestion,
  onViewSummary,
}) => {
  const isCorrect = diagnosis.isCorrect;
  const isAmbiguous = diagnosis.misconceptionCode === 'INSUFFICIENT_EVIDENCE';
  const savedStudent = storageService.getSavedStudentProfile();
  const hasAudioPreference = Boolean(
    savedStudent.audioSupport ||
      savedStudent.preferredPresentation?.includes('audio') ||
      savedStudent.learningPreferences?.includes('audio')
  );

  const speechExplanationText = `Diagnosis result: ${diagnosis.title}. ${diagnosis.summary}. Detailed explanation: ${diagnosis.explanation}. Pedagogical guidance: ${diagnosis.pedagogicalEmpathyNote}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner Status */}
      <div
        className={`rounded-3xl p-6 md:p-8 border shadow-xl ${
          isCorrect
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-800/60'
            : isAmbiguous
            ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-amber-800/60'
            : 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-indigo-800/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isCorrect
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isAmbiguous
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isAmbiguous ? (
                <HelpCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-slate-400 block">
                  Edge Diagnostic Output · {diagnosis.misconceptionCode}
                </span>
                {diagnosis.earnedXp && diagnosis.earnedXp > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                    <Sparkles className="w-3 h-3 fill-amber-300" />
                    +{diagnosis.earnedXp} XP Earned
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                {diagnosis.title}
              </h2>
            </div>
          </div>

          {/* Performance & Audio Verification */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <AudioPlayerControl
              textToSpeak={speechExplanationText}
              label="Listen"
              variant="compact"
              hasAudioPreference={hasAudioPreference}
            />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-emerald-400">
              <Zap className="w-3 h-3" />
              <span>{diagnosis.parsingDurationMs}ms</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-indigo-300">
              <ShieldCheck className="w-3 h-3" />
              <span>0 KB Used</span>
            </span>
          </div>
        </div>

        {/* Diagnosis Summary & Empathy Note */}
        <div className="mt-5 space-y-3">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {diagnosis.summary}
          </p>

          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-indigo-300">Pedagogical Note:</strong>{' '}
            {diagnosis.pedagogicalEmpathyNote}
          </p>

          {/* Full Playback Control Bar for Diagnostic Feedback */}
          <AudioPlayerControl
            textToSpeak={speechExplanationText}
            label="Listen to Full Diagnostic Analysis"
            variant="card"
            hasAudioPreference={hasAudioPreference}
          />
        </div>
      </div>

      {/* Evidence Comparison Card (If not correct and has faulty line) */}
      {!isCorrect && !isAmbiguous && diagnosis.faultyExpression && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Mathematical Evidence Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student's Faulty Transition */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-rose-300 font-semibold">
                <span>Your Step (Line {diagnosis.faultyStepNumber || 1})</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200">
                  Misconception
                </span>
              </div>
              <div className="font-mono text-lg font-bold text-rose-100 py-1">
                {diagnosis.faultyExpression}
              </div>
              <p className="text-xs text-rose-300/80">
                Transposed without inverting operational sign.
              </p>
            </div>

            {/* Mathematically Correct Transition */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                <span>Expected WAEC Method</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
                  Standard Rule
                </span>
              </div>
              <div className="font-mono text-lg font-bold text-emerald-100 py-1">
                {diagnosis.expectedExpression}
              </div>
              <p className="text-xs text-emerald-300/80">
                Maintains balance scale equality on both sides.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-1">Why this happened:</strong>
            {diagnosis.explanation}
          </div>
        </div>
      )}

      {/* Action Decision Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onTryAgain}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Try This Equation Again</span>
        </button>

        {!isCorrect && !isAmbiguous && (
          <button
            onClick={onStartIntervention}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-200" />
            <span>Launch 2-Minute Targeted Remedy (+10 XP)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isCorrect && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onViewSummary && (
              <button
                onClick={onViewSummary}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                View Session Summary
              </button>
            )}
            <button
              onClick={onNextQuestion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition hover:scale-[1.02] cursor-pointer"
            >
              <span>Next Equation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
