import React from 'react';
import { ArrowUpRight, Database, Layout, Server, Cpu } from 'lucide-react';

interface PopularPathsProps {
    onSelect: (career: string) => void;
}

const paths = [
    {
        title: "Frontend Engineer",
        icon: Layout,
        stack: "HTML · CSS · TypeScript · React",
        desc: "Build responsive interfaces, state management, and modern web applications."
    },
    {
        title: "Backend Engineer",
        icon: Server,
        stack: "Node.js · SQL · REST APIs · Auth",
        desc: "Design scalable server architectures, relational databases, and APIs."
    },
    {
        title: "Data Scientist",
        icon: Database,
        stack: "Python · SQL · Pandas · ML",
        desc: "Analyze datasets, build statistical pipelines, and train machine learning models."
    },
    {
        title: "AI & Systems Engineer",
        icon: Cpu,
        stack: "Python · LLMs · Vector DBs · APIs",
        desc: "Build production AI applications, retrieval pipelines, and autonomous workflows."
    }
];

const PopularPaths: React.FC<PopularPathsProps> = ({ onSelect }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paths.map((path, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(path.title)}
                        className="group surface-interactive rounded-2xl p-5 text-left flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-9 h-9 rounded-xl surface-recessed flex items-center justify-center text-indigo-300 group-hover:text-white transition-colors">
                                    <path.icon size={17} />
                                </div>
                                <ArrowUpRight
                                    size={15}
                                    className="text-neutral-500 group-hover:text-white transition-colors"
                                />
                            </div>

                            <h4 className="font-bold text-white text-sm mb-1 tracking-tight">
                                {path.title}
                            </h4>
                            <p className="text-[11px] font-mono text-indigo-300/80 mb-3">
                                {path.stack}
                            </p>
                            <p className="text-xs text-neutral-300/80 leading-relaxed line-clamp-2">
                                {path.desc}
                            </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-neutral-400 group-hover:text-white transition-colors">
                            <span>Initialize track</span>
                            <span className="font-mono text-[11px] tabular-nums">5–15 chapters</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PopularPaths;
