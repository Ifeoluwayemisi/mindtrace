/**
 * MindTrace Gamification & Pedagogical Incentive Engine
 * Idempotent point transactions, badge criteria evaluation, and offline-resilient leaderboards.
 */

import {
  StudentProfile,
  PointTransaction,
  ActivityRewardType,
  BadgeDefinition,
  BadgeProgress,
  LeaderboardEntry,
} from '../types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'badge-first-steps',
    title: 'Diagnostic Baseline',
    tagline: 'First Step on the Trace',
    description: 'Completed your first step-by-step mathematical diagnostic on MindTrace.',
    icon: 'Footprints',
    category: 'starter',
    xpReward: 25,
    criteriaDescription: 'Complete 1 full diagnostic problem.',
    maxProgress: 1,
  },
  {
    id: 'badge-mistake-detective',
    title: 'Error Diagnosis',
    tagline: 'Root Misconception Resolved',
    description: 'Identified an algebraic misconception and successfully completed the targeted visual remedy.',
    icon: 'Search',
    category: 'detective',
    xpReward: 50,
    criteriaDescription: 'Complete 1 targeted intervention.',
    maxProgress: 1,
  },
  {
    id: 'badge-consistency-star',
    title: 'Study Momentum',
    tagline: 'Daily Problem-Solving Discipline',
    description: 'Maintained a problem-solving streak across consecutive study days.',
    icon: 'Flame',
    category: 'streak',
    xpReward: 75,
    criteriaDescription: 'Maintain a 3-day learning streak.',
    maxProgress: 3,
  },
  {
    id: 'badge-concept-champion',
    title: 'Concept Mastery',
    tagline: 'Follow-Up Verification Cleared',
    description: 'Demonstrated conceptual improvement on 3 follow-up verification assessments.',
    icon: 'Award',
    category: 'mastery',
    xpReward: 100,
    criteriaDescription: 'Solve 3 follow-up assessments correctly.',
    maxProgress: 3,
  },
  {
    id: 'badge-persistent-learner',
    title: 'Algebraic Rigour',
    tagline: 'WAEC Preparation Consistency',
    description: 'Completed 5 complete diagnostic sessions with step-by-step reasoning.',
    icon: 'Zap',
    category: 'persistence',
    xpReward: 120,
    criteriaDescription: 'Complete 5 diagnostic equations.',
    maxProgress: 5,
  },
];

// Peer benchmark snapshot for classroom comparison (Pseudonymous and respectful of low-bandwidth contexts)
const PEER_CLASS_BENCHMARKS: Omit<LeaderboardEntry, 'isCurrentStudent' | 'isLocalDeviceRecord'>[] = [
  {
    studentId: 'peer-chiamaka',
    username: 'Chiamaka_E',
    name: 'Chiamaka Eze',
    avatar: '/src/assets/images/student_avatar_female_2_1794394447322.jpg',
    rank: 1,
    weeklyPoints: 215,
    totalPoints: 640,
    badgesCount: 5,
    streakDays: 6,
  },
  {
    studentId: 'peer-grace',
    username: 'Grace_D',
    name: 'Grace Danjuma',
    avatar: '/src/assets/images/student_avatar_female_1_1794394445859.jpg',
    rank: 2,
    weeklyPoints: 185,
    totalPoints: 590,
    badgesCount: 4,
    streakDays: 5,
  },
  {
    studentId: 'peer-kemi',
    username: 'Kemi_B',
    name: 'Kemi Balogun',
    avatar: '/src/assets/images/student_avatar_female_3_1794394447853.jpg',
    rank: 3,
    weeklyPoints: 150,
    totalPoints: 510,
    badgesCount: 4,
    streakDays: 4,
  },
  {
    studentId: 'peer-emeka',
    username: 'Emeka_N',
    name: 'Emeka Nwosu',
    avatar: '/src/assets/images/student_avatar_male_1_1794394444739.jpg',
    rank: 4,
    weeklyPoints: 125,
    totalPoints: 420,
    badgesCount: 3,
    streakDays: 3,
  },
  {
    studentId: 'peer-tari',
    username: 'Tari_P',
    name: 'Tari Preye',
    avatar: '/src/assets/images/student_avatar_male_2_1794394446145.jpg',
    rank: 5,
    weeklyPoints: 110,
    totalPoints: 380,
    badgesCount: 3,
    streakDays: 2,
  },
  {
    studentId: 'peer-haruna',
    username: 'Haruna_Y',
    name: 'Haruna Yusuf',
    avatar: '/src/assets/images/student_avatar_male_3_1794394447398.jpg',
    rank: 6,
    weeklyPoints: 85,
    totalPoints: 290,
    badgesCount: 2,
    streakDays: 2,
  },
  {
    studentId: 'peer-david',
    username: 'David_O',
    name: 'David Ojo',
    avatar: '/src/assets/images/student_avatar_male_4_1794394448086.jpg',
    rank: 7,
    weeklyPoints: 65,
    totalPoints: 240,
    badgesCount: 1,
    streakDays: 1,
  },
  {
    studentId: 'peer-babatunde',
    username: 'Babatunde_A',
    name: 'Babatunde Adeleke',
    avatar: '/src/assets/images/student_avatar_female_4_1794394449400.jpg',
    rank: 8,
    weeklyPoints: 45,
    totalPoints: 190,
    badgesCount: 1,
    streakDays: 1,
  },
];

class GamificationService {
  private transactions: PointTransaction[] = [];

  constructor() {
    this.loadTransactions();
  }

  private loadTransactions() {
    try {
      const stored = localStorage.getItem('mindtrace_point_transactions');
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch {
      this.transactions = [];
    }
  }

  private persistTransactions() {
    try {
      localStorage.setItem('mindtrace_point_transactions', JSON.stringify(this.transactions));
    } catch {
      // safe
    }
  }

  /**
   * Idempotent point rewarder:
   * Only awards points if the transaction (studentId + activityType + activityId) has not already been granted.
   */
  awardPoints(
    student: StudentProfile,
    activityType: ActivityRewardType,
    activityId: string,
    points: number,
    reason: string
  ): { awarded: boolean; pointsGranted: number; newTotal: number } {
    const idempotencyKey = `${student.id}_${activityType}_${activityId}`;
    const alreadyRewarded = this.transactions.some(
      (tx) => tx.id === idempotencyKey || (tx.studentId === student.id && tx.activityType === activityType && tx.activityId === activityId)
    );

    if (alreadyRewarded) {
      return {
        awarded: false,
        pointsGranted: 0,
        newTotal: this.calculateTotalPoints(student.id),
      };
    }

    const tx: PointTransaction = {
      id: idempotencyKey,
      studentId: student.id,
      activityType,
      activityId,
      points,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.transactions.push(tx);
    this.persistTransactions();

    const newTotal = this.calculateTotalPoints(student.id);
    student.totalPoints = newTotal;
    student.currentLevel = Math.floor(newTotal / 100) + 1;

    return {
      awarded: true,
      pointsGranted: points,
      newTotal,
    };
  }

  calculateTotalPoints(studentId: string): number {
    return this.transactions
      .filter((tx) => tx.studentId === studentId)
      .reduce((sum, tx) => sum + tx.points, 0);
  }

  calculateWeeklyPoints(studentId: string): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.transactions
      .filter((tx) => tx.studentId === studentId && new Date(tx.timestamp) >= oneWeekAgo)
      .reduce((sum, tx) => sum + tx.points, 0);
  }

  getStudentTransactions(studentId: string): PointTransaction[] {
    return this.transactions
      .filter((tx) => tx.studentId === studentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Evaluates badge unlock status against actual activity transactions and profile attributes.
   */
  evaluateBadges(student: StudentProfile): {
    badgesProgress: BadgeProgress[];
    newlyUnlocked: BadgeDefinition[];
  } {
    const studentTxs = this.transactions.filter((tx) => tx.studentId === student.id);
    const completedDiagnostics = studentTxs.filter((tx) => tx.activityType === 'diagnostic_complete').length;
    const completedInterventions = studentTxs.filter((tx) => tx.activityType === 'intervention_complete').length;
    const improvedFollowups = studentTxs.filter((tx) => tx.activityType === 'followup_improved').length;
    const currentStreak = student.streakDays;

    const existingUnlocked = new Set(student.badgeAchievements || []);
    const newlyUnlocked: BadgeDefinition[] = [];

    const badgesProgress: BadgeProgress[] = BADGE_DEFINITIONS.map((def) => {
      let progress = 0;
      let unlocked = false;

      switch (def.id) {
        case 'badge-first-steps':
          progress = Math.min(1, completedDiagnostics);
          unlocked = progress >= 1;
          break;
        case 'badge-mistake-detective':
          progress = Math.min(1, completedInterventions);
          unlocked = progress >= 1;
          break;
        case 'badge-consistency-star':
          progress = Math.min(3, currentStreak);
          unlocked = progress >= 3;
          break;
        case 'badge-concept-champion':
          progress = Math.min(3, improvedFollowups);
          unlocked = progress >= 3;
          break;
        case 'badge-persistent-learner':
          progress = Math.min(5, completedDiagnostics);
          unlocked = progress >= 5;
          break;
        default:
          progress = 0;
          unlocked = false;
      }

      // Check if newly unlocked
      if (unlocked && !existingUnlocked.has(def.id)) {
        newlyUnlocked.push(def);
        student.badgeAchievements = [...(student.badgeAchievements || []), def.id];
      }

      return {
        badge: def,
        unlocked: unlocked || existingUnlocked.has(def.id),
        currentProgress: progress,
        maxProgress: def.maxProgress,
      };
    });

    return { badgesProgress, newlyUnlocked };
  }

  /**
   * Generates weekly or all-time leaderboard rankings incorporating the current student's actual persisted score.
   */
  getLeaderboard(student: StudentProfile, timeFrame: 'weekly' | 'allTime' = 'weekly'): LeaderboardEntry[] {
    const studentWeeklyPts = this.calculateWeeklyPoints(student.id);
    const studentTotalPts = this.calculateTotalPoints(student.id);

    // Build the student's entry (respecting privacy opt-in setting)
    const displayName = student.leaderboardOptIn ? student.name : 'Anonymous Student';
    const displayUsername = student.leaderboardOptIn ? student.username : 'learner_local';

    const currentStudentEntry: LeaderboardEntry = {
      studentId: student.id,
      username: displayUsername,
      name: displayName,
      avatar: student.avatarSeed || 'AD',
      rank: 0,
      weeklyPoints: studentWeeklyPts,
      totalPoints: studentTotalPts,
      badgesCount: (student.badgeAchievements || []).length,
      streakDays: student.streakDays,
      isCurrentStudent: true,
      isLocalDeviceRecord: true,
    };

    // Combine with peer benchmark snapshot
    const allEntries: LeaderboardEntry[] = [
      currentStudentEntry,
      ...PEER_CLASS_BENCHMARKS.map((peer) => ({
        ...peer,
        isCurrentStudent: false,
        isLocalDeviceRecord: false,
      })),
    ];

    // Sort by selected metric
    allEntries.sort((a, b) => {
      const valA = timeFrame === 'weekly' ? a.weeklyPoints : a.totalPoints;
      const valB = timeFrame === 'weekly' ? b.weeklyPoints : b.totalPoints;
      return valB - valA;
    });

    // Assign sequential ranks
    return allEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}

export const gamificationService = new GamificationService();
