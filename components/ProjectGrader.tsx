import React, { useState, useEffect, useCallback } from 'react';
import { ProjectTask, GradingResult, Level, ProjectFile, TestExecutionResult } from '../types';
import { gradeProject } from '../services/geminiService';
import { executeCodeAndTests, ensureProjectTestCases } from '../services/codeRunner';
import {
  X,
  Send,
  Loader2,
  Save,
  ExternalLink,
  Github,
  Code as CodeIcon,
  FilePlus,
  Trash2,
  FolderOpen,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Terminal as TerminalIcon,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import GradingReport from './GradingReport';
import CodeEditor from './ide/CodeEditor';
import { useAuth } from '../contexts/AuthContext';
import { saveProjectDraft, getProjectDraft } from '../services/db';
import { toast } from 'sonner';

interface ProjectGraderProps {
  project: ProjectTask;
  level: Level;
  careerTitle?: string;
  onClose: () => void;
  onComplete: (xp: number, result?: GradingResult) => void;
}

const ProjectGrader: React.FC<ProjectGraderProps> = ({
  project,
  level,
  careerTitle = 'Software Engineering',
  onClose,
  onComplete
}) => {
  const { user } = useAuth();

  const [files, setFiles] = useState<Record<string, ProjectFile>>({
    'main.js': { content: '// Loading workspace...', language: 'javascript' }
  });
  const [activeFile, setActiveFile] = useState<string>('main.js');
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  const [isGrading, setIsGrading] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResult, setTestResult] = useState<TestExecutionResult | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTerminalTab, setActiveTerminalTab] = useState<'tests' | 'console'>('tests');

  const [result, setResult] = useState<GradingResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Adaptive Support System: Track failed attempts & progressive help
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [unlockedHints, setUnlockedHints] = useState<number>(0);
  const [showSolutionWalkthrough, setShowSolutionWalkthrough] = useState<boolean>(false);

  const testCases = ensureProjectTestCases(project);

  const getDefaultFileInfo = (lang?: string, title?: string) => {
    const t = (lang || title || '').toLowerCase();
    if (t.includes('python')) return { name: 'main.py', lang: 'python' };
    if (t.includes('html') || t.includes('web')) return { name: 'index.html', lang: 'html' };
    if (t.includes('react') || t.includes('typescript') || t.includes('ts')) return { name: 'App.tsx', lang: 'typescript' };
    if (t.includes('css')) return { name: 'styles.css', lang: 'css' };
    if (t.includes('java') && !t.includes('script')) return { name: 'Main.java', lang: 'java' };
    if (t.includes('c++') || t.includes('cpp')) return { name: 'main.cpp', lang: 'cpp' };
    if (t.includes('sql')) return { name: 'query.sql', lang: 'sql' };
    return { name: 'index.js', lang: 'javascript' };
  };

  useEffect(() => {
    const loadDraft = async () => {
      const def = getDefaultFileInfo(project.language, project.title);
      const starterContent =
        project.starterCode ||
        `// Project: ${project.title}\n// Complete the requirements on the left and press Run & Test!\n\n`;

      if (user.email) {
        const draft = await getProjectDraft(user.email, project.id);
        if (draft && draft.files && Object.keys(draft.files).length > 0) {
          setFiles(draft.files);
          setActiveFile(Object.keys(draft.files)[0]);
          setLastSaved(new Date(draft.lastModified).toLocaleTimeString());
          return;
        }
      }

      const initialFiles: Record<string, ProjectFile> = {
        [def.name]: {
          content: starterContent,
          language: def.lang
        }
      };
      setFiles(initialFiles);
      setActiveFile(def.name);
    };
    loadDraft();
  }, [project.id, user.email]);

  const handleSaveDraft = async () => {
    if (!user.email) return;
    setIsSaving(true);
    try {
      await saveProjectDraft(user.email, project.id, files);
      setLastSaved(new Date().toLocaleTimeString());
      toast.success('Workspace saved');
    } catch (e) {
      toast.error('Failed to save workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCodeChange = (newContent: string) => {
    setFiles(prev => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        content: newContent
      }
    }));
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let name = newFileName.trim();
    if (!name.includes('.')) name += '.js';

    if (files[name]) {
      toast.error('File already exists');
      return;
    }

    const ext = name.split('.').pop()?.toLowerCase();
    let lang = 'javascript';
    if (ext === 'py') lang = 'python';
    if (ext === 'html') lang = 'html';
    if (ext === 'css') lang = 'css';
    if (ext === 'ts' || ext === 'tsx') lang = 'typescript';
    if (ext === 'json') lang = 'json';
    if (ext === 'sql') lang = 'sql';

    setFiles(prev => ({
      ...prev,
      [name]: { content: `// ${name}\n`, language: lang }
    }));
    setActiveFile(name);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const handleDeleteFile = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) {
      toast.error('Cannot delete the only file in workspace');
      return;
    }
    if (confirm(`Delete ${fileName}?`)) {
      const newFiles = { ...files };
      delete newFiles[fileName];
      setFiles(newFiles);
      if (activeFile === fileName) {
        setActiveFile(Object.keys(newFiles)[0]);
      }
    }
  };

  const handleRunTests = useCallback(async () => {
    setIsRunningTests(true);
    setIsTerminalOpen(true);
    try {
      const execRes = await executeCodeAndTests(project, files);
      setTestResult(execRes);
      if (execRes.passed) {
        toast.success(`All ${execRes.totalCount}/${execRes.totalCount} unit tests passed (${execRes.executionTimeMs}ms)`);
      } else {
        toast.error(`${execRes.passCount}/${execRes.totalCount} tests passed — inspect the test suite below.`);
      }
      return execRes;
    } catch (err) {
      toast.error('Test runner encountered an error');
      return null;
    } finally {
      setIsRunningTests(false);
    }
  }, [project, files]);

  // Keyboard shortcut Cmd/Ctrl + Enter to Run & Test
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !result) {
        e.preventDefault();
        handleRunTests();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRunTests, result]);

  const handleSubmit = async () => {
    const hasContent = Object.values(files).some(
      (f: ProjectFile) => f.content.trim().length > 10
    );
    if (!hasContent) return;

    setIsGrading(true);
    try {
      await handleSaveDraft();

      // Run deterministic test suite first so Staff AI Reviewer sees real test telemetry
      const latestTests = testResult || (await executeCodeAndTests(project, files));
      if (latestTests) {
        setTestResult(latestTests);
      }

      const testSummaryString = latestTests
        ? `Passed ${latestTests.passCount} of ${latestTests.totalCount} unit tests (${latestTests.executionTimeMs}ms). Details: ${latestTests.results
            .map(r => `[${r.passed ? 'PASS' : 'FAIL'}] ${r.name} -> Actual: ${r.actualOutput}`)
            .join('; ')}`
        : undefined;

      const fullSubmission = Object.entries(files)
        .map(([name, file]: [string, ProjectFile]) => `--- START OF FILE ${name} ---\n${file.content}\n--- END OF FILE ${name} ---`)
        .join('\n\n');

      const gradingResult = await gradeProject(
        project,
        fullSubmission,
        level.difficulty,
        testSummaryString
      );

      const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      const enrichedResult: GradingResult = {
        ...gradingResult,
        submittedFiles: { ...files },
        careerTitle,
        testPassCount: latestTests?.passCount ?? testCases.length,
        testTotalCount: latestTests?.totalCount ?? testCases.length,
        verificationHash: `SIM-${randomHex}-2026`
      };

      setResult(enrichedResult);

      if (enrichedResult.score < 70) {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        const totalHints = project.hints?.length || 0;
        if (totalHints > 0) {
          setUnlockedHints(prev => Math.min(totalHints, Math.max(prev, nextFails)));
        }
        if (nextFails >= 3) {
          setShowSolutionWalkthrough(true);
        }
      }
    } catch (error) {
      toast.error('Failed to grade submission. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const handleOpenStackBlitz = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://stackblitz.com/run';
    form.target = '_blank';

    const addInput = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addInput('project[title]', project.title);
    addInput('project[description]', project.description);
    addInput('project[template]', 'javascript');

    Object.entries(files).forEach(([name, file]: [string, ProjectFile]) => {
      addInput(`project[files][${name}]`, file.content);
    });

    if (!files['index.html']) {
      addInput('project[files][index.html]', `<div id="app"></div>`);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handlePushToGitHub = () => {
    const mainContent = files[activeFile]?.content || '';
    navigator.clipboard.writeText(mainContent);
    toast.info('Active file copied to clipboard. Opening GitHub Gist...');
    setTimeout(() => {
      window.open('https://gist.github.com/', '_blank');
    }, 1000);
  };

  const hintsList = Array.isArray(project.hints) ? project.hints : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 animate-fade-in">
      <div className="surface-card rounded-xl w-full max-w-[96vw] h-[94vh] flex flex-col overflow-hidden">
        {/* Top IDE Header Bar */}
        <div className="px-5 py-3 border-b border-white/[0.07] flex items-center justify-between bg-[#090b10] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              Assignment IDE
            </span>
            <span className="text-white/15">/</span>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              {project.title}
            </h2>
            {lastSaved && (
              <span className="text-xs font-mono text-slate-500 hidden md:inline">
                Saved {lastSaved}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!result && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  title="Save Progress"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Save</span>
                </button>

                <button
                  onClick={handleRunTests}
                  disabled={isRunningTests || isGrading}
                  className="btn-secondary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border-emerald-500/30 text-emerald-300 hover:text-white"
                  title="Execute Code & Run Automated Unit Tests (Cmd/Ctrl + Enter)"
                >
                  {isRunningTests ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  )}
                  <span>Run & Test</span>
                  <span className="hidden lg:inline text-[10px] font-mono text-slate-400 ml-1">⌘↵</span>
                </button>

                <button
                  onClick={handleOpenStackBlitz}
                  className="btn-secondary hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>StackBlitz</span>
                </button>
                <button
                  onClick={handlePushToGitHub}
                  className="btn-secondary hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Gist</span>
                </button>
                <div className="h-4 w-[1px] bg-white/[0.08] mx-1 hidden sm:block" />
              </>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Workspace Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {!result ? (
            <>
              {/* Left Sidebar: Spec, Unit Test Cases, Hints, Walkthrough & File Explorer */}
              <div className="w-full lg:w-[360px] xl:w-[400px] bg-[#080a0f] border-b lg:border-b-0 lg:border-r border-white/[0.07] flex flex-col h-1/3 lg:h-full shrink-0">
                <div className="p-5 overflow-y-auto flex-1 border-b border-white/[0.07] space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Specification
                      </h3>
                      <span className="text-xs font-mono text-indigo-400 uppercase">
                        {project.language || 'code'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Checklist Requirements */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      Requirements
                    </h4>
                    <ul className="space-y-2">
                      {(project.requirements || []).map((req, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span className="text-slate-500 font-mono text-[11px] mt-0.5">{i + 1}.</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Automated Unit Test Suite Specs */}
                  <div className="pt-2 border-t border-white/[0.07]">
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <TerminalIcon className="w-3.5 h-3.5" />
                        Unit Test Suite ({testCases.length})
                      </h4>
                      {testResult && (
                        <span
                          className={`text-[11px] font-mono tabular-nums ${
                            testResult.passed ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {testResult.passCount}/{testResult.totalCount} Passed
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {testCases.map((tc, i) => {
                        const runStatus = testResult?.results.find(r => r.id === tc.id);
                        return (
                          <div
                            key={tc.id || i}
                            className="surface-recessed rounded-lg p-3 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-slate-200">{tc.name}</span>
                              {runStatus ? (
                                runStatus.passed ? (
                                  <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                                    ● PASS
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-rose-400 shrink-0">
                                    ✕ FAIL
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                  PENDING
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 truncate">
                              In: {tc.inputDescription}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Adaptive Hints */}
                  {hintsList.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.07]">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Hints ({unlockedHints}/{hintsList.length})
                        </h4>
                        {unlockedHints < hintsList.length && (
                          <button
                            onClick={() => setUnlockedHints(prev => Math.min(hintsList.length, prev + 1))}
                            className="text-xs font-mono text-slate-400 hover:text-white transition-colors underline"
                          >
                            Reveal Next
                          </button>
                        )}
                      </div>

                      {unlockedHints === 0 ? (
                        <p className="text-xs text-slate-500">
                          Stuck? Click &ldquo;Reveal Next&rdquo; for a progressive nudge.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {hintsList.slice(0, unlockedHints).map((hint, idx) => (
                            <div
                              key={idx}
                              className="p-3 surface-recessed rounded-lg text-xs text-slate-300 leading-relaxed"
                            >
                              <span className="font-mono text-amber-400 uppercase mr-1.5">
                                Hint {idx + 1}:
                              </span>
                              {hint}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Solution Walkthrough */}
                  {project.walkthrough && (
                    <div className="pt-2 border-t border-white/[0.07]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Solution Guide
                        </h4>
                        {!showSolutionWalkthrough && (
                          <button
                            onClick={() => setShowSolutionWalkthrough(true)}
                            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors underline"
                          >
                            <Lock className="w-3 h-3" />
                            Unlock
                          </button>
                        )}
                      </div>

                      {showSolutionWalkthrough ? (
                        <div className="p-3.5 surface-recessed rounded-lg text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {project.walkthrough}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Unlocks automatically after 3 attempts, or click Unlock above.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* File Explorer */}
                <div className="p-4 flex flex-col h-40 shrink-0 bg-[#06070a]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5" /> Files
                    </span>
                    <button
                      onClick={() => setIsCreatingFile(true)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/[0.06] transition-colors"
                      title="New File"
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isCreatingFile && (
                    <form onSubmit={handleCreateFile} className="mb-2 flex gap-1.5">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        placeholder="filename.js"
                        className="w-full surface-recessed rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="btn-primary text-xs px-2.5 rounded font-semibold"
                      >
                        Add
                      </button>
                    </form>
                  )}

                  <div className="space-y-1 overflow-y-auto flex-1">
                    {Object.keys(files).map(fileName => (
                      <div
                        key={fileName}
                        onClick={() => setActiveFile(fileName)}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer group transition-colors ${
                          activeFile === fileName
                            ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CodeIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{fileName}</span>
                        </div>
                        {Object.keys(files).length > 1 && (
                          <button
                            onClick={e => handleDeleteFile(fileName, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Monaco Editor + Collapsible Live Terminal & Test Suite Drawer */}
              <div className="flex-1 flex flex-col h-2/3 lg:h-full bg-[#06070a] overflow-hidden">
                {/* Editor File Tab Bar */}
                <div className="flex items-center bg-[#090b10] border-b border-white/[0.07] px-3 h-9 shrink-0 overflow-x-auto">
                  {Object.keys(files).map(fileName => (
                    <button
                      key={fileName}
                      onClick={() => setActiveFile(fileName)}
                      className={`px-3 h-full flex items-center gap-2 text-xs font-mono border-r border-white/[0.06] transition-colors ${
                        activeFile === fileName
                          ? 'bg-[#06070a] text-white border-t-2 border-t-indigo-400'
                          : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                      }`}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>

                {/* Code Editor Area */}
                <div className="flex-1 relative min-h-[220px]">
                  <CodeEditor
                    value={files[activeFile]?.content || ''}
                    onChange={val => handleCodeChange(val || '')}
                    language={files[activeFile]?.language || 'javascript'}
                    height="100%"
                  />
                </div>

                {/* Collapsible Terminal & Unit Test Suite Drawer */}
                <div
                  className={`border-t border-white/[0.08] bg-[#050608] flex flex-col transition-all ${
                    isTerminalOpen ? 'h-56 md:h-64' : 'h-9'
                  } shrink-0`}
                >
                  {/* Drawer Header Bar */}
                  <div className="h-9 px-4 border-b border-white/[0.06] bg-[#090b10] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4 h-full">
                      <button
                        onClick={() => {
                          setActiveTerminalTab('tests');
                          setIsTerminalOpen(true);
                        }}
                        className={`h-full flex items-center gap-2 text-xs font-mono border-b-2 transition-colors ${
                          activeTerminalTab === 'tests' && isTerminalOpen
                            ? 'border-indigo-400 text-white'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Unit Test Suite</span>
                        {testResult && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums ${
                              testResult.passed
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {testResult.passCount}/{testResult.totalCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTerminalTab('console');
                          setIsTerminalOpen(true);
                        }}
                        className={`h-full flex items-center gap-2 text-xs font-mono border-b-2 transition-colors ${
                          activeTerminalTab === 'console' && isTerminalOpen
                            ? 'border-indigo-400 text-white'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>Console Output</span>
                        {testResult && (
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            ({testResult.stdout.length + testResult.stderr.length})
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {testResult && (
                        <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                          Executed in {testResult.executionTimeMs}ms
                        </span>
                      )}
                      <button
                        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                        className="text-slate-400 hover:text-white p-1 rounded"
                        title={isTerminalOpen ? 'Collapse Drawer' : 'Expand Drawer'}
                      >
                        {isTerminalOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Drawer Body */}
                  {isTerminalOpen && (
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                      {isRunningTests ? (
                        <div className="h-full flex items-center justify-center gap-2 text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          <span>Running code sandbox and unit test assertions...</span>
                        </div>
                      ) : !testResult ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-500">
                          <p>
                            Click <span className="text-emerald-400 font-semibold">Run & Test (⌘ + Enter)</span> to execute your code and verify all {testCases.length} unit tests before submitting.
                          </p>
                        </div>
                      ) : activeTerminalTab === 'tests' ? (
                        <div className="space-y-2.5">
                          {testResult.results.map(r => (
                            <div
                              key={r.id}
                              className={`p-3 rounded-lg border ${
                                r.passed
                                  ? 'bg-emerald-950/15 border-emerald-500/25'
                                  : 'bg-rose-950/15 border-rose-500/25'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {r.passed ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                  )}
                                  <span className="font-semibold text-white">{r.name}</span>
                                </div>
                                <span
                                  className={`text-[11px] font-semibold uppercase ${
                                    r.passed ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {r.passed ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                                <div className="bg-black/40 px-2.5 py-1.5 rounded border border-white/[0.05] truncate">
                                  <span className="text-slate-500">Expected: </span>
                                  <span className="text-emerald-300">{r.expectedOutput}</span>
                                </div>
                                <div className="bg-black/40 px-2.5 py-1.5 rounded border border-white/[0.05] truncate">
                                  <span className="text-slate-500">Actual: </span>
                                  <span className={r.passed ? 'text-emerald-300' : 'text-rose-300'}>
                                    {r.actualOutput}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {testResult.stdout.length === 0 && testResult.stderr.length === 0 ? (
                            <div className="text-slate-500">
                              Program finished with exit code 0 (no console.log output).
                            </div>
                          ) : (
                            <>
                              {testResult.stdout.map((line, i) => (
                                <div key={`out-${i}`} className="text-slate-200 whitespace-pre-wrap">
                                  <span className="text-slate-600 select-none mr-2">&gt;</span>
                                  {line}
                                </div>
                              ))}
                              {testResult.stderr.map((line, i) => (
                                <div key={`err-${i}`} className="text-rose-400 whitespace-pre-wrap">
                                  <span className="text-rose-500 select-none mr-2">✕</span>
                                  {line}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3.5 border-t border-white/[0.07] bg-[#090b10] flex justify-between items-center shrink-0">
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                    <span>
                      Editing <span className="text-white">{activeFile}</span>
                    </span>
                    {failedAttempts > 0 && (
                      <span className="text-amber-400">
                        · Attempt {failedAttempts + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleRunTests}
                      disabled={isRunningTests || isGrading}
                      className="btn-secondary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
                    >
                      {isRunningTests ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      )}
                      <span>Run Code & Tests</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isGrading}
                      className="btn-primary px-5 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGrading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Reviewing Code...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Staff Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#06070a]">
              <GradingReport
                result={result}
                projectTitle={project.title}
                careerTitle={careerTitle}
                onRetry={() => setResult(null)}
                onContinue={() => onComplete(result.xpAwarded, result)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectGrader;
