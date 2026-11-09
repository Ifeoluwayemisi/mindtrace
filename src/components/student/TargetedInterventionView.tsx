import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Scale,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  Clock,
  BookOpen,
} from 'lucide-react';
import { TargetedIntervention, Question } from '../../types';
import { TARGETED_INTERVENTIONS } from '../../data/questionBank';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface TargetedInterventionViewProps {
  misconceptionCode: string;
  onProceedToFollowUp: () => void;
  onCancel: () => void;
}

export const TargetedInterventionView: React.FC<TargetedInterventionViewProps> = ({
  misconceptionCode,
  onProceedToFollowUp,
  onCancel,
}) => {
  const intervention: TargetedIntervention =
    TARGETED_INTERVENTIONS[misconceptionCode] || TARGETED_INTERVENTIONS.ALG_SIGN_FLIP;

  const savedStudent = storageService.getSavedStudentProfile();
  const hasAudioPreference = Boolean(
    savedStudent.audioSupport ||
      savedStudent.preferredPresentation?.includes('audio') ||
      savedStudent.learningPreferences?.includes('audio')
  );

  const speechRemedyText = `${intervention.title}. ${intervention.subtitle}. The MindTrace Axiom: ${intervention.coreRule}. Interactive model: ${intervention.metaphorTitle}. ${intervention.metaphorDescription}`;

  // Interactive Balance Scale state for visual sandbox
  const [scaleLeft, setScaleLeft] = useState(14);
  const [scaleRight, setScaleRight] = useState(14);
  const [addedNumber, setAddedNumber] = useState<number | null>(null);

  // Interactive Rainbow Distribution state
  const [multiplier, setMultiplier] = useState(4);
  const [termA, setTermA] = useState(2);
  const [termB, setTermB] = useState(-3);
  const [activeRainbowStep, setActiveRainbowStep] = useState(0);

  const isBalanced = scaleLeft === scaleRight;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-800/60 p-6 md:p-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
            Targeted Cognitive Remedy · {intervention.durationMinutes} Min Micro-Module
          </span>
          <div className="flex items-center gap-2">
            <AudioPlayerControl
              textToSpeak={speechRemedyText}
              label="Listen"
              variant="compact"
              hasAudioPreference={hasAudioPreference}
            />
            <span className="inline-flex items-center gap-1 text-xs text-indigo-300 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>2 Minutes</span>
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold text-white">
          {intervention.title}
        </h1>
        <p className="text-sm text-slate-300">
          {intervention.subtitle}
        </p>

        {/* Core Mathematical Golden Rule */}
        <div className="mt-4 p-4 rounded-2xl bg-indigo-900/40 border border-indigo-700/50">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs uppercase font-bold text-amber-300 block mb-1">
                The MindTrace Axiom:
              </strong>
              <p className="text-sm text-white font-medium">
                {intervention.coreRule}
              </p>
            </div>
          </div>
        </div>

        {/* Full Playback Control Bar for 2-Minute Targeted Remedy */}
        <AudioPlayerControl
          textToSpeak={speechRemedyText}
          label="Listen to 2-Minute Remedy Explanation"
          variant="card"
          hasAudioPreference={hasAudioPreference}
        />
      </div>

      {/* Interactive Simulation Sandbox (Domain specific) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <span>Interactive Model: {intervention.metaphorTitle}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {intervention.metaphorDescription}
            </p>
          </div>
        </div>

        {/* Model 1: Balance Scale Simulation */}
        {intervention.interactiveModel === 'balance_scale' && (
          <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-6">
            <div className="flex flex-col items-center justify-center">
              {/* Scale Visualization */}
              <div className="w-full max-w-md py-6 flex items-center justify-between relative">
                {/* Left Pan */}
                <div
                  className={`w-36 p-4 rounded-2xl border text-center transition-all duration-300 ${
                    scaleLeft > scaleRight
                      ? 'translate-y-4 bg-indigo-950/80 border-indigo-500'
                      : scaleLeft < scaleRight
                      ? '-translate-y-4 bg-slate-900 border-slate-700'
                      : 'translate-y-0 bg-slate-900/90 border-emerald-500/80'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    Left Side
                  </span>
                  <div className="font-mono text-xl font-bold text-white">
                    3x - 7 {addedNumber !== null && <span className="text-indigo-400">+ 7</span>}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Weight: {scaleLeft}
                  </span>
                </div>

                {/* Fulcrum Pivot */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-indigo-500" />
                  <span className="text-xs font-bold text-slate-300 mt-2">
                    {isBalanced ? 'BALANCED (=)' : 'UNBALANCED (≠)'}
                  </span>
                </div>

                {/* Right Pan */}
                <div
                  className={`w-36 p-4 rounded-2xl border text-center transition-all duration-300 ${
                    scaleRight > scaleLeft
                      ? 'translate-y-4 bg-indigo-950/80 border-indigo-500'
                      : scaleRight < scaleLeft
                      ? '-translate-y-4 bg-slate-900 border-slate-700'
                      : 'translate-y-0 bg-slate-900/90 border-emerald-500/80'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    Right Side
                  </span>
                  <div className="font-mono text-xl font-bold text-white">
                    14 {addedNumber !== null && <span className="text-indigo-400">+ 7</span>}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Weight: {scaleRight}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div
                className={`text-xs px-3 py-1.5 rounded-xl font-medium mt-2 ${
                  isBalanced
                    ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800'
                    : 'text-amber-300 bg-amber-950/60 border border-amber-800'
                }`}
              >
                {isBalanced
                  ? 'Equality holds: Adding +7 to BOTH sides leaves 3x = 21.'
                  : 'Scale tilted! Subtracting only from one side breaks equality.'}
              </div>
            </div>

            {/* Interactive Buttons for Student */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setScaleLeft(21);
                  setScaleRight(21);
                  setAddedNumber(7);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Apply Correct Action: Add +7 to BOTH Sides
              </button>
              <button
                onClick={() => {
                  setScaleLeft(14);
                  setScaleRight(7);
                  setAddedNumber(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900/80 border border-rose-800 text-rose-200 text-xs font-semibold transition cursor-pointer"
              >
                Observe Sign Error: Subtract 7 from Right Only
              </button>
              <button
                onClick={() => {
                  setScaleLeft(14);
                  setScaleRight(14);
                  setAddedNumber(null);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Reset Scale
              </button>
            </div>
          </div>
        )}

        {/* Model 2: Rainbow Expansion Visualizer */}
        {intervention.interactiveModel === 'rainbow_expansion' && (
          <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-6 text-center">
            <div className="font-mono text-2xl font-bold text-white flex items-center justify-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-600 text-white">4</span>
              <span>(</span>
              <span className="p-2 rounded-lg bg-violet-900/60 text-violet-200">2x</span>
              <span className="p-2 rounded-lg bg-pink-900/60 text-pink-200">- 3</span>
              <span>)</span>
              <span>= 28</span>
            </div>

            {/* Visual Expansion Arrows */}
            <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-violet-800/50">
                <span className="text-violet-400 font-semibold block mb-1">
                  Arrow 1: Outer × Term 1
                </span>
                <span className="font-mono text-sm text-white font-bold">4 × 2x = 8x</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-pink-800/50">
                <span className="text-pink-400 font-semibold block mb-1">
                  Arrow 2: Outer × Term 2
                </span>
                <span className="font-mono text-sm text-white font-bold">4 × (-3) = -12</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 font-medium">
              Resulting equation:{' '}
              <span className="font-mono font-bold text-white">8x - 12 = 28</span> (Not 8x - 3!)
            </div>
          </div>
        )}

        {/* 3-Step Guided Walkthrough */}
        <div className="space-y-3 pt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3-Step Visual Memory Blueprint
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {intervention.stepGuide.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
              >
                <div className="text-xs font-semibold text-indigo-400">{step.title}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                <div className="pt-2 font-mono text-xs font-bold text-indigo-200">
                  {step.formulaVisual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA to verify recovery */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          Cancel & Return
        </button>

        <button
          onClick={onProceedToFollowUp}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition hover:scale-[1.02] cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Take Single Follow-Up Check (Prove Mastery)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
