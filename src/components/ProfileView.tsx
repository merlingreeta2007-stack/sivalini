import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/presets';
import type { LearnerProfile } from '../types/elevora';
import { ProfileForm } from './ProfileForm';

interface ProfileViewProps {
  profile: LearnerProfile;
  onUpdateProfile: (updated: LearnerProfile) => void;
  onResetAll: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onResetAll,
}) => {
  const [savedNotice, setSavedNotice] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSave = (updated: LearnerProfile) => {
    onUpdateProfile(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const applyPreset = (idx: number) => {
    const preset = SAMPLE_PRESETS[idx];
    onUpdateProfile({
      ...preset.profile,
      updatedAt: new Date().toISOString(),
    });
    setFormKey((k) => k + 1);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Learner Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Update your education, field, current skills, or target career anytime. Your AI analyses can be refreshed to match.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetAll}
          className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-rose-400/40 hover:bg-rose-500/10 text-xs font-medium text-slate-300 hover:text-rose-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart Onboarding
        </button>
      </div>

      {savedNotice && (
        <div className="px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          Profile updated. Re-run Skill Analysis or Learning Roadmap to reflect your latest changes.
        </div>
      )}

      <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
        <ProfileForm
          key={`${profile.updatedAt}-${formKey}`}
          initialProfile={profile}
          submitLabel="Save Profile Changes"
          onSubmit={handleSave}
        />
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0B1224] p-6">
        <h2 className="font-display text-base font-semibold text-white">
          Switch to a Multi-Field Sample Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Explore how Elevora AI adapts across Technology, Finance, Healthcare, and Agriculture.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(idx)}
              className="text-left p-3.5 rounded-lg border border-white/[0.08] bg-[#060B18] hover:border-cyan-400/50 transition-colors cursor-pointer"
            >
              <div className="text-sm font-medium text-slate-100">{preset.label}</div>
              <div className="text-xs text-slate-400 mt-1">
                {preset.fieldTag} · Target: {preset.profile.targetCareer}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
