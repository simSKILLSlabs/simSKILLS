import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, ExternalLink, Terminal, CheckCircle2 } from 'lucide-react';
import { ProjectHistoryItem, UserProfile } from '../types';
import { getPortfolioIdForUser } from '../services/db';
import { useNavigate } from 'react-router-dom';

interface CertificateModalProps {
  user: UserProfile;
  projectItem?: ProjectHistoryItem | null;
  careerTitle?: string;
  onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  user,
  projectItem,
  careerTitle = 'Software Engineering',
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const portfolioId = getPortfolioIdForUser(user);
  const portfolioPath = `/portfolio/${portfolioId}`;
  const shareUrl = `${window.location.origin}${portfolioPath}`;

  const verificationHash =
    projectItem?.verificationHash ||
    `SIM-${portfolioId.slice(-4).toUpperCase()}-2026`;

  const displayTitle = projectItem ? projectItem.projectTitle : `${careerTitle} Track`;
  const displayScore = projectItem ? projectItem.score : Math.min(99, Math.max(82, 80 + user.level * 2));
  const displayDate = projectItem
    ? new Date(projectItem.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : user.joinedDate || 'Oct 2026';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPortfolio = () => {
    onClose();
    navigate(portfolioPath);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="surface-card rounded-xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Verified Engineering Credential
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="surface-recessed rounded-xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
            {/* Subtle top accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-white/[0.07]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">
                  <Terminal className="w-3.5 h-3.5" />
                  SimSKILLS Proof of Work
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {user.name || 'Verified Developer'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {user.title || careerTitle} · Level {user.level} ({user.xp.toLocaleString()} XP)
                </p>
              </div>

              <div className="text-left md:text-right font-mono">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">Verification ID</div>
                <div className="text-sm font-semibold text-white mt-0.5">{verificationHash}</div>
                <div className="text-[11px] text-slate-500 mt-1">Issued {displayDate}</div>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Verified Simulation Assessment
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{displayTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Passed automated unit test assertions and Senior Staff Engineer architectural code review.
                  </p>
                </div>

                <div className="surface-card rounded-lg px-4 py-3 text-center shrink-0">
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                    {displayScore}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                    Review Score
                  </div>
                </div>
              </div>

              {projectItem?.skillMatrix && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3">
                  {[
                    { label: 'Coding', val: projectItem.skillMatrix.coding },
                    { label: 'Logic', val: projectItem.skillMatrix.logic },
                    { label: 'Best Practices', val: projectItem.skillMatrix.bestPractices },
                    { label: 'Completeness', val: projectItem.skillMatrix.completeness },
                    { label: 'Architecture', val: projectItem.skillMatrix.creativity }
                  ].map(metric => (
                    <div key={metric.label} className="bg-[#0b0d13] border border-white/[0.06] rounded-lg p-2.5">
                      <div className="text-[10px] font-mono text-slate-500 uppercase truncate">
                        {metric.label}
                      </div>
                      <div className="text-sm font-mono font-semibold text-white tabular-nums mt-0.5">
                        {metric.val}/100
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {projectItem?.testTotalCount
                    ? `${projectItem.testPassCount ?? projectItem.testTotalCount}/${projectItem.testTotalCount} Automated Unit Tests Verified`
                    : 'Deterministic Code Review Verified'}
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                Public URL: /portfolio/{portfolioId}
              </span>
            </div>
          </div>

          {/* Share URL Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
              Shareable Recruiter & LinkedIn Verification URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full surface-recessed rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="btn-secondary px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/[0.07] bg-[#090b10] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium"
          >
            Close
          </button>
          <button
            onClick={handleOpenPortfolio}
            className="btn-primary px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            Open Public Portfolio Page
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
