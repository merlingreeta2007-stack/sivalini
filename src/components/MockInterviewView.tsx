import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Send,
  UserCheck,
} from 'lucide-react';
import { evaluateInterviewAnswer, fetchInterviewQuestion } from '../services/api';
import type {
  InterviewEvaluation,
  InterviewPersona,
  InterviewQuestionData,
  InterviewRecord,
  LearnerProfile,
} from '../types/elevora';

interface MockInterviewViewProps {
  profile: LearnerProfile;
  history: InterviewRecord[];
  onRecordSaved: (record: InterviewRecord) => void;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({
  profile,
  history,
  onRecordSaved,
}) => {
  const [persona, setPersona] = useState<InterviewPersona>('hr');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestionData | null>(
    null
  );
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hrImgFailed, setHrImgFailed] = useState(false);
  const [techImgFailed, setTechImgFailed] = useState(false);

  const sessionHistory = history.filter((h) => h.persona === persona);

  const startOrNextQuestion = async (selectedPersona: InterviewPersona = persona) => {
    setError(null);
    setEvaluation(null);
    setAnswer('');
    setLoadingQuestion(true);
    try {
      const relevantHistory = history
        .filter((h) => h.persona === selectedPersona)
        .slice(-4)
        .map((h) => ({ question: h.question, answer: h.answer }));

      const q = await fetchInterviewQuestion({
        profile,
        persona: selectedPersona,
        history: relevantHistory,
        questionNumber: relevantHistory.length + 1,
      });
      setCurrentQuestion(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate question.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handlePersonaSwitch = (next: InterviewPersona) => {
    setPersona(next);
    setCurrentQuestion(null);
    setEvaluation(null);
    setAnswer('');
    setError(null);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !answer.trim()) return;

    setError(null);
    setEvaluating(true);
    try {
      const result = await evaluateInterviewAnswer({
        profile,
        persona,
        question: currentQuestion.question,
        answer: answer.trim(),
        focusArea: currentQuestion.focusArea,
      });
      setEvaluation(result);
      onRecordSaved({
        id: `int-${Date.now()}`,
        persona,
        question: currentQuestion.question,
        focusArea: currentQuestion.focusArea,
        answer: answer.trim(),
        evaluation: result,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate your answer.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">AI Mock Interview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Practice realistic interviews for{' '}
          <span className="text-slate-200 font-medium">{profile.targetCareer}</span> with
          instant AI scoring, feedback, and model answers.
        </p>
      </div>

      {/* Persona Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handlePersonaSwitch('hr')}
          className={`p-5 rounded-xl border text-left flex items-center gap-4 transition-colors cursor-pointer ${
            persona === 'hr'
              ? 'border-cyan-400/60 bg-cyan-500/10'
              : 'border-white/[0.08] bg-[#0B1224] hover:border-white/20'
          }`}
        >
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
            {!hrImgFailed ? (
              <img
                src="/src/assets/images/hr_interviewer_avatar_1794649695655.jpg"
                alt="Friendly HR Interviewer portrait"
                referrerPolicy="no-referrer"
                onError={() => setHrImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-300 font-display font-bold">
                HR
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-cyan-300 font-medium">Interviewer A</div>
            <div className="font-display text-base font-bold text-white mt-0.5">
              Friendly HR Interviewer
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Core HR questions · Communication evaluation · Confidence feedback
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handlePersonaSwitch('technical')}
          className={`p-5 rounded-xl border text-left flex items-center gap-4 transition-colors cursor-pointer ${
            persona === 'technical'
              ? 'border-violet-400/60 bg-violet-500/10'
              : 'border-white/[0.08] bg-[#0B1224] hover:border-white/20'
          }`}
        >
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
            {!techImgFailed ? (
              <img
                src="/src/assets/images/tech_interviewer_avatar_1794649697317.jpg"
                alt="Technical Interviewer portrait"
                referrerPolicy="no-referrer"
                onError={() => setTechImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-violet-300 font-display font-bold">
                TC
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-violet-300 font-medium">Interviewer B</div>
            <div className="font-display text-base font-bold text-white mt-0.5">
              Technical / Domain Interviewer
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Career-specific questions · Follow-up probing · Domain knowledge grading
            </p>
          </div>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Active Interview Stage */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 space-y-5">
        {!currentQuestion && !loadingQuestion && (
          <div className="py-6 text-center max-w-xl mx-auto">
            <UserCheck className="w-8 h-8 text-cyan-300 mx-auto mb-3" />
            <h2 className="font-display text-lg font-semibold text-white">
              {persona === 'hr'
                ? 'Start a Friendly HR Practice Session'
                : `Start a ${profile.targetCareer} Technical Session`}
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              You will receive a tailored question, submit your written response, and receive a
              100-point rubric score with suggested improvements and a stronger sample answer.
            </p>
            <button
              type="button"
              onClick={() => startOrNextQuestion(persona)}
              className="mt-5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-sm font-semibold text-white whitespace-nowrap cursor-pointer"
            >
              Ask First Question
            </button>
          </div>
        )}

        {loadingQuestion && (
          <div className="py-10 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-slate-400">
              Preparing your {persona === 'hr' ? 'HR' : 'domain technical'} interview question...
            </p>
          </div>
        )}

        {currentQuestion && !loadingQuestion && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-white/[0.08]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span>
                  {persona === 'hr'
                    ? 'Friendly HR Interviewer'
                    : 'Technical / Domain Interviewer'}{' '}
                  · Focus: <span className="text-cyan-300">{currentQuestion.focusArea}</span>
                </span>
                {currentQuestion.isFollowUp && (
                  <span className="font-mono text-violet-300">Follow-up probe</span>
                )}
              </div>
              <p className="text-xs text-slate-400 italic mb-2">
                “{currentQuestion.interviewerNote}”
              </p>
              <h2 className="font-display text-lg font-semibold text-white leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label
                  htmlFor="interview-answer"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Your Answer
                </label>
                <textarea
                  id="interview-answer"
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={evaluating}
                  placeholder="Write your answer clearly as if speaking in the interview..."
                  className="w-full px-4 py-3 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => startOrNextQuestion(persona)}
                  disabled={loadingQuestion || evaluating}
                  className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/[0.04] text-xs font-medium text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  Skip / New Question
                </button>

                <button
                  type="submit"
                  disabled={evaluating || !answer.trim()}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {evaluating ? 'Evaluating Response...' : 'Submit & Evaluate Answer'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Evaluation Output */}
      {evaluation && (
        <div className="rounded-xl border border-cyan-400/30 bg-[#0B1224] p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div>
              <div className="text-xs text-cyan-300">Gemini AI Interview Evaluation</div>
              <h3 className="font-display text-lg font-bold text-white mt-0.5">
                Performance Breakdown
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-400">{evaluation.secondaryMetricLabel}</div>
                <div className="font-mono tabular-nums text-lg font-semibold text-slate-100">
                  {evaluation.secondaryMetricScore}/100
                </div>
              </div>
              <div className="text-right pl-6 border-l border-white/[0.08]">
                <div className="text-xs text-slate-400">Overall Score</div>
                <div className="font-mono tabular-nums text-3xl font-bold text-cyan-300">
                  {evaluation.score}/100
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            {evaluation.confidenceOrClarityFeedback}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-lg bg-[#060B18] border border-white/[0.07]">
              <div className="text-xs font-semibold text-emerald-300 mb-2">Strengths</div>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-relaxed flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[#060B18] border border-white/[0.07]">
              <div className="text-xs font-semibold text-amber-300 mb-2">Weaknesses</div>
              <ul className="space-y-1.5">
                {evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-relaxed">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[#060B18] border border-white/[0.07]">
              <div className="text-xs font-semibold text-cyan-300 mb-2">
                Suggested Improvements
              </div>
              <ul className="space-y-1.5">
                {evaluation.suggestedImprovements.map((imp, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-relaxed">
                    {i + 1}. {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#060B18] border border-white/[0.07] space-y-1.5">
            <div className="text-xs font-semibold text-violet-300">
              Better Sample Answer
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {evaluation.betterSampleAnswer}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400">
              Next logical follow-up:{' '}
              <span className="text-slate-200">{evaluation.recommendedFollowUp}</span>
            </div>
            <button
              type="button"
              onClick={() => startOrNextQuestion(persona)}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <section className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <h3 className="font-display text-base font-semibold text-white">
              Recent {persona === 'hr' ? 'HR' : 'Technical'} Practice Log
            </h3>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {sessionHistory
              .slice()
              .reverse()
              .slice(0, 5)
              .map((rec) => (
                <div
                  key={rec.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="max-w-2xl">
                    <div className="text-slate-100 font-medium">{rec.question}</div>
                    <div className="text-slate-400 mt-0.5 truncate">{rec.focusArea}</div>
                  </div>
                  <div className="font-mono tabular-nums text-cyan-300 font-semibold">
                    {rec.evaluation.score}/100
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
};
