import React, { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Send,
  Search,
  Filter,
  ChevronDown,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { TeacherProfile, ClassAnalyticsSummary, StudentProfile } from '../../types';
import { MOCK_STUDENT_ROSTER, StudentRosterItem } from '../../data/mockTeacherData';
import { ChalkboardScriptModal } from './ChalkboardScriptModal';
import { StudentDetailModal } from './StudentDetailModal';
import { ClassroomManagerModal } from './ClassroomManagerModal';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { Download, ShieldCheck, Key } from 'lucide-react';

interface TeacherDashboardProps {
  teacher: TeacherProfile;
  analytics: ClassAnalyticsSummary;
  onRefreshAnalytics: () => void;
  activeTab?: 'insights' | 'students' | 'problems';
  onTabChange?: (tab: 'insights' | 'students' | 'problems') => void;
  openChalkboardOnMount?: boolean;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  analytics,
  onRefreshAnalytics,
  activeTab: controlledTab,
  onTabChange,
  openChalkboardOnMount = false,
}) => {
  const [internalTab, setInternalTab] = useState<'insights' | 'students' | 'problems'>('insights');
  const activeTab = controlledTab || internalTab;

  const setActiveTab = (tab: 'insights' | 'students' | 'problems') => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [selectedClass, setSelectedClass] = useState(teacher.activeClass);
  const [isChalkboardOpen, setIsChalkboardOpen] = useState(openChalkboardOnMount);
  const [isClassroomManagerOpen, setIsClassroomManagerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'at-risk' | 'mastered'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentVerification, setCurrentVerification] = useState<'pending' | 'approved' | 'rejected'>(
    teacher.verificationStatus || authService.getActiveUser()?.verificationStatus || 'pending'
  );
  const [redemptionToken, setRedemptionToken] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);

  const handleRedeemToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redemptionToken.trim()) return;
    setIsRedeeming(true);
    setRedemptionError(null);
    const res = await authService.redeemTeacherToken(redemptionToken.trim());
    setIsRedeeming(false);
    if (res.success) {
      setCurrentVerification('approved');
      showToast('Accreditation verified! Full educator permissions granted.');
      setRedemptionToken('');
    } else {
      setRedemptionError(res.message || 'Invalid or expired accreditation token.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamically augment roster with live student attempts from local storage
  const [dynamicRoster, setDynamicRoster] = useState<StudentRosterItem[]>(MOCK_STUDENT_ROSTER);
  const [realAnalytics, setRealAnalytics] = useState<any>(analytics);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await apiRequest(`/api/teacher/analytics/classroom/${selectedClass}`);
      if (res.ok) {
        setRealAnalytics(res.data.data);
      }
    };
    fetchAnalytics();
  }, [selectedClass]);

  React.useEffect(() => {
    const recent = storageService.getRecentDiagnoses();
    const savedStudent = storageService.getSavedStudentProfile();

    if (recent && recent.length > 0) {
      const correctCount = recent.filter((r) => r.isCorrect).length;
      const liveScore = Math.round((correctCount / recent.length) * 100);
      const misconceptionsMap = new Map<string, string>();
      recent.forEach((r) => {
        if (!r.isCorrect && r.misconceptionCode) {
          misconceptionsMap.set(r.misconceptionCode, r.title || r.misconceptionCode);
        }
      });

      const updated = MOCK_STUDENT_ROSTER.map((st) => {
        if (st.id === savedStudent.id || st.name.toLowerCase() === savedStudent.name.toLowerCase()) {
          return {
            ...st,
            name: savedStudent.name,
            overallScore: liveScore,
            status: (liveScore >= 80 ? 'Mastered' : liveScore < 60 ? 'At Risk' : 'In Progress') as 'Mastered' | 'At Risk' | 'In Progress',
            detectedMisconceptions: Array.from(misconceptionsMap.entries()).map(([code, label]) => ({
              code: code as any,
              label,
              remediated: false,
            })),
            lastActive: 'Just now (Synced)',
            timeSpentMinutes: Math.max(st.timeSpentMinutes, Math.round(recent.length * 2.5)),
          };
        }
        return st;
      });
      setDynamicRoster(updated);
    }
  }, []);

  const handleExportClassReport = () => {
    const exportData = {
      className: selectedClass,
      teacher: teacher.name,
      generatedAt: new Date().toISOString(),
      summary: analytics,
      roster: dynamicRoster,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindTrace_Class_Report_${selectedClass.replace(/\s+/g, '_')}.json`;
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Chalkboard Script Modal */}
      <ChalkboardScriptModal
        isOpen={isChalkboardOpen}
        onClose={() => setIsChalkboardOpen(false)}
      />

      {/* Classroom Manager Modal */}
      <ClassroomManagerModal
        isOpen={isClassroomManagerOpen}
        onClose={() => setIsClassroomManagerOpen(false)}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onPushRemedy={(name) => showToast(`Pushed 2-minute targeted remedy to ${name}`)}
      />

      {/* Educator Verification Status Notice */}
      {currentVerification === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-300">Teacher Account Verification Pending</h3>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Your profile is pending approval from your school administrator or academic coordinator. You can explore demo rosters, but classroom creation and assignment publishing require verified educator credentials.
                </p>
              </div>
            </div>
            <form onSubmit={handleRedeemToken} className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={redemptionToken}
                onChange={(e) => setRedemptionToken(e.target.value.toUpperCase().trim())}
                placeholder="Enter MTR-XXXX-XXXX"
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-800/80 font-mono text-xs text-amber-300 placeholder:text-amber-300/40 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isRedeeming || !redemptionToken.trim()}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                {isRedeeming ? 'Verifying...' : 'Redeem Token'}
              </button>
            </form>
          </div>
          {redemptionError && (
            <p className="text-[11px] text-rose-300 font-medium pl-8">{redemptionError}</p>
          )}
        </div>
      )}

      {currentVerification === 'rejected' && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-rose-300">Accreditation Request Rejected</h3>
            <p className="text-[11px] text-rose-200/80 mt-0.5">
              Your educator verification request was declined by the administrator. Please contact your school administration or submit an inquiry to coordinate approval.
            </p>
          </div>
        </div>
      )}

      {currentVerification === 'approved' && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Accredited Educator · WAEC / MOE Verified</span>
        </div>
      )}

      {/* Top Header & Homework Review Bar (Modeled after user's reference screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Homework Review</span>
            <span>·</span>
            <span>7A Algebra - Linear Equation</span>
            <span>·</span>
            <span>Due: 22/01/2026</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-[10px]">
              Ongoing
            </span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Linear Equations — Practice
          </h1>
        </div>

        {/* Class Selector Dropdown & Primary Action */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-slate-200 hover:border-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {teacher.classes.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900 text-white">
                  {cls}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsChalkboardOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Chalkboard Script</span>
          </button>

          <button
            onClick={() => setIsClassroomManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manage Classrooms</span>
          </button>

          <button
            onClick={handleExportClassReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Download offline report for class"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards (Matching Screenshot Screenshot_20261108-092440_df2940ad.jpg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Submission Rate */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Submission Rate</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {analytics.submissionRate}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.submissionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Avg Completion */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Avg Completion</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {analytics.avgCompletion}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.avgCompletion}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Avg Correctness */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Avg Correctness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {analytics.avgCorrectness}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.avgCorrectness}%` }}
            />
          </div>
        </div>

        {/* Metric 4: At-Risk Students */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">At-Risk Students</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {analytics.atRiskCount}
          </div>
          <p className="text-[11px] text-rose-400 font-medium">Requires attention</p>
        </div>
      </div>

      {/* Segmented Tab Controls (Insights, Students, Problems) */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Students ({MOCK_STUDENT_ROSTER.length})
        </button>
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'problems'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Curriculum Problems
        </button>
      </div>

      {/* Tab 1: Insights & Visual Heatmaps */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Top Row: Micro-skill Performance Radar + Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Micro-skill Performance Radar Chart */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Micro-skill Performance</h3>
                <span className="text-xs text-slate-400">Class SS2 Average</span>
              </div>

              {/* High-fidelity SVG Spider / Radar Chart */}
              <div className="relative h-64 flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-full h-full max-w-[280px]">
                  {/* Concentric rings */}
                  {[25, 50, 75, 100].map((r) => (
                    <polygon
                      key={r}
                      points="150,50 236,100 236,200 150,250 64,200 64,100"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                      transform={`scale(${r / 100})`}
                      style={{ transformOrigin: '150px 150px' }}
                    />
                  ))}

                  {/* Web spokes */}
                  <line x1="150" y1="150" x2="150" y2="50" stroke="rgba(255,255,255,0.12)" />
                  <line x1="150" y1="150" x2="236" y2="100" stroke="rgba(255,255,255,0.12)" />
                  <line x1="150" y1="150" x2="236" y2="200" stroke="rgba(255,255,255,0.12)" />
                  <line x1="150" y1="150" x2="150" y2="250" stroke="rgba(255,255,255,0.12)" />
                  <line x1="150" y1="150" x2="64" y2="200" stroke="rgba(255,255,255,0.12)" />
                  <line x1="150" y1="150" x2="64" y2="100" stroke="rgba(255,255,255,0.12)" />

                  {/* Student performance polygon (shaded cyan/indigo) */}
                  <polygon
                    points="150,62 215,115 202,180 150,212 90,185 82,112"
                    fill="rgba(99, 102, 241, 0.25)"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                  />

                  {/* Micro-skill labels */}
                  <text x="150" y="38" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
                    Linear Equation (88%)
                  </text>
                  <text x="245" y="98" textAnchor="start" fill="#94a3b8" fontSize="10" fontWeight="600">
                    Graphing (68%)
                  </text>
                  <text x="245" y="208" textAnchor="start" fill="#94a3b8" fontSize="10" fontWeight="600">
                    Word Problem (54%)
                  </text>
                  <text x="150" y="270" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
                    Systems (62%)
                  </text>
                  <text x="50" y="208" textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="600">
                    Isolation (66%)
                  </text>
                  <text x="50" y="98" textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="600">
                    Substitution (78%)
                  </text>
                </svg>
              </div>
            </div>

            {/* Performance Trends Dual Line Chart */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Performance Trends</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-300">Submission Rate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300">Correctness</span>
                  </div>
                </div>
              </div>

              {/* Line chart visualization */}
              <div className="relative h-64 w-full pt-4">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((val) => (
                    <g key={val}>
                      <line
                        x1="40"
                        y1={170 - (val / 100) * 140}
                        x2="480"
                        y2={170 - (val / 100) * 140}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="30"
                        y={174 - (val / 100) * 140}
                        textAnchor="end"
                        fill="#64748b"
                        fontSize="9"
                      >
                        {val}%
                      </text>
                    </g>
                  ))}

                  {/* Submission Rate line (purple) */}
                  <polyline
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3"
                    points="60,150 120,125 180,105 240,86 300,75 360,65 420,51"
                  />

                  {/* Correctness line (green) */}
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                    points="60,156 120,131 180,107 240,97 300,103 360,111 420,64"
                  />

                  {/* Date labels */}
                  {analytics.performanceTrends.map((pt, i) => (
                    <text
                      key={pt.date}
                      x={60 + i * 60}
                      y="190"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                    >
                      {pt.date}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Row: Time Spent + Hints Used + Top Misconceptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Time Spent Bar Chart */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Time Spent</h3>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                  Month
                </span>
              </div>
              <div className="space-y-2.5 pt-2">
                {analytics.timeSpentDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{item.range}</span>
                      <span className="font-mono text-white">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${item.percentage * 1.8}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints Used Bar Chart */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hints Used</h3>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                  Month
                </span>
              </div>
              <div className="space-y-2.5 pt-2">
                {analytics.hintsUsedDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{item.range}</span>
                      <span className="font-mono text-white">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500/80 h-full rounded-full"
                        style={{ width: `${item.percentage * 1.8}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Misconceptions Cards (Matching Screenshot) */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Top Misconceptions
                </h3>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                  Month
                </span>
              </div>

              <div className="space-y-2.5">
                {analytics.topMisconceptions.map((mis, idx) => (
                  <div
                    key={idx}
                    onClick={() => setIsChalkboardOpen(true)}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-rose-900/40 hover:border-rose-500/60 transition cursor-pointer space-y-1"
                  >
                    <div className="text-xs font-bold text-rose-200">{mis.title}</div>
                    <div className="text-[11px] text-rose-300/80 flex items-center justify-between">
                      <span>{mis.affectedPercentage}% of students affected</span>
                      <span className="text-[10px] text-slate-500">View Script →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students Roster Table */}
      {activeTab === 'students' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('at-risk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === 'at-risk'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                At Risk ({MOCK_STUDENT_ROSTER.filter((s) => s.status === 'At Risk').length})
              </button>
              <button
                onClick={() => setStatusFilter('mastered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === 'mastered'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Mastered
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Detected Misconceptions</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {st.avatar}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{st.name}</span>
                          <span className="text-[11px] text-slate-400">{st.classSection}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white tabular-nums">
                      {st.overallScore}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          st.status === 'Mastered'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : st.status === 'At Risk'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {st.detectedMisconceptions.length === 0 ? (
                        <span className="text-slate-500">None detected</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {st.detectedMisconceptions.map((m, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                            >
                              {m.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{st.timeSpentMinutes}m</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Curriculum Problems */}
      {activeTab === 'problems' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-white">
              WAEC Linear Equations Curriculum Assignment
            </h2>
            <button
              onClick={() => setIsChalkboardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Chalkboard Script</span>
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                equation: '3x - 7 = 14',
                topic: 'Transposition of constants',
                errorRate: '42% sign flip',
                recommendation: 'Use Two-Pan Balance Metaphor before Friday.',
              },
              {
                equation: '4(2x - 3) = 28',
                topic: 'Distributive Law expansion',
                errorRate: '35% missed 2nd term',
                recommendation: 'Emphasize Rainbow Multiplier arrows on blackboard.',
              },
              {
                equation: '5x + 8 = 2x + 29',
                topic: 'Variables on both sides',
                errorRate: '16% dropped variable x',
                recommendation: 'Reinforce like-terms grouping.',
              },
              {
                equation: '(2x - 4) / 3 = 6',
                topic: 'Algebraic fractions with linear numerators',
                errorRate: '28% denominator precedence',
                recommendation: 'Multiply both sides by 3 before transposing.',
              },
            ].map((prob, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-mono text-base font-bold text-white">{prob.equation}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{prob.topic}</p>
                </div>

                <div className="text-right sm:max-w-xs">
                  <span className="text-xs font-bold text-rose-400 block">{prob.errorRate}</span>
                  <span className="text-[11px] text-slate-400">{prob.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
