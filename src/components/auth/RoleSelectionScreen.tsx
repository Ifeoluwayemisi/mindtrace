import React from 'react';
import { GraduationCap, School, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        <span className="inline-block px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-mono font-bold text-[#1D4ED8]">
          Account Setup · Choose Experience
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F172A]">
          How will you use MindTrace?
        </h1>
        <p className="text-xs sm:text-sm text-[#475569]">
          Select your primary role. MindTrace tailors your interface for personal mastery or classroom supervision.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Option 1: Student */}
        <div
          onClick={() => onSelectRole('student')}
          className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] transition-all hover:shadow-xl hover:shadow-[#2563EB]/10 cursor-pointer space-y-4 hover:scale-[1.01]"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-display font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
              Student Learner
            </h2>
            <p className="text-xs text-[#475569] mt-1 leading-relaxed">
              For secondary school students (SS1–SS3) preparing for WAEC, JAMB, or NECO exams.
            </p>
          </div>

          <ul className="text-xs text-[#475569] space-y-2 pt-3 border-t border-[#E2E8F0]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Step-by-step solver diagnostics</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Targeted 2-min visual remedies</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span>Badges, streaks & XP rewards</span>
            </li>
          </ul>

          <div className="pt-2 text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Continue as Student</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 2: Teacher */}
        <div
          onClick={() => onSelectRole('teacher')}
          className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9] transition-all hover:shadow-xl hover:shadow-[#0EA5E9]/10 cursor-pointer space-y-4 hover:scale-[1.01]"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] text-[#0EA5E9] border border-[#BAE6FD] flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-display font-bold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">
              Mathematics Teacher
            </h2>
            <p className="text-xs text-[#475569] mt-1 leading-relaxed">
              For mathematics teachers managing 50+ students in secondary classrooms.
            </p>
          </div>

          <ul className="text-xs text-[#475569] space-y-2 pt-3 border-t border-[#E2E8F0]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0EA5E9] shrink-0" />
              <span>Class-wide misconception heatmaps</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0EA5E9] shrink-0" />
              <span>Micro-skill performance radar</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0EA5E9] shrink-0" />
              <span>5-minute chalkboard scripts</span>
            </li>
          </ul>

          <div className="pt-2 text-xs font-bold text-[#0EA5E9] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Continue as Teacher</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="text-xs text-[#475569] hover:text-[#0F172A] font-medium transition cursor-pointer"
        >
          ← Back to welcome screen
        </button>
      </div>
    </div>
  );
};
