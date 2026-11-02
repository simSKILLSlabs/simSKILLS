import React from 'react';
import { CareerRoadmap, Level, UserProfile, ProjectTask } from '../types';
import {
  CheckCircle2,
  ArrowLeft,
  Trash2,
  Code,
  Sparkles,
  Lock,
  Plus,
  ChevronRight
} from 'lucide-react';

interface RoadmapViewProps {
  roadmap: CareerRoadmap;
  user: UserProfile;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
  onUpgrade: (msg?: string) => void;
  onGeneratePractice: () => void;
  onSelectPractice: (project: ProjectTask) => void;
  onExtend: () => void;
  onUnenroll: (id: string) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({
  roadmap,
  user,
  onSelectLevel,
  onBack,
  onUpgrade,
  onGeneratePractice,
  onSelectPractice,
  onExtend,
  onUnenroll
}) => {
  const isLevelCompleted = (level: Level) => {
    if (!level.projects || level.projects.length === 0) return false;
    return level.projects.every(p => user.completedProjects.includes(p.id));
  };

  const canExtend = user.isPro && roadmap.levels.length < 15;

  return (
    <div className="min-h-screen text-[#f0f2f5]">
      {/* Sticky Top Header */}
      <header className="border-b border-white/[0.08] bg-[#06070a]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>

          <div className="flex items-center gap-3">
            {user.isPro ? (
              <button
                onClick={() => onUnenroll(roadmap.id)}
                className="btn-secondary px-3 py-1.5 rounded-lg text-neutral-300 hover:text-red-400 text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Track</span>
              </button>
            ) : (
              <button
                onClick={() => onUpgrade("Deleting tracks is a Pro feature.")}
                className="btn-secondary px-3 py-1.5 rounded-lg text-neutral-400 text-xs flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3" />
                <span>Delete Track</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-14">
        {/* Track Header */}
        <div className="space-y-3 border-b border-white/[0.08] pb-8">
          <div className="inline-flex flex-wrap items-center gap-2 text-xs font-mono text-indigo-300/90">
            <span>Curriculum Track</span>
            <span>·</span>
            <span className="tabular-nums">{roadmap.levels.length} Chapters</span>
            {roadmap.isCurated && (
              <>
                <span>·</span>
                <span className="text-emerald-400">⚡ Pre-Curated Blueprint</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {roadmap.careerTitle}
          </h1>
          <p className="text-sm md:text-base text-neutral-300/85 max-w-3xl leading-relaxed">
            {roadmap.description}
          </p>
        </div>

        {/* Tactile Chapter List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Chapters
            </h2>
            <span className="text-xs text-neutral-400">
              Select a chapter to read the lesson and complete its assignments
            </span>
          </div>

          <div className="space-y-3">
            {roadmap.levels.map((level, index) => {
              const completed = isLevelCompleted(level);
              const isReadyInstant = Boolean(level.isCached || (level.teaching && level.teaching.sections?.length));

              return (
                <div
                  key={level.id}
                  onClick={() => onSelectLevel(level)}
                  className="group surface-interactive rounded-2xl p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Chapter Number / Checkmark */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5 tabular-nums ${
                        completed
                          ? 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                          : 'surface-recessed text-indigo-300 group-hover:text-white'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{String(index + 1).padStart(2, '0')}</span>
                      )}
                    </div>

                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                          {level.title}
                        </h3>
                        <span className="text-xs font-mono text-indigo-300/80">
                          · {level.difficulty}
                        </span>
                        {isReadyInstant && (
                          <span className="text-xs font-mono text-emerald-400/90">
                            · ⚡ Instant Cache
                          </span>
                        )}
                        {completed && (
                          <span className="text-xs font-mono text-emerald-400">
                            · Completed
                          </span>
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-neutral-300/85 leading-relaxed max-w-2xl">
                        {level.description}
                      </p>

                      {/* Topics as clean typographic list */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-neutral-400">
                        {(level.topics || []).map((t, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-neutral-600">·</span>}
                            <span>{t}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 group-hover:text-white shrink-0 self-end md:self-center">
                    <span>{completed ? 'Review Chapter' : 'Open Chapter'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Extend Track Option */}
          {canExtend && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={onExtend}
                className="btn-secondary px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Advanced Chapters (Up to 15)</span>
              </button>
            </div>
          )}

          {!user.isPro && roadmap.levels.length <= 5 && (
            <div className="pt-4">
              <div className="surface-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Unlock Chapters 6–15 (Advanced &amp; Systems)</span>
                  </h4>
                  <p className="text-xs text-neutral-300/80">
                    Upgrade to Pro to extend this curriculum into advanced engineering and architecture modules.
                  </p>
                </div>
                <button
                  onClick={() => onUpgrade("Upgrade to Pro to unlock full 15-chapter tracks.")}
                  className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg shrink-0"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Infinite Practice Arena */}
        <section className="pt-8 border-t border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Practice Arena
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Generate standalone coding assignments tailored to your current XP level.
              </p>
            </div>

            {user.isPro ? (
              <button
                onClick={onGeneratePractice}
                className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Practice Assignment</span>
              </button>
            ) : (
              <button
                onClick={() => onUpgrade("Upgrade to Pro to unlock Infinite Practice.")}
                className="btn-secondary px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 self-start sm:self-auto"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Generate Practice Assignment (Pro)</span>
              </button>
            )}
          </div>

          {roadmap.extraProjects && roadmap.extraProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {roadmap.extraProjects.map(proj => {
                const isDone = user.completedProjects.includes(proj.id);
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectPractice(proj)}
                    className="surface-interactive p-5 rounded-2xl cursor-pointer flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-indigo-300/90">
                          {proj.difficulty}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Code className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{proj.title}</h4>
                      <p className="text-xs text-neutral-300/80 line-clamp-2">{proj.description}</p>
                    </div>
                    <div className="text-xs text-white font-semibold flex items-center gap-1">
                      <span>{isDone ? 'Review Submission' : 'Open Assignment'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="surface-recessed rounded-2xl p-8 text-center text-xs text-neutral-400">
              No extra practice assignments generated yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default RoadmapView;
