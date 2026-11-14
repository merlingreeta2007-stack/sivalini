import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckSquare,
  ExternalLink,
  Map,
  RefreshCw,
  Square,
} from 'lucide-react';
import type { LearnerProfile, LearningRoadmap, RoadmapPhase } from '../types/elevora';

interface RoadmapViewProps {
  profile: LearnerProfile;
  roadmap: LearningRoadmap | null;
  completedStepIds: string[];
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onToggleStep: (stepId: string) => void;
}

type PhaseFilter = 'all' | RoadmapPhase['phaseType'];

const PHASE_LABELS: Record<RoadmapPhase['phaseType'], string> = {
  beginner: 'Beginner Lessons',
  intermediate: 'Intermediate Lessons',
  exercise: 'Practical Exercises',
  project: 'Mini Projects',
};

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  profile,
  roadmap,
  completedStepIds,
  loading,
  error,
  onGenerate,
  onToggleStep,
}) => {
  const [filter, setFilter] = useState<PhaseFilter>('all');

  const stats = useMemo(() => {
    if (!roadmap) return { total: 0, completed: 0, pct: 0, totalHours: 0 };
    const allSteps = roadmap.phases.flatMap((p) => p.steps);
    const total = allSteps.length;
    const completed = allSteps.filter((s) => completedStepIds.includes(s.id)).length;
    const totalHours = allSteps.reduce((sum, s) => sum + (s.estimatedHours || 0), 0);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct, totalHours };
  }, [roadmap, completedStepIds]);

  const visiblePhases = useMemo(() => {
    if (!roadmap) return [];
    if (filter === 'all') return roadmap.phases;
    return roadmap.phases.filter((p) => p.phaseType === filter);
  }, [roadmap, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Personalized Learning Roadmap
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Structured step-by-step curriculum for{' '}
            <span className="text-slate-200 font-medium">{profile.targetCareer}</span> at{' '}
            <span className="font-mono tabular-nums text-cyan-300">
              {profile.weeklyHoursGoal} hrs/week
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 text-xs font-semibold text-white flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading
            ? 'Generating Roadmap...'
            : roadmap
              ? 'Regenerate Plan'
              : 'Generate Learning Path'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm text-rose-200 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={onGenerate}
            className="px-3 py-1.5 rounded-md bg-rose-500/20 text-xs font-medium text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !roadmap && (
        <div className="space-y-4">
          <div className="h-28 rounded-xl border border-white/[0.08] bg-[#0B1224] animate-pulse" />
          <div className="h-64 rounded-xl border border-white/[0.08] bg-[#0B1224] animate-pulse" />
        </div>
      )}

      {!loading && !roadmap && !error && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-8 lg:p-12 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-4">
            <Map className="w-6 h-6 text-cyan-300" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white">
            Build your custom learning plan
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Elevora AI will generate Beginner Lessons, Intermediate Lessons, Practical
            Exercises, Mini Projects, and open-access learning resources tailored to{' '}
            {profile.targetCareer}.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-6 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-sm font-semibold text-white whitespace-nowrap cursor-pointer"
          >
            Generate Personalized Roadmap
          </button>
        </div>
      )}

      {roadmap && (
        <div className="space-y-6">
          {/* Overview + Progress Bar */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="text-xs text-cyan-300">
                  {roadmap.field} · Est. {roadmap.estimatedDuration} ·{' '}
                  <span className="font-mono tabular-nums">{stats.totalHours} study hours</span>
                </div>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                  {roadmap.overview}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono tabular-nums text-2xl font-bold text-white">
                  {stats.completed}/{stats.total}
                </div>
                <div className="text-xs text-slate-400">steps completed ({stats.pct}%)</div>
              </div>
            </div>

            <div className="w-full h-2 rounded-sm bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-300"
                style={{ width: `${stats.pct}%` }}
              />
            </div>

            {/* Interactive Phase Filter Tabs */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              {(
                [
                  ['all', 'All Phases'],
                  ['beginner', 'Beginner Lessons'],
                  ['intermediate', 'Intermediate Lessons'],
                  ['exercise', 'Practical Exercises'],
                  ['project', 'Mini Projects'],
                ] as [PhaseFilter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-white/[0.06]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Phases & Steps */}
          <div className="space-y-6">
            {visiblePhases.map((phase, pIdx) => (
              <section
                key={`${phase.phaseType}-${pIdx}`}
                className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="text-xs text-cyan-300">
                      0{pIdx + 1}. {PHASE_LABELS[phase.phaseType] || phase.phaseType} ·{' '}
                      {phase.duration}
                    </div>
                    <h2 className="font-display text-lg font-bold text-white mt-0.5">
                      {phase.phaseTitle}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{phase.description}</p>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {phase.steps.map((step) => {
                    const isDone = completedStepIds.includes(step.id);
                    return (
                      <div key={step.id} className="py-4 first:pt-2 last:pb-0 space-y-2.5">
                        <div className="flex items-start justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => onToggleStep(step.id)}
                            className="flex items-start gap-3 text-left group cursor-pointer"
                          >
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <div
                                className={`text-sm font-semibold transition-colors ${
                                  isDone
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-100 group-hover:text-cyan-200'
                                }`}
                              >
                                {step.title}
                              </div>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </button>

                          <span className="text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap shrink-0">
                            {step.estimatedHours} hrs
                          </span>
                        </div>

                        <div className="pl-7 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                          <span className="text-slate-300">
                            <span className="text-slate-500">Deliverable:</span>{' '}
                            {step.deliverable}
                          </span>
                          {step.resources.map((res, rIdx) => (
                            <span
                              key={rIdx}
                              className="text-cyan-300 flex items-center gap-1"
                            >
                              <BookOpen className="w-3 h-3 shrink-0" />
                              <span>
                                {res.title} ({res.provider} · {res.costType})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Recommended Resources Directory */}
          {roadmap.recommendedResources?.length > 0 && (
            <section className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
              <h2 className="font-display text-base font-semibold text-white mb-4">
                Recommended Accessible Learning Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roadmap.recommendedResources.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-white/[0.07] bg-[#060B18] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-100">{res.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {res.provider} · {res.format} ·{' '}
                        <span className="text-cyan-300">{res.costType}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
