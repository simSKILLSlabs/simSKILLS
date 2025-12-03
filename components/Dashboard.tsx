
import React from 'react';
import { UserProfile, CareerRoadmap } from '../types';
import { Plus, Zap, Trophy, Flame, PlayCircle, Terminal, Layout } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  roadmaps: CareerRoadmap[];
  onResume: (id: string) => void;
  onNewPath: () => void;
  onUpgrade: () => void;
  onProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, roadmaps, onResume, onNewPath, onUpgrade, onProfile }) => {
  
  return (
    <div className="min-h-screen p-6 md:p-12 animate-fade-in max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
            <h1 className="text-3xl font-bold text-white">Hello, {user.name}</h1>
            <p className="text-gray-400 text-sm">Welcome back to your workspace.</p>
        </div>
        <div className="flex gap-4">
            {!user.isPro && (
                <button 
                    onClick={onUpgrade}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all"
                >
                    Upgrade to Pro
                </button>
            )}
            <button 
              onClick={onProfile}
              className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400">{user.name}</div>
                    <div className="text-[10px] text-gray-500">Level {user.level}</div>
                </div>
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl group hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-yellow-500 transition-colors">
                <Zap className="w-4 h-4 text-yellow-500" />
                Total XP
            </div>
            <div className="text-3xl font-bold text-white">{user.xp.toLocaleString()}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl group hover:border-orange-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-orange-500 transition-colors">
                <Flame className="w-4 h-4 text-orange-500" />
                Daily Streak
            </div>
            <div className="text-3xl font-bold text-white">{user.streak} Days</div>
        </div>
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl group hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-purple-500 transition-colors">
                <Trophy className="w-4 h-4 text-purple-500" />
                Projects
            </div>
            <div className="text-3xl font-bold text-white">{user.completedProjects.length}</div>
        </div>
        <div 
          className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:border-emerald-500/50 group transition-colors" 
          onClick={onNewPath}
        >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <Plus className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-gray-300 group-hover:text-white">New Simulation</div>
        </div>
      </div>

      {/* Career Simulations Grid */}
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
         <Layout className="w-5 h-5 text-gray-500" />
         Enrolled Simulations
      </h3>
      
      {roadmaps.length > 0 ? (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((map) => {
                const progressPercent = Math.min(100, Math.round((user.xp / (Math.max(1, map.levels.length) * 1000)) * 100)); 
                return (
                    <div key={map.id} className="flex flex-col group h-full">
                        
                        {/* Main Card */}
                        <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 relative overflow-hidden group-hover:border-emerald-500/30 transition-all flex flex-col h-full">
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            <div className="relative z-10 flex-1">
                                <div className="flex justify-between items-start mb-4 pr-4">
                                    <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-emerald-500/10 transition-colors inline-block">
                                        <Terminal className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-white mb-2 line-clamp-1">{map.careerTitle}</h2>
                                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-6 h-8">
                                    {map.description}
                                </p>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                        <span>Sync Status</span>
                                        <span className={progressPercent > 0 ? 'text-emerald-500' : 'text-gray-600'}>{progressPercent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={() => onResume(map.id)}
                                className="relative z-10 w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white font-bold rounded-xl group-hover:bg-emerald-500 group-hover:text-black transition-all text-sm mt-auto"
                            >
                                <PlayCircle className="w-4 h-4" />
                                Resume Path
                            </button>
                        </div>
                    </div>
                );
            })}
            
            {/* Add New Card */}
            <button 
                onClick={onNewPath}
                className="min-h-[280px] border border-gray-800 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-white hover:bg-gray-900/30 transition-all group"
            >
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Initialize New Path</span>
            </button>
         </div>
      ) : (
        <div className="text-center py-20 bg-[#0a0a0a] border border-gray-800 border-dashed rounded-3xl">
            <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white mb-2">No Simulations Initialized</h3>
                <p className="text-gray-500 mb-8">Start a new career simulation to see your roadmap here.</p>
                <button 
                    onClick={onNewPath}
                    className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                >
                    Launch Simulator
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
