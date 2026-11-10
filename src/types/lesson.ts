import { MisconceptionCode } from './index';

export type VisualModelType =
  | 'balance_scale'
  | 'rainbow_expansion'
  | 'fraction_clearer'
  | 'variable_grouping';

export interface AnimatedLessonStep {
  stepNumber: number;
  title: string;
  equationLhs: string;
  equationRhs: string;
  operationBadge?: {
    text: string;
    type: 'add' | 'subtract' | 'multiply' | 'divide' | 'cancel' | 'simplify';
  };
  highlightLhs?: string[];
  highlightRhs?: string[];
  cancelledTerms?: string[];
  actionText: string;
  explanation: string;
  spokenText: string;
  visualState: {
    scaleLeftWeight?: number;
    scaleRightWeight?: number;
    isBalanced?: boolean;
    tiltAngle?: number;
    rainbowStage?: number; // 0: initial, 1: first arc, 2: second arc, 3: expanded
    activeMultiplier?: number;
    activeTerm?: string;
    likeTermsGrouped?: boolean;
    fractionCleared?: boolean;
  };
}

export interface ComprehensionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface InteractiveComprehensionCheck {
  prompt: string;
  equation: string;
  options: ComprehensionOption[];
  hint: string;
}

export interface AnimatedMicroLesson {
  id: string;
  misconceptionCode: MisconceptionCode;
  title: string;
  subtitle: string;
  category: string;
  durationMinutes: number;
  visualModel: VisualModelType;
  originalEquation: string;
  targetVariable: string;
  axiom: string;
  whyIncorrectFails: {
    incorrectStep: string;
    result: string;
    explanation: string;
  };
  steps: AnimatedLessonStep[];
  comprehensionCheck: InteractiveComprehensionCheck;
  isOfflineCached?: boolean;
  downloadSizeKb: number;
}
