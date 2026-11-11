import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Question, StepSubmission, DiagnosisResult, StudentProfile } from '../../types';
import { evaluateStudentSubmission } from '../../services/edgeRuleEngine';
import { storageService } from '../../services/storageService';
import { gamificationService } from '../../services/gamificationService';
import { speechService } from '../../services/speechService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface QuestionInterfaceProps {
  question: Question;
  student: StudentProfile;
  onBack: () => void;
  onDiagnosisCompleted: (result: DiagnosisResult) => void;
}

export const QuestionInterface: React.FC<QuestionInterfaceProps> = ({
  question,
  student,
  onBack,
  onDiagnosisCompleted,
}) => {
  const [steps, setSteps] = useState<StepSubmission[]>([
    { stepNumber: 1, actionDescription: 'Transpose constant term', mathExpression: '' },
    { stepNumber: 2, actionDescription: 'Simplify expression', mathExpression: '' },
  ]);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [focusedField, setFocusedField] = useState<number | 'final'>(0);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Add intermediate step
  const handleAddStep = () => {
    const nextNumber = steps.length + 1;
    setSteps([
      ...steps,
      {
        stepNumber: nextNumber,
        actionDescription: `Step ${nextNumber}`,
        mathExpression: '',
      },
    ]);
    setFocusedField(steps.length);
  };

  // Remove step
  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      stepNumber: i + 1,
    }));
    setSteps(updated);
    if (focusedField === index) setFocusedField(Math.max(0, index - 1));
  };

  // Update step expression
  const handleStepChange = (index: number, expression: string) => {
    const updated = [...steps];
    updated[index].mathExpression = expression;
    setSteps(updated);
  };

  // Insert character from accessible virtual math keyboard
  const handleInsertSymbol = (symbol: string) => {
    if (symbol === 'CLEAR') {
      if (focusedField === 'final') {
        setFinalAnswer('');
      } else {
        const updated = [...steps];
        updated[focusedField].mathExpression = '';
        setSteps(updated);
      }
      return;
    }

    if (focusedField === 'final') {
      setFinalAnswer((prev) => prev + symbol);
    } else {
      const updated = [...steps];
      updated[focusedField].mathExpression = (updated[focusedField].mathExpression || '') + symbol;
      setSteps(updated);
    }
  };

  // Quick preset loaders for hackathon demonstration
  const handleLoadPreset = (type: 'sign_flip' | 'distrib_error' | 'correct' | 'insufficient') => {
    if (type === 'sign_flip') {
      if (question.id === 'q-lin-01') {
        setSteps([
          { stepNumber: 1, actionDescription: 'Move -7 across equals sign', mathExpression: '3x = 14 - 7' },
          { stepNumber: 2, actionDescription: 'Subtract right side', mathExpression: '3x = 7' },
        ]);
        setFinalAnswer('7/3');
      } else if (question.id === 'q-vars-03') {
        setSteps([
          { stepNumber: 1, actionDescription: 'Collect terms', mathExpression: '5x + 2x = 29 + 8' },
          { stepNumber: 2, actionDescription: 'Simplify', mathExpression: '7x = 37' },
        ]);
        setFinalAnswer('37/7');
      } else {
        setSteps([
          { stepNumber: 1, actionDescription: 'Clear fraction', mathExpression: '2x - 4 = 18' },
          { stepNumber: 2, actionDescription: 'Transpose 4', mathExpression: '2x = 18 - 4' },
        ]);
        setFinalAnswer('7');
      }
    } else if (type === 'distrib_error') {
      setSteps([
        { stepNumber: 1, actionDescription: 'Expand bracket', mathExpression: '8x - 3 = 28' },
        { stepNumber: 2, actionDescription: 'Add 3', mathExpression: '8x = 31' },
      ]);
      setFinalAnswer('31/8');
    } else if (type === 'correct') {
      setSteps(
        question.expectedSteps.slice(0, 3).map((st, i) => ({
          stepNumber: i + 1,
          actionDescription: `Standard transition ${i + 1}`,
          mathExpression: st,
        }))
      );
      setFinalAnswer(question.expectedFinalAnswer);
    } else if (type === 'insufficient') {
      setSteps([
        { stepNumber: 1, actionDescription: 'Blank', mathExpression: '' },
      ]);
      setFinalAnswer('42');
    }
  };

  // Execute deterministic edge diagnosis & idempotent gamification points
  const handleDiagnose = async () => {
    setIsDiagnosing(true);

    // Stop speech if active
    speechService.stop();

    // Run deterministic edge rule engine (<50ms execution)
    const diagnosis = evaluateStudentSubmission(question, steps, finalAnswer);

    // Calculate XP rewards idempotently
    let earnedXp = 0;

    // 1. Award +10 XP for completing a diagnostic
    const diagReward = gamificationService.awardPoints(
      student,
      'diagnostic_complete',
      diagnosis.attemptId || question.id,
      10,
      `Completed mathematical diagnostic: ${question.equation}`
    );
    if (diagReward.awarded) earnedXp += 10;

    // 2. Award +5 XP for providing complete mathematical working (at least 2 non-empty steps)
    const validStepCount = steps.filter((s) => s.mathExpression.trim().length > 0).length;
    if (validStepCount >= 2) {
      const stepReward = gamificationService.awardPoints(
        student,
        'working_steps_provided',
        diagnosis.attemptId || question.id,
        5,
        `Provided complete intermediate working steps`
      );
      if (stepReward.awarded) earnedXp += 5;
    }

    // Increment daily goal count
    student.dailyGoalCompleted = (student.dailyGoalCompleted || 0) + 1;
    student.totalDiagnosed = (student.totalDiagnosed || 0) + 1;

    // Check if daily goal met (award +5 XP idempotently)
    if (student.dailyGoalCompleted >= student.dailyGoalTarget) {
      const todayStr = new Date().toISOString().split('T')[0];
      const goalReward = gamificationService.awardPoints(
        student,
        'daily_goal_complete',
        todayStr,
        5,
        `Completed daily mathematical goal (${student.dailyGoalTarget} equations)`
      );
      if (goalReward.awarded) earnedXp += 5;
    }

    diagnosis.earnedXp = earnedXp;

    // Save record to local IndexedDB store and enqueue for micro-sync
    await storageService.saveDiagnosticRecord(diagnosis, student, 38, activeHint ? 1 : 0, {
      equation: question.equation,
      workingSteps: steps,
      finalAnswer,
    });
    await storageService.saveStudentProfile(student);

    setTimeout(() => {
      setIsDiagnosing(false);
      onDiagnosisCompleted(diagnosis);
    }, 180);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button & context */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Selection</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Read-Aloud Speech Button (Compact button beside header) */}
          <AudioPlayerControl
            textToSpeak={`Solve the equation: ${question.equation}. ${question.prompt}. Focus on isolating variable ${question.targetVariable}.`}
            label="Listen"
            variant="compact"
            hasAudioPreference={Boolean(student.audioSupport || student.preferredPresentation?.includes('audio') || student.learningPreferences?.includes('audio'))}
          />

          <span className="text-xs text-indigo-400 font-medium">
            {question.contextNote || 'WAEC Mathematics Section A'}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {question.topicTitle}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Difficulty: {question.difficulty}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300 font-mono font-bold">
              +15 XP
            </span>
          </div>
        </div>

        {/* Displayed Equation */}
        <div className="py-4 px-6 rounded-2xl bg-slate-950/90 border border-indigo-950 text-center relative group">
          <p className="text-xs text-slate-400 mb-1">Target Equation:</p>
          <div className="font-mono text-3xl font-extrabold text-white tracking-wide">
            {question.equation}
          </div>
        </div>

        <p className="text-sm text-slate-200">{question.prompt}</p>

        {/* Accessible Audio Read-Aloud Bar directly below question instructions */}
        <AudioPlayerControl
          textToSpeak={`Solve the equation: ${question.equation}. Instructions: ${question.prompt}. Focus on isolating variable ${question.targetVariable} step-by-step.`}
          label="Listen to Question Instructions"
          variant="card"
          hasAudioPreference={Boolean(student.audioSupport || student.preferredPresentation?.includes('audio') || student.learningPreferences?.includes('audio'))}
        />

        {/* Quick hint expander */}
        <div className="pt-2">
          {!activeHint ? (
            <button
              onClick={() =>
                setActiveHint(
                  `Hint: Isolate the term containing ${question.targetVariable} first by undoing operations to both sides.`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Need a hint? (Recorded for teacher analytics)</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{activeHint}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preset Benchmarks for Hackathon Testing */}
      <div className="rounded-2xl bg-indigo-950/30 border border-indigo-900/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Diagnostic Step Presets (Click to autofill sample working):</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLoadPreset('sign_flip')}
            className="px-2.5 py-1 rounded-lg bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 text-indigo-200 text-xs font-medium transition cursor-pointer"
          >
            Sign Reversal Error (ALG_SIGN_FLIP)
          </button>
          <button
            onClick={() => handleLoadPreset('distrib_error')}
            className="px-2.5 py-1 rounded-lg bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 text-indigo-200 text-xs font-medium transition cursor-pointer"
          >
            Bracket Slip (ALG_INVALID_DISTRIB)
          </button>
          <button
            onClick={() => handleLoadPreset('correct')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 text-xs font-medium transition cursor-pointer"
          >
            Flawless Working
          </button>
          <button
            onClick={() => handleLoadPreset('insufficient')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            Empty Steps (Abstention Test)
          </button>
        </div>
      </div>

      {/* Step-by-Step Mathematical Reasoning Input */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-white">
              Your Step-by-Step Working
            </h3>
            <p className="text-xs text-slate-400">
              Enter each transformation line. The edge rule engine examines your operational logic.
            </p>
          </div>
          <button
            onClick={handleAddStep}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line</span>
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isFieldActive = focusedField === idx;
            return (
              <div
                key={step.stepNumber}
                className={`flex items-center gap-3 p-3 rounded-2xl transition ${
                  isFieldActive
                    ? 'bg-slate-900 border-2 border-indigo-500 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-950/70 border border-slate-800'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                    isFieldActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-indigo-400'
                  }`}
                >
                  {step.stepNumber}
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={step.mathExpression}
                    onFocus={() => setFocusedField(idx)}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder={`e.g. ${
                      idx === 0 ? '3x = 14 + 7' : idx === 1 ? '3x = 21' : 'x = 21 / 3'
                    }`}
                    className="w-full bg-transparent text-sm sm:text-base font-mono text-white placeholder:text-slate-600 focus:outline-hidden"
                  />
                </div>

                {isFieldActive && (
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 hidden sm:inline">
                    Editing
                  </span>
                )}

                {steps.length > 1 && (
                  <button
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer rounded-lg hover:bg-slate-800"
                    title="Remove step line"
                    aria-label={`Remove step ${step.stepNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Accessible Virtual Mathematics Keypad (Touch Target >= 44px) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Interactive Math Keypad:
            </span>
            <span className="text-[11px] font-mono text-indigo-400">
              Inserting into {focusedField === 'final' ? 'Final Answer' : `Step ${focusedField + 1}`}
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[
              { label: '+', val: ' + ' },
              { label: '−', val: ' - ' },
              { label: '×', val: ' * ' },
              { label: '÷', val: ' / ' },
              { label: '=', val: ' = ' },
              { label: 'x', val: 'x' },
              { label: '(', val: '(' },
              { label: ')', val: ')' },
              { label: '/', val: '/' },
              { label: '⌫ Clear', val: 'CLEAR' },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => handleInsertSymbol(btn.val)}
                className={`min-h-[44px] rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  btn.val === 'CLEAR'
                    ? 'col-span-2 sm:col-span-1 bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900/60'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-indigo-500'
                }`}
                aria-label={`Insert mathematical symbol ${btn.label}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Final Answer Input */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            Final Answer for {question.targetVariable}:
          </label>
          <div
            className={`flex items-center gap-3 p-3 rounded-2xl transition ${
              focusedField === 'final'
                ? 'bg-slate-900 border-2 border-indigo-500 shadow-md shadow-indigo-950/40'
                : 'bg-slate-950/90 border border-indigo-900/60'
            }`}
          >
            <span className="font-mono text-sm font-bold text-indigo-400">
              {question.targetVariable} =
            </span>
            <input
              type="text"
              value={finalAnswer}
              onFocus={() => setFocusedField('final')}
              onChange={(e) => setFinalAnswer(e.target.value)}
              placeholder="e.g. 7"
              className="flex-1 bg-transparent font-mono text-base font-bold text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Deterministic edge engine: &lt;50ms response, 0 KB data.</span>
          </div>

          <button
            onClick={handleDiagnose}
            disabled={isDiagnosing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isDiagnosing ? 'animate-bounce' : ''}`} />
            <span>{isDiagnosing ? 'Diagnosing Reasoning...' : 'Diagnose My Steps'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
