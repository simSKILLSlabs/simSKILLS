import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface PricingModalProps {
    onSelect: (isPro: boolean) => void;
    onClose: () => void;
    message?: string | null;
}

const PricingModal: React.FC<PricingModalProps> = ({ onSelect, onClose, message }) => {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="surface-card relative w-full max-w-4xl rounded-2xl p-6 md:p-10 my-8">
                <button
                    onClick={onClose}
                    className="btn-secondary absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="max-w-xl mb-8">
                    {message && (
                        <p className="text-xs font-mono text-amber-400 mb-2">
                            {message}
                        </p>
                    )}
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Plans &amp; Pricing
                    </h2>
                    <p className="text-neutral-300/85 text-xs md:text-sm mt-1">
                        Start for free on the Hobby plan or upgrade to Pro for unlimited curriculum tracks and extended 15-chapter roadmaps.
                    </p>
                </div>

                {/* Segmented Billing Toggle */}
                <div className="inline-flex p-1 surface-recessed rounded-xl mb-8">
                    <button
                        onClick={() => setBilling('monthly')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            billing === 'monthly' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBilling('yearly')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            billing === 'yearly' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        <span>Yearly (Save 20%)</span>
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Hobby Tier */}
                    <div className="surface-recessed rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="mb-6">
                                <h3 className="text-base font-bold text-white">Hobby</h3>
                                <p className="text-neutral-400 text-xs mt-0.5">For individuals exploring core tracks.</p>
                            </div>

                            <div className="mb-6 pb-6 border-b border-white/[0.08]">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white font-mono tabular-nums">$0</span>
                                    <span className="text-xs text-neutral-500 font-mono">/ month</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 text-xs">
                                <li className="flex items-center gap-2.5 text-neutral-200">
                                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                    <span>Up to 2 active learning tracks</span>
                                </li>
                                <li className="flex items-center gap-2.5 text-neutral-200">
                                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                    <span>5 foundational chapters per track</span>
                                </li>
                                <li className="flex items-center gap-2.5 text-neutral-200">
                                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                    <span>Automated code review &amp; grading</span>
                                </li>
                                <li className="flex items-center gap-2.5 text-neutral-500">
                                    <X className="w-3.5 h-3.5 shrink-0" />
                                    <span>Chapters 6–15 advanced extensions</span>
                                </li>
                                <li className="flex items-center gap-2.5 text-neutral-500">
                                    <X className="w-3.5 h-3.5 shrink-0" />
                                    <span>Unlimited Practice Arena generator</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => onSelect(false)}
                            className="btn-secondary w-full py-2.5 rounded-lg text-xs font-semibold"
                        >
                            Continue with Hobby
                        </button>
                    </div>

                    {/* Pro Tier */}
                    <div className="surface-card border-white/25 rounded-2xl p-6 flex flex-col justify-between relative">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-white">Pro</h3>
                                    <p className="text-neutral-300/80 text-xs mt-0.5">For dedicated engineers and career switchers.</p>
                                </div>
                                <span className="text-[11px] font-mono text-indigo-300">
                                    Recommended
                                </span>
                            </div>

                            <div className="mb-6 pb-6 border-b border-white/[0.08]">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white font-mono tabular-nums">
                                        {billing === 'monthly' ? '$5' : '$4'}
                                    </span>
                                    <span className="text-xs text-neutral-400 font-mono">/ month</span>
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-1">
                                    {billing === 'monthly' ? 'Billed monthly' : 'Billed $48 annually'}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8 text-xs">
                                {[
                                    'Unlimited active learning tracks',
                                    'Full 15-chapter curriculum extensions',
                                    'Unlimited Practice Arena assignments',
                                    'Unlimited Daily Bug Hunter sandboxes',
                                    'Full submission & code review history',
                                    'Track management & deletion controls'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-neutral-100">
                                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => onSelect(true)}
                            className="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold"
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
