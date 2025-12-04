import React from 'react';
import { GradingResult } from '../types';
import { CheckCircle, AlertTriangle, Lightbulb, Star } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface GradingReportProps {
    result: GradingResult;
    onClose?: () => void;
    actionButton?: React.ReactNode;
}

const GradingReport: React.FC<GradingReportProps> = ({ result, onClose, actionButton }) => {
    const chartData = [
        { subject: 'Coding', A: result.skillMatrix.coding, fullMark: 100 },
        { subject: 'Logic', A: result.skillMatrix.logic, fullMark: 100 },
        { subject: 'Creativity', A: result.skillMatrix.creativity, fullMark: 100 },
        { subject: 'Practices', A: result.skillMatrix.bestPractices, fullMark: 100 },
        { subject: 'Complete', A: result.skillMatrix.completeness, fullMark: 100 },
    ];

    return (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
            {/* Left Column: Report */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className={`text-5xl font-bold ${result.score >= 80 ? 'text-emerald-400' : result.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {result.score}
                        <span className="text-lg text-gray-500 font-normal ml-1">/100</span>
                    </div>
                    <div className="bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-700/30 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-yellow-200 font-bold text-sm">+{result.xpAwarded} XP</span>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-2">Verdict</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{result.feedbackSummary}</p>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                        {result.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-gray-400 flex gap-2">
                                <span className="text-gray-600">•</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" /> Weaknesses
                    </h4>
                    <ul className="space-y-2">
                        {result.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-gray-400 flex gap-2">
                                <span className="text-gray-600">•</span> {w}
                            </li>
                        ))}
                    </ul>
                </div>

                {actionButton && (
                    <div className="mt-4">
                        {actionButton}
                    </div>
                )}
            </div>

            {/* Right Column: Visualization & Tips */}
            <div className="space-y-6">
                <div className="h-64 w-full bg-gray-900/30 rounded-xl border border-gray-800 relative">
                    <p className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Skill Matrix</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Skill"
                                dataKey="A"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="#10b981"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-emerald-900/10 border border-emerald-900/30 p-5 rounded-xl">
                    <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Recommended Actions
                    </h4>
                    <ul className="space-y-3">
                        {result.suggestions.map((tip, i) => (
                            <li key={i} className="text-sm text-gray-300 border-l-2 border-emerald-500/30 pl-3">
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GradingReport;
