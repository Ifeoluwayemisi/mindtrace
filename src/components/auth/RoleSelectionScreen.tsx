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
        <span className="inline-block px-3 py-1 rounded-full bg-[#F3F1FF] border border-[#E4E0FD] text-xs font-mono font-bold text-[#5140CA]">
          Account Setup · Choose Experience
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#252641]">
          How will you use MindTrace?
        </h1>
        <p className="text-xs sm:text-sm text-[#74788E]">
          Select your primary role. MindTrace tailors your interface for personal mastery or classroom supervision.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Option 1: Student */}
        <div
          onClick={() => onSelectRole('student')}
          className="group p-6 rounded-3xl bg-white border border-[#E9EAF3] hover:border-[#6755E8] transition-all hover:shadow-xl hover:shadow-[#6755E8]/10 cursor-pointer space-y-4 hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F3F1FF] text-[#6755E8] border border-[#E4E0FD] flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-display font-bold text-[#252641] group-hover:text-[#6755E8] transition-colors">
              Student Learner
            </h2>
            <p className="text-xs text-[#74788E] mt-1 leading-relaxed">
              For secondary school students (SS1–SS3) preparing for WAEC, JAMB, or NECO exams.
            </p>
          </div>

          <ul className="text-xs text-[#4A4D68] space-y-2 pt-3 border-t border-[#E9EAF3]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#49C6A3] shrink-0" />
              <span>Step-by-step solver diagnostics</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#49C6A3] shrink-0" />
              <span>Targeted 2-min visual remedies</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#49C6A3] shrink-0" />
              <span>Badges, streaks & XP rewards</span>
            </li>
          </ul>

          <div className="pt-2 text-xs font-bold text-[#6755E8] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Continue as Student</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 2: Teacher */}
        <div
          onClick={() => onSelectRole('teacher')}
          className="group p-6 rounded-3xl bg-white border border-[#E9EAF3] hover:border-[#5140CA] transition-all hover:shadow-xl hover:shadow-[#5140CA]/10 cursor-pointer space-y-4 hover:scale-[1.02]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EBF8FB] text-[#167E96] border border-[#CEEEF6] flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-display font-bold text-[#252641] group-hover:text-[#5140CA] transition-colors">
              Mathematics Teacher
            </h2>
            <p className="text-xs text-[#74788E] mt-1 leading-relaxed">
              For mathematics teachers managing 50+ students in secondary classrooms.
            </p>
          </div>

          <ul className="text-xs text-[#4A4D68] space-y-2 pt-3 border-t border-[#E9EAF3]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#36B8D8] shrink-0" />
              <span>Class-wide misconception heatmaps</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#36B8D8] shrink-0" />
              <span>Micro-skill performance radar</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#36B8D8] shrink-0" />
              <span>5-minute chalkboard scripts</span>
            </li>
          </ul>

          <div className="pt-2 text-xs font-bold text-[#5140CA] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Continue as Teacher</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#74788E] hover:text-[#252641] transition cursor-pointer"
        >
          ← Back to Welcome
        </button>
      </div>
    </div>
  );
};
