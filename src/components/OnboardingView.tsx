import React, { useState } from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/presets';
import type { LearnerProfile } from '../types/elevora';
import { ProfileForm } from './ProfileForm';

interface OnboardingViewProps {
  onComplete: (profile: LearnerProfile) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const activePreset =
    selectedPresetIdx !== null ? SAMPLE_PRESETS[selectedPresetIdx].profile : undefined;

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-100 flex flex-col">
      {/* Clean Top Bar */}
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between gap-8 max-w-[1440px] w-full mx-auto">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            ELEVORA AI
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <span className="whitespace-nowrap shrink-0">Skill Gap Diagnostics</span>
          <span className="whitespace-nowrap shrink-0">Career Matching</span>
          <span className="whitespace-nowrap shrink-0">Learning Roadmaps</span>
          <span className="whitespace-nowrap shrink-0">AI Mentor & Interviews</span>
        </nav>

        <button
          type="button"
          onClick={() =>
            onComplete({
              ...SAMPLE_PRESETS[0].profile,
              updatedAt: new Date().toISOString(),
            })
          }
          className="px-4 py-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-medium text-cyan-200 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          Try Sample Learner
        </button>
      </header>

      {/* Main Split Hero + Onboarding Form */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Editorial Intro & Visual Backdrop */}
        <section className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0B1224] overflow-hidden relative">
          <div className="relative h-56 lg:h-64 w-full overflow-hidden bg-slate-900">
            {!imgFailed ? (
              <img
                src="/src/assets/images/elevora_hero_backdrop_1794649695582.jpg"
                alt="Elevora AI architectural slate backdrop"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0B1224] via-indigo-950 to-cyan-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1224] via-[#0B1224]/40 to-transparent" />
          </div>

          <div className="p-6 lg:p-8 flex-1 flex flex-col justify-between gap-8 -mt-8 relative z-10">
            <div>
              <p className="text-xs font-medium text-cyan-300 tracking-wide mb-2">
                Discover Your Potential. Build Your Future.
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-white leading-tight text-balance">
                Intelligent career clarity for every learner and field.
              </h1>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Built for college students, fresh graduates, rural learners, and job seekers.
                Map your existing strengths, uncover missing skills, follow a personalized
                learning roadmap, and practice with an AI mentor and mock interviewer.
              </p>
            </div>

            <div className="pt-6 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Quick-fill a sample learner across fields</span>
                <span className="font-mono text-slate-500">4 fields</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelectedPresetIdx(idx)}
                    className={`text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      selectedPresetIdx === idx
                        ? 'border-cyan-400/60 bg-cyan-500/10 text-white'
                        : 'border-white/[0.08] bg-[#060B18]/70 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium truncate">{preset.profile.targetCareer}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {preset.fieldTag}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right: Onboarding Form */}
        <section className="lg:col-span-7 rounded-xl border border-white/[0.08] bg-[#0B1224] p-6 lg:p-8 flex flex-col justify-center">
          <div className="mb-6 pb-5 border-b border-white/[0.08] flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">
                Create Your Learner Profile
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Tell Elevora AI about your background so every analysis and roadmap fits your field.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-300">
              <span>Step 1 of 1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <ProfileForm
            key={selectedPresetIdx !== null ? `preset-${selectedPresetIdx}` : 'custom'}
            initialProfile={activePreset}
            submitLabel="Launch My Workspace"
            onSubmit={onComplete}
          />
        </section>
      </main>
    </div>
  );
};
