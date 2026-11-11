import React, { useState } from 'react';
import {
  Award,
  Flame,
  Zap,
  Target,
  Trophy,
  Lock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { StudentProfile, BadgeProgress } from '../../types';
import { gamificationService, BADGE_DEFINITIONS } from '../../services/gamificationService';
import { resolveAvatarSrc, getInitials } from '../../utils/avatar';

interface GamificationHubProps {
  student: StudentProfile;
  onGoToSolve: () => void;
  onBackToDashboard: () => void;
}

type HubTab = 'overview' | 'badges' | 'leaderboard' | 'transactions';

const POINT_RULES = [
  { activity: 'Complete a diagnostic', pts: '+10 XP', desc: 'Solve an equation with diagnostic feedback.' },
  { activity: 'Provide complete working', pts: '+5 XP', desc: 'Enter 2 or more intermediate transformation steps.' },
  { activity: 'Complete targeted remedy', pts: '+10 XP', desc: 'Engage with the 2-minute visual model.' },
  { activity: 'Follow-up assessment', pts: '+10 XP', desc: 'Attempt the 1-question verification check.' },
  { activity: 'Demonstrate improvement', pts: '+15 XP', desc: 'Ace the follow-up question correctly.' },
  { activity: 'Meet daily learning goal', pts: '+5 XP', desc: 'Solve 3 equations in a single day.' },
];

export const GamificationHub: React.FC<GamificationHubProps> = ({
  student,
  onGoToSolve,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('overview');
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
  const unlockedCount = badgesProgress.filter((b) => b.unlocked).length;

  const tabs: Array<{ key: HubTab; label: string }> = [
    { key: 'overview', label: 'How XP works' },
    { key: 'badges', label: `Badges (${unlockedCount})` },
    { key: 'leaderboard', label: 'Class leaderboard' },
    { key: 'transactions', label: `XP history (${transactions.length})` },
  ];

  const statCards = [
    {
      label: 'Total points',
      value: `${totalPoints} XP`,
      hint: `${100 - pointsInCurrentLevel} XP until level ${level + 1}`,
      icon: Sparkles,
      tone: 'text-[#D97706]',
    },
    {
      label: 'This week',
      value: `+${weeklyPoints} XP`,
      hint: 'Counts toward class rankings',
      icon: TrendingUp,
      tone: 'text-[#059669]',
    },
    {
      label: 'Badges unlocked',
      value: `${unlockedCount} / ${BADGE_DEFINITIONS.length}`,
      hint: 'Cognitive milestones',
      icon: Award,
      tone: 'text-[#D97706]',
    },
    {
      label: 'Daily goal',
      value: `${student.dailyGoalCompleted || 0} / ${student.dailyGoalTarget || 3}`,
      hint: 'Equations solved today',
      icon: Target,
      tone: 'text-[#6366F1]',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Badge detail modal */}
      {selectedBadge && (
        <div
          className="modal-backdrop animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-dialog-title"
        >
          <div className="modal-surface max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="eyebrow">
                Badge · {selectedBadge.badge.category}
              </span>
              <button
                onClick={() => setSelectedBadge(null)}
                aria-label="Close badge details"
                className="icon-btn w-9 h-9"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="text-center space-y-2 py-1">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${
                  selectedBadge.unlocked
                    ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                    : 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0]'
                }`}
              >
                {selectedBadge.unlocked ? (
                  <Award className="w-8 h-8" aria-hidden="true" />
                ) : (
                  <Lock className="w-8 h-8" aria-hidden="true" />
                )}
              </div>

              <h3 id="badge-dialog-title" className="section-title">
                {selectedBadge.badge.title}
              </h3>
              <p className="text-[13px] font-semibold text-[#4338CA]">
                “{selectedBadge.badge.tagline}”
              </p>
              <p className="text-[13px] text-[#475569] leading-relaxed">
                {selectedBadge.badge.description}
              </p>
              <span
                className={`badge ${selectedBadge.unlocked ? 'badge-mastery' : 'badge-neutral'}`}
              >
                {selectedBadge.unlocked ? 'Unlocked' : 'In progress'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between text-[12px] font-semibold text-[#0F172A]">
                <span>Unlock criteria</span>
                <span className="font-mono text-[#2563EB]">
                  {selectedBadge.currentProgress} / {selectedBadge.maxProgress}
                </span>
              </div>
              <p className="text-[12px] text-[#475569]">{selectedBadge.badge.criteriaDescription}</p>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={selectedBadge.maxProgress}
                aria-valuenow={selectedBadge.currentProgress}
                aria-label={`${selectedBadge.badge.title} progress`}
              >
                <div
                  className={`progress-fill ${
                    selectedBadge.unlocked ? 'progress-fill-diagnostic' : ''
                  }`}
                  style={{
                    width: `${Math.min(100, (selectedBadge.currentProgress / selectedBadge.maxProgress) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <button onClick={() => setSelectedBadge(null)} className="btn-secondary w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header + level banner */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-white to-[#E0F2FE] p-5 sm:p-7"
        aria-labelledby="xp-heading"
      >
        <div className="absolute inset-0 bg-math-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1D4ED8]">
                <Trophy className="w-4 h-4" aria-hidden="true" />
                <span>
                  Level {level} · {student.grade} WAEC track
                </span>
              </div>
              <h1 id="xp-heading" className="page-title">
                Your XP and milestones
              </h1>
              <p className="body-text">
                Earn points for reasoning through every step, repairing misconceptions, and practising
                consistently — never for guessing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={onGoToSolve} className="btn-primary">
                <Zap className="w-4 h-4" aria-hidden="true" />
                <span>Solve a practice equation</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button onClick={onBackToDashboard} className="btn-secondary">
                Dashboard
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map(({ label, value, hint, icon: Icon, tone }) => (
              <div key={label} className="p-4 rounded-xl bg-white/90 border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569]">
                  <span>{label}</span>
                  <Icon className={`w-4 h-4 ${tone}`} aria-hidden="true" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-display text-[#0F172A] tabular-nums">
                  {value}
                </div>
                <p className="text-[11px] text-[#64748B]">{hint}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569]">
              <span>Progress to level {level + 1}</span>
              <span className="font-mono">{pointsInCurrentLevel}%</span>
            </div>
            <div
              className="progress-track bg-white"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pointsInCurrentLevel}
              aria-label={`Progress to level ${level + 1}`}
            >
              <div className="progress-fill" style={{ width: `${pointsInCurrentLevel}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div
          role="tablist"
          aria-label="Gamification sections"
          className="flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl w-fit"
        >
          {tabs.map((tab) => {
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

      {/* Tab: overview */}
      {activeTab === 'overview' && (
        <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="rules-heading">
          <div>
            <h2 id="rules-heading" className="section-title">
              Transparent points system
            </h2>
            <p className="text-[13px] text-[#475569] mt-1">
              MindTrace never awards points for repeated guessing or random clicks. Points are tied to
              mathematical reasoning and recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POINT_RULES.map((item) => (
              <div
                key={item.activity}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[#0F172A]">{item.activity}</span>
                  <span className="font-mono text-[12px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] rounded px-1.5 py-0.5 whitespace-nowrap">
                    {item.pts}
                  </span>
                </div>
                <p className="text-[12px] text-[#475569] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: badges */}
      {activeTab === 'badges' && (
        <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="badges-heading">
          <div>
            <h2 id="badges-heading" className="section-title">
              Mastery badges
            </h2>
            <p className="text-[13px] text-[#475569] mt-1">
              Select a badge to see its unlock criteria, pedagogical value, and progress.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badgesProgress.map((bp) => (
              <li key={bp.badge.id}>
                <button
                  onClick={() => setSelectedBadge(bp)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-3 ${
                    bp.unlocked
                      ? 'bg-white border-[#FDE68A] hover:border-[#F59E0B]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        bp.unlocked
                          ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                          : 'bg-white text-[#94A3B8] border-[#E2E8F0]'
                      }`}
                    >
                      {bp.unlocked ? (
                        <Award className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Lock className="w-5 h-5" aria-hidden="true" />
                      )}
                    </div>

                    <span className={`badge ${bp.unlocked ? 'badge-mastery' : 'badge-neutral'}`}>
                      {bp.unlocked ? 'Unlocked' : `${bp.currentProgress}/${bp.maxProgress}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-semibold text-[#0F172A]">{bp.badge.title}</h3>
                    <p className="text-[12px] text-[#475569] mt-0.5 line-clamp-2">
                      {bp.badge.description}
                    </p>
                  </div>

                  <div className="progress-track h-1.5">
                    <div
                      className={`progress-fill ${
                        bp.unlocked ? 'progress-fill-diagnostic' : ''
                      }`}
                      style={{
                        width: `${Math.min(100, (bp.currentProgress / bp.maxProgress) * 100)}%`,
                      }}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tab: leaderboard */}
      {activeTab === 'leaderboard' && (
        <section className="card-modern overflow-hidden" aria-labelledby="leaderboard-heading">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0]">
            <div>
              <h2 id="leaderboard-heading" className="section-title">
                Class A — Algebra I
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#475569] mt-1">
                <span className="inline-flex items-center gap-1 text-[#047857]">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Local class snapshot · offline-safe</span>
                </span>
                <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
                <span>Pseudonymous ranks</span>
              </div>
            </div>

            <div
              role="group"
              aria-label="Leaderboard timeframe"
              className="flex items-center p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] self-start sm:self-auto"
            >
              <button
                onClick={() => setLeaderboardTimeframe('weekly')}
                aria-pressed={leaderboardTimeframe === 'weekly'}
                className={`px-3 min-h-[34px] rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                  leaderboardTimeframe === 'weekly'
                    ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#475569] hover:text-[#0F172A] border border-transparent'
                }`}
              >
                This week
              </button>
              <button
                onClick={() => setLeaderboardTimeframe('allTime')}
                aria-pressed={leaderboardTimeframe === 'allTime'}
                className={`px-3 min-h-[34px] rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                  leaderboardTimeframe === 'allTime'
                    ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#475569] hover:text-[#0F172A] border border-transparent'
                }`}
              >
                All time
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-modern min-w-[560px]">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Student</th>
                  <th scope="col">Weekly XP</th>
                  <th scope="col">Total points</th>
                  <th scope="col">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.studentId}
                    className={entry.isCurrentStudent ? 'bg-[#EFF6FF]' : undefined}
                  >
                    <td>
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-bold ${
                          entry.rank === 1
                            ? 'bg-[#FDE68A] text-[#92400E]'
                            : entry.rank === 2
                            ? 'bg-[#E2E8F0] text-[#334155]'
                            : entry.rank === 3
                            ? 'bg-[#FED7AA] text-[#9A3412]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden shrink-0">
                          <img
                            src={resolveAvatarSrc(entry.avatar) ?? undefined}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#475569]">
                            {getInitials(entry.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[#0F172A] font-semibold block truncate">
                            {entry.name}{' '}
                            {entry.isCurrentStudent && (
                              <span className="text-[10px] text-[#1D4ED8] uppercase font-bold">
                                (you)
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-[#64748B] font-mono truncate block">
                            @{entry.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono font-bold text-[#047857] tabular-nums">
                      +{entry.weeklyPoints}
                    </td>
                    <td className="font-mono text-[#334155] tabular-nums">{entry.totalPoints}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 font-mono text-[#92400E]">
                        <Flame className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                        <span>{entry.streakDays}d</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab: transactions */}
      {activeTab === 'transactions' && (
        <section className="card-modern p-5 sm:p-6 space-y-4" aria-labelledby="ledger-heading">
          <div>
            <h2 id="ledger-heading" className="section-title">
              XP ledger
            </h2>
            <p className="text-[13px] text-[#475569] mt-1">
              Audit log of every reward point earned on this device.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="py-10 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] space-y-1">
              <p className="text-[14px] font-semibold text-[#0F172A]">No XP earned yet</p>
              <p className="text-[12px] text-[#475569] max-w-sm mx-auto">
                Solve an equation or complete an intervention to record your first reward.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-semibold text-[#0F172A] text-[13px] block truncate">
                      {tx.reason}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B] block truncate">
                      {new Date(tx.timestamp).toLocaleString()} · ID: {tx.id.substring(0, 24)}…
                    </span>
                  </div>

                  <span className="font-mono font-bold text-[#B45309] text-[13px] whitespace-nowrap">
                    +{tx.points} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};
