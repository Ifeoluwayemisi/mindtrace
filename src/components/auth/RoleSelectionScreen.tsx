import React from 'react';
import { GraduationCap, School, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Role } from '../../types';

interface RoleSelectionScreenProps {
  onSelectRole: (role: Role) => void;
  onBack: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRole,
  onBack,
}) => {
  return (
    <div className="max-w-xl mx-auto my-auto min-h-[70vh] flex flex-col justify-center px-4 animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-medium text-indigo-400">
          Account Setup · Choose Experience
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          How will you use MindTrace?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Select your primary role. MindTrace tailors your interface for personal mastery or classroom supervision.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Student */}
        <div
          onClick={() => onSelectRole('student')}
          className="group p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 transition-all hover:bg-slate-900 cursor-pointer space-y-4 shadow-xl hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-display font-bold text-white group-hover:text-indigo-300 transition-colors">
              Student Learner
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              For secondary school students (SS1–SS3) preparing for WAEC, JAMB, or NECO exams.
            </p>
          </div>

          <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800/60">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Step-by-step solver diagnostics</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Targeted 2-min visual remedies</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Badges, streaks & XP rewards</span>
            </li>
          </ul>

          <div className="pt-2 text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Continue as Student</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 2: Teacher */}
        <div
          onClick={() => onSelectRole('teacher')}
          className="group p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/80 transition-all hover:bg-slate-900 cursor-pointer space-y-4 shadow-xl hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-950 text-violet-400 border border-violet-800/60 flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-display font-bold text-white group-hover:text-violet-300 transition-colors">
              Mathematics Teacher
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              For mathematics teachers managing 50+ students in overcrowded secondary classrooms.
            </p>
          </div>

          <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800/60">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Class-wide misconception heatmaps</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Micro-skill performance radar</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              <span>5-minute chalkboard scripts</span>
            </li>
          </ul>

          <div className="pt-2 text-xs font-bold text-violet-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Continue as Teacher</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          ← Back to Welcome
        </button>
      </div>
    </div>
  );
};
