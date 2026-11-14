import type { CareerField, ExperienceLevel, LearnerProfile } from '../types/elevora';

export const CAREER_FIELDS: CareerField[] = [
  'Technology & Software',
  'Healthcare & Life Sciences',
  'Business, Finance & Accounting',
  'Creative Design & Media',
  'Engineering & Manufacturing',
  'Education, Law & Public Policy',
  'Agriculture, Trades & Rural Enterprise',
  'Other / Interdisciplinary',
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'High School / Pre-College',
  'College Student',
  'Fresh Graduate',
  'Entry-Level (1-2 yrs)',
  'Career Switcher',
];

export interface SampleLearnerPreset {
  label: string;
  fieldTag: string;
  profile: Omit<LearnerProfile, 'updatedAt'>;
}

export const SAMPLE_PRESETS: SampleLearnerPreset[] = [
  {
    label: 'Priya Sharma · Computer Science Graduate',
    fieldTag: 'Technology & Software',
    profile: {
      fullName: 'Priya Sharma',
      field: 'Technology & Software',
      education: 'B.Sc. Computer Science (Tier-3 Regional College)',
      currentSkills: ['HTML & CSS', 'JavaScript Basics', 'Python', 'SQL Fundamentals', 'Problem Solving'],
      experienceLevel: 'Fresh Graduate',
      targetCareer: 'Full-Stack Web Developer',
      interests: 'Building accessible web applications for local businesses and education',
      weeklyHoursGoal: 12,
    },
  },
  {
    label: 'Aarav Patel · Commerce & Finance Student',
    fieldTag: 'Business, Finance & Accounting',
    profile: {
      fullName: 'Aarav Patel',
      field: 'Business, Finance & Accounting',
      education: 'B.Com (Honours) in Accounting & Finance',
      currentSkills: ['Microsoft Excel', 'Bookkeeping', 'Financial Statements', 'Business Communication'],
      experienceLevel: 'College Student',
      targetCareer: 'Financial Data Analyst',
      interests: 'Corporate valuation, investment modeling, and small business credit analysis',
      weeklyHoursGoal: 10,
    },
  },
  {
    label: 'Elena Rostova · Allied Health Graduate',
    fieldTag: 'Healthcare & Life Sciences',
    profile: {
      fullName: 'Elena Rostova',
      field: 'Healthcare & Life Sciences',
      education: 'B.Sc. Nursing & Community Health',
      currentSkills: ['Patient Intake', 'Medical Terminology', 'Electronic Health Records', 'Empathy & Care'],
      experienceLevel: 'Entry-Level (1-2 yrs)',
      targetCareer: 'Clinical Informatics Specialist',
      interests: 'Improving rural clinic workflows, patient data accuracy, and telehealth coordination',
      weeklyHoursGoal: 8,
    },
  },
  {
    label: 'Mateo Rivera · Rural Agri-Tech Entrepreneur',
    fieldTag: 'Agriculture, Trades & Rural Enterprise',
    profile: {
      fullName: 'Mateo Rivera',
      field: 'Agriculture, Trades & Rural Enterprise',
      education: 'Diploma in Agricultural Science & Farm Management',
      currentSkills: ['Soil & Crop Monitoring', 'Supply Chain Logistics', 'Spreadsheet Budgeting', 'Team Coordination'],
      experienceLevel: 'Career Switcher',
      targetCareer: 'Precision Agriculture Specialist',
      interests: 'Drip irrigation efficiency, cooperative market access, and climate-resilient yields',
      weeklyHoursGoal: 9,
    },
  },
];

export interface SkillTrendPoint {
  week: string;
  coreSkills: number;
  appliedPractice: number;
  interviewReadiness: number;
}

export const SAMPLE_SKILL_TREND: SkillTrendPoint[] = [
  { week: 'Wk 1', coreSkills: 38, appliedPractice: 24, interviewReadiness: 30 },
  { week: 'Wk 2', coreSkills: 44, appliedPractice: 31, interviewReadiness: 36 },
  { week: 'Wk 3', coreSkills: 51, appliedPractice: 40, interviewReadiness: 43 },
  { week: 'Wk 4', coreSkills: 58, appliedPractice: 49, interviewReadiness: 52 },
  { week: 'Wk 5', coreSkills: 64, appliedPractice: 56, interviewReadiness: 60 },
  { week: 'Wk 6', coreSkills: 71, appliedPractice: 65, interviewReadiness: 68 },
];

export interface AssessmentPoint {
  label: string;
  category: string;
  score: number;
  isSample?: boolean;
}

export const SAMPLE_ASSESSMENT_HISTORY: AssessmentPoint[] = [
  { label: 'HR Intro', category: 'HR', score: 64, isSample: true },
  { label: 'Core Concepts', category: 'Technical', score: 58, isSample: true },
  { label: 'Case Scenario', category: 'Technical', score: 71, isSample: true },
  { label: 'Behavioral', category: 'HR', score: 76, isSample: true },
];
