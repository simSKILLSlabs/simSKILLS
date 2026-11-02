import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal, Play, Save, Folder, FileCode, ChevronLeft, Plus, Trash2, Code2, BookOpen, Lightbulb, Check, X } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectDraft, saveProjectDraft } from '../../services/db';
import { ProjectFile, ProjectTask } from '../../types';
import { toast } from 'sonner';
import { SEO } from '../SEO';

const DEFAULT_FILES: Record<string, ProjectFile> = {
    'index.js': { content: '// Start coding your project here...', language: 'javascript' },
    'README.md': { content: '# Project Title\n\nDescribe your project...', language: 'markdown' }
};

const IDEWorkspace: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Multi-file state
    const [files, setFiles] = useState<Record<string, ProjectFile>>(DEFAULT_FILES);
    const [activeFile, setActiveFile] = useState<string>('index.js');
    const [output, setOutput] = useState<string[]>(['> Ready to code...']);
    const [isSaving, setIsSaving] = useState(false);
    const [projectMeta, setProjectMeta] = useState<ProjectTask | null>(null);
    const [rightTab, setRightTab] = useState<'guide' | 'console'>('guide');
    const [unlockedHints, setUnlockedHints] = useState(0);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    useEffect(() => {
        let loadedMeta: ProjectTask | null = null;
        if (projectId) {
            try {
                const raw = localStorage.getItem(`simskills_project_meta_${projectId}`);
                if (raw) {
                    loadedMeta = JSON.parse(raw) as ProjectTask;
                    setProjectMeta(loadedMeta);
                } else {
                    setRightTab('console');
                }
            } catch {
                setRightTab('console');
            }
        }

        if (user.email && projectId) {
            getProjectDraft(user.email, projectId).then(draft => {
                if (draft && draft.files && Object.keys(draft.files).length > 0) {
                    setFiles(draft.files);
                    const firstFile = Object.keys(draft.files)[0];
                    if (firstFile) setActiveFile(firstFile);
                } else if (loadedMeta) {
                    const lang = (loadedMeta.language || 'javascript').toLowerCase();
                    const mainFile = lang === 'python' ? 'main.py' : lang === 'typescript' ? 'index.ts' : lang === 'html' ? 'index.html' : 'index.js';
                    const starterFiles: Record<string, ProjectFile> = {
                        [mainFile]: {
                            content: loadedMeta.starterCode || `// ${loadedMeta.title}\n// Start implementing your solution below\n`,
                            language: lang
                        },
                        'README.md': {
                            content: `# ${loadedMeta.title}\n\n${loadedMeta.description}\n\n## Requirements\n${(loadedMeta.requirements || []).map(r => `- ${r}`).join('\n')}`,
                            language: 'markdown'
                        }
                    };
                    setFiles(starterFiles);
                    setActiveFile(mainFile);
                }
            });
        }
    }, [user.email, projectId]);

    const handleCodeChange = (newContent: string | undefined) => {
        setFiles(prev => ({
            ...prev,
            [activeFile]: { ...prev[activeFile], content: newContent || '' }
        }));
    };

    const handleSave = async () => {
        if (!user.email || !projectId) return;
        setIsSaving(true);
        try {
            await saveProjectDraft(user.email, projectId, files);
            toast.success('Project saved to Cloud IDE');
        } catch (error) {
            toast.error('Failed to save project');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = () => {
        setRightTab('console');
        setOutput(prev => [...prev, `> Running ${activeFile}...`]);
        try {
            const currentCode = files[activeFile]?.content || '';
            const logs: string[] = [];
            const logRegex = /(?:console\.log|print)\(([^)]+)\)/g;
            let match: RegExpExecArray | null;
            while ((match = logRegex.exec(currentCode)) !== null) {
                logs.push(match[1].replace(/["'`]/g, ''));
            }

            if (logs.length > 0) {
                setOutput(prev => [...prev, ...logs]);
            } else {
                setOutput(prev => [...prev, 'Code executed (No stdout output)']);
            }
            setOutput(prev => [...prev, '> Done.']);
        } catch (e: any) {
            setOutput(prev => [...prev, `Error: ${e.message}`]);
        }
    };

    const handleConfirmNewFile = () => {
        const name = newFileName.trim();
        if (!name) return;
        if (files[name]) {
            toast.error("File already exists");
            return;
        }
        const ext = name.split('.').pop()?.toLowerCase();
        const lang =
            ext === 'js' ? 'javascript' :
            ext === 'ts' ? 'typescript' :
            ext === 'py' ? 'python' :
            ext === 'css' ? 'css' :
            ext === 'html' ? 'html' : 'markdown';
        setFiles(prev => ({ ...prev, [name]: { content: '', language: lang } }));
        setActiveFile(name);
        setNewFileName('');
        setIsCreatingFile(false);
    };

    const deleteFile = (fileName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (Object.keys(files).length <= 1) {
            toast.error("Cannot delete the last file");
            return;
        }
        setFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[fileName];
            return newFiles;
        });
        if (activeFile === fileName) {
            setActiveFile(Object.keys(files).find(f => f !== fileName) || '');
        }
        toast.info(`Deleted ${fileName}`);
    };

    const hintsList = Array.isArray(projectMeta?.hints) ? projectMeta!.hints! : [];
    const requirementsList = Array.isArray(projectMeta?.requirements) ? projectMeta!.requirements : [];

    return (
        <div className="flex h-screen bg-[#050505] text-gray-300 overflow-hidden font-sans">
            <SEO title={`IDE - ${projectMeta?.title || projectId || 'Project'}`} description="SimSkills Cloud IDE" />
            {/* Sidebar / File Explorer */}
            <div className="w-64 border-r border-gray-800 flex flex-col bg-[#0a0a0a]">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-white">
                        <Folder size={18} className="text-emerald-500" />
                        <span>Project Files</span>
                    </div>
                    <button
                        onClick={() => setIsCreatingFile(true)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="New File"
                    >
                        <Plus size={16} className="text-emerald-500" />
                    </button>
                </div>

                {isCreatingFile && (
                    <div className="p-2 border-b border-gray-800 bg-gray-900/60 flex items-center gap-1.5">
                        <input
                            type="text"
                            value={newFileName}
                            onChange={e => setNewFileName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleConfirmNewFile()}
                            placeholder="utils.js"
                            autoFocus
                            className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                        <button onClick={handleConfirmNewFile} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded">
                            <Check size={14} />
                        </button>
                        <button onClick={() => { setIsCreatingFile(false); setNewFileName(''); }} className="p-1 text-gray-400 hover:bg-gray-800 rounded">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex-1 p-2 overflow-y-auto space-y-1">
                    {Object.keys(files).map(fileName => (
                        <div
                            key={fileName}
                            onClick={() => setActiveFile(fileName)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-colors ${activeFile === fileName ? 'bg-white/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <FileCode size={16} />
                                <span className="text-sm truncate">{fileName}</span>
                            </div>
                            {activeFile === fileName && Object.keys(files).length > 1 && (
                                <button onClick={(e) => deleteFile(fileName, e)} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={16} /> Back to Assignment
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4 min-w-0">
                        <h1 className="font-semibold text-white flex items-center gap-2 truncate">
                            <Code2 className="text-emerald-500 shrink-0" size={20} />
                            <span className="truncate">{projectMeta?.title || `Project: ${projectId}`}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 flex items-center gap-1.5 transition-colors"
                            title="Save Draft to Cloud IDE"
                        >
                            <Save size={15} className="text-emerald-400" />
                            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                        </button>
                        <button
                            onClick={handleRun}
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-colors"
                        >
                            <Play size={15} /> Run Code
                        </button>
                    </div>
                </div>

                {/* Split View: Editor & Guide/Terminal */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <div className="flex-1 relative border-r border-gray-800">
                        <CodeEditor
                            value={files[activeFile]?.content || ''}
                            onChange={handleCodeChange}
                            height="100%"
                            language={files[activeFile]?.language || 'javascript'}
                        />
                    </div>

                    {/* Right Context Panel: Assignment Guide & Console */}
                    <div className="h-72 lg:h-auto lg:w-96 bg-[#0b0b0e] flex flex-col border-t lg:border-t-0">
                        <div className="flex items-center justify-between px-3 py-2 bg-[#111115] border-b border-gray-800">
                            <div className="flex items-center gap-1">
                                {projectMeta && (
                                    <button
                                        onClick={() => setRightTab('guide')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                                            rightTab === 'guide' ? 'bg-emerald-500/15 text-emerald-400' : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <BookOpen size={13} />
                                        <span>Assignment Guide</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setRightTab('console')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                                        rightTab === 'console' ? 'bg-emerald-500/15 text-emerald-400' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Terminal size={13} />
                                    <span>Console</span>
                                </button>
                            </div>
                            {rightTab === 'console' && (
                                <button onClick={() => setOutput([])} className="text-xs text-gray-500 hover:text-gray-300 px-2">
                                    Clear
                                </button>
                            )}
                        </div>

                        {rightTab === 'guide' && projectMeta ? (
                            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">{projectMeta.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{projectMeta.description}</p>
                                </div>

                                {requirementsList.length > 0 && (
                                    <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                                        <p className="font-semibold text-emerald-400">Requirements Checklist</p>
                                        <ul className="space-y-1.5 text-gray-300">
                                            {requirementsList.map((req, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="font-mono text-emerald-400">0{idx + 1}.</span>
                                                    <span className="leading-relaxed">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {projectMeta.walkthrough && (
                                    <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
                                        <p className="font-semibold text-indigo-300">Implementation Walkthrough</p>
                                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{projectMeta.walkthrough}</p>
                                    </div>
                                )}

                                {hintsList.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                                                <Lightbulb size={13} />
                                                Progressive Hints ({unlockedHints}/{hintsList.length})
                                            </span>
                                            {unlockedHints < hintsList.length && (
                                                <button
                                                    onClick={() => setUnlockedHints(prev => prev + 1)}
                                                    className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-950/60 transition-colors"
                                                >
                                                    Unlock Next Hint
                                                </button>
                                            )}
                                        </div>
                                        {hintsList.slice(0, unlockedHints).map((hint, idx) => (
                                            <div key={idx} className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/25 text-amber-100 leading-relaxed">
                                                <span className="font-bold text-amber-400 mr-1">Hint {idx + 1}:</span>
                                                {hint}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1">
                                {output.map((line, i) => (
                                    <div key={i} className={`${line.startsWith('>') ? 'text-gray-400' : line.startsWith('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {line}
                                    </div>
                                ))}
                                <div className="animate-pulse text-emerald-500">_</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDEWorkspace;

