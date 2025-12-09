import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal, Play, Save, Folder, FileCode, ChevronLeft, Settings, Plus, Trash2, Code2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectDraft, saveProjectDraft } from '../../services/db';
import { ProjectFile } from '../../types';
import { toast } from 'sonner';
import { SEO } from '../SEO';

const DEFAULT_FILES: Record<string, ProjectFile> = {
    'index.js': { content: '// Start coding your project here...', language: 'javascript' },
    'readme.md': { content: '# Project Title\n\nDescribe your project...', language: 'markdown' }
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

    useEffect(() => {
        if (user.email && projectId) {
            getProjectDraft(user.email, projectId).then(draft => {
                if (draft && draft.files) {
                    setFiles(draft.files);
                    const firstFile = Object.keys(draft.files)[0];
                    if (firstFile) setActiveFile(firstFile);
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
            toast.success('Project saved successfully');
        } catch (error) {
            toast.error('Failed to save project');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = () => {
        setOutput(prev => [...prev, `> Running ${activeFile}...`]);
        try {
            const currentCode = files[activeFile]?.content || '';
            // Simple mock execution
            if (currentCode.includes('console.log')) {
                const logMatch = currentCode.match(/console\.log\((.*)\)/);
                if (logMatch) {
                    setOutput(prev => [...prev, `${logMatch[1].replace(/["']/g, '')}`]);
                }
            } else {
                setOutput(prev => [...prev, 'Code executed (No output)']);
            }
            setOutput(prev => [...prev, '> Done.']);
        } catch (e: any) {
            setOutput(prev => [...prev, `Error: ${e.message}`]);
        }
    };

    const createFile = () => {
        const name = prompt("Enter file name (e.g., utils.js):");
        if (name && !files[name]) {
            const ext = name.split('.').pop();
            const lang = ext === 'js' ? 'javascript' : ext === 'css' ? 'css' : ext === 'html' ? 'html' : 'markdown';
            setFiles(prev => ({ ...prev, [name]: { content: '', language: lang } }));
            setActiveFile(name);
        }
    };

    const deleteFile = (fileName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (Object.keys(files).length <= 1) {
            toast.error("Cannot delete the last file");
            return;
        }
        if (confirm(`Delete ${fileName}?`)) {
            setFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[fileName];
                return newFiles;
            });
            if (activeFile === fileName) {
                setActiveFile(Object.keys(files).find(f => f !== fileName) || '');
            }
        }
    };

    return (
        <div className="flex h-screen bg-[#050505] text-gray-300 overflow-hidden font-sans">
            <SEO title={`IDE - ${projectId || 'Project'}`} description="SimSkills Cloud IDE" />
            {/* Sidebar / File Explorer */}
            <div className="w-64 border-r border-gray-800 flex flex-col bg-[#0a0a0a]">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-white">
                        <Folder size={18} className="text-emerald-500" />
                        <span>Project Files</span>
                    </div>
                    <button onClick={createFile} className="p-1 hover:bg-white/10 rounded transition-colors" title="New File">
                        <Plus size={16} className="text-emerald-500" />
                    </button>
                </div>
                <div className="flex-1 p-2 overflow-y-auto">
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
                            {activeFile === fileName && (
                                <button onClick={(e) => deleteFile(fileName, e)} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4">
                        <h1 className="font-semibold text-white flex items-center gap-2">
                            <Code2 className="text-emerald-500" size={20} />
                            Project: {projectId}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 mr-2 flex items-center gap-2">
                            {isSaving ? <span className="text-emerald-500 animate-pulse">Saving...</span> : <span>Autosave: Off</span>}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-2 hover:bg-white/10 rounded-lg text-emerald-500 transition-colors"
                            title="Save (Ctrl+S)"
                        >
                            <Save size={20} />
                        </button>
                        <button
                            onClick={handleRun}
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                        >
                            <Play size={16} /> Run
                        </button>
                    </div>
                </div>

                {/* Split View: Editor & Terminal */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <div className="flex-1 relative border-r border-gray-800">
                        <CodeEditor
                            value={files[activeFile]?.content || ''}
                            onChange={handleCodeChange}
                            height="100%"
                            language={files[activeFile]?.language || 'javascript'}
                        />
                    </div>

                    {/* Terminal */}
                    <div className="h-64 lg:h-auto lg:w-96 bg-[#0c0c0c] flex flex-col border-t lg:border-t-0">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-gray-800">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Terminal size={14} /> <span>Console</span>
                            </div>
                            <button onClick={() => setOutput([])} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
                        </div>
                        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1">
                            {output.map((line, i) => (
                                <div key={i} className={`${line.startsWith('>') ? 'text-gray-400' : line.startsWith('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {line}
                                </div>
                            ))}
                            <div className="animate-pulse text-emerald-500">_</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDEWorkspace;
