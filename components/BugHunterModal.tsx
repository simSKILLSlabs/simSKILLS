import React, { useState } from 'react';
import { generateBugHunt, validateBugFix } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { BugHuntChallenge } from '../types';
import { Bug, X, Play, Loader2, CheckCircle2 } from 'lucide-react';
import CodeEditor from './ide/CodeEditor';
import { toast } from 'sonner';

interface BugHunterModalProps {
    onClose: () => void;
    careerPath: string;
}

const BugHunterModal: React.FC<BugHunterModalProps> = ({ onClose, careerPath }) => {
    const { user, updateUser } = useAuth();

    const [challenge, setChallenge] = useState<BugHuntChallenge | null>(null);
    const [editorCode, setEditorCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

    const startHunt = async () => {
        const today = new Date().toISOString().split('T')[0];
        const huntsToday = user.lastBugHuntDate === today ? (user.bugHuntsCompletedToday || 0) : 0;

        if (!user.isPro && huntsToday >= 2) {
            toast.error("Daily Bug Hunt limit reached. Upgrade to Pro for unlimited sessions.");
            return;
        }

        setLoading(true);
        try {
            const data = await generateBugHunt(careerPath, user.level > 5 ? 'Medium' : 'Easy');
            setChallenge(data);
            setEditorCode(data.buggyCode);
            setResult(null);
        } catch (error) {
            toast.error("Failed to initialize debugging session. Please try again.");
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
                toast.success(`Bug resolved! +${challenge.xpAward} XP`);
                const today = new Date().toISOString().split('T')[0];
                const currentHunts = user.lastBugHuntDate === today ? (user.bugHuntsCompletedToday || 0) : 0;

                updateUser({
                    xp: user.xp + challenge.xpAward,
                    bugHuntsCompletedToday: currentHunts + 1,
                    lastBugHuntDate: today
                });
            } else {
                toast.error("Fix did not pass verification. Review the feedback.");
            }
        } catch (error) {
            toast.error("Verification error.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
                <div className="surface-card rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <p className="text-xs font-mono text-neutral-300">Initializing Debugging Sandbox...</p>
                </div>
            </div>
        );
    }

    if (!challenge) {
        const remaining = 2 - (user.lastBugHuntDate === new Date().toISOString().split('T')[0] ? (user.bugHuntsCompletedToday || 0) : 0);
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
                <div className="surface-card rounded-2xl p-8 max-w-md w-full">
                    <div className="surface-recessed w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                        <Bug className="text-indigo-300 w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight mb-2">Bug Hunter Sandbox</h2>
                    <p className="text-neutral-300/85 text-xs leading-relaxed mb-6">
                        Inspect a broken code snippet from {careerPath}, identify the root cause, and submit a working patch.
                    </p>

                    <div className="mb-6 py-2.5 px-3.5 rounded-xl surface-recessed text-xs font-mono text-neutral-300 flex items-center justify-between">
                        <span>Daily Sessions</span>
                        <span className="tabular-nums text-white">{user.isPro ? 'Unlimited (Pro)' : `${Math.max(0, remaining)} / 2 remaining`}</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="btn-secondary flex-1 py-2.5 text-xs font-medium rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={startHunt}
                            className="btn-primary flex-1 py-2.5 text-xs font-semibold rounded-lg"
                        >
                            Start Session
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#06070a]">
            {/* Header */}
            <div className="h-14 border-b border-white/[0.08] bg-[#080a0f] flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <Bug className="w-4 h-4 text-indigo-300" />
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-white font-bold">Bug Hunter Sandbox</span>
                        <span className="text-neutral-600">·</span>
                        <span className="font-mono text-neutral-400">{challenge.difficulty}</span>
                        <span className="text-neutral-600">·</span>
                        <span className="font-mono text-indigo-300">+{challenge.xpAward} XP</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="btn-secondary w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Task Desc */}
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#090b10] p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-xs font-mono text-indigo-300/90 mb-2">Issue Description</h3>
                        <div className="surface-recessed p-4 rounded-xl text-neutral-200 text-xs leading-relaxed">
                            {challenge.description}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-mono text-indigo-300/90 mb-2">Instructions</h4>
                        <ul className="text-neutral-300 text-xs space-y-2">
                            <li>1. Inspect the code in the editor.</li>
                            <li>2. Identify the logical or syntax bug.</li>
                            <li>3. Modify the code directly to resolve the issue.</li>
                            <li>4. Click Verify Fix to run diagnostics.</li>
                        </ul>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-xl border ${result.isCorrect ? 'bg-emerald-950/25 border-emerald-800/60' : 'bg-red-950/25 border-red-900/60'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {result.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
                                <h4 className={`text-xs font-bold ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.isCorrect ? 'Patch Verified' : 'Verification Failed'}
                                </h4>
                            </div>
                            <p className="text-neutral-200 text-xs leading-relaxed">{result.feedback}</p>

                            {result.isCorrect && (
                                <button
                                    onClick={onClose}
                                    className="btn-primary mt-4 w-full py-2 rounded-lg text-xs font-semibold"
                                >
                                    Claim XP &amp; Close
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <CodeEditor
                            value={editorCode}
                            onChange={(val) => setEditorCode(val || '')}
                            height="100%"
                            language={challenge.language.toLowerCase()}
                        />
                    </div>

                    {!result?.isCorrect && (
                        <div className="p-4 border-t border-white/[0.08] bg-[#080a0f] flex justify-end">
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="btn-primary px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play size={14} />}
                                <span>Verify Fix</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BugHunterModal;
