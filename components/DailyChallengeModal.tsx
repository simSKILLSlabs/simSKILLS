
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Code, Brain } from 'lucide-react';
import { Challenge } from '../types';

interface DailyChallengeModalProps {
    challenge: Challenge;
    onClose: () => void;
    onComplete: (xp: number) => void;
}

const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ challenge, onClose, onComplete }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSubmit = () => {
        if (!selectedOption && challenge.type === 'quiz') return;

        // For bug fix, we assume "Show Answer" is the interaction for now, 
        // or if we had a text input we would check it. 
        // To keep it simple and 2-min length, we'll treat Bug Fix as a self-graded reveal or simple choice if existing.

        let correct = false;
        if (challenge.type === 'quiz') {
            correct = selectedOption === challenge.correctAnswer;
        } else {
            // Bug Fix logic: For now, just revealing the answer counts as "completing" a lesson, 
            // but strictly speaking, let's make it so they have to click "I fixed it" or "Reveal Solution".
            // Actually, let's just use the Reveal pattern for Bug Fix to ensure they read it.
            correct = true;
        }

        setIsCorrect(correct);
        setIsSubmitted(true);

        if (correct) {
            setTimeout(() => onComplete(challenge.xpAward), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 relative animate-[fadeIn_0.3s_ease-out] border border-white/10">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${challenge.type === 'quiz' ? 'bg-purple-500/20' : 'bg-rose-500/20'}`}>
                            {challenge.type === 'quiz' ? <Brain className="text-purple-400" size={24} /> : <Code className="text-rose-400" size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Daily {challenge.type === 'quiz' ? 'Trivia' : 'Bug Hunt'}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    +{challenge.xpAward} XP
                                </span>
                                <span className="text-xs text-gray-400">{challenge.difficulty}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <h3 className="text-lg text-gray-200 mb-4 leading-relaxed font-medium">
                        {challenge.question}
                    </h3>

                    {challenge.codeSnippet && (
                        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 font-mono text-sm text-gray-300 overflow-x-auto mb-6 shadow-inner">
                            <pre>{challenge.codeSnippet}</pre>
                        </div>
                    )}

                    {challenge.type === 'quiz' && challenge.options ? (
                        <div className="space-y-3">
                            {challenge.options.map((option, idx) => {
                                let stateClass = "border-white/10 hover:bg-white/5 hover:border-white/20";
                                if (isSubmitted) {
                                    if (option === challenge.correctAnswer) stateClass = "border-emerald-500/50 bg-emerald-500/20 text-emerald-100";
                                    else if (option === selectedOption) stateClass = "border-rose-500/50 bg-rose-500/20 text-rose-100";
                                    else stateClass = "border-white/10 opacity-50";
                                } else if (selectedOption === option) {
                                    stateClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-100";
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={isSubmitted}
                                        onClick={() => setSelectedOption(option)}
                                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${stateClass}`}
                                    >
                                        <span>{option}</span>
                                        {isSubmitted && option === challenge.correctAnswer && <CheckCircle size={18} className="text-emerald-400" />}
                                        {isSubmitted && option === selectedOption && option !== challenge.correctAnswer && <XCircle size={18} className="text-rose-400" />}
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        // Bug Fix Reveal View
                        <div className="mt-4">
                            {!isSubmitted ? (
                                <div className="p-6 border border-dashed border-white/20 rounded-xl text-center bg-white/5">
                                    <p className="text-gray-400 mb-4">Analyze the code above. When you think you've found the bug...</p>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Reveal Solution
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                    <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                                        <CheckCircle size={18} /> Solution
                                    </h4>
                                    <p className="text-gray-200 leading-relaxed">{challenge.correctAnswer}</p>
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
                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            Submit Answer
                        </button>
                    </div>
                )}

                {isSubmitted && (
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <h4 className="text-blue-300 font-semibold mb-1 text-sm uppercase tracking-wider">Explanation</h4>
                        <p className="text-gray-300 text-sm">{challenge.explanation}</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DailyChallengeModal;
