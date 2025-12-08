
import React from 'react';
import { ArrowRight, Sparkles, Database, Layout, Server, Cpu } from 'lucide-react';

interface PopularPathsProps {
    onSelect: (career: string) => void;
}

const paths = [
    {
        title: "Frontend Developer",
        icon: Layout,
        color: "from-pink-500 to-rose-500",
        desc: "Master React, CSS, and modern UI.",
        demand: "High"
    },
    {
        title: "Backend Engineer",
        icon: Server,
        color: "from-blue-500 to-cyan-500",
        desc: "Build APIs, databases, and scalable logic.",
        demand: "Very High"
    },
    {
        title: "Data Scientist",
        icon: Database,
        color: "from-emerald-500 to-green-500",
        desc: "Analyze data, build ML models & AI.",
        demand: "Explosive"
    },
    {
        title: "AI Engineer",
        icon: Brain, // Using Sparkles as generic AI if Brain not imported, but let's import Brain
        color: "from-purple-500 to-violet-500",
        desc: "Create LLMs, agents, and neural nets.",
        demand: "Top Tier"
    }
];

// Helper to make sure we have the icon
import { Brain } from 'lucide-react';

const PopularPaths: React.FC<PopularPathsProps> = ({ onSelect }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paths.map((path, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(path.title)}
                        className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-left hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1"
                    >
                        {/* Hover Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${path.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <path.icon size={20} className="text-white" />
                            </div>

                            <h4 className="font-semibold text-white text-lg mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                                {path.title}
                            </h4>
                            <p className="text-xs text-gray-400 font-medium mb-3">{path.demand} Demand</p>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                {path.desc}
                            </p>

                            <div className="flex items-center text-xs text-white/50 font-medium group-hover:text-white transition-colors">
                                Start Path <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PopularPaths;
