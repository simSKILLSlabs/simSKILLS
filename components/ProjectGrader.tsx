
import React, { useState } from 'react';
import { ProjectTask, GradingResult, Level } from '../types';
import { gradeProject } from '../services/geminiService';
import { X, Send, CheckCircle, AlertTriangle, Lightbulb, Loader2, Star } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ProjectGraderProps {
  project: ProjectTask;
  level: Level;
  onClose: () => void;
  onComplete?: (xp: number) => void;
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
      // Wait a moment so user sees the grading, then update global state if they close? 
      // Actually, we pass the XP back when they close or via a specific button.
      // For now, let's just let them view it.
    } catch (error) {
      alert("Grading failed. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleFinish = () => {
      if (result && onComplete) {
          onComplete(result.xpAwarded);
      } else {
          onClose();
      }
  };

  const chartData = result ? [
    { subject: 'Coding', A: result.skillMatrix.coding, fullMark: 100 },
    { subject: 'Logic', A: result.skillMatrix.logic, fullMark: 100 },
    { subject: 'Creativity', A: result.skillMatrix.creativity, fullMark: 100 },
    { subject: 'Practices', A: result.skillMatrix.bestPractices, fullMark: 100 },
    { subject: 'Complete', A: result.skillMatrix.completeness, fullMark: 100 },
  ] : [];

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
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Report */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`text-5xl font-bold ${result.score >= 80 ? 'text-emerald-400' : result.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {result.score}
                    <span className="text-lg text-gray-500 font-normal ml-1">/100</span>
                  </div>
                  <div className="bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-700/30 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-yellow-200 font-bold text-sm">+{result.xpAwarded} XP</span>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-2">Verdict</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{result.feedbackSummary}</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-gray-600">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" /> Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-gray-600">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={handleFinish}
                  className="w-full mt-4 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                    Collect XP & Close
                </button>
              </div>

              {/* Right Column: Visualization & Tips */}
              <div className="space-y-6">
                 <div className="h-64 w-full bg-gray-900/30 rounded-xl border border-gray-800 relative">
                    <p className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Skill Matrix</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Skill"
                          dataKey="A"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="bg-emerald-900/10 border border-emerald-900/30 p-5 rounded-xl">
                    <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Recommended Actions
                    </h4>
                    <ul className="space-y-3">
                      {result.suggestions.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-300 border-l-2 border-emerald-500/30 pl-3">
                          {tip}
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectGrader;
