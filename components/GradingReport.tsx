import React, { useState } from 'react';
import { GradingResult } from '../types';
import { CheckCircle, AlertTriangle, Lightbulb, Award, ShieldCheck } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import CertificateModal from './CertificateModal';

interface GradingReportProps {
  result: GradingResult;
  projectTitle?: string;
  careerTitle?: string;
  onRetry: () => void;
  onContinue: () => void;
}

const GradingReport: React.FC<GradingReportProps> = ({
  result,
  projectTitle = 'Engineering Assignment',
  careerTitle = 'Software Engineering',
  onRetry,
  onContinue
}) => {
  const { user } = useAuth();
  const [showCertModal, setShowCertModal] = useState(false);

  const skillMatrix = result.skillMatrix || {
    coding: 50,
    logic: 50,
    creativity: 50,
    bestPractices: 50,
    completeness: 50
  };
  const strengths = Array.isArray(result.strengths) ? result.strengths : [];
  const weaknesses = Array.isArray(result.weaknesses) ? result.weaknesses : [];
  const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];

  const chartData = [
    { subject: 'Coding', A: skillMatrix.coding, fullMark: 100 },
    { subject: 'Logic', A: skillMatrix.logic, fullMark: 100 },
    { subject: 'Creativity', A: skillMatrix.creativity, fullMark: 100 },
    { subject: 'Best Practices', A: skillMatrix.bestPractices, fullMark: 100 },
    { subject: 'Completeness', A: skillMatrix.completeness, fullMark: 100 },
  ];

  const isPassed = result.score >= 70;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Score & Summary Card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 surface-card p-6 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="surface-recessed rounded-xl px-5 py-4 text-center min-w-[110px]">
            <div className={`text-3xl font-bold font-mono tabular-nums ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {result.score}
            </div>
            <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mt-1">
              Score / 100
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className={`text-xs font-mono uppercase tracking-wider ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPassed ? '● Assessment Passed' : '▲ Revision Recommended'}
              </span>
              <span className="text-white/15">·</span>
              <span className="text-xs font-mono text-indigo-400 tabular-nums">
                +{result.xpAwarded} XP
              </span>
              {result.testTotalCount !== undefined && (
                <>
                  <span className="text-white/15">·</span>
                  <span className="text-xs font-mono text-slate-300">
                    {result.testPassCount ?? result.testTotalCount}/{result.testTotalCount} Unit Tests Passed
                  </span>
                </>
              )}
              {result.verificationHash && (
                <>
                  <span className="text-white/15">·</span>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {result.verificationHash}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              {isPassed ? 'Requirements Verified' : 'Changes Requested'}
            </h2>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              {result.feedbackSummary}
            </p>
          </div>
        </div>

        {isPassed && (
          <button
            onClick={() => setShowCertModal(true)}
            className="btn-secondary px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 border-indigo-500/30 text-indigo-300 hover:text-white"
          >
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Verified Credential & Share</span>
          </button>
        )}
      </div>

      {/* Radar Chart & Strengths/Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface-card p-6 rounded-xl flex flex-col items-center justify-center min-h-[280px]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 w-full text-left">
            Competency Breakdown
          </h3>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.22}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5 rounded-xl">
            <h4 className="text-emerald-400 text-xs font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> What Worked Well
            </h4>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="text-slate-300 text-xs flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 font-mono">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card p-5 rounded-xl">
            <h4 className="text-amber-400 text-xs font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Areas to Improve
            </h4>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-slate-300 text-xs flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-400 font-mono">-</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="surface-card p-6 rounded-xl">
        <h4 className="text-indigo-400 text-xs font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5" /> Code Review Notes
        </h4>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <p key={i} className="text-slate-300 text-xs leading-relaxed">
              • {s}
            </p>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onRetry}
          className="btn-secondary px-5 py-2.5 rounded-lg text-xs font-medium"
        >
          Revise Code
        </button>
        {isPassed && (
          <button
            onClick={onContinue}
            className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-xs"
          >
            Complete Assignment
          </button>
        )}
      </div>

      {showCertModal && (
        <CertificateModal
          user={user}
          projectItem={{
            ...result,
            projectId: projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            projectTitle,
            timestamp: Date.now()
          }}
          careerTitle={careerTitle}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};

export default GradingReport;
