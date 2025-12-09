
import React, { useState } from 'react';
import { UserProfile, CareerRoadmap, Challenge } from '../types';
import { Plus, Zap, Trophy, Flame, PlayCircle, Terminal, Layout, Sparkles, Brain, ChevronDown, Bug, ArrowRight } from 'lucide-react';
import PopularPaths from './PopularPaths';
import DailyChallengeModal from './DailyChallengeModal';
import { generateDailyChallenge } from '../services/geminiService';
import { toast } from 'sonner';

interface DashboardProps {
    user: UserProfile;
    roadmaps: CareerRoadmap[];
    onResume: (id: string) => void;
    onNewPath: () => void;
    onQuickStart: (career: string) => void;
    onAddXP: (amount: number) => void;
    onUpgrade: (message?: string) => void;
    onProfile: () => void;
    onBugHunt: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, roadmaps, onResume, onNewPath, onQuickStart, onAddXP, onUpgrade, onProfile, onBugHunt }) => {


    const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [showChallengeModal, setShowChallengeModal] = useState(false);

    // Initialize from localStorage to check if user permanently hid it
    const [showPopularPathsSection, setShowPopularPathsSection] = useState(() => {
        return localStorage.getItem('hidePopularPaths') !== 'true';
    });
    const [showPopularPaths, setShowPopularPaths] = useState(true); // Toggle for accordion

    const handleHidePopularPaths = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Remove Popular Paths? You can bring this back from settings later.")) {
            setShowPopularPathsSection(false);
            localStorage.setItem('hidePopularPaths', 'true');
        }
    };

    const handleStartChallenge = async () => {
        // Enforce Limits
        const challengesDone = user.dailyChallengesCompleted || 0;
        if (!user.isPro && challengesDone >= 1) {
            onUpgrade("Free users can only do 1 Daily Challenge per day. Upgrade to Pro for unlimited training.");
            return;
        }

        setIsGeneratingChallenge(true);
        try {
            const context = roadmaps.length > 0 ? roadmaps[0].careerTitle : "Computer Science";
            const newChallenge = await generateDailyChallenge(user.level, context);
            setChallenge(newChallenge);
            setShowChallengeModal(true);
        } catch (e) {
            console.error(e);
            toast.error("Could not generate daily challenge. Try again.");
        } finally {
            setIsGeneratingChallenge(false);
        }
    };

    const challengesDone = user.dailyChallengesCompleted || 0;
    const isLimitReached = !user.isPro && challengesDone >= 1;

    return (
        <div className="min-h-screen p-6 md:p-12 animate-fade-in max-w-[1600px] mx-auto">
            {showChallengeModal && challenge && (
                <DailyChallengeModal
                    challenge={challenge}
                    onClose={() => setShowChallengeModal(false)}
                    onComplete={(xp) => {
                        onAddXP(xp);
                        setShowChallengeModal(false);
                    }}
                />
            )}

            {/* Top Bar (Restored & Enhanced) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Hello, {user.name}</h1>
                    <p className="text-gray-400 text-sm">Welcome back to your workspace.</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Status HUD */}
                    <div className="flex items-center bg-[#111] border border-gray-800 rounded-full px-4 py-2 gap-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-orange-500" title="Daily Streak">
                            <Flame size={16} className={user.streak > 0 ? "fill-orange-500" : ""} />
                            <span>{user.streak}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-800" />
                        <div className="flex items-center gap-2 text-sm font-bold text-yellow-500" title="Total XP">
                            <Zap size={16} className="fill-yellow-500" />
                            <span>{user.xp.toLocaleString()}</span>
                        </div>
                    </div>

                    {!user.isPro && (
                        <button
                            onClick={() => onUpgrade()}
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT SIDEBAR AREA - ONLY CHALLENGES */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Card Hidden on Desktop since we have Top Bar? No, User wanted "Challenge on Left".
                        I will hide the redundant Profile Card info or just keep the simplified challenge button + maybe a "Quick Actions" or keep it clean.
                        The user asked to "separate" streak.
                    */}

                    {/* Daily Challenge Card - Detailed Vertical Version */}
                    <button
                        onClick={handleStartChallenge}
                        disabled={isGeneratingChallenge || isLimitReached}
                        className={`w-full text-left relative overflow-hidden group transition-all duration-300 rounded-3xl border p-8 flex flex-col items-center text-center h-fit
                            ${isLimitReached
                                ? 'bg-gray-900/20 border-gray-800 opacity-75 cursor-not-allowed'
                                : 'bg-gradient-to-b from-[#0a0a0a] to-[#111] border-gray-800 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]'
                            }
                        `}
                    >
                        {isGeneratingChallenge && <div className="absolute inset-0 bg-white/5 animate-pulse" />}

                        <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-colors
                            ${isLimitReached ? 'bg-gray-800 text-gray-500' : 'bg-orange-900/20 text-orange-500 group-hover:scale-110'}
                        `}>
                            <Brain size={32} />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                            {isGeneratingChallenge ? "Loading..." : "Daily Challenge"}
                        </h3>

                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                            {isLimitReached
                                ? "Daily limit reached. Come back tomorrow!"
                                : "Boost your streak with a quick code trivia or bug fix."}
                        </p>

                        {!isLimitReached && (
                            <div className="w-full py-3 bg-white text-black font-bold rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all flex items-center justify-center gap-2">
                                Start Now <Sparkles size={16} />
                            </div>
                        )}
                        {isLimitReached && (
                            <div className="w-full py-3 bg-gray-800 text-gray-500 font-bold rounded-xl flex items-center justify-center gap-2">
                                Locked
                            </div>
                        )}
                    </button>

                    {/* Bug Hunter Mode Card */}
                    <button
                        onClick={onBugHunt}
                        className="w-full text-left relative overflow-hidden group transition-all duration-300 rounded-2xl border border-gray-800 bg-gray-900/40 hover:bg-red-900/10 hover:border-red-500/50 p-6 flex items-center gap-4"
                    >
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                            <Bug size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">Bug Hunter Mode</h3>
                            <p className="text-xs text-gray-500">Find & fix bugs for XP</p>
                        </div>
                        <div className="ml-auto text-gray-600 group-hover:text-red-500 transition-colors">
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    {/* Add simple stats here maybe? */}
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Total XP
                        </div>
                        <div className="text-3xl font-bold text-white">{user.xp.toLocaleString()}</div>
                    </div>
                </div>


                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-9 space-y-10">

                    {/* Popular Paths - Collapsible & Removable */}
                    {showPopularPathsSection && (
                        <div className="transition-all duration-300">
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer group select-none"
                                onClick={() => setShowPopularPaths(!showPopularPaths)}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        Popular Career Paths
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleHidePopularPaths}
                                        className="text-xs text-gray-600 hover:text-red-500 hover:underline px-2"
                                        title="Permanently Remove"
                                    >
                                        Remove
                                    </button>
                                    <div className={`p-1 rounded-full bg-gray-900 text-gray-400 transition-transform duration-300 ${showPopularPaths ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showPopularPaths ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <PopularPaths onSelect={(career) => onQuickStart(career)} />
                            </div>
                        </div>
                    )}

                    {/* Stats Row (Condensed) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-[#0a0a0a] border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Trophy size={18} /></div>
                            <div>
                                <div className="text-2xl font-bold text-white">{user.completedProjects.length}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Projects</div>
                            </div>
                        </div>
                        <div className="bg-[#0a0a0a] border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Terminal size={18} /></div>
                            <div>
                                <div className="text-2xl font-bold text-white">{roadmaps.length}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Active Paths</div>
                            </div>
                        </div>
                        <div className="bg-[#0a0a0a] border border-gray-800 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-colors" onClick={onNewPath}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-800 rounded-lg text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors"><Plus size={18} /></div>
                                <div>
                                    <div className="font-bold text-white">New Path</div>
                                    <div className="text-xs text-gray-500">Custom</div>
                                </div>
                            </div>
                            <div className="text-gray-600 group-hover:text-white transition-colors"><PlayCircle size={18} /></div>
                        </div>
                    </div>

                    {/* Simulations Grid */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px bg-gray-800 flex-1" />
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 text-nowrap">
                                <Layout className="w-4 h-4 text-emerald-500" />
                                Your Simulations
                            </h3>
                            <div className="h-px bg-gray-800 flex-1" />
                        </div>

                        {roadmaps.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {roadmaps.map((map) => {
                                    const progressPercent = Math.min(100, Math.round((user.xp / (Math.max(1, map.levels.length) * 1000)) * 100));
                                    return (
                                        <div key={map.id} className="flex flex-col group h-full">
                                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 relative overflow-hidden group-hover:border-emerald-500/30 transition-all flex flex-col h-full hover:shadow-2xl hover:shadow-emerald-900/10">
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                <div className="relative z-10 flex-1">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="p-2 bg-gray-900 rounded-lg text-emerald-400 border border-gray-800 group-hover:border-emerald-500/50 transition-colors">
                                                            <Terminal size={18} />
                                                        </div>
                                                        <span className="px-2 py-1 bg-gray-900 rounded text-[10px] text-gray-400 font-mono border border-gray-800">
                                                            {map.levels.length} Levels
                                                        </span>
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
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-[#0a0a0a] border border-gray-800 border-dashed rounded-3xl opacity-50 hover:opacity-100 transition-opacity">
                                <p className="text-sm text-gray-500">No active simulations. Start one above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
