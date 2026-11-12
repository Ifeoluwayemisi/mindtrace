import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  PenLine,
  CircleDot,
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

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      stepNumber: i + 1,
    }));
    setSteps(updated);
    if (focusedField === index) setFocusedField(Math.max(0, index - 1));
  };

  const handleStepChange = (index: number, expression: string) => {
    const updated = [...steps];
    updated[index].mathExpression = expression;
    setSteps(updated);
  };

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

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    speechService.stop();
    const diagnosis = evaluateStudentSubmission(question, steps, finalAnswer);
    let earnedXp = 0;
    const diagReward = gamificationService.awardPoints(student, 'diagnostic_complete', diagnosis.attemptId || question.id, 10, `Completed diagnostic: ${question.equation}`);
    if (diagReward.awarded) earnedXp += 10;
    const validStepCount = steps.filter((s) => s.mathExpression.trim().length > 0).length;
    if (validStepCount >= 2) {
      const stepReward = gamificationService.awardPoints(student, 'working_steps_provided', diagnosis.attemptId || question.id, 5, `Provided complete working steps`);
      if (stepReward.awarded) earnedXp += 5;
    }
    student.dailyGoalCompleted = (student.dailyGoalCompleted || 0) + 1;
    student.totalDiagnosed = (student.totalDiagnosed || 0) + 1;
    if (student.dailyGoalCompleted >= student.dailyGoalTarget) {
      const todayStr = new Date().toISOString().split('T')[0];
      const goalReward = gamificationService.awardPoints(student, 'daily_goal_complete', todayStr, 5, `Completed daily mathematical goal`);
      if (goalReward.awarded) earnedXp += 5;
    }
    diagnosis.earnedXp = earnedXp;
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

  const filledStepCount = steps.filter((s) => s.mathExpression.trim().length > 0).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to question selection</span>
        </button>
        <div className="flex items-center gap-3">
          <AudioPlayerControl
            textToSpeak={`Solve the equation: ${question.equation}. ${question.prompt}. Focus on isolating variable ${question.targetVariable}.`}
            label="Listen"
            variant="compact"
            hasAudioPreference={Boolean(student.audioSupport || student.preferredPresentation?.includes('audio') || student.learningPreferences?.includes('audio'))}
          />
          <span className="text-[12px] text-[#64748B] font-medium hidden sm:inline">
            {question.contextNote || 'WAEC Mathematics Section A'}
          </span>
        </div>
      </div>

      {/* Question card */}
      <section className="card-modern p-5 sm:p-7 space-y-5" aria-labelledby="question-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow text-[#2563EB]">{question.topicTitle}</span>
          <div className="flex items-center gap-2">
            <span className="badge badge-neutral">Difficulty: {question.difficulty}</span>
            <span className="badge badge-diagnostic font-mono">+15 XP</span>
          </div>
        </div>

        <div className="py-6 px-4 sm:px-6 rounded-2xl bg-white border border-[#E2E8F0] bg-math-grid text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[#64748B] mb-2">
            Target equation
          </p>
          <div
            id="question-heading"
            className="math-expression text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-wide break-words"
          >
            {question.equation}
          </div>
        </div>

        <p className="body-text font-medium">{question.prompt}</p>

        <AudioPlayerControl
          textToSpeak={`Solve the equation: ${question.equation}. Instructions: ${question.prompt}. Focus on isolating variable ${question.targetVariable} step-by-step.`}
          label="Listen to question instructions"
          variant="card"
          hasAudioPreference={Boolean(student.audioSupport || student.preferredPresentation?.includes('audio') || student.learningPreferences?.includes('audio'))}
        />

        <div>
          {!activeHint ? (
            <button
              onClick={() => setActiveHint(`Hint: Isolate the term containing ${question.targetVariable} first by undoing operations to both sides.`)}
              className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] text-[#92400E] hover:text-[#B45309] font-semibold cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" aria-hidden="true" />
              <span>Need a hint? (Recorded for teacher analytics)</span>
            </button>
          ) : (
            <div className="math-step math-step-ai p-4 flex items-start gap-3">
              <span className="math-step-badge math-step-badge-ai" aria-hidden="true">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#4338CA]">
                  AI guidance
                </span>
                <p className="text-[13px] text-[#3730A3] leading-relaxed">{activeHint}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sample working presets — demo aid, styled neutrally */}
      <section className="card-flat bg-[#F8FAFC] p-4 sm:p-5 space-y-3" aria-label="Sample working presets">
        <span className="text-[12px] font-bold text-[#334155] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#6366F1]" aria-hidden="true" />
          <span>Diagnostic step presets (autofill sample working)</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleLoadPreset('sign_flip')} className="btn-secondary min-h-[36px] px-3 py-1.5 text-[12px]">Sign reversal error</button>
          <button onClick={() => handleLoadPreset('distrib_error')} className="btn-secondary min-h-[36px] px-3 py-1.5 text-[12px]">Bracket slip</button>
          <button onClick={() => handleLoadPreset('correct')} className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] text-[12px] font-bold transition hover:bg-[#A7F3D0] cursor-pointer">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Flawless working
          </button>
          <button onClick={() => handleLoadPreset('insufficient')} className="btn-secondary min-h-[36px] px-3 py-1.5 text-[12px] text-[#64748B]">Empty steps</button>
        </div>
      </section>

      {/* Working area */}
      <section className="card-modern p-5 sm:p-6 space-y-5" aria-labelledby="working-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="working-heading" className="section-title">Your working</h2>
            <p className="meta-text">Enter each step-by-step transformation.</p>
          </div>
          <button
            onClick={handleAddStep}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[12px] font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> <span>Add line</span>
          </button>
        </div>

        {/* State legend: colour is reinforced with text and icons */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#64748B]" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5 text-[#2563EB]" /> Current step
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Completed step
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5 text-[#94A3B8]" /> Not started
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isFieldActive = focusedField === idx;
            const isFilled = step.mathExpression.trim().length > 0;
            const stateClass = isFieldActive
              ? 'math-step-current'
              : isFilled
              ? 'math-step-completed'
              : 'bg-white border border-[#E2E8F0]';

            return (
              <div key={step.stepNumber} className={`math-step flex items-center gap-3 p-3 ${stateClass}`}>
                <span
                  className={`math-step-badge ${
                    isFieldActive
                      ? 'math-step-badge-current'
                      : isFilled
                      ? 'math-step-badge-completed'
                      : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                  }`}
                  aria-hidden="true"
                >
                  {!isFieldActive && isFilled ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <label htmlFor={`step-${idx}`} className="sr-only">
                    Step {step.stepNumber} expression
                  </label>
                  <input
                    id={`step-${idx}`}
                    type="text"
                    value={step.mathExpression}
                    onFocus={() => setFocusedField(idx)}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder="e.g. 3x = 14 + 7"
                    aria-describedby={`step-state-${idx}`}
                    className="w-full min-h-[28px] bg-transparent math-expression text-[15px] text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                  <span id={`step-state-${idx}`} className="sr-only">
                    {isFieldActive ? 'Current step' : isFilled ? 'Completed step' : 'Not started'}
                  </span>
                </div>
                {steps.length > 1 && (
                  <button
                    onClick={() => handleRemoveStep(idx)}
                    aria-label={`Remove step ${step.stepNumber}`}
                    className="p-2 rounded-lg text-[#94A3B8] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Keypad */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] font-bold text-[#334155]">
            <span>Math keypad</span>
            <span className="text-[11px] text-[#2563EB]">
              Editing {focusedField === 'final' ? 'final answer' : `step ${focusedField + 1}`}
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[ {label: '+', val: ' + '}, {label: '−', val: ' - '}, {label: '×', val: ' * '}, {label: '÷', val: ' / '}, {label: '=', val: ' = '}, {label: 'x', val: 'x'}, {label: '(', val: '('}, {label: ')', val: ')'}, {label: '/', val: '/'}, {label: '⌫', val: 'CLEAR'} ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => handleInsertSymbol(btn.val)}
                aria-label={btn.val === 'CLEAR' ? 'Clear current field' : `Insert ${btn.label}`}
                className={`min-h-[44px] rounded-xl math-expression text-[15px] font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
                  btn.val === 'CLEAR'
                    ? 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    : 'bg-white border border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#EFF6FF] text-[#0F172A]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Final answer */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          <label htmlFor="final-answer" className="label-modern">Final answer</label>
          <div className={`math-step flex items-center gap-3 p-3 ${focusedField === 'final' ? 'math-step-current' : finalAnswer.trim() ? 'math-step-completed' : 'bg-white border border-[#E2E8F0]'}`}>
            <span className="math-expression text-[15px] font-bold text-[#2563EB] pl-1">{question.targetVariable} =</span>
            <input
              id="final-answer"
              type="text"
              value={finalAnswer}
              onFocus={() => setFocusedField('final')}
              onChange={(e) => setFinalAnswer(e.target.value)}
              placeholder="e.g. 7"
              className="w-full min-h-[32px] bg-transparent math-expression text-lg font-bold text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[12px] text-[#64748B] font-medium">
            {filledStepCount} of {steps.length} lines filled · Deterministic engine: &lt;50ms response.
          </div>
          <button
            onClick={handleDiagnose}
            disabled={isDiagnosing}
            className="btn-primary w-full sm:w-auto px-6 py-3 text-sm"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span>{isDiagnosing ? 'Diagnosing…' : 'Diagnose steps'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
