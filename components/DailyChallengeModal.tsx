import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Code, Terminal, Loader2 } from 'lucide-react';
import { Challenge } from '../types';
import { generateDailyChallenge } from '../services/geminiService';
import CodeEditor from './ide/CodeEditor';
import { toast } from 'sonner';

interface DailyChallengeModalProps {
    challenge?: Challenge;
    userLevel?: number;
    careerFocus?: string;
    onClose: () => void;
    onComplete: (xp: number) => void;
}

const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
    challenge: initialChallenge,
    userLevel = 1,
    careerFocus = "Computer Science",
    onClose,
    onComplete
}) => {
    const [challenge, setChallenge] = useState<Challenge | null>(initialChallenge || null);
    const [loading, setLoading] = useState(!initialChallenge);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [codeVal, setCodeVal] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (!initialChallenge) {
            setLoading(true);
            generateDailyChallenge(userLevel, careerFocus)
                .then(data => {
                    setChallenge(data);
                    if (data.codeSnippet) setCodeVal(data.codeSnippet);
                })
                .catch(() => {
                    toast.error("Failed to load daily challenge.");
                    onClose();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (initialChallenge.codeSnippet) {
            setCodeVal(initialChallenge.codeSnippet);
        }
    }, [initialChallenge, userLevel, careerFocus]);

    const handleSubmit = () => {
        if (!challenge) return;
        if (!selectedOption && challenge.type === 'quiz') return;

        let correct = false;
        if (challenge.type === 'quiz') {
            correct = selectedOption === challenge.correctAnswer;
        } else {
            correct = true;
        }

        setIsCorrect(correct);
        setIsSubmitted(true);

        if (correct) {
            setTimeout(() => {
                onComplete(challenge.xpAward);
                onClose();
            }, 1600);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="surface-card w-full max-w-2xl rounded-2xl p-6 md:p-8 relative">
                {loading || !challenge ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                        <p className="text-xs font-mono text-neutral-400">Loading Daily Challenge...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/[0.08]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl surface-recessed flex items-center justify-center text-indigo-300">
                                    {challenge.type === 'quiz' ? <Terminal size={17} /> : <Code size={17} />}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white tracking-tight">
                                        Daily {challenge.type === 'quiz' ? 'Technical Question' : 'Code Fix'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-indigo-300/90">
                                        <span>+{challenge.xpAward} XP</span>
                                        <span>·</span>
                                        <span className="text-neutral-400">{challenge.difficulty}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="btn-secondary w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            <h3 className="text-sm md:text-base text-neutral-200 mb-4 leading-relaxed font-medium">
                                {challenge.question}
                            </h3>

                            {challenge.codeSnippet && (
                                <div className="mb-6 rounded-xl overflow-hidden surface-recessed">
                                    <CodeEditor
                                        value={codeVal}
                                        onChange={(v) => setCodeVal(v || '')}
                                        readOnly={isSubmitted}
                                        height="260px"
                                        language="javascript"
                                    />
                                </div>
                            )}

                            {challenge.type === 'quiz' && challenge.options ? (
                                <div className="space-y-2.5">
                                    {challenge.options.map((option, idx) => {
                                        let stateClass = "surface-recessed text-neutral-200 hover:border-white/20";
                                        if (isSubmitted) {
                                            if (option === challenge.correctAnswer) stateClass = "border border-emerald-500/50 bg-emerald-950/30 text-emerald-300";
                                            else if (option === selectedOption) stateClass = "border border-red-800 bg-red-950/25 text-red-300";
                                            else stateClass = "surface-recessed opacity-50";
                                        } else if (selectedOption === option) {
                                            stateClass = "surface-card border-white/40 text-white";
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                disabled={isSubmitted}
                                                onClick={() => setSelectedOption(option)}
                                                className={`w-full p-3.5 rounded-xl text-left text-xs md:text-sm transition-all flex items-center justify-between ${stateClass}`}
                                            >
                                                <span>{option}</span>
                                                {isSubmitted && option === challenge.correctAnswer && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                                                {isSubmitted && option === selectedOption && option !== challenge.correctAnswer && <XCircle size={16} className="text-red-400 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mt-4">
                                    {!isSubmitted ? (
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={handleSubmit}
                                                className="btn-primary px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2"
                                            >
                                                <Code size={14} /> Submit Fix
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="surface-recessed p-4 rounded-xl">
                                            <h4 className="text-emerald-400 text-xs font-mono mb-2 flex items-center gap-1.5">
                                                <CheckCircle size={14} /> Reference Solution
                                            </h4>
                                            <pre className="p-3 bg-[#050609] border border-white/[0.06] rounded-lg font-mono text-xs text-neutral-200 overflow-x-auto">
                                                {challenge.correctAnswer}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer (Quiz only submit button) */}
                        {challenge.type === 'quiz' && !isSubmitted && (
                            <div className="flex justify-end">
                                <button
                                    disabled={!selectedOption}
                                    onClick={handleSubmit}
                                    className="btn-primary px-6 py-2.5 text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Submit Answer
                                </button>
                            </div>
                        )}

                        {isSubmitted && (
                            <div className="mt-4 p-4 surface-recessed rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-mono text-indigo-300/90">Explanation</h4>
                                    {!isCorrect && (
                                        <button
                                            onClick={onClose}
                                            className="text-xs font-semibold text-white underline"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                                <p className="text-neutral-200 text-xs leading-relaxed">{challenge.explanation}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyChallengeModal;
