

import React, { useEffect, useState } from 'react';
import { Bot, Lightbulb } from 'lucide-react';

interface LoaderProps {
    text?: string;
}

const TIPS = [
    "Consistency is key. Code a little every day.",
    "The best way to learn is by doing. Build projects!",
    "Don't be afraid to break things. That's how you learn.",
    "Read the error message. It's trying to help you.",
    "Refactoring is just part of the process.",
    "SimSkill Pro Tip: Use the 'Practice Arena' to test new skills.",
    "Documentation is your best friend.",
    "A senior developer is just a junior who didn't give up.",
    "Debug with print statements if you have to. No shame.",
    "Take breaks. Your brain solves problems while you rest.",
    "Fact: The first computer bug was an actual moth.",
    "Comments explain 'why', code explains 'how'."
];

const Loader: React.FC<LoaderProps> = ({ text = "LOADING" }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Pick a random tip on mount
    setTipIndex(Math.floor(Math.random() * TIPS.length));

    // Progress Bar Animation
    const interval = setInterval(() => {
        setProgress(p => {
            if (p >= 100) {
                clearInterval(interval);
                return 100;
            }
            // Non-linear progress simulation for a more natural feel
            return p + (Math.random() * 3); 
        });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-8 animate-fade-in text-white">
        {/* Background Ambience */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-md w-full text-center space-y-10">
            
            {/* Mascot / Icon Animation */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                 <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                 <div className="relative bg-gradient-to-tr from-gray-800 to-black p-5 rounded-2xl border border-gray-700 shadow-2xl animate-bounce">
                    <Bot className="w-10 h-10 text-emerald-400" />
                 </div>
            </div>

            {/* Main Text */}
            <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight uppercase">{text}</h2>
                <div className="flex justify-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
            </div>

            {/* Simple Text Tip (Removed Box) */}
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-yellow-400">
                    <Lightbulb className="w-4 h-4 fill-yellow-400/20" />
                    <span className="text-xs font-bold uppercase tracking-widest text-yellow-500/80">System Tip</span>
                </div>
                <p className="text-gray-400 text-sm font-medium leading-relaxed italic max-w-xs mx-auto">
                    "{TIPS[tipIndex]}"
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden border border-gray-800">
                <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden" 
                    style={{ width: `${progress}%` }} 
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] -skew-x-12"></div>
                </div>
            </div>
            
            <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">{Math.floor(progress)}% Complete</p>
        </div>
    </div>
  );
};

export default Loader;