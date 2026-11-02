import React, { useState } from 'react';
import { Level, ProjectTask } from '../types';
import {
  X,
  PlayCircle,
  ExternalLink,
  Code,
  Youtube,
  BookOpen,
  Lightbulb,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface LevelDetailProps {
  level: Level;
  totalLevels?: number;
  careerTitle?: string;
  isLoading?: boolean;
  completedProjectIds: string[];
  onClose: () => void;
  onStartProject: (project: ProjectTask) => void;
  onRegenerate?: () => void;
}

const LevelDetail: React.FC<LevelDetailProps> = ({
  level,
  totalLevels = 5,
  careerTitle = "Software Engineering",
  isLoading,
  completedProjectIds,
  onClose,
  onStartProject,
  onRegenerate
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [openWalkthroughs, setOpenWalkthroughs] = useState<Record<string, boolean>>({});
  const [openStarterPreview, setOpenStarterPreview] = useState<Record<string, boolean>>({});

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = level.teaching?.sections || [];
  const pitfalls = level.teaching?.pitfalls || [];
  const videoResources = (level.resources || []).filter(r => r.type === 'video' || !r.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="surface-card w-full max-w-5xl h-[93vh] rounded-2xl overflow-hidden flex flex-col">

        {/* Top Sticky Header Bar (No Left Sidebar) */}
        <header className="px-6 py-4 bg-[#080a0f] border-b border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300/90">
              <span className="font-semibold">
                Chapter {level.id} of {totalLevels}
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">{level.difficulty}</span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-white truncate mt-0.5 tracking-tight">
              {level.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isLoading && level.teaching && (
              <div className="hidden md:flex items-center gap-1 mr-2 text-xs text-neutral-400">
                <button
                  onClick={() => scrollToSection('chapter-reading')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  Lesson
                </button>
                {pitfalls.length > 0 && (
                  <button
                    onClick={() => scrollToSection('chapter-mistakes')}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    Common Mistakes
                  </button>
                )}
                <button
                  onClick={() => scrollToSection('chapter-videos')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  Videos
                </button>
                <button
                  onClick={() => scrollToSection('chapter-assignments')}
                  className="btn-secondary px-3 py-1.5 rounded-lg text-white font-medium whitespace-nowrap shrink-0"
                >
                  Assignments ({(level.projects || []).length})
                </button>
              </div>
            )}

            {onRegenerate && !isLoading && (
              <button
                onClick={onRegenerate}
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
                title="Regenerate chapter content"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="btn-secondary w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Continuous Single-Column Reading Body */}
        <div className="flex-1 overflow-y-auto bg-[#06070a]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4 p-8 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  Loading Chapter {level.id}: {level.title}
                </p>
                <p className="text-xs text-neutral-400 max-w-md">
                  Preparing comprehensive topic explanations, syntax rules, working code examples with output, and guided exercises.
                </p>
              </div>
            </div>
          ) : (
            <article className="max-w-3xl mx-auto px-6 py-10 md:py-14 space-y-14">

              {/* CHAPTER HEADER & INTRODUCTION */}
              {level.teaching && (
                <section id="chapter-reading" className="space-y-6">
                  <div className="space-y-2 border-b border-white/[0.08] pb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      {level.title}
                    </h1>
                    <p className="text-xs font-mono text-indigo-300/90">
                      Topics: {(level.topics || []).join(' · ')}
                    </p>
                  </div>

                  {/* Introduction Paragraphs */}
                  <div className="text-neutral-200 text-base leading-8 whitespace-pre-line">
                    {level.teaching.conceptExplanation}
                  </div>
                </section>
              )}

              {/* COMPREHENSIVE TOPIC SECTIONS */}
              {sections.length > 0 && (
                <div className="space-y-14">
                  {sections.map((sec, idx) => {
                    const codeId = `section-code-${idx}`;
                    const hasNumberPrefix = /^\d+\./.test((sec.title || '').trim());
                    const headingText = hasNumberPrefix ? sec.title : `${idx + 1}. ${sec.title}`;

                    return (
                      <section
                        key={idx}
                        className="space-y-6 pt-8 border-t border-white/[0.08]"
                      >
                        {/* Section Heading */}
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                          {headingText}
                        </h2>

                        {/* Thorough Reading Paragraphs */}
                        <div className="text-neutral-200 text-base leading-8 whitespace-pre-line">
                          {sec.theory}
                        </div>

                        {/* Syntax Blueprint / Formula (if provided) */}
                        {sec.syntaxRule && (
                          <div className="surface-recessed rounded-xl p-4 space-y-1.5">
                            <span className="text-xs font-mono text-indigo-300/90">
                              Syntax
                            </span>
                            <pre className="text-xs md:text-sm font-mono text-neutral-100 overflow-x-auto leading-relaxed">
                              <code>{sec.syntaxRule}</code>
                            </pre>
                          </div>
                        )}

                        {/* Example Code + Output Block */}
                        {sec.codeExample && (
                          <div className="surface-card rounded-2xl overflow-hidden">
                            {/* Code Header */}
                            <div className="px-4 py-2.5 bg-[#090b10] border-b border-white/[0.08] flex items-center justify-between">
                              <span className="text-xs font-mono text-neutral-300 flex items-center gap-2">
                                <Code className="w-3.5 h-3.5 text-indigo-300" />
                                Example ({sec.codeLanguage || 'code'})
                              </span>
                              <button
                                onClick={() => handleCopyCode(sec.codeExample, codeId)}
                                className="btn-secondary text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5"
                              >
                                {copiedId === codeId ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Code Content */}
                            <pre className="p-5 text-xs md:text-sm font-mono text-neutral-100 overflow-x-auto leading-relaxed bg-[#050609]">
                              <code>{sec.codeExample}</code>
                            </pre>

                            {/* Attached Output Console */}
                            {sec.codeOutput && (
                              <div className="border-t border-white/[0.08] bg-[#080a0f] px-5 py-3.5">
                                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 mb-1.5">
                                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>Output</span>
                                </div>
                                <pre className="text-xs md:text-sm font-mono text-emerald-400 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                                  {sec.codeOutput}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Step-by-Step Explanation of the Code */}
                        {sec.explanation && (
                          <div className="surface-card rounded-xl p-5 space-y-2">
                            <p className="text-xs font-mono text-indigo-300/90">
                              Code Walkthrough
                            </p>
                            <div className="text-neutral-200 text-sm md:text-base leading-7 whitespace-pre-line">
                              {sec.explanation}
                            </div>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}

              {/* COMMON MISTAKES SECTION */}
              {pitfalls.length > 0 && (
                <section id="chapter-mistakes" className="space-y-6 pt-8 border-t border-white/[0.08]">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      Common Mistakes to Avoid
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                      Watch out for these frequent bugs when writing your code.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {pitfalls.map((pitfall, idx) => (
                      <div key={idx} className="surface-card rounded-2xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-white">{pitfall.mistake}</h3>
                            <p className="text-sm text-neutral-300 leading-relaxed">{pitfall.whyItHappens}</p>
                          </div>
                        </div>

                        {(pitfall.badCode || pitfall.goodCode) && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {pitfall.badCode && (
                              <div className="rounded-xl border border-red-900/40 bg-[#050609] overflow-hidden">
                                <div className="px-3.5 py-2 bg-red-950/25 border-b border-red-900/40 text-xs font-mono text-red-400">
                                  Incorrect
                                </div>
                                <pre className="p-4 text-xs font-mono text-red-200 overflow-x-auto leading-relaxed">
                                  <code>{pitfall.badCode}</code>
                                </pre>
                              </div>
                            )}
                            {pitfall.goodCode && (
                              <div className="rounded-xl border border-emerald-900/40 bg-[#050609] overflow-hidden">
                                <div className="px-3.5 py-2 bg-emerald-950/25 border-b border-emerald-900/40 text-xs font-mono text-emerald-400">
                                  Correct
                                </div>
                                <pre className="p-4 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
                                  <code>{pitfall.goodCode}</code>
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-sm text-neutral-200 leading-relaxed">
                          <span className="font-semibold text-emerald-400 mr-1.5">Fix:</span>
                          {pitfall.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* COMPACT INLINE VIDEO TUTORIALS STRIP */}
              <section id="chapter-videos" className="space-y-4 pt-8 border-t border-white/[0.08]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-indigo-300" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Video Tutorials
                    </h2>
                  </div>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${careerTitle} ${level.title} tutorial`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Search YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {videoResources.slice(0, 3).map((res, i) => (
                    <a
                      key={i}
                      href={res.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${careerTitle} ${level.title} ${res.title} tutorial`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-4 rounded-xl surface-interactive flex flex-col justify-between gap-2 group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-indigo-300/80">
                        <span className="flex items-center gap-1.5 truncate">
                          {res.isVerified ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Search className="w-3 h-3 text-neutral-400 shrink-0" />
                          )}
                          <span className="truncate">{res.source || 'YouTube'}</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-white shrink-0" />
                      </div>
                      <p className="text-xs font-semibold text-neutral-200 group-hover:text-white line-clamp-2 leading-snug">
                        {res.title}
                      </p>
                    </a>
                  ))}
                </div>
              </section>

              {/* GUIDED CODING ASSIGNMENTS */}
              {level.projects && (
                <section id="chapter-assignments" className="space-y-6 pt-8 border-t border-white/[0.08] pb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      Practice Assignments
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                      Apply what you just read. Each assignment includes starter code, a walkthrough, and hints if you get stuck.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {(level.projects || []).map((project, projectIdx) => {
                      const isCompleted = (completedProjectIds || []).includes(project.id);
                      const requirementsList = Array.isArray(project.requirements) ? project.requirements : [];
                      const hintsList = Array.isArray(project.hints) ? project.hints : [];
                      const unlockedHintsCount = revealedHints[project.id] || 0;
                      const isWalkthroughOpen = Boolean(openWalkthroughs[project.id]);
                      const isStarterOpen = Boolean(openStarterPreview[project.id]);

                      return (
                        <div
                          key={project.id || projectIdx}
                          className="surface-card rounded-2xl overflow-hidden"
                        >
                          <div className="p-6 space-y-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300/90 mb-1">
                                  <span>Assignment {projectIdx + 1}</span>
                                  <span>·</span>
                                  <span>{project.language || 'javascript'}</span>
                                  {isCompleted && (
                                    <>
                                      <span>·</span>
                                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                      </span>
                                    </>
                                  )}
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">{project.title}</h3>
                              </div>
                            </div>

                            <p className="text-neutral-200 text-sm leading-relaxed">{project.description}</p>

                            {/* Requirements */}
                            {requirementsList.length > 0 && (
                              <div className="surface-recessed p-4 rounded-xl space-y-2">
                                <p className="text-xs font-mono text-indigo-300/90">
                                  Requirements
                                </p>
                                <ul className="text-sm text-neutral-200 space-y-1.5">
                                  {requirementsList.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                      <span className="text-neutral-500 font-mono text-xs mt-0.5 tabular-nums">{i + 1}.</span>
                                      <span className="flex-1 text-sm leading-relaxed">{req}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Walkthrough, Starter Code, & Hints */}
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {project.walkthrough && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenWalkthroughs(prev => ({ ...prev, [project.id]: !prev[project.id] }))
                                    }
                                    className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                                    <span>{isWalkthroughOpen ? 'Hide' : 'Show'} Step-by-Step Guide</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isWalkthroughOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                )}

                                {project.starterCode && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenStarterPreview(prev => ({ ...prev, [project.id]: !prev[project.id] }))
                                    }
                                    className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                  >
                                    <Code className="w-3.5 h-3.5 text-indigo-300" />
                                    <span>{isStarterOpen ? 'Hide' : 'Preview'} Starter Code</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isStarterOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                )}

                                {hintsList.length > 0 && unlockedHintsCount < hintsList.length && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedHints(prev => ({
                                        ...prev,
                                        [project.id]: (prev[project.id] || 0) + 1
                                      }))
                                    }
                                    className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                  >
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                    <span>
                                      Hint ({unlockedHintsCount}/{hintsList.length})
                                    </span>
                                  </button>
                                )}
                              </div>

                              {isWalkthroughOpen && project.walkthrough && (
                                <div className="p-4 rounded-xl surface-recessed text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                                  {project.walkthrough}
                                </div>
                              )}

                              {isStarterOpen && project.starterCode && (
                                <div className="rounded-xl overflow-hidden surface-recessed">
                                  <div className="px-4 py-2 bg-[#090b10] border-b border-white/[0.06] flex items-center justify-between">
                                    <span className="text-xs font-mono text-neutral-400">
                                      Starter Code
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(project.starterCode!, `starter-${project.id}`)}
                                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                                    >
                                      {copiedId === `starter-${project.id}` ? (
                                        <span className="text-emerald-400">Copied</span>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" /> Copy
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-4 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                                    <code>{project.starterCode}</code>
                                  </pre>
                                </div>
                              )}

                              {unlockedHintsCount > 0 && (
                                <div className="space-y-2">
                                  {hintsList.slice(0, unlockedHintsCount).map((hint, hIdx) => (
                                    <div
                                      key={hIdx}
                                      className="p-3.5 rounded-xl surface-recessed text-xs md:text-sm text-neutral-200"
                                    >
                                      <span className="font-mono font-semibold text-amber-400 mr-1.5">
                                        Hint {hIdx + 1}:
                                      </span>
                                      <span>{hint}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {isCompleted ? (
                              <button
                                onClick={() => onStartProject(project)}
                                className="btn-secondary w-full py-2.5 font-semibold rounded-lg flex items-center justify-center gap-2 text-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Open Assignment &amp; Improve Score
                              </button>
                            ) : (
                              <button
                                onClick={() => onStartProject(project)}
                                className="btn-primary w-full py-2.5 font-semibold rounded-lg flex items-center justify-center gap-2 text-xs"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Start Assignment
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

            </article>
          )}
        </div>

      </div>
    </div>
  );
};

export default LevelDetail;
