import React, { useState } from 'react';
import { UserProfile, CareerRoadmap } from '../types';
import {
  Plus,
  ArrowRight,
  Flame,
  Lock,
  Terminal,
  Bug,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPortfolioIdForUser } from '../services/db';
import PopularPaths from './PopularPaths';
import DailyChallengeModal from './DailyChallengeModal';
import FeedbackModal from './FeedbackModal';

interface DashboardProps {
  user: UserProfile;
  roadmaps: CareerRoadmap[];
  onSelectRoadmap?: (id: string) => void;
  onResume: (id: string) => void;
  onNewPath: () => void;
  onQuickStart: (career: string) => void;
  onAddXP: (amount: number) => void;
  onUpgrade: (msg?: string) => void;
  onProfile: () => void;
  onBugHunt: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  roadmaps,
  onResume,
  onNewPath,
  onQuickStart,
  onAddXP,
  onUpgrade,
  onProfile,
  onBugHunt
}) => {
  const [showChallenge, setShowChallenge] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const isDailyDone = user.lastChallengeDate === today;
  const portfolioId = getPortfolioIdForUser(user);

  return (
    <div className="min-h-screen text-[#f0f2f5]">
      {/* Top Workspace Header */}
      <header className="border-b border-white/[0.08] bg-[#06070a]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
              S
            </div>
            <span className="text-sm font-semibold text-white truncate">
              {user.name}
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-mono text-indigo-300/90">
              {user.isPro ? 'Pro Plan' : 'Hobby Plan'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Compact Metrics */}
            <div className="hidden sm:flex items-center gap-4 px-3.5 py-1.5 rounded-lg surface-recessed text-xs font-mono">
              <span className="text-neutral-400">
                LVL <strong className="text-white tabular-nums">{user.level}</strong>
              </span>
              <span className="text-neutral-800">|</span>
              <span className="text-neutral-400">
                XP <strong className="text-white tabular-nums">{user.xp}</strong>
              </span>
              <span className="text-neutral-800">|</span>
              <span className="flex items-center gap-1 text-neutral-400" title="Daily Streak">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-white tabular-nums">{user.streak || 0}d</strong>
              </span>
            </div>

            <button
              onClick={() => navigate(`/portfolio/${portfolioId}`)}
              className="btn-secondary hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium"
              title="Open Public Verified Portfolio"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Portfolio</span>
            </button>

            {!user.isPro && (
              <button
                onClick={() => onUpgrade()}
                className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0"
              >
                Upgrade
              </button>
            )}

            <button
              onClick={() => setShowFeedback(true)}
              className="btn-secondary p-2 rounded-lg text-neutral-300 hover:text-white"
              title="Send Feedback"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={onProfile}
              className="w-8 h-8 rounded-full btn-secondary flex items-center justify-center text-xs font-bold text-white"
              title="Profile & Settings"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Page Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Workspace Overview
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Manage your active engineering tracks, live code simulations, and verified portfolio.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => navigate(`/portfolio/${portfolioId}`)}
              className="btn-secondary h-10 px-4 font-medium text-xs rounded-lg flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Portfolio</span>
            </button>
            <button
              onClick={onNewPath}
              className="btn-primary h-10 px-4 font-semibold text-xs rounded-lg flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Learning Track</span>
            </button>
          </div>
        </div>

        {/* Daily Practice Row (Daily Challenge & Bug Hunter) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="surface-card rounded-2xl p-6 flex flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300/90">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Daily Checkpoint</span>
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Daily Technical Challenge
                </h2>
                <p className="text-xs text-neutral-300/80 leading-relaxed">
                  Complete one short concept or code-debugging question each day to maintain your streak.
                </p>
              </div>
              {isDailyDone && (
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-neutral-400 tabular-nums">+50–150 XP</span>
              <button
                onClick={() => !isDailyDone && setShowChallenge(true)}
                disabled={isDailyDone}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isDailyDone
                    ? 'surface-recessed text-neutral-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {isDailyDone ? 'Completed Today' : 'Start Challenge'}
              </button>
            </div>
          </div>

          <div className="surface-card rounded-2xl p-6 flex flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300/90">
                  <Bug className="w-3.5 h-3.5" />
                  <span>Debugging Lab</span>
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Bug Hunter Sandbox
                </h2>
                <p className="text-xs text-neutral-300/80 leading-relaxed">
                  Inspect broken production snippets, diagnose the root cause, and ship a working fix.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-neutral-400 tabular-nums">+100–500 XP</span>
              <button
                onClick={onBugHunt}
                className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium"
              >
                Open Sandbox
              </button>
            </div>
          </div>
        </section>

        {/* Active Learning Tracks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Active Learning Tracks
            </h2>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">
              {roadmaps.length} / {user.isPro ? '∞' : '2'} active
            </span>
          </div>

          {roadmaps.length === 0 ? (
            <div className="surface-card rounded-2xl p-12 text-center space-y-4">
              <p className="text-base text-white font-semibold">
                No active learning tracks yet
              </p>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Select one of the pre-curated tracks below for 0ms instant onboarding or create a custom curriculum.
              </p>
              <button
                onClick={onNewPath}
                className="btn-primary px-5 py-2.5 text-xs font-semibold rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Track</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {roadmaps.map(map => {
                const totalProjects = map.levels.reduce(
                  (acc, l) => acc + (l.projects ? l.projects.length : 1),
                  0
                );
                const completedInMap = map.levels.reduce((acc, l) => {
                  if (!l.projects) return acc;
                  return (
                    acc +
                    l.projects.filter(p => user.completedProjects.includes(p.id)).length
                  );
                }, 0);
                const progress =
                  totalProjects > 0
                    ? Math.round((completedInMap / totalProjects) * 100)
                    : 0;

                return (
                  <div
                    key={map.id}
                    onClick={() => onResume(map.id)}
                    className="group cursor-pointer surface-interactive rounded-2xl p-6 flex flex-col justify-between gap-6"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono text-indigo-300/90">
                        <span className="flex items-center gap-1.5">
                          <span>{map.levels.length} Chapters</span>
                          {map.isCurated && (
                            <span className="text-emerald-400 flex items-center gap-0.5" title="Pre-Curated Instant Track">
                              · <Zap className="w-3 h-3" /> Cached
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums text-white font-semibold">{progress}%</span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {map.careerTitle}
                      </h3>
                      <p className="text-xs text-neutral-300/80 line-clamp-2 leading-relaxed">
                        {map.description}
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="w-full h-1.5 surface-recessed rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-white rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(progress, 4)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">
                        <span>Continue track</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Track Card */}
              <button
                onClick={onNewPath}
                className="surface-interactive rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 min-h-[190px] text-neutral-400 hover:text-white"
              >
                {!user.isPro && roadmaps.length >= 2 ? (
                  <>
                    <Lock className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs font-semibold text-white">Unlock Unlimited Tracks</span>
                    <span className="text-[11px] text-neutral-400">Pro Plan required</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl surface-recessed flex items-center justify-center text-white">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-white">Create New Track</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Quick-Start Curated Templates */}
        <section className="space-y-4 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Pre-Curated Core Engineering Tracks
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Instant 0ms curriculum blueprints with pre-built unit test suites and cached chapters.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              Instant Load
            </span>
          </div>
          <PopularPaths onSelect={onQuickStart} />
        </section>
      </main>

      {showChallenge && (
        <DailyChallengeModal
          userLevel={user.level}
          careerFocus={roadmaps.length > 0 ? roadmaps[0].careerTitle : 'Computer Science'}
          onClose={() => setShowChallenge(false)}
          onComplete={xp => {
            onAddXP(xp);
          }}
        />
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} userId={user.email} userEmail={user.email} />}
    </div>
  );
};

export default Dashboard;
