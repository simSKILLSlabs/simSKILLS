
import React, { useRef, useState } from 'react';
import { CareerRoadmap, Level, UserProfile, ProjectTask } from '../types';
import { ChevronRight, Trophy, BookOpen, Lock, CheckCircle2, Zap, Terminal, Plus, ArrowDownCircle, RotateCcw, ArrowUpCircle, Trash2, AlertTriangle } from 'lucide-react';

interface RoadmapViewProps {
  roadmap: CareerRoadmap;
  user: UserProfile;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
  onUpgrade: () => void;
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
  const practiceRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const scrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate Progress based on ACTUAL completed levels (all projects done)
  const totalLevels = roadmap.levels.length;
  
  const completedLevelsCount = roadmap.levels.filter(lvl => {
      // A level is complete if it has projects loaded AND all are finished
      if (!lvl.projects || lvl.projects.length === 0) return false;
      return lvl.projects.every(p => user.completedProjects.includes(p.id));
  }).length;
  
  const progressPercent = totalLevels > 0 ? Math.min(100, (completedLevelsCount / totalLevels) * 100) : 0;

  // Check if roadmap can be extended (User is Pro AND roadmap has few levels, implying it was free)
  const canExtend = user.isPro && roadmap.levels.length <= 10;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-[1400px] mx-auto animate-fade-in pb-24">
      
      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#09090b] border border-red-900/50 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Delete Simulation?
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Are you sure you want to delete <span className="text-white font-bold">{roadmap.careerTitle}</span>? 
                    This action cannot be undone and all progress in this path will be permanently lost.
                </p>
                
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)} 
                        className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onUnenroll(roadmap.id)} 
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-gray-800 pb-8 sticky top-0 bg-[#050505]/95 backdrop-blur z-40 pt-4">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center gap-2 font-mono"
          >
            <ChevronRight className="rotate-180 w-3 h-3" /> Dashboard
          </button>
          <div>
             <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{roadmap.careerTitle}</h1>
             <p className="text-gray-400 max-w-2xl text-sm md:text-base font-light">{roadmap.description}</p>
          </div>
        </div>
        
        <div className="w-full md:w-80 space-y-4">
             <div className="flex flex-col items-end gap-3">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                    }}
                    type="button"
                    className="flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider bg-red-900/10 hover:bg-red-900/20 px-3 py-1.5 rounded-full border border-red-900/30 cursor-pointer"
                >
                    <Trash2 className="w-3 h-3" />
                    Delete Simulation
                </button>
                <button 
                    onClick={scrollToPractice}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                >
                    Jump to Practice Arena
                    <ArrowDownCircle className="w-4 h-4" />
                </button>
             </div>
            <div className="space-y-2">
                <div className="flex justify-between text-xs uppercase tracking-wider font-medium text-gray-500">
                    <span>Completion</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Blueprint Grid */}
      <div className="relative pt-8 mb-24">
        {/* Central Spine Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gray-800 -translate-x-1/2 hidden md:block" />

        <div className="space-y-8 md:space-y-16">
            {roadmap.levels.map((level, index) => {
                const isEven = index % 2 === 0;
                // Lock logic: If user is not Pro, lock levels > 5
                const isLocked = !user.isPro && index >= 5;
                
                // Strict Completion Logic:
                // 1. Must have projects loaded (lazy load check)
                // 2. All projects must be in user.completedProjects
                const hasProjects = level.projects && level.projects.length > 0;
                const isCompleted = hasProjects && level.projects!.every(p => user.completedProjects.includes(p.id));

                return (
                  <div key={level.id} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      
                      {/* Node on Spine */}
                      <div className={`absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-[#050505] z-10 
                          ${isCompleted ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : isLocked ? 'bg-red-900/50' : 'bg-gray-700'}
                          hidden md:block
                      `} />

                      {/* Content Card */}
                      <div className="w-full md:w-1/2 group">
                          <div 
                            onClick={() => !isLocked && onSelectLevel(level)}
                            className={`
                                relative p-6 md:p-8 rounded-2xl border transition-all duration-500 overflow-hidden
                                ${isLocked 
                                    ? 'bg-red-900/5 border-red-900/20 cursor-not-allowed opacity-70 grayscale' 
                                    : 'glass-panel border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-900/10 cursor-pointer hover:-translate-y-1 hover:shadow-2xl'
                                }
                            `}
                          >
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 text-center p-4">
                                    <Lock className="w-8 h-8 text-red-500 mb-2" />
                                    <h3 className="text-white font-bold text-lg">Pro Tier Locked</h3>
                                    <p className="text-gray-400 text-sm mb-4">Upgrade to access advanced levels.</p>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
                                        className="px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded hover:bg-gray-200"
                                    >
                                        Unlock Now
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider
                                    ${level.difficulty === 'Expert' ? 'bg-purple-900/30 text-purple-400' :
                                      level.difficulty === 'Advanced' ? 'bg-indigo-900/30 text-indigo-400' :
                                      level.difficulty === 'Intermediate' ? 'bg-blue-900/30 text-blue-400' : 
                                      'bg-emerald-900/30 text-emerald-400'}
                                `}>
                                    Level {String(index + 1).padStart(2, '0')}
                                </span>
                                {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 font-mono">{level.title}</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">{level.description}</p>

                            <div className="flex gap-6 text-xs text-gray-500 border-t border-gray-800 pt-4 font-mono">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" />
                                    <span>{level.topics.length} TOPICS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-3 h-3" />
                                    {/* Handle Lazy Loaded Counts */}
                                    <span>{level.projects ? level.projects.length : '?'} PROJECTS</span>
                                </div>
                            </div>
                          </div>
                      </div>

                      {/* Spacer for the other side */}
                      <div className="hidden md:block w-1/2" />
                  </div>
                );
            })}
        </div>

        {/* Extend Roadmap Option for Pro Users */}
        {canExtend && (
            <div className="flex flex-col items-center justify-center mt-16 animate-fade-in-up">
                <div className="h-16 w-px bg-gradient-to-b from-gray-800 to-transparent mb-4"></div>
                <button 
                    onClick={onExtend}
                    className="group relative px-8 py-4 bg-[#0a0a0a] border border-emerald-500/30 text-emerald-400 font-bold rounded-full hover:bg-emerald-900/10 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all flex items-center gap-3"
                >
                    <ArrowUpCircle className="w-6 h-6" />
                    Initialize Pro Architecture (Levels {roadmap.levels.length + 1}-20)
                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping opacity-50 pointer-events-none"></div>
                </button>
                <p className="text-gray-500 text-sm mt-4">You have Pro access. Generate the advanced modules for this career.</p>
            </div>
        )}
      </div>
      
      {/* Infinite Practice Section */}
      <div ref={practiceRef} className="mt-32 pt-12 border-t border-gray-800">
         <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
                <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                   <Zap className="w-6 h-6 text-yellow-500" />
                   Infinite Practice Arena
                </h3>
                <p className="text-gray-400 max-w-xl">
                    Generate unlimited, unique project assignments tailored to your current skill level. 
                    Test your knowledge with fresh challenges anytime.
                </p>
            </div>
            {user.isPro ? (
                <button 
                    onClick={onGeneratePractice}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-yellow-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Generate New Challenge
                </button>
            ) : (
                <button 
                    onClick={onUpgrade}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-400 font-bold rounded-lg cursor-not-allowed border border-gray-700 hover:border-gray-600"
                >
                    <Lock className="w-4 h-4" />
                    Unlock Infinite Practice
                </button>
            )}
         </div>

         {/* Generated Projects Grid */}
         {roadmap.extraProjects && roadmap.extraProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmap.extraProjects.map((project, i) => {
                    const isCompleted = user.completedProjects.includes(project.id);
                    return (
                        <div 
                            key={i} 
                            onClick={() => onSelectPractice(project)}
                            className={`p-6 border rounded-xl transition-all cursor-pointer group flex flex-col
                                ${isCompleted 
                                    ? 'bg-emerald-900/10 border-emerald-500/30' 
                                    : 'bg-[#0a0a0a] border-gray-800 hover:border-yellow-500/50 hover:bg-yellow-900/5'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg transition-colors
                                    ${isCompleted ? 'bg-emerald-500/20' : 'bg-gray-900 group-hover:bg-yellow-500/10'}
                                `}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <Terminal className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" />
                                    )}
                                </div>
                                <span className={`text-[10px] uppercase font-bold
                                    ${isCompleted ? 'text-emerald-500' : 'text-gray-500'}
                                `}>{project.difficulty}</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{project.title}</h4>
                            <p className="text-gray-400 text-xs mb-4 line-clamp-2 flex-1">{project.description}</p>
                            
                            {isCompleted ? (
                                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold mt-auto">
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Practice Again</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-yellow-500 font-bold mt-auto">
                                    <span>Start Challenge</span>
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
         ) : (
            <div className="p-12 border border-gray-800 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-[#0a0a0a]/50">
                <Terminal className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-500 font-medium">No practice projects generated yet.</p>
                {user.isPro && <p className="text-gray-600 text-sm mt-1">Click the button above to start your first challenge.</p>}
            </div>
         )}
      </div>

    </div>
  );
};

export default RoadmapView;
