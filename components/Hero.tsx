import React, { useState } from 'react';
import { ArrowRight, Terminal, Code2, CheckCircle2, Play, BookOpen, Layers } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onLogin?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart, onLogin }) => {
  const handleLoginClick = onLogin || onStart;
  const [previewTab, setPreviewTab] = useState<'lesson' | 'review'>('lesson');

  return (
    <div className="min-h-screen text-[#f0f2f5] flex flex-col justify-between relative">
      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#06070a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="/" className="font-bold tracking-tight text-white text-base whitespace-nowrap shrink-0">
            SimSKILLS
          </a>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-400">
            <a href="#curriculum" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Curriculum</a>
            <a href="#workspace" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Workspace</a>
            <a href="#reviews" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Code Reviews</a>
            <button onClick={handleLoginClick} className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Sign In
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onStart}
              className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-16 md:py-24 space-y-24">
        {/* 2-Column Balanced Split: Proposition Left + Tactile Interactive Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-mono text-indigo-300/90 tracking-wide">
              Interactive Software Engineering Curriculum
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Learn to engineer software by building it.
            </h1>

            <p className="text-neutral-300/90 text-base md:text-lg leading-relaxed font-normal max-w-xl">
              Structured, textbook-depth chapters from first principles to production architecture. Read clear explanations with live code outputs, solve guided assignments, and receive instant technical code reviews.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onStart}
                className="btn-primary h-11 px-6 font-semibold text-sm rounded-lg flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Start Learning Track</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleLoginClick}
                className="btn-secondary h-11 px-6 font-medium text-sm rounded-lg whitespace-nowrap shrink-0"
              >
                Resume Existing Track
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-neutral-400 font-mono">
              <span>Zero-Jargon Chapter 1</span>
              <span>·</span>
              <span>Built-In Cloud IDE</span>
              <span>·</span>
              <span>Automated Code Review</span>
            </div>
          </div>

          {/* Right Column: Tactile Elevated Workspace Preview Window */}
          <div className="lg:col-span-6">
            <div className="surface-card rounded-2xl overflow-hidden">
              {/* Window Chrome Header */}
              <div className="px-4 py-3 bg-[#090b10] border-b border-white/[0.08] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400">
                    Chapter 02 · Asynchronous State &amp; APIs
                  </span>
                </div>

                {/* Interactive Segmented Control */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#050609] border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('lesson')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      previewTab === 'lesson'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Interactive Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('review')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      previewTab === 'review'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Code Review
                  </button>
                </div>
              </div>

              {/* Window Body */}
              {previewTab === 'lesson' ? (
                <div className="p-5 md:p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-white">
                      1. Fetching &amp; Parsing JSON Responses
                    </h3>
                    <p className="text-xs text-neutral-300/90 leading-relaxed">
                      When requesting data from an external service, <code className="text-indigo-300 font-mono">await fetch(url)</code> pauses execution inside the async function until the server responds.
                    </p>
                  </div>

                  {/* Code Snippet */}
                  <div className="surface-recessed rounded-xl overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span>example.ts</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Play className="w-2.5 h-2.5" /> Executable
                      </span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                      <code>{`async function loadUserProfile(id: number) {
  const res = await fetch(\`/api/users/\${id}\`);
  const user = await res.json();
  return \`\${user.name} (\${user.role})\`;
}`}</code>
                    </pre>
                    <div className="px-4 py-2.5 bg-[#050609] border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500">Output:</span>
                      <span className="text-emerald-400">&quot;Ada Lovelace (Principal Engineer)&quot;</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-neutral-400">
                      2 guided assignments included in this chapter
                    </span>
                    <button
                      onClick={onStart}
                      className="text-xs font-semibold text-white hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Try it yourself</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 md:p-6 space-y-4">
                  <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
                    <div>
                      <span className="text-xs font-mono text-neutral-400 block">Assignment Evaluation</span>
                      <h4 className="text-sm font-semibold text-white mt-0.5">Retry-Safe API Client</h4>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-2xl font-bold text-emerald-400">94</span>
                      <span className="text-xs text-neutral-500"> / 100</span>
                    </div>
                  </div>

                  <div className="surface-recessed rounded-xl p-4 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2 text-neutral-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Properly handles HTTP 429 rate-limit responses with exponential backoff.</span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Clean TypeScript return types and error boundary propagation.</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono text-emerald-400 tabular-nums">+250 XP Awarded</span>
                    <button
                      onClick={onStart}
                      className="text-xs font-semibold text-white hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Start first assignment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asymmetric Bento Capability Grid with Tactile Top Sheen */}
        <section id="curriculum" className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Designed for real retention, not passive watching.
            </h2>
            <p className="text-sm text-neutral-400 mt-1.5">
              Every chapter combines clear prose, executable syntax breakdowns, and hands-on coding exercises in a single flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Marquee Card (col-span-2) */}
            <div
              onClick={onStart}
              className="surface-interactive md:col-span-2 p-7 rounded-2xl cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-indigo-300/90">
                  <span>01. Cumulative Curriculum</span>
                  <BookOpen className="w-4 h-4 text-neutral-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  Progressive Chapters That Build on Each Other
                </h3>
                <p className="text-sm text-neutral-300/90 leading-relaxed max-w-xl">
                  Whether you are writing your very first variable or architecting distributed backend services, each chapter references what you learned previously and shows exact code + output side by side.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-neutral-400">
                <span>Chapter 1: Core Syntax</span>
                <span>→</span>
                <span>Chapter 2: Control Flow</span>
                <span>→</span>
                <span>Chapter 3: Functions &amp; State</span>
                <span>→</span>
                <span className="text-white">Production Systems</span>
              </div>
            </div>

            {/* Secondary Card (col-span-1) */}
            <div
              id="workspace"
              onClick={onStart}
              className="surface-interactive p-7 rounded-2xl cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-indigo-300/90">
                  <span>02. Cloud IDE</span>
                  <Code2 className="w-4 h-4 text-neutral-400" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Guided In-Browser Workspace
                </h3>
                <p className="text-sm text-neutral-300/90 leading-relaxed">
                  Open any assignment with pre-loaded starter boilerplate, step-by-step walkthroughs, and progressive hints when you get stuck.
                </p>
              </div>
              <div className="text-xs font-mono text-neutral-400">
                Single-file &amp; multi-file support
              </div>
            </div>

            {/* Bottom Full-Width Card (col-span-3) */}
            <div
              id="reviews"
              onClick={onStart}
              className="surface-interactive md:col-span-3 p-7 rounded-2xl cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300/90">
                  <Layers className="w-4 h-4 text-neutral-400" />
                  <span>03. Automated Code Review &amp; Pitfall Detection</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Immediate Line-by-Line Technical Feedback
                </h3>
                <p className="text-sm text-neutral-300/90 leading-relaxed">
                  Every chapter highlights side-by-side <span className="text-white font-medium">Incorrect vs. Correct</span> code patterns before you start coding, and grades your submission on logic, edge cases, and code structure.
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className="btn-primary px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 self-start md:self-center whitespace-nowrap shrink-0"
              >
                <span>Build Your First Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.08] py-6 px-6 text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SimSKILLS Engineering Platform</span>
          <span className="font-mono text-neutral-500">Interactive CS &amp; Software Engineering</span>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
