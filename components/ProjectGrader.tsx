import React, { useState } from 'react';
import { ProjectTask, GradingResult, Level } from '../types';
import { gradeProject } from '../services/geminiService';
import { X, Send, Loader2 } from 'lucide-react';
import GradingReport from './GradingReport';

interface ProjectGraderProps {
  project: ProjectTask;
  level: Level;
  onClose: () => void;
  onComplete?: (xp: number, result: GradingResult) => void;
}

const ProjectGrader: React.FC<ProjectGraderProps> = ({ project, level, onClose, onComplete }) => {
  const [submission, setSubmission] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);

  const handleSubmit = async () => {
    if (!submission.trim()) return;
    setIsGrading(true);
    try {
      const grading = await gradeProject(project, submission, level.difficulty);
      setResult(grading);
    } catch (error) {
      alert("Grading failed. Please try again.");
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
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg">
                <h3 className="text-blue-400 text-sm font-semibold mb-2">Instructions</h3>
                <p className="text-gray-400 text-sm">
                  Paste your code snippet, a GitHub link, or a detailed textual description of how you solved the problem.
                  The AI will analyze your logic, best practices, and completeness.
                </p>
              </div>

              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="// Paste code or description here..."
                className="w-full h-64 bg-[#050505] border border-gray-800 rounded-xl p-4 text-gray-300 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isGrading || !submission}
                  className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isGrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isGrading ? 'Analyzing...' : 'Submit for Review'}
                </button>
              </div>
            </div>
          ) : (
            <GradingReport
              result={result}
              actionButton={
                <button
                  onClick={handleFinish}
                  className="w-full mt-4 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
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
