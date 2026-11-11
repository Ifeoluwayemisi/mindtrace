import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  Sparkles,
  Trophy,
  User,
  Layers,
  Users,
  FileText,
  Clock,
} from 'lucide-react';
import { Role, StudentProfile, TeacherProfile } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: string;
}

interface MobileBottomNavProps {
  currentRole: Role;
  activeView: string;
  onViewChange: (view: string) => void;
  student?: StudentProfile;
  teacher?: TeacherProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRole,
  activeView,
  onViewChange,
  student,
  teacher,
}) => {
  const isStudentActive = (views: string[]) => views.includes(activeView);

  const studentNavItems: NavItem[] = [
    {
      id: 'student-dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      active: isStudentActive(['student-dashboard']),
    },
    {
      id: 'question-solve',
      label: 'Practice',
      icon: Zap,
      active: isStudentActive(['question-solve', 'diagnosis-result', 'follow-up', 'session-summary']),
    },
    {
      id: 'subject-overview',
      label: 'Topics',
      icon: BookOpen,
      active: isStudentActive(['subject-overview']),
    },
    {
      id: 'remedy-library',
      label: 'Remedies',
      icon: Sparkles,
      active: isStudentActive(['remedy-library', 'intervention']),
    },
    {
      id: 'gamification',
      label: 'Badges',
      icon: Trophy,
      active: isStudentActive(['gamification']),
      badge: student?.totalPoints ? `${student.totalPoints}p` : undefined,
    },
  ];

  const teacherNavItems: NavItem[] = [
    {
      id: 'teacher-dashboard',
      label: 'Heatmap',
      icon: Layers,
      active: activeView === 'teacher-dashboard',
    },
    {
      id: 'teacher-students',
      label: 'Roster',
      icon: Users,
      active: activeView === 'teacher-students',
    },
    {
      id: 'teacher-problems',
      label: 'Problems',
      icon: BookOpen,
      active: activeView === 'teacher-problems',
    },
    {
      id: 'teacher-chalkboard',
      label: 'Chalkboard',
      icon: FileText,
      active: activeView === 'teacher-chalkboard',
    },
  ];

  const items = currentRole === 'student' ? studentNavItems : teacherNavItems;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] px-2 py-1.5 shadow-lg safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.active;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#2563EB] font-bold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#2563EB]' : 'text-[#475569]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-mono font-bold bg-[#D97706] text-white px-1 rounded-full leading-tight shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 transition-colors leading-none tracking-tight ${
                  isActive ? 'text-[#2563EB] font-bold' : 'text-[#475569]'
                }`}
              >
                {item.label}
              </span>

              {/* Active subtle pill dot */}
              {isActive && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
