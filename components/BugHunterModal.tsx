import React, { useState } from 'react';
import { generateBugHunt, validateBugFix } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { BugHuntChallenge } from '../types';
import { Bug, X, Play, Loader2, Award, ArrowRight } from 'lucide-react';
import CodeEditor from './ide/CodeEditor';
import { toast } from 'sonner';

interface BugHunterModalProps {
    onClose: () => void;
    careerPath: string; // e.g. "Frontend Developer"
}

const BugHunterModal: React.FC<BugHunterModalProps> = ({ onClose, careerPath }) => {
    const { user, updateUser } = useAuth();

    const [challenge, setChallenge] = useState<BugHuntChallenge | null>(null);
    const [editorCode, setEditorCode] = useState('');
    const [loading, setLoading] = useState(false); // For generating
    const [verifying, setVerifying] = useState(false); // For validation
    const [result, setResult] = useState<{ isCorrect: boolean, feedback: string } | null>(null);

    const startHunt = async () => {
        // Daily Limit Check
        const today = new Date().toISOString().split('T')[0];
        const huntsToday = user.lastBugHuntDate === today ? (user.bugHuntsCompletedToday || 0) : 0;

        if (!user.isPro && huntsToday >= 2) {
            toast.error("Daily Bug Hunt limit reached. Upgrade to Pro for unlimited hunts!");
            return;
        }

        setLoading(true);
        try {
            const data = await generateBugHunt(careerPath, user.level > 5 ? 'Medium' : 'Easy');
            setChallenge(data);
            setEditorCode(data.buggyCode);
            setResult(null);
        } catch (error) {
            toast.error("Failed to find a bug to hunt. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!challenge) return;
        setVerifying(true);
        try {
            const res = await validateBugFix(challenge.buggyCode, editorCode, challenge.description);
            setResult(res);

            if (res.isCorrect) {
                toast.success(`Bug Squash! +${challenge.xpAward} XP`);
                // Update User Stats
                const today = new Date().toISOString().split('T')[0];
                const currentHunts = user.lastBugHuntDate === today ? (user.bugHuntsCompletedToday || 0) : 0;

                updateUser({
                    xp: user.xp + challenge.xpAward,
                    bugHuntsCompletedToday: currentHunts + 1,
                    lastBugHuntDate: today
                });
            } else {
                toast.error("Bug verification failed. Check the feedback.");
            }
        } catch (error) {
            toast.error("Verification error.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <div className="text-center text-emerald-500 animate-pulse">
                    <p className="text-xl font-bold">Scanning for bugs...</p>
                </div>
            </div>
        );
    }

    // Intro Screen
    if (!challenge) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bug className="text-red-500 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Bug Hunter Mode</h2>
                    <p className="text-gray-400 mb-6">
                        Find and fix bugs in generated code snippets.
                        <br />
                        <span className="text-emerald-400 text-sm">
                            {user.isPro ? 'Unlimited Hunts (Pro)' : `${2 - ((user.lastBugHuntDate === new Date().toISOString().split('T')[0] ? (user.bugHuntsCompletedToday || 0) : 0))} / 2 Daily Hunts Remaining`}
                        </span>
                    </p>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors">
                            Cancel
                        </button>
                        <button onClick={startHunt} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20">
                            Start Hunt
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#050505]">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <Bug className="text-red-500" />
                    <div>
                        <h2 className="text-white font-bold">Bug Hunt</h2>
                        <p className="text-xs text-gray-500">{challenge.difficulty} Difficulty • {challenge.xpAward} XP</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Task Desc */}
                <div className="w-1/3 border-r border-gray-800 bg-[#0c0c0c] p-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">Mission Brief</h3>
                    <div className="bg-white/5 p-4 rounded-lg mb-6 text-gray-300 text-sm leading-relaxed">
                        {challenge.description}
                    </div>

                    <div className="mb-6">
                        <h4 className="text-gray-500 text-xs font-uppercase tracking-wider mb-2">Instructions</h4>
                        <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
                            <li>Read the code carefully.</li>
                            <li>Identify the logical or syntax error.</li>
                            <li>Edit the code in the editor to fix it.</li>
                            <li>Click "Verify Fix" to submit.</li>
                        </ul>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-xl border ${result.isCorrect ? 'bg-emerald-900/20 border-emerald-900' : 'bg-red-900/20 border-red-900'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {result.isCorrect ? <Award className="text-emerald-500" /> : <X className="text-red-500" />}
                                <h4 className={`font-bold ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.isCorrect ? 'Bug Squashed!' : 'Correction Failed'}
                                </h4>
                            </div>
                            <p className="text-gray-300 text-sm">{result.feedback}</p>

                            {result.isCorrect && (
                                <button onClick={onClose} className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 transition-colors">
                                    Claim Reward & Close
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col">
                    <CodeEditor
                        value={editorCode}
                        onChange={(val) => setEditorCode(val || '')}
                        height="100%"
                        language={challenge.language.toLowerCase()}
                    />

                    {!result?.isCorrect && (
                        <div className="p-4 border-t border-gray-800 bg-[#111] flex justify-end">
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 flex items-center gap-2 disabled:opacity-50 transition-all"
                            >
                                {verifying ? <Loader2 className="animate-spin" /> : <Play size={16} />}
                                Verify Fix
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BugHunterModal;
