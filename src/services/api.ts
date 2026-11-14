import type {
  CareerRecommendationsResponse,
  InterviewEvaluation,
  InterviewPersona,
  InterviewQuestionData,
  LearnerProfile,
  LearningRoadmap,
  SkillAnalysisReport,
} from '../types/elevora';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export function fetchSkillAnalysis(profile: LearnerProfile) {
  return postJson<SkillAnalysisReport>('/api/ai/skill-analysis', { profile });
}

export function fetchCareerRecommendations(profile: LearnerProfile) {
  return postJson<CareerRecommendationsResponse>('/api/ai/career-recommendations', {
    profile,
  });
}

export function fetchLearningRoadmap(
  profile: LearnerProfile,
  missingSkills: string[] = []
) {
  return postJson<LearningRoadmap>('/api/ai/learning-roadmap', {
    profile,
    missingSkills,
  });
}

export function fetchInterviewQuestion(params: {
  profile: LearnerProfile;
  persona: InterviewPersona;
  history: { question: string; answer: string }[];
  questionNumber: number;
}) {
  return postJson<InterviewQuestionData>('/api/ai/interview/question', params);
}

export function evaluateInterviewAnswer(params: {
  profile: LearnerProfile;
  persona: InterviewPersona;
  question: string;
  answer: string;
  focusArea: string;
}) {
  return postJson<InterviewEvaluation>('/api/ai/interview/evaluate', params);
}

export function sendMentorMessage(params: {
  profile: LearnerProfile;
  message: string;
  history: { role: 'user' | 'mentor'; content: string }[];
  missingSkills: string[];
}) {
  return postJson<{ reply: string; suggestedActions: string[] }>(
    '/api/ai/mentor',
    params
  );
}
