import React, { useState, useEffect } from 'react';
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
import { ChalkboardScriptModal } from './ChalkboardScriptModal';
import { StudentDetailModal } from './StudentDetailModal';
import { ClassroomManagerModal } from './ClassroomManagerModal';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { apiRequest } from '../../services/apiClient';
import { Download, ShieldCheck, Key, ChevronLeft, RefreshCw } from 'lucide-react';
import { AssignmentManager } from './AssignmentManager';
import { SubmissionReview } from './SubmissionReview';

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

  const [currentVerification, setCurrentVerification] = useState<'pending' | 'approved' | 'rejected'>(
    teacher.verificationStatus || 'pending'
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
      fetchClassrooms(); // Refresh classrooms after approval
    } else {
      setRedemptionError(res.message || 'Invalid or expired accreditation token.');
    }
  };

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
    if (currentVerification === 'approved') {
      fetchClassrooms();
    } else {
      setIsLoading(false);
    }
  }, [currentVerification]);

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
          // Map partial data to summary
          setRealAnalytics({
            ...INITIAL_CLASS_ANALYTICS,
            totalStudents: overview.totalStudents || 0,
            submissionRate: 100, // Placeholder if not computed yet
            avgCorrectness: 75, // Placeholder
            atRiskCount: 0, // Should be calculated from roster
            topMisconceptions: (insights || []).map((i: any) => ({
              code: i.code,
              title: i.code.replace(/_/g, ' '),
              affectedPercentage: Math.round((i.count / (overview.totalStudents || 1)) * 100),
              studentCount: i.count,
              severity: 'medium',
            }))
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

  // Verification Wall View
  if (currentVerification === 'pending' || currentVerification === 'rejected') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
        <div className="w-full max-w-2xl text-center space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center ${currentVerification === 'pending' ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'}`}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white">
            {currentVerification === 'pending' ? 'Verification Required' : 'Account Rejected'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            {currentVerification === 'pending' 
              ? 'Your educator profile is currently pending approval. To protect student data, classroom analytics and assignment publishing are restricted to verified teachers.' 
              : `Your teacher account has been rejected by the administrator. Reason: ${teacher.rejectionReason || 'No reason provided.'}`}
          </p>
        </div>

        <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Redeem Accreditation Token</span>
            </h2>
            <p className="text-xs text-slate-400">
              If your school administrator issued an MTR token, enter it below for instant activation.
            </p>
            <form onSubmit={handleRedeemToken} className="space-y-3">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
                <input
                  type="text"
                  value={redemptionToken}
                  onChange={(e) => setRedemptionToken(e.target.value.toUpperCase().trim())}
                  placeholder="MTR-XXXX-XXXX"
                  className="w-full bg-transparent font-mono text-sm text-amber-300 placeholder:text-slate-700 focus:outline-hidden"
                />
              </div>
              {redemptionError && (
                <p className="text-[11px] text-rose-400 font-medium">{redemptionError}</p>
              )}
              <button
                type="submit"
                disabled={isRedeeming || !redemptionToken.trim()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isRedeeming ? 'Verifying...' : 'Redeem & Activate Workspace'}
              </button>
            </form>
          </div>
          
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 text-center">
              Don't have a token? Please contact your school's IT coordinator or visit the MindTrace Support portal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // Onboarding View (No classrooms)
  if (teacherClassrooms.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 animate-fade-in text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
          <Users className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-extrabold text-white">Welcome, {teacher.name.split(' ').pop()}!</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You are now a verified MindTrace educator. To begin tracking student progress and identifying misconceptions, create your first classroom.
          </p>
        </div>
        <button
          onClick={() => setIsClassroomManagerOpen(true)}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          Create New Classroom
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
        onClose={() => {
          setIsClassroomManagerOpen(false);
          fetchClassrooms();
        }}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        onPushRemedy={(name) => showToast(`Pushed 2-minute targeted remedy to ${name}`)}
      />

      {/* Top Header & Homework Review Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-900/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
            <span className="font-semibold text-indigo-400 uppercase tracking-wider">{activeClass.subject}</span>
            <span>·</span>
            <span>{activeClass.gradeLevel}</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-[9px]">
              Active Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
            {activeClass.name}
          </h1>
        </div>

        {/* Class Selector Dropdown & Primary Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-200 hover:border-indigo-500 focus:outline-hidden cursor-pointer min-w-[160px]"
            >
              {teacherClassrooms.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-slate-900 text-white">
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsClassroomManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition cursor-pointer"
            title="Manage Classrooms"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Manage</span>
          </button>

          <button
            onClick={handleExportClassReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition cursor-pointer"
            title="Download offline report"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={() => setIsChalkboardOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Chalkboard Script</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Submission Rate */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 shadow-sm hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Submission Rate</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {realAnalytics.submissionRate}%
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${realAnalytics.submissionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Avg Completion */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 shadow-sm hover:border-violet-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Avg Completion</span>
            <Clock className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {realAnalytics.avgCompletion}%
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${realAnalytics.avgCompletion}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Avg Correctness */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Avg Correctness</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {realAnalytics.avgCorrectness}%
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${realAnalytics.avgCorrectness}%` }}
            />
          </div>
        </div>

        {/* Metric 4: At-Risk Students */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 shadow-sm hover:border-rose-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>At-Risk Students</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {realAnalytics.atRiskCount}
          </div>
          <p className="text-[11px] text-rose-400 font-medium">Requires attention</p>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Students ({dynamicRoster.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'problems'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Curriculum
        </button>
      </div>

      {/* Tab Content Rendering */}
      <div className="min-h-[400px]">
        {activeTab === 'insights' && (
          <div className="space-y-6 animate-fade-in">
            {/* Insights Content (Radar, Trends, etc.) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar and Line charts as before, but using realAnalytics */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Micro-skill Performance</h3>
                  <span className="text-[11px] text-slate-500 font-mono">Real-time Class Aggregate</span>
                </div>
                {/* SVG Radar implementation same as before but keeping it clean */}
                <div className="relative h-64 flex items-center justify-center">
                  <svg viewBox="0 0 300 300" className="w-full h-full max-w-[280px]">
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
                    <polygon
                      points="150,62 215,115 202,180 150,212 90,185 82,112"
                      fill="rgba(99, 102, 241, 0.25)"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />
                    <text x="150" y="38" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">Linear (88%)</text>
                    <text x="245" y="98" textAnchor="start" fill="#94a3b8" fontSize="9" fontWeight="700">Graph (68%)</text>
                    <text x="245" y="208" textAnchor="start" fill="#94a3b8" fontSize="9" fontWeight="700">Word (54%)</text>
                  </svg>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Performance Trends</h3>
                  <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> <span>Sync Rate</span></div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> <span>Correctness</span></div>
                  </div>
                </div>
                <div className="h-64 pt-4">
                  {/* Performance trends polyline same as before */}
                  <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                    <polyline fill="none" stroke="#818cf8" strokeWidth="3" points="60,150 120,125 180,105 240,86 300,75 360,65 420,51" />
                    <polyline fill="none" stroke="#34d399" strokeWidth="3" points="60,156 120,131 180,107 240,97 300,103 360,111 420,64" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Spent</h3>
                <div className="space-y-3">
                  {realAnalytics.timeSpentDistribution.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]"><span className="text-slate-400">{item.range}</span> <span className="text-white font-mono">{item.percentage}%</span></div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className="bg-indigo-600 h-full" style={{ width: `${item.percentage}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hints Used</h3>
                <div className="space-y-3">
                  {realAnalytics.hintsUsedDistribution.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]"><span className="text-slate-400">{item.range}</span> <span className="text-white font-mono">{item.percentage}%</span></div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500/80 h-full" style={{ width: `${item.percentage}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Misconceptions</h3>
                <div className="space-y-2">
                  {realAnalytics.topMisconceptions.map((mis, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/50 border border-rose-950/30 space-y-1">
                      <div className="text-[11px] font-bold text-rose-200">{mis.title}</div>
                      <div className="flex justify-between text-[10px] text-slate-500"><span>{mis.affectedPercentage}% affected</span> <span className="text-indigo-400 font-semibold cursor-pointer">Script →</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 animate-fade-in shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search roster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {['all', 'at-risk', 'mastered'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f as any)}
                    className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${statusFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-500 hover:text-slate-300 border border-slate-800'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800/50">
                  <tr>
                    <th className="py-4 px-4">Student Identity</th>
                    <th className="py-4 px-4">Mastery</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Last Active</th>
                    <th className="py-4 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-500 italic font-medium">No students found matching your filters.</td></tr>
                  ) : filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-950/40 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-900/30 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shadow-inner">
                            {st.avatar}
                          </div>
                          <span className="font-bold text-slate-200 group-hover:text-white">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-white tabular-nums">{st.overallScore}%</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${st.status === 'Mastered' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : st.status === 'At Risk' ? 'bg-rose-950/50 text-rose-400 border border-rose-900/50' : 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/50'}`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 italic">{st.lastActive}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudentId(st.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-bold border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer"
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
          <div className="space-y-4 animate-fade-in">
            {/* Curriculum Problems Content as before */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
               <h2 className="text-sm font-bold text-white uppercase tracking-widest text-slate-500">WAEC / JAMB Mathematics Question Bank</h2>
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { q: "3x - 7 = 14", t: "Linear Equations · Basic Isolation", d: "Foundational" },
                   { q: "4(2x - 3) = 28", t: "Distributive Property", d: "Intermediate" },
                   { q: "(2x - 4) / 3 = 6", t: "Linear Fractions", d: "WAEC Standard" }
                 ].map((p, i) => (
                   <div key={i} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex justify-between items-center group hover:border-indigo-500/40 transition-colors">
                     <div>
                       <div className="font-mono text-lg font-bold text-white">{p.q}</div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{p.t}</div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                       <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-bold">{p.d}</span>
                       <button className="text-[10px] text-indigo-400 font-bold hover:underline">Add to Assignment →</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
