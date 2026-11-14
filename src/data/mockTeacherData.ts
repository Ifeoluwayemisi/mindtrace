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
  className: '',
  topicName: '',
  activeAssignment: '',
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
