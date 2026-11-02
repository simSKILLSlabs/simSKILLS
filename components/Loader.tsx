import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
    text?: string;
}

const TIPS = [
    "Consistency beats intensity. Complete one chapter at a time.",
    "Read the code output carefully before writing your assignment solution.",
    "Each chapter builds directly on concepts from earlier chapters.",
    "Use the Practice Arena to generate additional exercises on demand.",
    "Break larger problems down into small, testable functions.",
    "Comments explain why a decision was made; code explains how it works."
];

const Loader: React.FC<LoaderProps> = ({ text = "Loading Workspace" }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * TIPS.length));

    const interval = setInterval(() => {
        setProgress(p => {
            if (p >= 96) {
                clearInterval(interval);
                return 96;
            }
            return p + (Math.random() * 4);
        });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#06070a]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in text-[#f0f2f5]">
        <div className="surface-card max-w-sm w-full rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span className="text-xs font-semibold text-white tracking-tight">
                        {text}
                    </span>
                </div>
                <span className="text-xs font-mono text-indigo-300 tabular-nums">
                    {Math.floor(progress)}%
                </span>
            </div>

            {/* Luminous Progress Bar */}
            <div className="w-full surface-recessed rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-white rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed">
                {TIPS[tipIndex]}
            </p>
        </div>
    </div>
  );
};

export default Loader;