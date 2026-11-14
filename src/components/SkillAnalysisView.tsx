import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Target,
} from 'lucide-react';
import type { LearnerProfile, NavSection, SkillAnalysisReport } from '../types/elevora';

interface SkillAnalysisViewProps {
  profile: LearnerProfile;
  report: SkillAnalysisReport | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onNavigate: (section: NavSection) => void;
}

export const SkillAnalysisView: React.FC<SkillAnalysisViewProps> = ({
  profile,
  report,
  loading,
  error,
  onGenerate,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            AI Skill Gap Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Evaluating your profile against{' '}
            <span className="text-slate-200 font-medium">{profile.targetCareer}</span> in{' '}
            <span className="text-cyan-300">{profile.field}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 text-xs font-semibold text-white flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing Skills...' : report ? 'Refresh Analysis' : 'Run AI Skill Analysis'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm text-rose-200 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={onGenerate}
            className="px-3 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-xs font-medium text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !report && (
        <div className="space-y-4">
          <div className="h-32 rounded-xl border border-white/[0.08] bg-[#0B1224] animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-56 rounded-xl border border-white/[0.08] bg-[#0B1224] animate-pulse" />
            <div className="h-56 rounded-xl border border-white/[0.08] bg-[#0B1224] animate-pulse" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !report && !error && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-8 lg:p-12 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-cyan-300" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white">
            Ready to diagnose your skills
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Elevora AI will compare your {profile.currentSkills.length} listed skill
            {profile.currentSkills.length === 1 ? '' : 's'} and {profile.education}{' '}
            background against real-world expectations for a {profile.targetCareer}.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-6 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            Generate Skill Gap Report
          </button>
        </div>
      )}

      {/* Populated Report */}
      {report && (
        <div className="space-y-6">
          {/* Top Diagnostic Summary */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/[0.08] pb-4 lg:pb-0 lg:pr-6">
              <span className="text-xs text-slate-400">Target Career Readiness</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-white font-mono tabular-nums">
                  {report.readinessScore}%
                </span>
                <span className="text-xs text-cyan-300 font-mono">baseline</span>
              </div>
              <div className="mt-3 w-full h-2 rounded-sm bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${Math.max(4, Math.min(100, report.readinessScore))}%` }}
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-2">
              <div className="text-xs text-slate-400">Diagnostic Summary</div>
              <p className="text-sm text-slate-200 leading-relaxed">{report.summary}</p>
              <div className="pt-1 text-xs text-cyan-300">
                Priority Next Step: <span className="text-slate-200">{report.actionableNextStep}</span>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('roadmap')}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors"
              >
                <span>Build Learning Path</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('career-matches')}
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/[0.04] text-xs font-medium text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
              >
                Explore 3 Career Matches
              </button>
            </div>
          </div>

          {/* 4-Quadrant Skill Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Existing Strengths */}
            <section className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-display text-base font-semibold text-white">
                    Existing Strengths
                  </h2>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {report.strengths.length} identified
                </span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {report.strengths.map((item) => (
                  <div key={item.skill} className="py-3.5 first:pt-4 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-100">{item.skill}</span>
                      <span className="text-xs font-mono text-emerald-300">
                        {item.proficiency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.relevanceNote}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Missing Skills */}
            <section className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-display text-base font-semibold text-white">
                    Missing Skills
                  </h2>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {report.missingSkills.length} gaps
                </span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {report.missingSkills.map((item) => (
                  <div key={item.skill} className="py-3.5 first:pt-4 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-100">{item.skill}</span>
                      <span
                        className={`text-xs font-mono ${
                          item.priority === 'Essential'
                            ? 'text-rose-300'
                            : item.priority === 'High'
                              ? 'text-amber-300'
                              : 'text-cyan-300'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Weak Skills to Strengthen */}
            <section className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <h2 className="font-display text-base font-semibold text-white">
                  Skills to Strengthen
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {report.weakSkills.length} areas
                </span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {report.weakSkills.map((item) => (
                  <div key={item.skill} className="py-3.5 first:pt-4 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-100">{item.skill}</span>
                      <span className="text-xs font-mono text-amber-300">
                        {item.currentLevel} → {item.targetLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.gapReason}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Required Skills Matrix for Target Career */}
            <section className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <h2 className="font-display text-base font-semibold text-white">
                  Required for {profile.targetCareer}
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {report.requiredForTarget.length} competencies
                </span>
              </div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400">
                      <th className="py-2.5 font-medium">Competency</th>
                      <th className="py-2.5 font-medium">Domain</th>
                      <th className="py-2.5 font-medium text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {report.requiredForTarget.map((req) => (
                      <tr key={req.skill} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 text-slate-100 font-medium">{req.skill}</td>
                        <td className="py-2.5 text-slate-400">{req.category}</td>
                        <td className="py-2.5 text-right font-mono text-cyan-300">
                          {req.importance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
