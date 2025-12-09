import React, { useState, useEffect } from 'react';
import { ProjectTask, GradingResult, Level } from '../types';
import { gradeProject } from '../services/geminiService';
import { X, Send, Loader2, Save, ExternalLink, Github, Code, FileCode } from 'lucide-react';
import GradingReport from './GradingReport';
import CodeEditor from './ide/CodeEditor';
import { useAuth } from '../contexts/AuthContext';
import { saveProjectDraft, getProjectDraft } from '../services/db';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProjectGraderProps {
  project: ProjectTask;
  level: Level;
  onClose: () => void;
  onComplete?: (xp: number, result: GradingResult) => void;
}

type SubmissionMethod = 'paste' | 'github' | 'ide';

const ProjectGrader: React.FC<ProjectGraderProps> = ({ project, level, onClose, onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState<SubmissionMethod>('paste');
  const [submission, setSubmission] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [ideFilesCount, setIdeFilesCount] = useState(0);

  // Check IDE draft status on mount
  useEffect(() => {
    if (user.email && project.id) {
      getProjectDraft(user.email, project.id).then(draft => {
        if (draft && draft.files) {
          setIdeFilesCount(Object.keys(draft.files).length);
          // If there are files, default to ide? Maybe not, let user choose.
        }
      });
    }
  }, [user.email, project.id]);


  const handleSaveDraft = async () => {
    if (user.email && project.id && method === 'paste') {
      // We only save "paste" drafts as a single file named 'index.js' in the new structure
      // purely to keep backward compatibility or just for this specific text box.
      // Actually, let's keep the IDE draft separate from this simple paste text.
      // For MVP, "Save Draft" in 'Paste' mode could just save to local storage or a simplistic draft.
      // Let's repurpose: "Save to IDE" which pushes this code to index.js in the IDE.

      await saveProjectDraft(user.email, project.id, {
        'index.js': { content: submission, language: 'javascript' }
      });
      setIdeFilesCount(1);
      toast.success("Saved to Cloud IDE");
    }
  };

  const handleOpenIDE = () => {
    navigate(`/ide/${project.id}`);
  };

  const handleSubmit = async () => {
    setIsGrading(true);
    try {
      let finalSubmission = "";

      if (method === 'paste') {
        if (!submission.trim()) { toast.error("Please enter code."); setIsGrading(false); return; }
        finalSubmission = `[PASTED CODE]\n${submission}`;
      } else if (method === 'github') {
        if (!githubUrl.trim()) { toast.error("Please enter a GitHub URL."); setIsGrading(false); return; }
        finalSubmission = `[GITHUB REPO]\nURL: ${githubUrl}\n(Please analyze this repository context if possible, or grade based on the structure implied)`;
      } else if (method === 'ide') {
        if (!user.email) return;
        const draft = await getProjectDraft(user.email, project.id);
        if (!draft || !draft.files || Object.keys(draft.files).length === 0) {
          toast.error("No files found in Cloud IDE.");
          setIsGrading(false);
          return;
        }
        finalSubmission = `[CLOUD IDE PROJECT]\n`;
        Object.entries(draft.files).forEach(([name, file]) => {
          finalSubmission += `\n--- FILE: ${name} ---\n${file.content}\n`;
        });
      }

      const grading = await gradeProject(project, finalSubmission, level.difficulty);
      setResult(grading);
    } catch (error) {
      toast.error("Grading failed. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleFinish = () => {
    if (result && onComplete) {
      onComplete(result.xpAwarded, result);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-500">#</span> {project.title}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Submission & Grading System</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {!result ? (
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Submission Tabs */}
              <div className="flex p-1 bg-gray-900/50 rounded-xl border border-gray-800">
                <button
                  onClick={() => setMethod('paste')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${method === 'paste' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Code size={16} /> Paste Code
                </button>
                <button
                  onClick={() => setMethod('github')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${method === 'github' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Github size={16} /> GitHub Repo
                </button>
                <button
                  onClick={() => setMethod('ide')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${method === 'ide' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <FileCode size={16} /> Cloud IDE {ideFilesCount > 0 && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full">{ideFilesCount} files</span>}
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {method === 'paste' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg mb-4">
                      <p className="text-gray-400 text-sm">Paste your solution directly below. Good for quick snippets or single-file scripts.</p>
                    </div>
                    <CodeEditor
                      value={submission}
                      onChange={(val) => setSubmission(val || '')}
                      height="400px"
                      language="javascript"
                    />
                  </div>
                )}

                {method === 'github' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-800 rounded-xl bg-gray-900/10">
                    <Github size={48} className="text-gray-700 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Submit Repository</h3>
                    <p className="text-gray-500 text-center max-w-md mb-6">Paste the URL to your public GitHub repository. We will analyze the README and structure.</p>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project-repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full max-w-lg bg-black border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {method === 'ide' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 border border-emerald-900/30 bg-emerald-900/5 rounded-xl p-8 text-center">
                    <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Code size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">SimSkill Cloud IDE</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                      Use our built-in multi-file editor to build your project.
                      {ideFilesCount > 0 ? ` You currently have ${ideFilesCount} files saved.` : " You haven't started this project yet."}
                    </p>

                    <button
                      onClick={handleOpenIDE}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto transition-all shadow-lg hover:shadow-emerald-500/20"
                    >
                      <ExternalLink size={18} /> {ideFilesCount > 0 ? "Continue Coding" : "Open Workspace"}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                {method === 'paste' && (
                  <button
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 flex items-center gap-2 transition-all"
                  >
                    <Save size={18} /> Save to IDE
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isGrading}
                  className="px-8 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {isGrading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isGrading ? 'Grading...' : 'Submit Project'}
                </button>
              </div>
            </div>
          ) : (
            <GradingReport
              result={result}
              actionButton={
                <button
                  onClick={handleFinish}
                  className="w-full mt-4 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg"
                >
                  Collect XP & Close
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectGrader;
