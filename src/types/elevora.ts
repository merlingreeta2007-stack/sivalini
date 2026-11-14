export type ExperienceLevel =
  | 'High School / Pre-College'
  | 'College Student'
  | 'Fresh Graduate'
  | 'Entry-Level (1-2 yrs)'
  | 'Career Switcher';

export type CareerField =
  | 'Technology & Software'
  | 'Healthcare & Life Sciences'
  | 'Business, Finance & Accounting'
  | 'Creative Design & Media'
  | 'Engineering & Manufacturing'
  | 'Education, Law & Public Policy'
  | 'Agriculture, Trades & Rural Enterprise'
  | 'Other / Interdisciplinary';

export interface LearnerProfile {
  fullName: string;
  field: CareerField;
  education: string;
  currentSkills: string[];
  experienceLevel: ExperienceLevel;
  targetCareer: string;
  interests: string;
  weeklyHoursGoal: number;
  updatedAt: string;
}

export interface SkillStrength {
  skill: string;
  proficiency: string;
  relevanceNote: string;
}

export interface WeakSkill {
  skill: string;
  currentLevel: string;
  targetLevel: string;
  gapReason: string;
}

export interface MissingSkill {
  skill: string;
  priority: 'Essential' | 'High' | 'Medium';
  reason: string;
}

export interface RequiredSkill {
  skill: string;
  category: string;
  importance: 'Core' | 'Supporting';
}

export interface SkillAnalysisReport {
  readinessScore: number;
  summary: string;
  strengths: SkillStrength[];
  weakSkills: WeakSkill[];
  missingSkills: MissingSkill[];
  requiredForTarget: RequiredSkill[];
  actionableNextStep: string;
  generatedAt: string;
}

export interface CareerRecommendation {
  careerTitle: string;
  field: string;
  careerDescription: string;
  requiredSkills: string[];
  matchPercentage: number;
  missingSkills: string[];
  recommendations: string[];
  growthOutlook: string;
}

export interface CareerRecommendationsResponse {
  recommendations: CareerRecommendation[];
  generatedAt: string;
}

export interface LearningResource {
  title: string;
  provider: string;
  format: string;
  costType: 'Free' | 'Freemium' | 'Open Access';
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  deliverable: string;
  resources: LearningResource[];
}

export interface RoadmapPhase {
  phaseTitle: string;
  phaseType: 'beginner' | 'intermediate' | 'exercise' | 'project';
  duration: string;
  description: string;
  steps: RoadmapStep[];
}

export interface LearningRoadmap {
  targetCareer: string;
  field: string;
  estimatedDuration: string;
  overview: string;
  phases: RoadmapPhase[];
  recommendedResources: LearningResource[];
  generatedAt: string;
}

export type InterviewPersona = 'hr' | 'technical';

export interface InterviewQuestionData {
  question: string;
  interviewerNote: string;
  focusArea: string;
  isFollowUp: boolean;
}

export interface InterviewEvaluation {
  score: number;
  secondaryMetricLabel: string;
  secondaryMetricScore: number;
  confidenceOrClarityFeedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
  betterSampleAnswer: string;
  recommendedFollowUp: string;
}

export interface InterviewRecord {
  id: string;
  persona: InterviewPersona;
  question: string;
  focusArea: string;
  answer: string;
  evaluation: InterviewEvaluation;
  createdAt: string;
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  suggestedActions?: string[];
  createdAt: string;
}

export type NavSection =
  | 'dashboard'
  | 'skill-analysis'
  | 'career-matches'
  | 'roadmap'
  | 'interview'
  | 'mentor'
  | 'profile';

export interface ProgressState {
  completedStepIds: string[];
  weeklyHoursLogged: number;
  interviewHistory: InterviewRecord[];
  mentorHistory: MentorMessage[];
}
