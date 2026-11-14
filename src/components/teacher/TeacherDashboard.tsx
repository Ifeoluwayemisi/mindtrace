import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Send,
  Search,
  ChevronDown,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { TeacherProfile, ClassAnalyticsSummary, StudentProfile } from '../../types';
import { ChalkboardScriptModal } from './ChalkboardScriptModal';
import { StudentDetailModal } from './StudentDetailModal';
import { ClassroomManagerModal } from './ClassroomManagerModal';
import { storageService } from '../../services/storageService';
import { apiRequest } from '../../services/apiClient';
import { Download, RefreshCw } from 'lucide-react';
import { AssignmentManager } from './AssignmentManager';
import { SubmissionReview } from './SubmissionReview';
import { resolveAvatarSrc, getInitials } from '../../utils/avatar';

interface TeacherDashboardProps {
  teacher: TeacherProfile;
  analytics: ClassAnalyticsSummary;
  onRefreshAnalytics: () => void;
  activeTab?: 'insights' | 'students' | 'problems' | 'assignments';
  onTabChange?: (tab: 'insights' | 'students' | 'problems' | 'assignments') => void;
  openChalkboardOnMount?: boolean;
}

const INITIAL_CLASS_ANALYTICS: ClassAnalyticsSummary = {
  className: '',
  topicName: 'Linear Equations',
  activeAssignment: 'None',
  submissionRate: 0,
  avgCompletion: 0,
  avgCorrectness: 0,
  atRiskCount: 0,
  totalStudents: 0,
  activeStudents: 0,
  microSkills: [],
  performanceTrends: [],
  timeSpentDistribution: [],
  hintsUsedDistribution: [],
  workingStepsDistribution: [],
  attemptsPerStudentDistribution: [],
  topMisconceptions: [],
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  analytics,
  onRefreshAnalytics,
  activeTab: controlledTab,
  onTabChange,
  openChalkboardOnMount = false,
}) => {
  const [internalTab, setInternalTab] = useState<'insights' | 'students' | 'problems' | 'assignments'>('insights');
  const activeTab = controlledTab || internalTab;

  const setActiveTab = (tab: 'insights' | 'students' | 'problems' | 'assignments') => {
    setInternalTab(tab);
    setViewingAssignmentId(null);
    if (onTabChange) onTabChange(tab as any);
  };

  const [teacherClassrooms, setTeacherClassrooms] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);
  const [isChalkboardOpen, setIsChalkboardOpen] = useState(openChalkboardOnMount);
  const [isClassroomManagerOpen, setIsClassroomManagerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'at-risk' | 'mastered'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [dynamicRoster, setDynamicRoster] = useState<any[]>([]);
  const [realAnalytics, setRealAnalytics] = useState<ClassAnalyticsSummary>(analytics);

  const fetchClassrooms = async () => {
    setIsLoading(true);
    const res = await apiRequest('/api/teacher/classrooms');
    if (res.ok && res.data?.classrooms) {
      setTeacherClassrooms(res.data.classrooms);
      if (res.data.classrooms.length > 0 && !selectedClassId) {
        setSelectedClassId(res.data.classrooms[0].id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchClassDetails = async () => {
        // 1. Fetch Roster
        const rosterRes = await apiRequest(`/api/teacher/classrooms/${selectedClassId}`);
        if (rosterRes.ok) {
          const { roster } = rosterRes.data;
          const transformedRoster = (roster || []).map((s: any) => ({
            id: s.id,
            name: s.fullName,
            classSection: s.gradeLevel,
            avatar: s.avatarSeed || 'AD',
            overallScore: s.masteryPercentage || 0,
            status: (s.masteryPercentage >= 80 ? 'Mastered' : s.masteryPercentage < 60 ? 'At Risk' : 'In Progress'),
            lastActive: s.lastActiveDate || 'Never',
          }));
          setDynamicRoster(transformedRoster);
        }

        // 2. Fetch Analytics
        const analyticsRes = await apiRequest(`/api/teacher/analytics?classroomId=${selectedClassId}`);
        if (analyticsRes.ok) {
          const { overview, insights } = analyticsRes.data;
          setRealAnalytics({
            ...INITIAL_CLASS_ANALYTICS,
            totalStudents: overview.totalStudents ?? 0,
            activeStudents: overview.activeStudents ?? 0,
            submissionRate: overview.submissionRate ?? 0,
            avgCompletion: overview.avgCompletion ?? 0,
            avgCorrectness: overview.avgCorrectness ?? 0,
            atRiskCount: overview.atRiskCount ?? 0,
            microSkills: overview.microSkills ?? [],
            performanceTrends: overview.performanceTrends ?? [],
            workingStepsDistribution: overview.workingStepsDistribution ?? [],
            attemptsPerStudentDistribution: overview.attemptsPerStudentDistribution ?? [],
            topMisconceptions:
              overview.topMisconceptions ??
              (insights || []).map((i: any) => ({
                code: i.code,
                title: i.code.replace(/_/g, ' '),
                affectedPercentage: Math.round(
                  ((i.studentCount ?? i.count) / (overview.totalStudents || 1)) * 100
                ),
                studentCount: i.studentCount ?? i.count,
                severity: 'medium',
              })),
          });
        }
      };
      fetchClassDetails();
    }
  }, [selectedClassId]);

  const handleExportClassReport = () => {
    if (!selectedClassId) return;
    const currentClass = teacherClassrooms.find(c => c.id === selectedClassId);
    const exportData = {
      className: currentClass?.name || 'Unknown',
      teacher: teacher.name,
      generatedAt: new Date().toISOString(),
      summary: realAnalytics,
      roster: dynamicRoster,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindTrace_Class_Report_${(currentClass?.name || 'Class').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported complete class diagnostic report (Offline JSON)');
  };

  const filteredStudents = dynamicRoster.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'at-risk') return matchesSearch && s.status === 'At Risk';
    if (statusFilter === 'mastered') return matchesSearch && s.status === 'Mastered';
    return matchesSearch;
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" aria-hidden="true" />
          <span className="text-[13px] text-[#475569] font-medium">Loading workspace…</span>
        </div>
      </div>
    );
  }

  // Onboarding View (No classrooms)
  if (teacherClassrooms.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-16 space-y-6 animate-fade-in text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center">
          <Users className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="page-title">Welcome, {teacher.name.split(' ').pop()}</h1>
          <p className="body-text max-w-md mx-auto">
            You are now a verified MindTrace educator. Create your first classroom to begin tracking
            student progress and identifying misconceptions.
          </p>
        </div>
        <button onClick={() => setIsClassroomManagerOpen(true)} className="btn-primary">
          Create new classroom
        </button>

        <ClassroomManagerModal
          isOpen={isClassroomManagerOpen}
          onClose={() => {
            setIsClassroomManagerOpen(false);
            fetchClassrooms();
          }}
        />
      </div>
    );
  }

  const activeClass = teacherClassrooms.find(c => c.id === selectedClassId) || teacherClassrooms[0];

  const metricCards = [
    {
      label: 'Submission rate',
      value: `${realAnalytics.submissionRate}%`,
      barWidth: realAnalytics.submissionRate,
      barClass: 'progress-fill',
      icon: Users,
      tone: 'text-[#2563EB]',
    },
    {
      label: 'Avg completion',
      value: `${realAnalytics.avgCompletion}%`,
      barWidth: realAnalytics.avgCompletion,
      barClass: 'progress-fill progress-fill-mastery',
      icon: Clock,
      tone: 'text-[#047857]',
    },
    {
      label: 'Avg correctness',
      value: `${realAnalytics.avgCorrectness}%`,
      barWidth: realAnalytics.avgCorrectness,
      barClass: 'progress-fill progress-fill-mastery',
      icon: CheckCircle2,
      tone: 'text-[#047857]',
    },
  ];

  const radarSkills = realAnalytics.microSkills.slice(0, 6);
  const radarPoint = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, radarSkills.length) - Math.PI / 2;
    return [
      150 + Math.cos(angle) * 92 * ratio,
      150 + Math.sin(angle) * 92 * ratio,
    ];
  };
  const radarPolygon = radarSkills
    .map((skill, index) => radarPoint(index, Math.max(0, Math.min(100, skill.score)) / 100).join(','))
    .join(' ');

  const trendSeries = realAnalytics.performanceTrends;
  const trendPoints = (key: 'submissionRate' | 'correctness') =>
    trendSeries
      .map((entry, index) => {
        const x = 60 + (index * 360) / Math.max(1, trendSeries.length - 1);
        const value = Math.max(0, Math.min(100, entry[key]));
        return `${Math.round(x)},${Math.round(170 - (value / 100) * 120)}`;
      })
      .join(' ');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-3 rounded-xl bg-white border border-[#A7F3D0] shadow-lg text-[13px] font-semibold text-[#065F46] flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ChalkboardScriptModal
        isOpen={isChalkboardOpen}
        onClose={() => setIsChalkboardOpen(false)}
      />

      <ClassroomManagerModal
        isOpen={isClassroomManagerOpen}
        onClose={() => {
          setIsClassroomManagerOpen(false);
          fetchClassrooms();
        }}
      />

      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        onPushRemedy={(name) => showToast(`Pushed 2-minute targeted remedy to ${name}`)}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#475569]">
            <span className="font-semibold text-[#1D4ED8] uppercase tracking-[0.06em]">
              {activeClass.subject}
            </span>
            <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
            <span>{activeClass.gradeLevel}</span>
            <span className="badge badge-mastery">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" aria-hidden="true" />
              Active workspace
            </span>
          </div>
          <h1 className="page-title truncate">{activeClass.name}</h1>
          <p className="text-[13px] text-[#475569]">
            {realAnalytics.totalStudents} enrolled · {realAnalytics.activeStudents} active this week
          </p>
        </div>

        {/* Class selector & actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <label htmlFor="class-selector" className="sr-only">
              Select classroom
            </label>
            <select
              id="class-selector"
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="input-modern appearance-none pr-9 min-w-[170px] font-semibold cursor-pointer"
            >
              {teacherClassrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          <button
            onClick={() => setIsClassroomManagerOpen(true)}
            className="btn-secondary"
            title="Manage classrooms"
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Manage</span>
          </button>

          <button onClick={handleExportClassReport} className="btn-secondary" title="Download offline report">
            <Download className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button onClick={() => setIsChalkboardOpen(true)} className="btn-primary">
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Chalkboard script</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map(({ label, value, barWidth, barClass, icon: Icon, tone }) => (
          <div key={label} className="card-modern p-5 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569]">
              <span>{label}</span>
              <Icon className={`w-4 h-4 ${tone}`} aria-hidden="true" />
            </div>
            <div className="text-3xl font-display font-bold text-[#0F172A] tabular-nums">{value}</div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={barWidth}
              aria-label={label}
            >
              <div className={barClass} style={{ width: `${barWidth}%` }} />
            </div>
          </div>
        ))}

        {/* At-risk */}
        <div className="card-modern p-5 space-y-3 border-[#FDE68A]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569]">
            <span>At-risk students</span>
            <AlertTriangle className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
          </div>
          <div className="text-3xl font-display font-bold text-[#0F172A] tabular-nums">
            {realAnalytics.atRiskCount}
          </div>
          <span className="badge badge-diagnostic">Needs attention</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div
          role="tablist"
          aria-label="Teacher workspace sections"
          className="flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl w-fit"
        >
          {[
            { key: 'insights' as const, label: 'Insights' },
            { key: 'students' as const, label: `Students (${dynamicRoster.length})` },
            { key: 'assignments' as const, label: 'Assignments' },
            { key: 'problems' as const, label: 'Curriculum' },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 min-h-[38px] text-[12px] font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#475569] hover:text-[#0F172A] border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'insights' && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Radar */}
              <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="micro-skill-heading">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="micro-skill-heading" className="section-title">
                    Micro-skill performance
                  </h2>
                  <span className="text-[11px] text-[#64748B] font-mono">Class aggregate</span>
                </div>
                <div className="relative h-64 flex items-center justify-center">
                  {radarSkills.length < 3 ? (
                    <p className="text-[13px] text-[#64748B] text-center max-w-[240px]">
                      No misconception data yet for this class. Micro-skill performance appears after students submit working.
                    </p>
                  ) : (
                    <svg
                      viewBox="0 0 300 300"
                      className="w-full h-full max-w-[280px]"
                      role="img"
                      aria-label={`Radar chart of micro-skill performance: ${radarSkills
                        .map((s) => `${s.skill} ${s.score}%`)
                        .join(', ')}`}
                    >
                      {[25, 50, 75, 100].map((ring) => (
                        <polygon
                          key={ring}
                          points={radarSkills
                            .map((_, index) => radarPoint(index, ring / 100).join(','))
                            .join(' ')}
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      ))}
                      <polygon
                        points={radarPolygon}
                        fill="rgba(37, 99, 235, 0.14)"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                      />
                      {radarSkills.map((skill, index) => {
                        const [x, y] = radarPoint(index, 1.22);
                        return (
                          <text
                            key={skill.skill}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#475569"
                            fontSize="8.5"
                            fontWeight="700"
                          >
                            {skill.skill.length > 22 ? `${skill.skill.slice(0, 21)}…` : skill.skill} ({skill.score}%)
                          </text>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </section>

              {/* Trends */}
              <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="trends-heading">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="trends-heading" className="section-title">
                    Performance trends
                  </h2>
                  <div className="flex items-center gap-3 text-[11px] text-[#475569]">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" aria-hidden="true" />
                      Sync rate
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#059669]" aria-hidden="true" />
                      Correctness
                    </span>
                  </div>
                </div>
                <div className="h-64 pt-4">
                  {trendSeries.length < 2 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-[13px] text-[#64748B] text-center max-w-[240px]">
                        Trends appear once students submit at least two assignments.
                      </p>
                    </div>
                  ) : (
                    <svg
                      viewBox="0 0 500 200"
                      className="w-full h-full overflow-visible"
                      role="img"
                      aria-label="Line chart of submission rate and correctness trends"
                    >
                      {[0, 25, 50, 75, 100].map((grid) => (
                        <line
                          key={grid}
                          x1="60"
                          x2="420"
                          y1={170 - (grid / 100) * 120}
                          y2={170 - (grid / 100) * 120}
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      ))}
                      <polyline fill="none" stroke="#2563EB" strokeWidth="3" points={trendPoints('submissionRate')} />
                      <polyline fill="none" stroke="#059669" strokeWidth="3" points={trendPoints('correctness')} />
                      {trendSeries.map((entry, index) => (
                        <text
                          key={`${entry.date}-${index}`}
                          x={60 + (index * 360) / Math.max(1, trendSeries.length - 1)}
                          y="192"
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize="9"
                          fontWeight="600"
                        >
                          {entry.date}
                        </text>
                      ))}
                    </svg>
                  )}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <section className="card-modern p-5 space-y-4" aria-labelledby="working-steps-heading">
                <h2 id="working-steps-heading" className="eyebrow">
                  Working steps per attempt
                </h2>
                {realAnalytics.workingStepsDistribution.every((item) => item.percentage === 0) ? (
                  <p className="text-[12px] text-[#64748B]">No submitted working yet.</p>
                ) : (
                  <div className="space-y-3">
                    {realAnalytics.workingStepsDistribution.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#475569]">{item.range}</span>
                          <span className="text-[#0F172A] font-mono font-semibold">{item.percentage}%</span>
                        </div>
                        <div className="progress-track h-1.5">
                          <div className="progress-fill" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="card-modern p-5 space-y-4" aria-labelledby="attempts-heading">
                <h2 id="attempts-heading" className="eyebrow">
                  Attempts per student
                </h2>
                {realAnalytics.attemptsPerStudentDistribution.every((item) => item.percentage === 0) ? (
                  <p className="text-[12px] text-[#64748B]">No diagnostic attempts recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {realAnalytics.attemptsPerStudentDistribution.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#475569]">{item.range}</span>
                          <span className="text-[#0F172A] font-mono font-semibold">{item.percentage}%</span>
                        </div>
                        <div className="progress-track h-1.5">
                          <div className="progress-fill progress-fill-diagnostic" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="card-modern p-5 space-y-3" aria-labelledby="misconceptions-heading">
                <h2 id="misconceptions-heading" className="eyebrow">
                  Top misconceptions
                </h2>
                <div className="space-y-2">
                  {realAnalytics.topMisconceptions.length === 0 ? (
                    <p className="text-[12px] text-[#64748B]">
                      No misconceptions detected yet. They appear after students submit working.
                    </p>
                  ) : (
                    realAnalytics.topMisconceptions.map((mis, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] space-y-1">
                        <div className="text-[12px] font-semibold text-[#92400E]">{mis.title}</div>
                        <div className="flex justify-between text-[11px] text-[#92400E]">
                          <span>{mis.affectedPercentage}% affected</span>
                          <span className="text-[#1D4ED8] font-semibold cursor-pointer">Script →</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <section className="card-modern overflow-hidden animate-fade-in" aria-labelledby="roster-heading">
            <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0]">
              <h2 id="roster-heading" className="section-title">
                Student roster
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative">
                  <label htmlFor="roster-search" className="sr-only">
                    Search roster
                  </label>
                  <Search
                    className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="roster-search"
                    type="search"
                    placeholder="Search roster…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-modern pl-10 sm:w-64"
                  />
                </div>
                <div
                  role="group"
                  aria-label="Filter students by status"
                  className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]"
                >
                  {(['all', 'at-risk', 'mastered'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      aria-pressed={statusFilter === f}
                      className={`px-3 min-h-[32px] rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                        statusFilter === f
                          ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                          : 'text-[#475569] hover:text-[#0F172A] border border-transparent'
                      }`}
                    >
                      {f.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-modern min-w-[680px]">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Mastery</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last active</th>
                    <th scope="col" className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-[13px] text-[#64748B]">
                        No students match these filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const avatarSrc = resolveAvatarSrc(st.avatar);
                      return (
                        <tr key={st.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="relative w-8 h-8 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden flex items-center justify-center shrink-0">
                                {avatarSrc ? (
                                  <img
                                    src={avatarSrc}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#475569]">
                                  {getInitials(st.name)}
                                </span>
                              </div>
                              <span className="font-semibold text-[#0F172A]">{st.name}</span>
                            </div>
                          </td>
                          <td className="font-mono font-semibold text-[#0F172A] tabular-nums">
                            {st.overallScore}%
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                st.status === 'Mastered'
                                  ? 'badge-mastery'
                                  : st.status === 'At Risk'
                                  ? 'badge-diagnostic'
                                  : 'badge-primary'
                              }`}
                            >
                              {st.status}
                            </span>
                          </td>
                          <td className="text-[#64748B]">{st.lastActive}</td>
                          <td className="text-right">
                            <button
                              onClick={() => setSelectedStudentId(st.id)}
                              className="btn-secondary min-h-[34px] px-3 text-[12px]"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4 animate-fade-in">
            {viewingAssignmentId ? (
              <SubmissionReview
                assignmentId={viewingAssignmentId}
                onBack={() => setViewingAssignmentId(null)}
              />
            ) : (
              <AssignmentManager
                classroomId={selectedClassId!}
                onViewSubmissions={(id) => setViewingAssignmentId(id)}
              />
            )}
          </div>
        )}

        {activeTab === 'problems' && (
          <section className="card-modern p-5 sm:p-6 space-y-5 animate-fade-in" aria-labelledby="question-bank-heading">
            <div>
              <h2 id="question-bank-heading" className="section-title">
                WAEC / JAMB mathematics question bank
              </h2>
              <p className="text-[13px] text-[#475569] mt-1">
                Curriculum-aligned equations ready to add to a class assignment.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3">
              {[
                { q: '3x - 7 = 14', t: 'Linear Equations · Basic Isolation', d: 'Foundational' },
                { q: '4(2x - 3) = 28', t: 'Distributive Property', d: 'Intermediate' },
                { q: '(2x - 4) / 3 = 6', t: 'Linear Fractions', d: 'WAEC Standard' },
              ].map((p, i) => (
                <li
                  key={i}
                  className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-mono text-lg font-semibold text-[#0F172A]">{p.q}</div>
                    <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-[0.06em] mt-1">
                      {p.t}
                    </div>
                  </div>
                  <div className="flex sm:flex-col sm:items-end gap-2 shrink-0">
                    <span className="badge badge-neutral">{p.d}</span>
                    <button className="text-[12px] text-[#1D4ED8] font-semibold hover:underline cursor-pointer">
                      Add to assignment →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
