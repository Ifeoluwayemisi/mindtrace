import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  CheckCircle,
  Lightbulb,
  Volume2,
  Sparkles,
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#74788E] hover:text-[#252641] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Selection</span>
        </button>
        <div className="flex items-center gap-3">
          <AudioPlayerControl
            textToSpeak={`Solve the equation: ${question.equation}. ${question.prompt}. Focus on isolating variable ${question.targetVariable}.`}
            label="Listen"
            variant="compact"
            hasAudioPreference={Boolean(student.audioSupport || student.preferredPresentation?.includes('audio') || student.learningPreferences?.includes('audio'))}
          />
          <span className="text-xs text-[#6755E8] font-bold">
            {question.contextNote || 'WAEC Mathematics Section A'}
          </span>
        </div>
      </div>

      <div className="card-modern p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#6755E8]">
            {question.topicTitle}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-[#F5F6FC] text-[#252641] font-bold">
              Difficulty: {question.difficulty}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#FFC85A]/20 text-[#B27B08] font-mono font-bold">
              +15 XP
            </span>
          </div>
        </div>

        <div className="py-6 px-6 rounded-2xl bg-[#F8F9FF] border border-[#E9EAF3] text-center">
          <p className="text-xs font-bold text-[#74788E] mb-2">Target Equation:</p>
          <div className="font-mono text-4xl font-black text-[#252641] tracking-wide">
            {question.equation}
          </div>
        </div>

        <p className="text-sm text-[#4A4D68] font-medium leading-relaxed">{question.prompt}</p>

        <AudioPlayerControl
          textToSpeak={`Solve the equation: ${question.equation}. Instructions: ${question.prompt}. Focus on isolating variable ${question.targetVariable} step-by-step.`}
          label="Listen to Question Instructions"
          variant="card"
          hasAudioPreference={Boolean(student.audioSupport || student.preferredPresentation?.includes('audio') || student.learningPreferences?.includes('audio'))}
        />

        <div className="pt-2">
          {!activeHint ? (
            <button
              onClick={() => setActiveHint(`Hint: Isolate the term containing ${question.targetVariable} first by undoing operations to both sides.`)}
              className="inline-flex items-center gap-1.5 text-xs text-[#B27B08] hover:text-[#5140CA] font-bold cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Need a hint? (Recorded for teacher analytics)</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-[#FFF9EB] border border-[#FCECC2] text-xs text-[#B27B08] font-medium flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-[#B27B08] shrink-0 mt-0.5" />
              <span>{activeHint}</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-[#F3F1FF] border border-[#E4E0FD] p-5 space-y-3">
        <span className="text-xs font-bold text-[#5140CA] flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Diagnostic Step Presets (Autofill sample working):</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleLoadPreset('sign_flip')} className="px-3 py-1.5 rounded-lg bg-white border border-[#E9EAF3] hover:border-[#6755E8] text-[#5140CA] text-xs font-bold transition cursor-pointer">Sign Reversal Error</button>
          <button onClick={() => handleLoadPreset('distrib_error')} className="px-3 py-1.5 rounded-lg bg-white border border-[#E9EAF3] hover:border-[#6755E8] text-[#5140CA] text-xs font-bold transition cursor-pointer">Bracket Slip</button>
          <button onClick={() => handleLoadPreset('correct')} className="px-3 py-1.5 rounded-lg bg-[#49C6A3] text-white text-xs font-bold transition cursor-pointer">Flawless Working</button>
          <button onClick={() => handleLoadPreset('insufficient')} className="px-3 py-1.5 rounded-lg bg-[#E9EAF3] text-[#74788E] text-xs font-bold transition cursor-pointer">Empty Steps</button>
        </div>
      </div>

      <div className="card-modern p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-[#252641]">Your Working</h3>
            <p className="text-xs text-[#74788E]">Enter step-by-step transformation.</p>
          </div>
          <button onClick={handleAddStep} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F6FC] hover:bg-[#F3F1FF] text-[#6755E8] text-xs font-bold transition cursor-pointer">
            <Plus className="w-4 h-4" /> <span>Add Line</span>
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isFieldActive = focusedField === idx;
            return (
              <div key={step.stepNumber} className={`flex items-center gap-3 p-3 rounded-2xl transition ${isFieldActive ? 'bg-[#F3F1FF] border-2 border-[#6755E8]' : 'bg-[#F8F9FF] border border-[#E9EAF3]'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 ${isFieldActive ? 'bg-[#6755E8] text-white' : 'bg-white border border-[#E9EAF3] text-[#6755E8]'}`}>
                  {step.stepNumber}
                </div>
                <input
                  type="text"
                  value={step.mathExpression}
                  onFocus={() => setFocusedField(idx)}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder="e.g. 3x = 14 + 7"
                  className="w-full bg-transparent text-sm font-mono text-[#252641] placeholder:text-[#B8BCD4] focus:outline-hidden"
                />
                {steps.length > 1 && (
                  <button onClick={() => handleRemoveStep(idx)} className="p-1.5 text-[#B8BCD4] hover:text-[#D64D31] transition cursor-pointer rounded-lg hover:bg-[#FFF1EE]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-[#F8F9FF] border border-[#E9EAF3] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#252641]">
            <span>Math Keypad:</span>
            <span className="text-[11px] text-[#6755E8]">Editing {focusedField === 'final' ? 'Final Answer' : `Step ${focusedField + 1}`}</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[ {label: '+', val: ' + '}, {label: '−', val: ' - '}, {label: '×', val: ' * '}, {label: '÷', val: ' / '}, {label: '=', val: ' = '}, {label: 'x', val: 'x'}, {label: '(', val: '('}, {label: ')', val: ')'}, {label: '/', val: '/'}, {label: '⌫', val: 'CLEAR'} ].map((btn) => (
              <button key={btn.label} type="button" onClick={() => handleInsertSymbol(btn.val)} className={`min-h-[44px] rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${btn.val === 'CLEAR' ? 'bg-[#FFF1EE] text-[#D64D31] border border-[#FDDDD7]' : 'bg-white border border-[#E9EAF3] hover:border-[#6755E8] text-[#252641]'}`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[#E9EAF3]">
          <label className="block text-xs font-bold text-[#252641] mb-2">Final Answer:</label>
          <div className={`flex items-center gap-3 p-3 rounded-2xl transition ${focusedField === 'final' ? 'bg-[#F3F1FF] border-2 border-[#6755E8]' : 'bg-[#F8F9FF] border border-[#E9EAF3]'}`}>
            <span className="font-mono text-sm font-bold text-[#6755E8]">x =</span>
            <input type="text" value={finalAnswer} onFocus={() => setFocusedField('final')} onChange={(e) => setFinalAnswer(e.target.value)} placeholder="e.g. 7" className="w-full bg-transparent font-mono text-base font-bold text-[#252641] placeholder:text-[#B8BCD4] focus:outline-hidden" />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-[#74788E] font-medium">Deterministic engine: &lt;50ms response.</div>
          <button onClick={handleDiagnose} disabled={isDiagnosing} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] text-white font-bold text-sm shadow-xl shadow-[#6755E8]/20 transition-all hover:scale-[1.02] cursor-pointer">
            <Zap className="w-4 h-4" /> <span>{isDiagnosing ? 'Diagnosing...' : 'Diagnose Steps'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
