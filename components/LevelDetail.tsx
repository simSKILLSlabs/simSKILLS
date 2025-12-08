
import React from 'react';
import { Level, ProjectTask } from '../types';
import { X, PlayCircle, ExternalLink, Code, Youtube, BookOpen, Lightbulb, PenTool, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

interface LevelDetailProps {
  level: Level;
  isLoading?: boolean;
  completedProjectIds: string[];
  onClose: () => void;
  onStartProject: (project: ProjectTask) => void;
}

const LevelDetail: React.FC<LevelDetailProps> = ({ level, isLoading, completedProjectIds, onClose, onStartProject }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#09090b] w-full max-w-6xl h-[90vh] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Sidebar: Resources & Meta */}
        <div className="w-full md:w-80 bg-gray-900/50 p-6 border-r border-gray-800 overflow-y-auto shrink-0">
          <button onClick={onClose} className="md:hidden mb-4 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <div className="mb-8">
            <span className="text-emerald-500 text-xs font-bold tracking-wider uppercase mb-2 block">{level.difficulty}</span>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{level.title}</h2>
            <p className="text-gray-400 text-xs leading-relaxed">{level.description}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
              Topics
            </h3>
            <ul className="space-y-2">
              {level.topics.map((topic, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300 text-xs">
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          {level.resources && (
            <div>
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                Recommended Videos
              </h3>
              <div className="space-y-2">
                {level.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(res.title + " tutorial")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-lg bg-gray-800/30 hover:bg-red-900/10 border border-gray-800 hover:border-red-900/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
                        {res.type === 'video' ? <Youtube className="w-3 h-3 text-red-500" /> : <BookOpen className="w-3 h-3" />}
                        {res.type}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-red-400" />
                    </div>
                    <p className="text-gray-200 text-xs font-medium leading-snug">{res.title}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content: Teaching & Projects */}
        <div className="flex-1 overflow-y-auto relative bg-[#050505]">
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-6 right-6 w-8 h-8 rounded-full border border-gray-800 items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-mono animate-pulse">GENERATING CLASS CONTENT...</p>
            </div>
          ) : (
            <div className="p-8 md:p-12 max-w-3xl mx-auto">

              {level.teaching ? (
                <div className="mb-12 border-b border-gray-800 pb-12 animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">The Lesson</h3>
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="bg-gray-900/20 p-6 rounded-2xl border border-gray-800 mb-6">
                      <h4 className="text-emerald-400 text-sm font-bold uppercase mb-2">Concept</h4>
                      <p className="text-gray-300 text-lg leading-relaxed">{level.teaching.conceptExplanation}</p>
                    </div>

                    <div className="pl-6 border-l-2 border-indigo-500/30">
                      <h4 className="text-indigo-400 text-sm font-bold uppercase mb-2">How to Apply It</h4>
                      <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{level.teaching.practicalGuide}</p>
                    </div>

                    <div className="mt-6 flex items-start gap-3 bg-blue-900/10 p-4 rounded-lg">
                      <div className="bg-blue-500/20 p-1 rounded">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-300 uppercase mb-1">Key Takeaway</p>
                        <p className="text-sm text-gray-400">{level.teaching.keyTakeaway}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {level.projects ? (
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <PenTool className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">Assignment</h3>
                  </div>
                  <p className="text-gray-500 mb-6 text-sm">Verify your understanding by building these specific artifacts.</p>

                  <div className="grid gap-6">
                    {level.projects.map((project) => {
                      const isCompleted = completedProjectIds.includes(project.id);

                      return (
                        <div key={project.id} className={`group relative p-[1px] rounded-2xl transition-all duration-500 
                                    ${isCompleted
                            ? 'bg-gradient-to-b from-emerald-800 to-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'bg-gradient-to-b from-gray-800 to-gray-900 hover:from-emerald-600 hover:to-emerald-900'
                          }`}>
                          <div className="bg-[#0a0a0a] p-6 rounded-2xl h-full relative z-10 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-xl transition-colors
                                            ${isCompleted ? 'bg-emerald-500/20' : 'bg-gray-900 group-hover:bg-emerald-500/10'}
                                        `}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <Code className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
                                )}
                              </div>
                              <span className={`text-[10px] font-bold uppercase border px-2 py-1 rounded bg-black
                                            ${isCompleted ? 'border-emerald-500/50 text-emerald-500' : 'border-gray-800 text-gray-500'}
                                        `}>
                                {isCompleted ? 'Completed' : 'Task'}
                              </span>
                            </div>

                            <h4 className="text-lg font-bold text-white mb-2">{project.title}</h4>
                            <p className="text-gray-400 text-sm mb-6 flex-1">{project.description}</p>

                            <div className="mb-6 bg-gray-900/30 p-4 rounded-lg">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Requirements</p>
                              <ul className="text-sm text-gray-300 space-y-1">
                                {project.requirements.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1.5">•</span>
                                    <span className="flex-1 text-xs">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {isCompleted ? (
                              <button
                                onClick={() => onStartProject(project)}
                                className="w-full py-3 bg-gray-900 text-emerald-400 border border-emerald-900 font-bold rounded-xl hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2 text-sm"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Test Again
                              </button>
                            ) : (
                              <button
                                onClick={() => onStartProject(project)}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 hover:text-black transition-all flex items-center justify-center gap-2 text-sm"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Start Grading
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LevelDetail;
