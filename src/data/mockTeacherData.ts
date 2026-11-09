import { ClassAnalyticsSummary, MisconceptionCode } from '../types';

export interface StudentRosterItem {
  id: string;
  name: string;
  classSection: string;
  avatar: string;
  overallScore: number;
  status: 'Mastered' | 'In Progress' | 'At Risk';
  detectedMisconceptions: {
    code: MisconceptionCode;
    label: string;
    remediated: boolean;
  }[];
  lastActive: string;
  timeSpentMinutes: number;
  hintsUsed: number;
}

export const INITIAL_CLASS_ANALYTICS: ClassAnalyticsSummary = {
  className: 'Class A - Algebra I (SS2)',
  topicName: 'Linear Equations — Practice',
  activeAssignment: 'Linear Equations — Step-by-Step Isolation',
  submissionRate: 85,
  avgCompletion: 82,
  avgCorrectness: 76,
  atRiskCount: 4,
  totalStudents: 42,
  activeStudents: 36,
  microSkills: [
    { skill: 'Linear Equation', score: 88 },
    { skill: 'Graphing', score: 68 },
    { skill: 'Word Problem', score: 54 },
    { skill: 'Systems', score: 62 },
    { skill: 'Isolation', score: 66 },
    { skill: 'Substitution', score: 78 },
  ],
  performanceTrends: [
    { date: '15/01', submissionRate: 15, correctness: 10 },
    { date: '16/01', submissionRate: 32, correctness: 28 },
    { date: '17/01', submissionRate: 48, correctness: 45 },
    { date: '18/01', submissionRate: 60, correctness: 52 },
    { date: '19/01', submissionRate: 68, correctness: 48 },
    { date: '20/01', submissionRate: 75, correctness: 42 },
    { date: '21/01', submissionRate: 85, correctness: 76 },
  ],
  timeSpentDistribution: [
    { range: '0-10 min', percentage: 6 },
    { range: '10-20 min', percentage: 48 },
    { range: '20-30 min', percentage: 22 },
    { range: '30-40 min', percentage: 18 },
    { range: '40-50 min', percentage: 6 },
  ],
  hintsUsedDistribution: [
    { range: '0 hints', percentage: 12 },
    { range: '1-2 hints', percentage: 52 },
    { range: '3-5 hints', percentage: 20 },
    { range: '5-7 hints', percentage: 11 },
    { range: '7+ hints', percentage: 5 },
  ],
  topMisconceptions: [
    {
      code: 'ALG_SIGN_FLIP',
      title: 'Sign errors when isolating variables',
      affectedPercentage: 42,
      studentCount: 18,
      severity: 'high',
    },
    {
      code: 'ALG_INVALID_DISTRIB',
      title: 'Incomplete bracket distribution (omitting 2nd term)',
      affectedPercentage: 35,
      studentCount: 15,
      severity: 'high',
    },
    {
      code: 'ALG_PRECEDENCE_VIOLATION',
      title: 'Dividing coefficients before isolating constants',
      affectedPercentage: 28,
      studentCount: 12,
      severity: 'medium',
    },
    {
      code: 'ALG_VARIABLE_DROPPED',
      title: 'Dropping unknown variable symbol during subtraction',
      affectedPercentage: 16,
      studentCount: 7,
      severity: 'medium',
    },
  ],
};

export const MOCK_STUDENT_ROSTER: StudentRosterItem[] = [
  {
    id: 'stu-aminat-01',
    name: 'Aminat Diallo',
    classSection: 'SS2 B',
    avatar: 'AD',
    overallScore: 82,
    status: 'In Progress',
    detectedMisconceptions: [
      { code: 'ALG_SIGN_FLIP', label: 'Sign Reversal on Transposition', remediated: true },
    ],
    lastActive: '10 mins ago',
    timeSpentMinutes: 18,
    hintsUsed: 2,
  },
  {
    id: 'stu-babatunde-02',
    name: 'Babatunde Adeleke',
    classSection: 'SS2 B',
    avatar: 'BA',
    overallScore: 48,
    status: 'At Risk',
    detectedMisconceptions: [
      { code: 'ALG_INVALID_DISTRIB', label: 'Bracket Distribution', remediated: false },
      { code: 'ALG_SIGN_FLIP', label: 'Sign Reversal', remediated: false },
    ],
    lastActive: '1 hour ago',
    timeSpentMinutes: 34,
    hintsUsed: 6,
  },
  {
    id: 'stu-chiamaka-03',
    name: 'Chiamaka Eze',
    classSection: 'SS2 B',
    avatar: 'CE',
    overallScore: 94,
    status: 'Mastered',
    detectedMisconceptions: [],
    lastActive: '25 mins ago',
    timeSpentMinutes: 12,
    hintsUsed: 0,
  },
  {
    id: 'stu-david-04',
    name: 'David Ojo',
    classSection: 'SS2 B',
    avatar: 'DO',
    overallScore: 52,
    status: 'At Risk',
    detectedMisconceptions: [
      { code: 'ALG_PRECEDENCE_VIOLATION', label: 'Precedence Violation', remediated: false },
    ],
    lastActive: '3 hours ago',
    timeSpentMinutes: 41,
    hintsUsed: 5,
  },
  {
    id: 'stu-emeka-05',
    name: 'Emeka Nwosu',
    classSection: 'SS2 B',
    avatar: 'EN',
    overallScore: 74,
    status: 'In Progress',
    detectedMisconceptions: [
      { code: 'ALG_SIGN_FLIP', label: 'Sign Reversal', remediated: true },
    ],
    lastActive: '45 mins ago',
    timeSpentMinutes: 20,
    hintsUsed: 2,
  },
  {
    id: 'stu-fatimah-06',
    name: 'Fatimah Alabi',
    classSection: 'SS2 B',
    avatar: 'FA',
    overallScore: 41,
    status: 'At Risk',
    detectedMisconceptions: [
      { code: 'ALG_SIGN_FLIP', label: 'Sign Reversal', remediated: false },
      { code: 'ALG_VARIABLE_DROPPED', label: 'Variable Dropped', remediated: false },
    ],
    lastActive: '2 hours ago',
    timeSpentMinutes: 38,
    hintsUsed: 7,
  },
  {
    id: 'stu-grace-07',
    name: 'Grace Danjuma',
    classSection: 'SS2 B',
    avatar: 'GD',
    overallScore: 96,
    status: 'Mastered',
    detectedMisconceptions: [],
    lastActive: 'Yesterday',
    timeSpentMinutes: 14,
    hintsUsed: 1,
  },
  {
    id: 'stu-haruna-08',
    name: 'Haruna Yusuf',
    classSection: 'SS2 B',
    avatar: 'HY',
    overallScore: 64,
    status: 'At Risk',
    detectedMisconceptions: [
      { code: 'ALG_VARIABLE_DROPPED', label: 'Variable Dropped', remediated: false },
    ],
    lastActive: '4 hours ago',
    timeSpentMinutes: 26,
    hintsUsed: 4,
  },
  {
    id: 'stu-kemi-09',
    name: 'Kemi Balogun',
    classSection: 'SS2 B',
    avatar: 'KB',
    overallScore: 88,
    status: 'Mastered',
    detectedMisconceptions: [],
    lastActive: '15 mins ago',
    timeSpentMinutes: 16,
    hintsUsed: 1,
  },
  {
    id: 'stu-tari-10',
    name: 'Tari Preye',
    classSection: 'SS2 B',
    avatar: 'TP',
    overallScore: 78,
    status: 'In Progress',
    detectedMisconceptions: [
      { code: 'ALG_INVALID_DISTRIB', label: 'Bracket Distribution', remediated: true },
    ],
    lastActive: '1 day ago',
    timeSpentMinutes: 22,
    hintsUsed: 3,
  },
];
