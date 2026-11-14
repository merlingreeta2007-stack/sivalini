import React from 'react';
import { Briefcase, Check, RefreshCw } from 'lucide-react';
import type {
  CareerRecommendationsResponse,
  LearnerProfile,
} from '../types/elevora';

interface CareerMatchesViewProps {
  profile: LearnerProfile;
  data: CareerRecommendationsResponse | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onSelectTargetCareer: (careerTitle: string) => void;
}

export const CareerMatchesView: React.FC<CareerMatchesViewProps> = ({
  profile,
  data,
  loading,
  error,
  onGenerate,
  onSelectTargetCareer,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            AI Career Matching
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Three tailored career paths matched to your education, skills, and interests in{' '}
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
          {loading
            ? 'Matching Careers...'
            : data
              ? 'Refresh Matches'
              : 'Discover 3 Career Matches'}
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

      {loading && !data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-96 rounded-xl border border-white/[0.08] bg-[#0B1224] animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && !data && !error && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-8 lg:p-12 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-violet-300" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white">
            Find your strongest career fit
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Gemini AI will recommend three realistic roles aligned with your background—complete
            with skill match percentages, missing skill checklists, and entry steps.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-6 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-sm font-semibold text-white whitespace-nowrap cursor-pointer"
          >
            Generate Career Matches
          </button>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {data.recommendations.map((rec, index) => {
            const isCurrentTarget =
              rec.careerTitle.toLowerCase() === profile.targetCareer.toLowerCase();
            return (
              <article
                key={`${rec.careerTitle}-${index}`}
                className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">
                        0{index + 1}. {rec.field} · {rec.growthOutlook}
                      </div>
                      <h2 className="font-display text-lg font-bold text-white mt-1">
                        {rec.careerTitle}
                      </h2>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono tabular-nums text-xl font-bold text-cyan-300">
                        {rec.matchPercentage}%
                      </div>
                      <div className="text-[11px] text-slate-400">match</div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-sm bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                      style={{
                        width: `${Math.max(5, Math.min(100, rec.matchPercentage))}%`,
                      }}
                    />
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {rec.careerDescription}
                  </p>

                  <div className="pt-3 border-t border-white/[0.07]">
                    <div className="text-xs font-medium text-slate-400 mb-1.5">
                      Required Skills
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {rec.requiredSkills.join(' · ')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.07]">
                    <div className="text-xs font-medium text-amber-300 mb-1.5">
                      Missing Skills to Acquire
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rec.missingSkills.join(' · ')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.07]">
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      Action Recommendations
                    </div>
                    <ul className="space-y-1.5">
                      {rec.recommendations.map((step, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                        >
                          <span className="font-mono text-cyan-400 shrink-0">
                            {i + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTargetCareer(rec.careerTitle)}
                  disabled={isCurrentTarget}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                    isCurrentTarget
                      ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 cursor-default'
                      : 'bg-slate-800 hover:bg-blue-600 border border-white/10 text-slate-100'
                  }`}
                >
                  {isCurrentTarget ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Active Target Career
                    </>
                  ) : (
                    'Set as Target Career'
                  )}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
