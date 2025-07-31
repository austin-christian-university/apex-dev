import type { OnboardingData } from '@acu-apex/types'

export type OnboardingStep = 
  | 'role-selection'
  | 'pending-approval'
  | 'personal-info'
  | 'photo-upload'
  | 'company-selection'
  | 'personality-assessments'
  | 'complete'

export interface OnboardingProgress {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  totalSteps: number
}

export interface OnboardingContextType {
  data: Partial<OnboardingData>
  progress: OnboardingProgress
  updateData: (data: Partial<OnboardingData>) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: OnboardingStep) => void
  isStepAccessible: (step: OnboardingStep) => boolean
}

// Personality assessment options
export const DISC_PROFILES = [
  { value: 'D', label: 'D - Dominance' },
  { value: 'I', label: 'I - Influence' },
  { value: 'S', label: 'S - Steadiness' },
  { value: 'C', label: 'C - Conscientiousness' },
  { value: 'DI', label: 'DI - Dominance/Influence' },
  { value: 'DC', label: 'DC - Dominance/Conscientiousness' },
  { value: 'ID', label: 'ID - Influence/Dominance' },
  { value: 'IS', label: 'IS - Influence/Steadiness' },
  { value: 'SI', label: 'SI - Steadiness/Influence' },
  { value: 'SC', label: 'SC - Steadiness/Conscientiousness' },
  { value: 'CD', label: 'CD - Conscientiousness/Dominance' },
  { value: 'CS', label: 'CS - Conscientiousness/Steadiness' }
]

export const MYERS_BRIGGS_TYPES = [
  { value: 'INTJ', label: 'INTJ - The Architect' },
  { value: 'INTP', label: 'INTP - The Thinker' },
  { value: 'ENTJ', label: 'ENTJ - The Commander' },
  { value: 'ENTP', label: 'ENTP - The Debater' },
  { value: 'INFJ', label: 'INFJ - The Advocate' },
  { value: 'INFP', label: 'INFP - The Mediator' },
  { value: 'ENFJ', label: 'ENFJ - The Protagonist' },
  { value: 'ENFP', label: 'ENFP - The Campaigner' },
  { value: 'ISTJ', label: 'ISTJ - The Logistician' },
  { value: 'ISFJ', label: 'ISFJ - The Protector' },
  { value: 'ESTJ', label: 'ESTJ - The Executive' },
  { value: 'ESFJ', label: 'ESFJ - The Consul' },
  { value: 'ISTP', label: 'ISTP - The Virtuoso' },
  { value: 'ISFP', label: 'ISFP - The Adventurer' },
  { value: 'ESTP', label: 'ESTP - The Entrepreneur' },
  { value: 'ESFP', label: 'ESFP - The Entertainer' }
]

export const ENNEAGRAM_TYPES = [
  { value: '1', label: 'Type 1 - The Perfectionist' },
  { value: '2', label: 'Type 2 - The Helper' },
  { value: '3', label: 'Type 3 - The Achiever' },
  { value: '4', label: 'Type 4 - The Individualist' },
  { value: '5', label: 'Type 5 - The Investigator' },
  { value: '6', label: 'Type 6 - The Loyalist' },
  { value: '7', label: 'Type 7 - The Enthusiast' },
  { value: '8', label: 'Type 8 - The Challenger' },
  { value: '9', label: 'Type 9 - The Peacemaker' },
  { value: '1w9', label: 'Type 1w9 - The Idealist' },
  { value: '1w2', label: 'Type 1w2 - The Advocate' },
  { value: '2w1', label: 'Type 2w1 - The Servant' },
  { value: '2w3', label: 'Type 2w3 - The Host/Hostess' },
  { value: '3w2', label: 'Type 3w2 - The Charmer' },
  { value: '3w4', label: 'Type 3w4 - The Professional' },
  { value: '4w3', label: 'Type 4w3 - The Aristocrat' },
  { value: '4w5', label: 'Type 4w5 - The Bohemian' },
  { value: '5w4', label: 'Type 5w4 - The Iconoclast' },
  { value: '5w6', label: 'Type 5w6 - The Problem Solver' },
  { value: '6w5', label: 'Type 6w5 - The Defender' },
  { value: '6w7', label: 'Type 6w7 - The Buddy' },
  { value: '7w6', label: 'Type 7w6 - The Entertainer' },
  { value: '7w8', label: 'Type 7w8 - The Realist' },
  { value: '8w7', label: 'Type 8w7 - The Maverick' },
  { value: '8w9', label: 'Type 8w9 - The Bear' },
  { value: '9w8', label: 'Type 9w8 - The Referee' },
  { value: '9w1', label: 'Type 9w1 - The Dreamer' }
]

// Step order for different roles
export const STUDENT_STEPS: OnboardingStep[] = [
  'role-selection',
  'personal-info',
  'photo-upload',
  'company-selection', 
  'personality-assessments',
  'complete'
]

export const STUDENT_LEADER_STEPS: OnboardingStep[] = [
  'role-selection',
  'pending-approval',
  'personal-info',
  'photo-upload',
  'company-selection',
  'personality-assessments', 
  'complete'
]

export const STAFF_STEPS: OnboardingStep[] = [
  'role-selection',
  'pending-approval',
  'personal-info',
  'photo-upload',
  'personality-assessments',
  'complete'
]