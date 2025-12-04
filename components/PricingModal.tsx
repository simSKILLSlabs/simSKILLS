
import React, { useState } from 'react';
import { Check, X, Zap, Crown, Sparkles } from 'lucide-react';

interface PricingModalProps {
    onSelect: (isPro: boolean) => void;
    onClose: () => void;
    message?: string | null;
}

const PricingModal: React.FC<PricingModalProps> = ({ onSelect, onClose, message }) => {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-5xl">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-4 md:right-0 text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                >
                    <X className="w-4 h-4" />
                    Close
                </button>

                <div className="text-center mb-10">
                    {message && (
                        <div className="mb-6 inline-block bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg">
                            <p className="text-yellow-500 font-bold text-sm flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                {message}
                            </p>
                        </div>
                    )}
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Invest in your <span className="text-emerald-500">Source Code</span>.
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Unlock the full potential of the AI architect. Build unlimited projects, get deep-dive grading, and fast-track your career.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-[#0a0a0a] border border-gray-800 p-1 rounded-full flex relative">
                        <button
                            onClick={() => setBilling('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative z-10 ${billing === 'monthly' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBilling('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative z-10 flex items-center gap-2 ${billing === 'yearly' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Yearly
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${billing === 'yearly' ? 'bg-black/10 border-black/20 text-black' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'}`}>
                                -20%
                            </span>
                        </button>

                        {/* Sliding Background */}
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full transition-all duration-300 ease-out shadow-lg ${billing === 'monthly' ? 'left-1' : 'left-[calc(50%+0px)]'}`}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 px-4 md:px-0">
                    {/* Free Tier */}
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 flex flex-col hover:border-gray-700 transition-all duration-300 group relative overflow-hidden">
                        <div className="mb-8 z-10">
                            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                                <Zap className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                            <p className="text-gray-500 text-sm">Essential tools for beginners.</p>
                        </div>

                        <div className="mb-8 z-10">
                            <div className="text-5xl font-bold text-white tracking-tight">$0</div>
                            <div className="text-gray-500 text-sm mt-2 font-medium">Forever free.</div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1 z-10">
                            <li className="flex gap-3 text-sm text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                Max 2 Active Simulations
                            </li>
                            <li className="flex gap-3 text-sm text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                Basic Project Grading
                            </li>
                            <li className="flex gap-3 text-sm text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                Standard Speed
                            </li>
                            <li className="flex gap-3 text-sm text-gray-500 opacity-50">
                                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                    <X className="w-3 h-3" />
                                </div>
                                Infinite Practice Arena
                            </li>
                            <li className="flex gap-3 text-sm text-gray-500 opacity-50">
                                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                    <X className="w-3 h-3" />
                                </div>
                                Grading History & Trends
                            </li>
                        </ul>

                        <button
                            onClick={() => onSelect(false)}
                            className="w-full py-4 rounded-xl border border-gray-800 text-white font-bold hover:bg-white hover:text-black transition-all z-10"
                        >
                            Continue Free
                        </button>
                    </div>

                    {/* Pro Tier */}
                    <div className="relative bg-[#050505] border border-emerald-500/30 rounded-3xl p-8 flex flex-col shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)] hover:shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)] transition-all duration-500 group overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Best Value
                        </div>

                        <div className="mb-8 z-10">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Crown className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Pro Architect</h3>
                            <p className="text-emerald-400/80 text-sm">For serious career switchers.</p>
                        </div>

                        <div className="mb-8 z-10">
                            <div className="flex items-baseline gap-2">
                                <div className="text-5xl font-bold text-white tracking-tight">
                                    {billing === 'monthly' ? '$5' : '$4'}
                                </div>
                                <span className="text-gray-400 font-medium">/mo</span>
                            </div>
                            <div className="text-gray-500 text-sm mt-2 font-medium">
                                {billing === 'monthly' ? 'Billed monthly.' : <span className="text-emerald-400">Billed $48 yearly. Save 20%.</span>}
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1 z-10">
                            {[
                                'Unlimited Simulations',
                                'Delete Simulations',
                                'Grading History & Trends',
                                'Infinite Practice Project Generator',
                                'Advanced AI Grading',
                                'Priority Support'
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-200">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-black" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => onSelect(true)}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all z-10"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
