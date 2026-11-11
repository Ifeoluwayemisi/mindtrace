/**
 * MindTrace: Core Domain Types & Service Contracts
 * Track 1: AI for Zero-Bandwidth & Localized Learning (Wale Lab Hackathon)
 */

export type Role = 'student' | 'teacher';

export type GradeLevel = 'SS1' | 'SS2' | 'SS3';

export type ExamTrack = 'WAEC' | 'JAMB' | 'NECO';

export type PresentationMode = 'visual' | 'audio' | 'interactive';
export type LearningPreference = PresentationMode;

export interface StudentProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  grade: GradeLevel;
  classSection: string;
  school: string;
  targetExam: ExamTrack;
  preferredPresentation?: PresentationMode[]; // Array of presentation modes: 'visual', 'audio', 'interactive'
  audioSupport?: boolean; // Boolean flag for audio read-aloud assistance
  learningPreferences: LearningPreference[]; // Compatibility alias
  streakDays: number;
  totalPoints: number;
  currentLevel: number;
  dailyGoalTarget: number;
  dailyGoalCompleted: number;
  lastActiveDate: string;
  badgeAchievements: string[];
  leaderboardOptIn: boolean;
  avatarSeed: string; // Avatar preset identifier or custom data URL
  totalDiagnosed: number;
  masteryPercentage: number;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  school: string;
  designation?: string;
  subjects?: string[];
  classes: string[];
  activeClass: string;
  subject: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  isDemoSession: boolean;
  mustChangePassword?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export type MisconceptionCode =
  | 'ALG_SIGN_FLIP'
  | 'ALG_INVALID_DISTRIB'
  | 'ALG_PRECEDENCE_VIOLATION'
  | 'ALG_ARITHMETIC_ERROR'
  | 'ALG_VARIABLE_DROPPED'
  | 'ALG_INCOMPLETE_ISOLATION'
  | 'CORRECT'
  | 'INSUFFICIENT_EVIDENCE';

export interface MisconceptionRule {
  code: MisconceptionCode;
  name: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  pedagogicalRemedy: string;
  chalkboardTip: string;
}

export interface SubjectModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  topicCount: number;
  examWeight: string;
  topics: {
    id: string;
    title: string;
    questionCount: number;
    difficulty: 'Foundational' | 'Intermediate' | 'WAEC Standard';
  }[];
}

export interface Question {
  id: string;
  topicId: string;
  topicTitle: string;
  difficulty: 'Foundational' | 'Intermediate' | 'WAEC Standard';
  equation: string;
  prompt: string;
  contextNote?: string;
  targetVariable: string;
  expectedFinalAnswer: string;
  expectedSteps: string[];
  commonMisconceptionTriggers: {
    answer: string;
    stepTrigger: string;
    code: MisconceptionCode;
  }[];
  followUpQuestion?: {
    equation: string;
    prompt: string;
    expectedFinalAnswer: string;
    expectedSteps: string[];
  };
}

export interface StepSubmission {
  stepNumber: number;
  actionDescription: string;
  mathExpression: string;
}

export interface StepAssessmentItem {
  stepNumber: number;
  mathExpression: string;
  actionDescription: string;
  isCorrect: boolean;
  isValidTransformation: boolean;
  isMethodAppropriate: boolean;
  demonstratesUnderstanding: boolean;
  feedbackNote: string;
  expectedExpression?: string;
}

export interface StepLevelEvaluation {
  totalSteps: number;
  validStepsCount: number;
  methodMarks: number; // 0 - 70 points based on valid step ratio
  accuracyMarks: number; // 0 - 30 points for numerical final answer match
  academicScorePercentage: number; // Pure academic score (methodMarks + accuracyMarks) separate from XP
  finalAnswerCorrect: boolean;
  firstFaultyStepNumber: number | null;
  stepAnalysis: StepAssessmentItem[];
  hasSufficientEvidence: boolean;
  diagnosticConfidence: number; // 0.0 - 1.0 confidence score
  identifiedMisconceptions: MisconceptionCode[];
}

export interface StudentAttemptSubmission {
  id: string;
  questionId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  submittedAt: string;
  steps: StepSubmission[];
  finalAnswer: string;
  timeSpentSeconds: number;
  hintsUsedCount: number;
}

export interface DiagnosisResult {
  id: string;
  attemptId: string;
  questionId: string;
  isCorrect: boolean;
  misconceptionCode: MisconceptionCode;
  title: string;
  summary: string;
  faultyStepNumber: number | null;
  faultyExpression: string | null;
  expectedExpression: string | null;
  explanation: string;
  pedagogicalEmpathyNote: string;
  engineType: 'deterministic_edge_rule' | 'cloud_llm_structured_fallback';
  parsingDurationMs: number;
  confidenceScore: number;
  needsClarification: boolean;
  clarifyingPrompt?: string;
  earnedXp?: number;
  stepEvaluation?: StepLevelEvaluation;
}

export interface TargetedIntervention {
  id: string;
  misconceptionCode: MisconceptionCode;
  title: string;
  subtitle: string;
  durationMinutes: number;
  metaphorTitle: string;
  metaphorDescription: string;
  coreRule: string;
  stepGuide: {
    title: string;
    description: string;
    formulaVisual: string;
  }[];
  interactiveModel: 'balance_scale' | 'rainbow_expansion' | 'fraction_clearer';
}

export interface SyncPayloadRecord {
  id: string;
  type: 'diagnostic_attempt' | 'profile_update' | 'gamification_sync';
  studentId: string;
  studentName: string;
  classSection: string;
  timestamp: string;
  questionId?: string;
  topicId?: string;
  isCorrect?: boolean;
  misconceptionCode?: MisconceptionCode;
  faultyStep?: number | null;
  timeSpentSeconds?: number;
  hintsUsed?: number;
  syncStatus: 'pending' | 'synced';
  payloadData?: Record<string, unknown>;
}

export interface ClassAnalyticsSummary {
  className: string;
  topicName: string;
  activeAssignment: string;
  submissionRate: number;
  avgCompletion: number;
  avgCorrectness: number;
  atRiskCount: number;
  totalStudents: number;
  activeStudents: number;
  microSkills: {
    skill: string;
    score: number; // 0 - 100
  }[];
  performanceTrends: {
    date: string;
    submissionRate: number;
    correctness: number;
  }[];
  timeSpentDistribution: {
    range: string;
    percentage: number;
  }[];
  hintsUsedDistribution: {
    range: string;
    percentage: number;
  }[];
  topMisconceptions: {
    code: MisconceptionCode;
    title: string;
    affectedPercentage: number;
    studentCount: number;
    severity: 'high' | 'medium' | 'low';
  }[];
}

// ---------------- Gamification Types ----------------

export type ActivityRewardType =
  | 'diagnostic_complete'
  | 'working_steps_provided'
  | 'intervention_complete'
  | 'followup_complete'
  | 'followup_improved'
  | 'daily_goal_complete';

export interface PointTransaction {
  id: string;
  studentId: string;
  activityType: ActivityRewardType;
  activityId: string; // Idempotency key (e.g. attemptId or questionId)
  points: number;
  reason: string;
  timestamp: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  category: 'starter' | 'detective' | 'streak' | 'mastery' | 'persistence';
  xpReward: number;
  criteriaDescription: string;
  maxProgress: number;
}

export interface BadgeProgress {
  badge: BadgeDefinition;
  unlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  maxProgress: number;
}

export interface LeaderboardEntry {
  studentId: string;
  username: string;
  name: string;
  avatar: string;
  rank: number;
  weeklyPoints: number;
  totalPoints: number;
  badgesCount: number;
  streakDays: number;
  isCurrentStudent: boolean;
  isLocalDeviceRecord: boolean;
}

export interface LearningSessionSummary {
  sessionId: string;
  date: string;
  questionsAttempted: number;
  questionsMastered: number;
  misconceptionsConquered: string[];
  totalPointsEarned: number;
  unlockedBadgeTitles: string[];
  timeSpentMinutes: number;
}
