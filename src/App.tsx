import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Compass,
  LayoutDashboard,
  Map,
  Menu,
  MessageSquareText,
  Target,
  UserCheck,
  UserCircle,
  X,
} from 'lucide-react';
import { CareerMatchesView } from './components/CareerMatchesView';
import { DashboardView } from './components/DashboardView';
import { MentorView } from './components/MentorView';
import { MockInterviewView } from './components/MockInterviewView';
import { OnboardingView } from './components/OnboardingView';
import { ProfileView } from './components/ProfileView';
import { RoadmapView } from './components/RoadmapView';
import { SkillAnalysisView } from './components/SkillAnalysisView';
import {
  fetchCareerRecommendations,
  fetchLearningRoadmap,
  fetchSkillAnalysis,
} from './services/api';
import type {
  CareerRecommendationsResponse,
  InterviewRecord,
  LearnerProfile,
  LearningRoadmap,
  MentorMessage,
  NavSection,
  ProgressState,
  SkillAnalysisReport,
} from './types/elevora';

const STORAGE_KEYS = {
  profile: 'elevora_profile_v1',
  skillReport: 'elevora_skill_report_v1',
  careerMatches: 'elevora_career_matches_v1',
  roadmap: 'elevora_roadmap_v1',
  progress: 'elevora_progress_v1',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'skill-analysis', label: 'Skill Analysis', icon: Target },
  { id: 'career-matches', label: 'Career Matches', icon: Briefcase },
  { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
  { id: 'interview', label: 'Mock Interview', icon: UserCheck },
  { id: 'mentor', label: 'AI Mentor', icon: MessageSquareText },
  { id: 'profile', label: 'Learner Profile', icon: UserCircle },
];

const DEFAULT_PROGRESS: ProgressState = {
  completedStepIds: [],
  weeklyHoursLogged: 4.5,
  interviewHistory: [],
  mentorHistory: [],
};

export default function App() {
  const [profile, setProfile] = useState<LearnerProfile | null>(() =>
    loadJson<LearnerProfile | null>(STORAGE_KEYS.profile, null)
  );
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [skillReport, setSkillReport] = useState<SkillAnalysisReport | null>(() =>
    loadJson<SkillAnalysisReport | null>(STORAGE_KEYS.skillReport, null)
  );
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);

  const [careerMatches, setCareerMatches] =
    useState<CareerRecommendationsResponse | null>(() =>
      loadJson<CareerRecommendationsResponse | null>(STORAGE_KEYS.careerMatches, null)
    );
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerError, setCareerError] = useState<string | null>(null);

  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(() =>
    loadJson<LearningRoadmap | null>(STORAGE_KEYS.roadmap, null)
  );
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const [progress, setProgress] = useState<ProgressState>(() =>
    loadJson<ProgressState>(STORAGE_KEYS.progress, DEFAULT_PROGRESS)
  );

  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.profile);
    }
  }, [profile]);

  useEffect(() => {
    if (skillReport) {
      localStorage.setItem(STORAGE_KEYS.skillReport, JSON.stringify(skillReport));
    } else {
      localStorage.removeItem(STORAGE_KEYS.skillReport);
    }
  }, [skillReport]);

  useEffect(() => {
    if (careerMatches) {
      localStorage.setItem(STORAGE_KEYS.careerMatches, JSON.stringify(careerMatches));
    } else {
      localStorage.removeItem(STORAGE_KEYS.careerMatches);
    }
  }, [careerMatches]);

  useEffect(() => {
    if (roadmap) {
      localStorage.setItem(STORAGE_KEYS.roadmap, JSON.stringify(roadmap));
    } else {
      localStorage.removeItem(STORAGE_KEYS.roadmap);
    }
  }, [roadmap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  }, [progress]);

  const handleRunSkillAnalysis = async (targetProfile: LearnerProfile | null = profile) => {
    if (!targetProfile) return;
    setSkillError(null);
    setSkillLoading(true);
    try {
      const report = await fetchSkillAnalysis(targetProfile);
      setSkillReport(report);
    } catch (err) {
      setSkillError(err instanceof Error ? err.message : 'Failed to analyze skills.');
    } finally {
      setSkillLoading(false);
    }
  };

  const handleRunCareerMatches = async (targetProfile: LearnerProfile | null = profile) => {
    if (!targetProfile) return;
    setCareerError(null);
    setCareerLoading(true);
    try {
      const res = await fetchCareerRecommendations(targetProfile);
      setCareerMatches(res);
    } catch (err) {
      setCareerError(
        err instanceof Error ? err.message : 'Failed to generate career matches.'
      );
    } finally {
      setCareerLoading(false);
    }
  };

  const handleRunRoadmap = async (targetProfile: LearnerProfile | null = profile) => {
    if (!targetProfile) return;
    setRoadmapError(null);
    setRoadmapLoading(true);
    try {
      const missing = skillReport?.missingSkills.map((m) => m.skill) ?? [];
      const plan = await fetchLearningRoadmap(targetProfile, missing);
      setRoadmap(plan);
    } catch (err) {
      setRoadmapError(
        err instanceof Error ? err.message : 'Failed to generate learning roadmap.'
      );
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleCompleteOnboarding = (newProfile: LearnerProfile) => {
    setProfile(newProfile);
    setActiveSection('dashboard');
  };

  const handleUpdateProfile = (updated: LearnerProfile) => {
    const careerChanged =
      profile && updated.targetCareer.toLowerCase() !== profile.targetCareer.toLowerCase();
    setProfile(updated);
    if (careerChanged) {
      setSkillReport(null);
      setRoadmap(null);
    }
  };

  const handleSelectTargetCareer = (careerTitle: string) => {
    if (!profile) return;
    const updated: LearnerProfile = {
      ...profile,
      targetCareer: careerTitle,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);
    setSkillReport(null);
    setRoadmap(null);
    setActiveSection('skill-analysis');
  };

  const handleToggleRoadmapStep = (stepId: string) => {
    setProgress((prev) => {
      const exists = prev.completedStepIds.includes(stepId);
      const completedStepIds = exists
        ? prev.completedStepIds.filter((id) => id !== stepId)
        : [...prev.completedStepIds, stepId];
      return { ...prev, completedStepIds };
    });
  };

  const handleLogHours = (hours: number) => {
    setProgress((prev) => ({
      ...prev,
      weeklyHoursLogged: Math.round((prev.weeklyHoursLogged + hours) * 10) / 10,
    }));
  };

  const handleSaveInterviewRecord = (record: InterviewRecord) => {
    setProgress((prev) => ({
      ...prev,
      interviewHistory: [...prev.interviewHistory, record],
    }));
  };

  const handleMentorMessagesChange = (mentorHistory: MentorMessage[]) => {
    setProgress((prev) => ({ ...prev, mentorHistory }));
  };

  const handleResetAll = () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setProfile(null);
    setSkillReport(null);
    setCareerMatches(null);
    setRoadmap(null);
    setProgress(DEFAULT_PROGRESS);
    setActiveSection('dashboard');
  };

  if (!profile) {
    return <OnboardingView onComplete={handleCompleteOnboarding} />;
  }

  const activeNavLabel =
    NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? 'Dashboard';

  const navigateTo = (sec: NavSection) => {
    setActiveSection(sec);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-white/[0.08] bg-[#080F20]">
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap">
            ELEVORA AI
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/15 text-cyan-200 border border-cyan-400/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.08]">
          <div className="text-xs font-medium text-slate-200 truncate">
            {profile.fullName}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {profile.targetCareer}
          </div>
          <div className="text-[11px] text-cyan-300 truncate mt-0.5">{profile.field}</div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#080F20] border-r border-white/[0.08] flex flex-col h-full z-10">
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-display font-bold text-sm text-white">
                  ELEVORA AI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/20 text-cyan-200 border border-cyan-400/25'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary action on right */}
        <header className="sticky top-0 z-30 bg-[#060B18]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden p-2 rounded-md border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
              <span className="text-slate-300 font-medium whitespace-nowrap">
                Elevora AI
              </span>
              <span aria-hidden="true">/</span>
              <span className="text-cyan-300 font-medium truncate">{activeNavLabel}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              activeSection === 'profile'
                ? navigateTo('dashboard')
                : navigateTo('profile')
            }
            className="px-3.5 py-1.5 rounded-lg border border-white/15 bg-[#0B1224] hover:border-cyan-400/50 text-xs font-medium text-slate-100 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {activeSection === 'profile' ? 'Back to Dashboard' : 'Edit Profile'}
          </button>
        </header>

        {/* Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">
          {activeSection === 'dashboard' && (
            <DashboardView
              profile={profile}
              skillReport={skillReport}
              roadmap={roadmap}
              completedStepIds={progress.completedStepIds}
              weeklyHoursLogged={progress.weeklyHoursLogged}
              interviewHistory={progress.interviewHistory}
              onLogHours={handleLogHours}
              onNavigate={navigateTo}
            />
          )}

          {activeSection === 'skill-analysis' && (
            <SkillAnalysisView
              profile={profile}
              report={skillReport}
              loading={skillLoading}
              error={skillError}
              onGenerate={() => handleRunSkillAnalysis(profile)}
              onNavigate={navigateTo}
            />
          )}

          {activeSection === 'career-matches' && (
            <CareerMatchesView
              profile={profile}
              data={careerMatches}
              loading={careerLoading}
              error={careerError}
              onGenerate={() => handleRunCareerMatches(profile)}
              onSelectTargetCareer={handleSelectTargetCareer}
            />
          )}

          {activeSection === 'roadmap' && (
            <RoadmapView
              profile={profile}
              roadmap={roadmap}
              completedStepIds={progress.completedStepIds}
              loading={roadmapLoading}
              error={roadmapError}
              onGenerate={() => handleRunRoadmap(profile)}
              onToggleStep={handleToggleRoadmapStep}
            />
          )}

          {activeSection === 'interview' && (
            <MockInterviewView
              profile={profile}
              history={progress.interviewHistory}
              onRecordSaved={handleSaveInterviewRecord}
            />
          )}

          {activeSection === 'mentor' && (
            <MentorView
              profile={profile}
              missingSkills={skillReport?.missingSkills.map((m) => m.skill) ?? []}
              messages={progress.mentorHistory}
              onMessagesChange={handleMentorMessagesChange}
            />
          )}

          {activeSection === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetAll={handleResetAll}
            />
          )}
        </main>
      </div>
    </div>
  );
}
