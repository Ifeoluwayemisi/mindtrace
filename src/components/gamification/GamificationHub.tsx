import React, { useState } from 'react';
import {
  Award,
  Flame,
  Zap,
  Target,
  Trophy,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Sparkles,
  Info,
  X,
  Search,
} from 'lucide-react';
import { StudentProfile, BadgeProgress, BadgeDefinition, LeaderboardEntry, PointTransaction } from '../../types';
import { gamificationService, BADGE_DEFINITIONS } from '../../services/gamificationService';

interface GamificationHubProps {
  student: StudentProfile;
  onGoToSolve: () => void;
  onBackToDashboard: () => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  student,
  onGoToSolve,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard' | 'transactions'>('overview');
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'weekly' | 'allTime'>('weekly');
  const [selectedBadge, setSelectedBadge] = useState<BadgeProgress | null>(null);

  // Evaluate live badges and rankings
  const { badgesProgress } = gamificationService.evaluateBadges(student);
  const leaderboard = gamificationService.getLeaderboard(student, leaderboardTimeframe);
  const transactions = gamificationService.getStudentTransactions(student.id);

  const totalPoints = gamificationService.calculateTotalPoints(student.id);
  const weeklyPoints = gamificationService.calculateWeeklyPoints(student.id);
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsInCurrentLevel = totalPoints % 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-medium text-indigo-400">
                Badge Details · {selectedBadge.badge.category.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2 py-2">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold shadow-lg ${
                  selectedBadge.unlocked
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-600 border border-slate-800'
                }`}
              >
                {selectedBadge.unlocked ? <Award className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
              </div>

              <h3 className="text-lg font-display font-bold text-white">
                {selectedBadge.badge.title}
              </h3>
              <p className="text-xs font-semibold text-indigo-300">
                "{selectedBadge.badge.tagline}"
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedBadge.badge.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Unlock Criteria:</span>
                <span className="font-mono text-indigo-400">
                  {selectedBadge.currentProgress} / {selectedBadge.maxProgress}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{selectedBadge.badge.criteriaDescription}</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    selectedBadge.unlocked ? 'bg-amber-400' : 'bg-indigo-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (selectedBadge.currentProgress / selectedBadge.maxProgress) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Banner: Level & Points Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-900/50 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Level {level} Scholar · {student.grade} WAEC Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Cognitive XP & Competency Milestones
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Earn XP for step-by-step mathematical reasoning, targeted misconception remedies, and consistent daily practice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToSolve}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Solve Practice Equation (+15 XP)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level XP Bar & Quick Stats */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Points (XP)</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-display text-white tabular-nums">
              {totalPoints} XP
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${pointsInCurrentLevel}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {100 - pointsInCurrentLevel} XP until Level {level + 1}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Weekly XP</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
              +{weeklyPoints} XP
            </div>
            <p className="text-[11px] text-slate-400">Eligible for class rankings</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Badges Unlocked</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-display text-white tabular-nums">
              {badgesProgress.filter((b) => b.unlocked).length} / {BADGE_DEFINITIONS.length}
            </div>
            <p className="text-[11px] text-slate-400">Cognitive milestones</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Daily Goal (Today)</span>
              <Target className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold font-display text-white tabular-nums">
              {student.dailyGoalCompleted || 0} / {student.dailyGoalTarget || 3}
            </div>
            <p className="text-[11px] text-slate-400">Equations solved today</p>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Rules & Overview
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Badges ({badgesProgress.filter((b) => b.unlocked).length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Class Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          XP History ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Overview & Points Earning Rules */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Transparent Points System (Anti-Guessing Framework)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                MindTrace never awards points for repeatedly guessing or submitting random clicks. Points are strictly tied to mathematical reasoning and recovery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { activity: 'Complete a Diagnostic', pts: '+10 XP', desc: 'Solve an equation with diagnostic feedback.' },
                { activity: 'Provide Complete Working', pts: '+5 XP', desc: 'Enter 2 or more intermediate transformation steps.' },
                { activity: 'Complete Targeted Remedy', pts: '+10 XP', desc: 'Engage with the 2-minute visual model.' },
                { activity: 'Follow-Up Assessment', pts: '+10 XP', desc: 'Attempt the 1-question verification check.' },
                { activity: 'Demonstrate Improvement', pts: '+15 XP', desc: 'Ace the follow-up question correctly.' },
                { activity: 'Meet Daily Learning Goal', pts: '+5 XP', desc: 'Solve 3 equations in a single day.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.activity}</span>
                    <span className="font-mono font-bold text-amber-300">{item.pts}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Achievement Badges Collection */}
      {activeTab === 'badges' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-display font-bold text-white">
              Cognitive Mastery Badges
            </h2>
            <p className="text-xs text-slate-400">
              Click any badge to view its unlock criteria, pedagogical value, and progress status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badgesProgress.map((bp) => (
              <div
                key={bp.badge.id}
                onClick={() => setSelectedBadge(bp)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  bp.unlocked
                    ? 'bg-slate-950/80 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                      bp.unlocked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-900 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {bp.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      bp.unlocked
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {bp.unlocked ? 'Unlocked' : `${bp.currentProgress}/${bp.maxProgress}`}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{bp.badge.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {bp.badge.description}
                  </p>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bp.unlocked ? 'bg-amber-400' : 'bg-indigo-500'}`}
                    style={{
                      width: `${Math.min(100, (bp.currentProgress / bp.maxProgress) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Weekly Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Class A — Algebra I Leaderboard
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Local Class Snapshot (Offline-Safe)</span>
                </span>
                <span>·</span>
                <span>Pseudonymous Ranks</span>
              </div>
            </div>

            {/* Timeframe switch */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setLeaderboardTimeframe('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  leaderboardTimeframe === 'weekly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly Points
              </button>
              <button
                onClick={() => setLeaderboardTimeframe('allTime')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  leaderboardTimeframe === 'allTime'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All-Time XP
              </button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Weekly XP</th>
                  <th className="py-2.5 px-3">Total Points</th>
                  <th className="py-2.5 px-3">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.studentId}
                    className={`transition ${
                      entry.isCurrentStudent
                        ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500 font-bold'
                        : 'hover:bg-slate-950/40'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs ${
                          entry.rank === 1
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : entry.rank === 2
                            ? 'bg-slate-300 text-slate-950 font-bold'
                            : entry.rank === 3
                            ? 'bg-amber-700 text-white font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold flex items-center justify-center text-[11px]">
                          {entry.avatar}
                        </div>
                        <div>
                          <span className="text-white block">
                            {entry.name}{' '}
                            {entry.isCurrentStudent && (
                              <span className="text-[10px] text-indigo-400 uppercase font-bold">(You)</span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">@{entry.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400 tabular-nums">
                      +{entry.weeklyPoints}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 tabular-nums">
                      {entry.totalPoints}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-400">
                      {entry.streakDays}d 🔥
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Idempotent Reward Transactions Log */}
      {activeTab === 'transactions' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-display font-bold text-white">
              Persisted XP Transaction Ledger
            </h2>
            <p className="text-xs text-slate-400">
              Audit log of all earned reward points stored on this local device.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No reward transactions recorded yet. Solve an equation or complete an intervention to earn points!
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">{tx.reason}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(tx.timestamp).toLocaleString()} · ID: {tx.id.substring(0, 24)}...
                    </span>
                  </div>

                  <span className="font-mono font-bold text-amber-300 text-sm">
                    +{tx.points} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
