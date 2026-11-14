import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please verify your API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

function handleApiError(res: express.Response, err: unknown) {
  console.error('[ELEVORA AI API Error]', err);
  const message =
    err instanceof Error ? err.message : 'An unexpected AI service error occurred.';
  const status = (err as { status?: number })?.status;

  if (
    message.includes('API_KEY_INVALID') ||
    message.includes('PERMISSION_DENIED') ||
    status === 403
  ) {
    return res.status(403).json({
      error:
        'Gemini API key permission issue. Please verify your key in Settings > Secrets.',
    });
  }
  if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
    return res.status(429).json({
      error: 'AI quota temporarily exceeded. Please wait a moment and try again.',
    });
  }
  return res.status(500).json({ error: message });
}

interface LearnerPayload {
  fullName: string;
  field: string;
  education: string;
  currentSkills: string[];
  experienceLevel: string;
  targetCareer: string;
  interests?: string;
  weeklyHoursGoal?: number;
}

function formatProfileContext(p: LearnerPayload): string {
  return [
    `Learner Name: ${p.fullName}`,
    `Primary Field / Industry: ${p.field}`,
    `Education: ${p.education}`,
    `Experience Level: ${p.experienceLevel}`,
    `Current Skills: ${p.currentSkills?.length ? p.currentSkills.join(', ') : 'None listed yet'}`,
    `Target Career: ${p.targetCareer}`,
    `Interests & Background Notes: ${p.interests || 'Not specified'}`,
    `Weekly Learning Availability: ${p.weeklyHoursGoal || 8} hours/week`,
  ].join('\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'elevora-ai' });
  });

  // 1. AI Skill Analysis
  app.post('/api/ai/skill-analysis', async (req, res) => {
    try {
      const profile = req.body?.profile as LearnerPayload | undefined;
      if (!profile?.targetCareer || !profile?.fullName) {
        return res.status(400).json({ error: 'Complete learner profile is required.' });
      }

      const ai = getGeminiClient();
      const prompt = `Analyze the following learner profile for their target career across any relevant industry domain (technology, healthcare, finance, engineering, trades, education, creative arts, agriculture, law, etc.). Be encouraging, realistic, specific to their field, and practical for students, graduates, rural learners, and job seekers.

${formatProfileContext(profile)}

Identify:
1. A realistic career readiness percentage (0-100) comparing current skills + education against their target career.
2. Existing strengths (from their listed skills & education).
3. Weak skills (skills they partially have or implied fundamentals that need strengthening).
4. Missing skills (critical skills absent from their profile needed for the target career).
5. Core and supporting skills required for the target career.
6. One clear, high-impact actionable next step.`;

      const result = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are an expert multidisciplinary career skills analyst at Elevora AI. Return strictly structured JSON matching the schema. Adapt terminology accurately to the learner field—never force software terms onto non-software careers.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                readinessScore: {
                  type: Type.INTEGER,
                  description: 'Overall readiness score from 0 to 100.',
                },
                summary: {
                  type: Type.STRING,
                  description: '2-3 sentence personalized diagnostic summary.',
                },
                strengths: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      proficiency: { type: Type.STRING },
                      relevanceNote: { type: Type.STRING },
                    },
                    required: ['skill', 'proficiency', 'relevanceNote'],
                  },
                },
                weakSkills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      currentLevel: { type: Type.STRING },
                      targetLevel: { type: Type.STRING },
                      gapReason: { type: Type.STRING },
                    },
                    required: ['skill', 'currentLevel', 'targetLevel', 'gapReason'],
                  },
                },
                missingSkills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      priority: {
                        type: Type.STRING,
                        description: 'Must be one of: Essential, High, Medium',
                      },
                      reason: { type: Type.STRING },
                    },
                    required: ['skill', 'priority', 'reason'],
                  },
                },
                requiredForTarget: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      category: { type: Type.STRING },
                      importance: {
                        type: Type.STRING,
                        description: 'Must be Core or Supporting',
                      },
                    },
                    required: ['skill', 'category', 'importance'],
                  },
                },
                actionableNextStep: { type: Type.STRING },
              },
              required: [
                'readinessScore',
                'summary',
                'strengths',
                'weakSkills',
                'missingSkills',
                'requiredForTarget',
                'actionableNextStep',
              ],
            },
          },
        })
      );

      const parsed = JSON.parse((result.text ?? '{}').trim());
      res.json({
        ...parsed,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 2. AI Career Recommendations (3 careers)
  app.post('/api/ai/career-recommendations', async (req, res) => {
    try {
      const profile = req.body?.profile as LearnerPayload | undefined;
      if (!profile?.fullName) {
        return res.status(400).json({ error: 'Learner profile is required.' });
      }

      const ai = getGeminiClient();
      const prompt = `Based on this learner's education, skills, field, experience level, and interests, recommend EXACTLY THREE (3) suitable, realistic careers—including their target career if well-aligned plus strong adjacent or emerging roles in their field (or cross-disciplinary options that fit their strengths).

${formatProfileContext(profile)}

For each of the 3 careers provide:
- careerTitle
- field
- careerDescription (2 clear sentences explaining day-to-day work and impact)
- requiredSkills (5-7 specific skills)
- matchPercentage (0-100 realistic match based on their current profile)
- missingSkills (3-5 concrete gaps to learn)
- recommendations (3 practical steps to qualify or break into this role, accessible for graduates/rural students/job seekers)
- growthOutlook (concise market demand note)`;

      const result = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a multidisciplinary career counselor at Elevora AI supporting all industries globally. Return strictly 3 tailored career recommendations in JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      careerTitle: { type: Type.STRING },
                      field: { type: Type.STRING },
                      careerDescription: { type: Type.STRING },
                      requiredSkills: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      matchPercentage: { type: Type.INTEGER },
                      missingSkills: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      recommendations: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      growthOutlook: { type: Type.STRING },
                    },
                    required: [
                      'careerTitle',
                      'field',
                      'careerDescription',
                      'requiredSkills',
                      'matchPercentage',
                      'missingSkills',
                      'recommendations',
                      'growthOutlook',
                    ],
                  },
                },
              },
              required: ['recommendations'],
            },
          },
        })
      );

      const parsed = JSON.parse((result.text ?? '{}').trim());
      res.json({
        recommendations: (parsed.recommendations || []).slice(0, 3),
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 3. Personalized Learning Roadmap
  app.post('/api/ai/learning-roadmap', async (req, res) => {
    try {
      const profile = req.body?.profile as LearnerPayload | undefined;
      const missingSkills = (req.body?.missingSkills as string[] | undefined) || [];
      if (!profile?.targetCareer) {
        return res.status(400).json({ error: 'Target career is required.' });
      }

      const ai = getGeminiClient();
      const prompt = `Create a structured, step-by-step personalized learning roadmap for this learner aiming to become a "${profile.targetCareer}" in the "${profile.field}" field.

${formatProfileContext(profile)}
${missingSkills.length > 0 ? `Priority Skill Gaps Identified: ${missingSkills.join(', ')}` : ''}

Organize the roadmap into EXACTLY 4 distinct phases matching these phaseType values in order:
1. "beginner" (Beginner Lessons — foundational concepts & tools)
2. "intermediate" (Intermediate Lessons — applied domain workflows & deeper mastery)
3. "exercise" (Practical Exercises — hands-on drills, case studies, simulations, or lab practice)
4. "project" (Mini Projects — portfolio-ready capstone or field deliverables)

Each phase must have 2 to 3 concrete steps with unique ids (e.g. "step-1-1"), realistic estimatedHours calibrated to their ${profile.weeklyHoursGoal || 8} hrs/week pace, a concrete deliverable, and 1-2 accessible (Free, Freemium, or Open Access) learning resources (real reputable platforms like Coursera audit, Khan Academy, NPTEL, MIT OpenCourseWare, freeCodeCamp, edX, official documentation, WHO/industry guides, etc.). Also include a top-level recommendedResources list of 4 standout resources for their field.`;

      const result = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a curriculum architect at Elevora AI designing accessible, high-impact career roadmaps across all fields (engineering, healthcare, finance, agriculture, design, education, tech, trades). Return structured JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                targetCareer: { type: Type.STRING },
                field: { type: Type.STRING },
                estimatedDuration: { type: Type.STRING },
                overview: { type: Type.STRING },
                phases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phaseTitle: { type: Type.STRING },
                      phaseType: {
                        type: Type.STRING,
                        description:
                          'Must be one of: beginner, intermediate, exercise, project',
                      },
                      duration: { type: Type.STRING },
                      description: { type: Type.STRING },
                      steps: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            estimatedHours: { type: Type.INTEGER },
                            deliverable: { type: Type.STRING },
                            resources: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  provider: { type: Type.STRING },
                                  format: { type: Type.STRING },
                                  costType: {
                                    type: Type.STRING,
                                    description: 'Free, Freemium, or Open Access',
                                  },
                                },
                                required: ['title', 'provider', 'format', 'costType'],
                              },
                            },
                          },
                          required: [
                            'id',
                            'title',
                            'description',
                            'estimatedHours',
                            'deliverable',
                            'resources',
                          ],
                        },
                      },
                    },
                    required: [
                      'phaseTitle',
                      'phaseType',
                      'duration',
                      'description',
                      'steps',
                    ],
                  },
                },
                recommendedResources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      provider: { type: Type.STRING },
                      format: { type: Type.STRING },
                      costType: { type: Type.STRING },
                    },
                    required: ['title', 'provider', 'format', 'costType'],
                  },
                },
              },
              required: [
                'targetCareer',
                'field',
                'estimatedDuration',
                'overview',
                'phases',
                'recommendedResources',
              ],
            },
          },
        })
      );

      const parsed = JSON.parse((result.text ?? '{}').trim());
      res.json({
        ...parsed,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 4A. AI Mock Interview - Generate Question
  app.post('/api/ai/interview/question', async (req, res) => {
    try {
      const { profile, persona, history = [], questionNumber = 1 } = req.body as {
        profile: LearnerPayload;
        persona: 'hr' | 'technical';
        history?: { question: string; answer: string }[];
        questionNumber?: number;
      };

      if (!profile?.targetCareer || !persona) {
        return res.status(400).json({ error: 'Profile and interviewer persona are required.' });
      }

      const ai = getGeminiClient();
      const personaDescription =
        persona === 'hr'
          ? 'Friendly HR Interviewer: warm, encouraging talent partner assessing communication clarity, motivation, teamwork, adaptability, and career readiness.'
          : `Domain / Technical Interviewer: rigorous yet fair senior specialist in "${profile.field}" assessing domain-specific technical knowledge, practical problem-solving, and follow-up depth for a "${profile.targetCareer}" candidate.`;

      const historyText =
        history.length > 0
          ? `\nPrevious Q&A in this session:\n${history
              .map(
                (h, i) =>
                  `Q${i + 1}: ${h.question}\nCandidate Answer: ${h.answer}`
              )
              .join('\n\n')}`
          : '';

      const prompt = `Generate Interview Question #${questionNumber} for this candidate.

Persona: ${personaDescription}
${formatProfileContext(profile)}
${historyText}

If there is previous Q&A in this session and it makes sense to probe deeper (especially for Technical Interviewer or clarifying an HR story), make this a natural follow-up question and set isFollowUp=true. Otherwise ask a fresh, realistic interview question appropriate to their experience level (${profile.experienceLevel}) and target role (${profile.targetCareer}).`;

      const result = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are an experienced interviewer conducting a realistic mock interview across any professional field. Return structured JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                interviewerNote: {
                  type: Type.STRING,
                  description: 'Brief 1-sentence natural remark from the interviewer.',
                },
                question: {
                  type: Type.STRING,
                  description: 'The clear interview question.',
                },
                focusArea: {
                  type: Type.STRING,
                  description: 'Short label of the competency being tested.',
                },
                isFollowUp: { type: Type.BOOLEAN },
              },
              required: ['interviewerNote', 'question', 'focusArea', 'isFollowUp'],
            },
          },
        })
      );

      res.json(JSON.parse((result.text ?? '{}').trim()));
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 4B. AI Mock Interview - Evaluate Answer
  app.post('/api/ai/interview/evaluate', async (req, res) => {
    try {
      const { profile, persona, question, answer, focusArea } = req.body as {
        profile: LearnerPayload;
        persona: 'hr' | 'technical';
        question: string;
        answer: string;
        focusArea: string;
      };

      if (!profile || !question || !answer?.trim()) {
        return res
          .status(400)
          .json({ error: 'Question, answer, and learner profile are required.' });
      }

      const ai = getGeminiClient();
      const isHR = persona === 'hr';
      const prompt = `Evaluate this candidate's mock interview answer honestly, constructively, and specifically for their experience level (${profile.experienceLevel}) and target career (${profile.targetCareer} in ${profile.field}).

Interviewer Persona: ${isHR ? 'Friendly HR Interviewer' : 'Technical / Domain Interviewer'}
Focus Area: ${focusArea}
Question Asked: ${question}
Candidate Answer: "${answer}"

Provide:
- score (0-100 overall score)
- secondaryMetricLabel ("Communication & Presence" for HR, or "Technical Accuracy" for Technical)
- secondaryMetricScore (0-100)
- confidenceOrClarityFeedback (specific feedback on confidence & communication for HR, or structured technical reasoning for Technical)
- strengths (2-3 concrete points)
- weaknesses (1-3 concrete gaps or missed points)
- suggestedImprovements (2-3 actionable tips)
- betterSampleAnswer (a complete, natural, strong sample answer tailored to their background)
- recommendedFollowUp (a smart follow-up question the interviewer could ask next)`;

      const result = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a supportive yet rigorous interview coach at Elevora AI. Evaluate candidate answers accurately without inflating scores for vague or very short responses. Return structured JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                secondaryMetricLabel: { type: Type.STRING },
                secondaryMetricScore: { type: Type.INTEGER },
                confidenceOrClarityFeedback: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedImprovements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                betterSampleAnswer: { type: Type.STRING },
                recommendedFollowUp: { type: Type.STRING },
              },
              required: [
                'score',
                'secondaryMetricLabel',
                'secondaryMetricScore',
                'confidenceOrClarityFeedback',
                'strengths',
                'weaknesses',
                'suggestedImprovements',
                'betterSampleAnswer',
                'recommendedFollowUp',
              ],
            },
          },
        })
      );

      res.json(JSON.parse((result.text ?? '{}').trim()));
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 5. AI Mentor Chat
  app.post('/api/ai/mentor', async (req, res) => {
    try {
      const {
        profile,
        message,
        history = [],
        missingSkills = [],
      } = req.body as {
        profile: LearnerPayload;
        message: string;
        history?: { role: 'user' | 'mentor'; content: string }[];
        missingSkills?: string[];
      };

      if (!profile?.fullName || !message?.trim()) {
        return res.status(400).json({ error: 'Profile and message are required.' });
      }

      const ai = getGeminiClient();
      const recentHistory = history
        .slice(-8)
        .map((m) => `${m.role === 'user' ? 'Learner' : 'Elevora Mentor'}: ${m.content}`)
        .join('\n\n');

      const prompt = `Context about the learner:
${formatProfileContext(profile)}
${missingSkills.length ? `Known Skill Gaps: ${missingSkills.join(', ')}` : ''}

Recent Conversation:
${recentHistory || '(Start of mentoring session)'}

Learner's Current Question:
${message}

Respond as Elevora AI Mentor: warm, practical, structured, jargon-free, and genuinely tailored to their field (${profile.field}) and resources accessible to students, fresh graduates, and rural/self-taught job seekers. Also suggest 2-3 short follow-up questions the learner might ask next.`;

      const result = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction:
              'You are Elevora AI Mentor, a personal career & learning mentor supporting learners across every professional and vocational field. Keep advice concrete, actionable, and concise (around 150-250 words unless a detailed plan is requested). Return structured JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                suggestedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-3 short follow-up prompts the user can click.',
                },
              },
              required: ['reply', 'suggestedActions'],
            },
          },
        })
      );

      res.json(JSON.parse((result.text ?? '{}').trim()));
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ELEVORA AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
