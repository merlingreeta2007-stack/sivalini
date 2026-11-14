import React from 'react';
import {
  ArrowRight,
  Clock,
  Compass,
  Map,
  MessageSquare,
  Plus,
  Target,
} from 'lucide-react';
import {
  SAMPLE_ASSESSMENT_HISTORY,
  SAMPLE_SKILL_TREND,
  type AssessmentPoint,
  type SkillTrendPoint,
} from '../data/presets';
import type {
  InterviewRecord,
  LearnerProfile,
  LearningRoadmap,
  NavSection,
  SkillAnalysisReport,
} from '../types/elevora';
import { AssessmentPerformanceChart, SkillImprovementChart } from './Charts';

interface DashboardViewProps {
  profile: LearnerProfile;
  skillReport: SkillAnalysisReport | null;
  roadmap: LearningRoadmap | null;
  completedStepIds: string[];
  weeklyHoursLogged: number;
  interviewHistory: InterviewRecord[];
  onLogHours: (hours: number) => void;
  onNavigate: (section: NavSection) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  skillReport,
  roadmap,
  completedStepIds,
  weeklyHoursLogged,
  interviewHistory,
  onLogHours,
  onNavigate,
}) => {
  const totalRoadmapSteps = roadmap
    ? roadmap.phases.reduce((sum, p) => sum + p.steps.length, 0)
    : 0;
  const completedCount = roadmap
    ? roadmap.phases
        .flatMap((p) => p.steps)
        .filter((s) => completedStepIds.includes(s.id)).length
    : completedStepIds.length;

  const baseReadiness = skillReport?.readinessScore ?? 42;
  const roadmapBonus =
    totalRoadmapSteps > 0 ? Math.round((completedCount / totalRoadmapSteps) * 24) : 0;
  const readinessPct = Math.min(100, baseReadiness + roadmapBonus);

  const hasLiveInterviews = interviewHistory.length > 0;
  const avgInterviewScore = hasLiveInterviews
    ? Math.round(
        interviewHistory.reduce((acc, r) => acc + r.evaluation.score, 0) /
          interviewHistory.length
      )
    : Math.round(
        SAMPLE_ASSESSMENT_HISTORY.reduce((acc, i) => acc + i.score, 0) /
          SAMPLE_ASSESSMENT_HISTORY.length
      );

  const skillTrendData: SkillTrendPoint[] = SAMPLE_SKILL_TREND.map((pt, idx) => {
    if (idx === SAMPLE_SKILL_TREND.length - 1 && (skillReport || completedCount > 0)) {
      return {
        ...pt,
        coreSkills: readinessPct,
        appliedPractice: Math.min(100, pt.appliedPractice + completedCount * 4),
        interviewReadiness: hasLiveInterviews ? avgInterviewScore : pt.interviewReadiness,
      };
    }
    return pt;
  });

  const assessmentData: AssessmentPoint[] = hasLiveInterviews
    ? interviewHistory.map((item, idx) => ({
        label: `Q${idx + 1} ${item.focusArea.split(' ')[0]}`,
        category: item.persona === 'hr' ? 'HR' : 'Technical',
        score: item.evaluation.score,
      }))
    : SAMPLE_ASSESSMENT_HISTORY;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="rounded-xl border border-white/[0.08] bg-gradient-to-r from-[#0B1224] via-[#0F1936] to-[#131538] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-xs text-cyan-300 font-medium">
            Discover Your Potential. Build Your Future.
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white text-balance">
            Welcome back, {profile.fullName}
          </h1>
          <p className="text-sm text-slate-300">
            Target Career:{' '}
            <span className="text-white font-semibold">{profile.targetCareer}</span> ·{' '}
            <span>{profile.field}</span> · <span>{profile.experienceLevel}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('skill-analysis')}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs font-semibold text-white flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all"
          >
            <span>{skillReport ? 'View Skill Gap Report' : 'Run AI Skill Analysis'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('mentor')}
            className="px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/[0.06] text-xs font-medium text-slate-100 whitespace-nowrap cursor-pointer transition-colors"
          >
            Ask AI Mentor
          </button>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Career Readiness</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="font-display text-3xl font-bold text-white font-mono tabular-nums">
              {readinessPct}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {skillReport
                ? 'Synced with AI skill report'
                : 'Sample baseline · Run AI analysis'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completed Activities</span>
            <Map className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="font-display text-3xl font-bold text-white font-mono tabular-nums">
              {completedCount}
              <span className="text-base text-slate-500 font-normal">
                {totalRoadmapSteps > 0 ? ` / ${totalRoadmapSteps}` : ''}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {roadmap
                ? 'Roadmap milestones checked off'
                : 'Generate roadmap to track steps'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Weekly Learning Hours</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl font-bold text-white font-mono tabular-nums">
                {weeklyHoursLogged}h
                <span className="text-sm text-slate-500 font-normal">
                  {' '}
                  / {profile.weeklyHoursGoal}h
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">This week&apos;s study log</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onLogHours(0.5)}
                title="Log 30 minutes of study"
                className="px-2 py-1 rounded border border-white/10 bg-slate-900 hover:border-cyan-400/50 text-[11px] font-mono text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                0.5h
              </button>
              <button
                type="button"
                onClick={() => onLogHours(1)}
                title="Log 1 hour of study"
                className="px-2 py-1 rounded border border-white/10 bg-slate-900 hover:border-cyan-400/50 text-[11px] font-mono text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                1h
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interview Average</span>
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="font-display text-3xl font-bold text-white font-mono tabular-nums">
              {avgInterviewScore}
              <span className="text-sm text-slate-500 font-normal">/100</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {hasLiveInterviews
                ? `Across ${interviewHistory.length} live practice round${
                    interviewHistory.length === 1 ? '' : 's'
                  }`
                : 'Sample benchmark · Try Mock Interview'}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Graphs */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 flex flex-col">
          <div className="mb-3">
            <h2 className="font-display text-base font-semibold text-white">
              Skill Improvement Graph
            </h2>
          </div>
          <div className="flex-1">
            <SkillImprovementChart
              data={skillTrendData}
              isSampleBaseline={!skillReport && completedCount === 0}
            />
          </div>
        </div>

        <div className="xl:col-span-5 rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 flex flex-col">
          <div className="mb-3">
            <h2 className="font-display text-base font-semibold text-white">
              Assessment Performance Graph
            </h2>
          </div>
          <div className="flex-1">
            <AssessmentPerformanceChart
              data={assessmentData}
              hasLiveData={hasLiveInterviews}
            />
          </div>
        </div>
      </section>

      {/* Guided Next Steps Across Modules */}
      <section className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-cyan-300" />
          <h2 className="font-display text-base font-semibold text-white">
            Your Career Workspace
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              section: 'skill-analysis' as NavSection,
              title: '01. Skill Gap Report',
              desc: skillReport
                ? `${skillReport.missingSkills.length} missing skills mapped`
                : 'Diagnose strengths and missing competencies',
            },
            {
              section: 'career-matches' as NavSection,
              title: '02. Career Matching',
              desc: 'Compare 3 AI-recommended careers fit for you',
            },
            {
              section: 'roadmap' as NavSection,
              title: '03. Learning Path',
              desc: roadmap
                ? `${completedCount}/${totalRoadmapSteps} milestones completed`
                : 'Lessons, exercises, projects & free resources',
            },
            {
              section: 'interview' as NavSection,
              title: '04. Mock Interview',
              desc: 'Practice HR & domain technical questions',
            },
          ].map((item) => (
            <button
              key={item.section}
              type="button"
              onClick={() => onNavigate(item.section)}
              className="text-left p-4 rounded-lg border border-white/[0.08] bg-[#060B18] hover:border-cyan-400/50 transition-colors cursor-pointer flex flex-col justify-between gap-3"
            >
              <div>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <span className="text-xs font-medium text-cyan-300 flex items-center gap-1">
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
