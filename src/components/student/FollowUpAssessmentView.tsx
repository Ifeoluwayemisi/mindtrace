import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Question, StudentProfile } from '../../types';
import { cleanMathStr } from '../../services/edgeRuleEngine';
import { storageService } from '../../services/storageService';
import { gamificationService } from '../../services/gamificationService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface FollowUpAssessmentViewProps {
  question: Question;
  student: StudentProfile;
  onMasteryAchieved: () => void;
  onReturnToDashboard: () => void;
}

export const FollowUpAssessmentView: React.FC<FollowUpAssessmentViewProps> = ({
  question,
  student,
  onMasteryAchieved,
  onReturnToDashboard,
}) => {
  const followUp = question.followUpQuestion || {
    equation: '4x - 9 = 15',
    prompt: 'Check your mastery: Solve 4x - 9 = 15. What is the value of x?',
    expectedFinalAnswer: '6',
    expectedSteps: ['4x = 15 + 9', '4x = 24', 'x = 6'],
  };

  const [workingStep, setWorkingStep] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [earnedBonusXp, setEarnedBonusXp] = useState(0);

  const handleSubmit = async () => {
    setIsEvaluating(true);
    const cleaned = cleanMathStr(finalAnswer);
    const expected = cleanMathStr(followUp.expectedFinalAnswer);

    await new Promise((r) => setTimeout(r, 200));
    setIsEvaluating(false);

    // 1. Award +10 XP for attempting the follow-up assessment (idempotent)
    let bonus = 0;
    const attemptReward = gamificationService.awardPoints(
      student,
      'followup_complete',
      followUp.equation,
      10,
      `Completed follow-up verification: ${followUp.equation}`
    );
    if (attemptReward.awarded) bonus += 10;

    if (cleaned === expected) {
      setIsSuccess(true);
      // 2. Award +15 XP for demonstrating conceptual improvement on follow-up!
      const improveReward = gamificationService.awardPoints(
        student,
        'followup_improved',
        followUp.equation,
        15,
        `Demonstrated improvement on follow-up: ${followUp.equation}`
      );
      if (improveReward.awarded) bonus += 15;

      // Persist mastery update
      student.masteryPercentage = Math.min(100, student.masteryPercentage + 4);
      student.streakDays = student.streakDays + 1;
      gamificationService.evaluateBadges(student);
      await storageService.saveStudentProfile(student);
    } else {
      setIsSuccess(false);
    }

    setEarnedBonusXp(bonus);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            Immediate Follow-Up Mastery Check
          </span>
          <span className="text-xs text-amber-300 font-mono font-bold">+25 XP Opportunity</span>
        </div>

        <h2 className="text-xl font-display font-bold text-white">
          Put Your New Understanding into Practice
        </h2>
        <p className="text-xs text-slate-300">
          Solve this follow-up equation to verify that you have eliminated the misconception.
        </p>

        {/* Audio Read-Aloud for Follow-up Equation */}
        <AudioPlayerControl
          textToSpeak={`Follow-up mastery check. Solve the equation: ${followUp.equation}. Instructions: ${followUp.prompt}`}
          label="Listen to Follow-Up Equation"
          variant="card"
          hasAudioPreference={Boolean(
            student.audioSupport ||
              student.preferredPresentation?.includes('audio') ||
              student.learningPreferences?.includes('audio')
          )}
        />

        {/* Follow-up Equation Card */}
        <div className="py-4 px-6 rounded-2xl bg-slate-950 border border-emerald-950 text-center">
          <p className="text-xs text-slate-400 mb-1">Solve for x:</p>
          <div className="font-mono text-3xl font-extrabold text-white">
            {followUp.equation}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Your transition step (optional but recommended):
            </label>
            <input
              type="text"
              value={workingStep}
              onChange={(e) => setWorkingStep(e.target.value)}
              placeholder="e.g. 4x = 15 + 9"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Final value of x:
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-indigo-900/60 focus-within:border-indigo-500">
              <span className="font-mono font-bold text-indigo-400 text-sm">x =</span>
              <input
                type="text"
                value={finalAnswer}
                onChange={(e) => setFinalAnswer(e.target.value)}
                placeholder="e.g. 6"
                className="flex-1 bg-transparent font-mono text-base font-bold text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Evaluation Output */}
        {isSuccess === true && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Misconception Overcome! Full Marks.</span>
              </div>
              {earnedBonusXp > 0 && (
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                  +{earnedBonusXp} XP Added!
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-300/90 leading-relaxed">
              You applied the inverse sign transposition correctly. Your algebra mastery has
              increased to <strong className="text-white">{student.masteryPercentage}%</strong> and
              your practice streak is now <strong className="text-white">{student.streakDays} days</strong>!
            </p>
          </div>
        )}

        {isSuccess === false && (
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/60 text-amber-200 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <span>Not quite yet — Let's check the signs</span>
            </div>
            <p className="text-xs text-amber-300/90">
              In 4x - 9 = 15, adding 9 to both sides gives 4x = 15 + 9 = 24. Then dividing by 4 gives x = 6.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isSuccess !== true ? (
            <button
              onClick={handleSubmit}
              disabled={isEvaluating || !finalAnswer.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isEvaluating ? 'Evaluating...' : 'Verify Answer'}</span>
            </button>
          ) : (
            <button
              onClick={onMasteryAchieved}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Record Mastery & Complete Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
