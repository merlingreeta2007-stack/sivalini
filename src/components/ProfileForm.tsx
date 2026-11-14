import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CAREER_FIELDS, EXPERIENCE_LEVELS } from '../data/presets';
import type { CareerField, ExperienceLevel, LearnerProfile } from '../types/elevora';

interface ProfileFormProps {
  initialProfile?: Partial<LearnerProfile>;
  submitLabel: string;
  onSubmit: (profile: LearnerProfile) => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialProfile,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [fullName, setFullName] = useState(initialProfile?.fullName ?? '');
  const [field, setField] = useState<CareerField>(
    initialProfile?.field ?? 'Technology & Software'
  );
  const [education, setEducation] = useState(initialProfile?.education ?? '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    initialProfile?.experienceLevel ?? 'College Student'
  );
  const [targetCareer, setTargetCareer] = useState(initialProfile?.targetCareer ?? '');
  const [interests, setInterests] = useState(initialProfile?.interests ?? '');
  const [weeklyHoursGoal, setWeeklyHoursGoal] = useState<number>(
    initialProfile?.weeklyHoursGoal ?? 10
  );
  const [skills, setSkills] = useState<string[]>(initialProfile?.currentSkills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');

  const addSkill = () => {
    const cleaned = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !skills.includes(s));
    if (cleaned.length > 0) {
      setSkills((prev) => [...prev, ...cleaned]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalSkills = [...skills];
    if (skillInput.trim()) {
      const extra = skillInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !finalSkills.includes(s));
      finalSkills = [...finalSkills, ...extra];
    }

    if (!fullName.trim() || !education.trim() || !targetCareer.trim()) {
      setError('Please enter your full name, education background, and target career.');
      return;
    }

    setError('');
    onSubmit({
      fullName: fullName.trim(),
      field,
      education: education.trim(),
      currentSkills: finalSkills,
      experienceLevel,
      targetCareer: targetCareer.trim(),
      interests: interests.trim(),
      weeklyHoursGoal: Number(weeklyHoursGoal) || 8,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="elevora-fullname"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Full Name
          </label>
          <input
            id="elevora-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Priya Sharma"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            required
          />
        </div>

        <div>
          <label
            htmlFor="elevora-field"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Field / Industry
          </label>
          <select
            id="elevora-field"
            value={field}
            onChange={(e) => setField(e.target.value as CareerField)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
          >
            {CAREER_FIELDS.map((f) => (
              <option key={f} value={f} className="bg-[#0B1224] text-slate-100">
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="elevora-education"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Education
          </label>
          <input
            id="elevora-education"
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g., B.Com Final Year, Diploma in Nursing, B.Tech"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            required
          />
        </div>

        <div>
          <label
            htmlFor="elevora-exp"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Experience Level
          </label>
          <select
            id="elevora-exp"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
          >
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl} className="bg-[#0B1224] text-slate-100">
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label
            htmlFor="elevora-target"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Target Career
          </label>
          <input
            id="elevora-target"
            type="text"
            value={targetCareer}
            onChange={(e) => setTargetCareer(e.target.value)}
            placeholder="e.g., Financial Analyst, Civil Site Engineer, Clinical Coordinator, UX Designer"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            required
          />
        </div>

        <div>
          <label
            htmlFor="elevora-hours"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Study Hours / Week
          </label>
          <input
            id="elevora-hours"
            type="number"
            min={1}
            max={60}
            value={weeklyHoursGoal}
            onChange={(e) => setWeeklyHoursGoal(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="elevora-skills-input"
          className="block text-xs font-medium text-slate-300 mb-1.5"
        >
          Current Skills
        </label>
        <div className="flex gap-2">
          <input
            id="elevora-skills-input"
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill or comma-separated list (e.g., Excel, Communication, Python)"
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-medium text-slate-100 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Skill
          </button>
        </div>

        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-white/10 text-xs text-slate-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="elevora-interests"
          className="block text-xs font-medium text-slate-300 mb-1.5"
        >
          Interests & Goals (Optional)
        </label>
        <textarea
          id="elevora-interests"
          rows={2}
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="What kind of work excites you or what local/industry problems do you want to solve?"
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#060B18] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
        />
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-sm font-semibold text-white shadow-sm whitespace-nowrap shrink-0 transition-all cursor-pointer"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
