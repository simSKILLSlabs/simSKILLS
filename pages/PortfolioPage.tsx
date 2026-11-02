import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getPublicPortfolio,
  buildPortfolioSnapshot,
  getPortfolioIdForUser
} from '../services/db';
import { PublicPortfolioSnapshot, ProjectHistoryItem } from '../types';
import {
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  Code2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { SEO } from '../components/SEO';
import CertificateModal from '../components/CertificateModal';

const PortfolioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [portfolio, setPortfolio] = useState<PublicPortfolioSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [selectedCertProject, setSelectedCertProject] = useState<ProjectHistoryItem | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    const loadPortfolio = async () => {
      setLoading(true);
      const currentUserId = user.isLoggedIn ? getPortfolioIdForUser(user) : '';

      if (user.isLoggedIn && (id === 'me' || id === currentUserId)) {
        setPortfolio(buildPortfolioSnapshot(user));
        setLoading(false);
        return;
      }

      if (id) {
        const fetched = await getPublicPortfolio(id);
        if (fetched) {
          setPortfolio(fetched);
          setLoading(false);
          return;
        }
      }

      if (user.isLoggedIn) {
        setPortfolio(buildPortfolioSnapshot(user));
      }
      setLoading(false);
    };

    loadPortfolio();
  }, [id, user]);

  const handleCopyShareUrl = () => {
    const slug = portfolio?.portfolioId || id || 'me';
    const url = `${window.location.origin}/portfolio/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Loading Verified Engineering Portfolio...
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="surface-card rounded-xl p-8 max-w-md w-full space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-rose-400">
            404 · Record Not Found
          </div>
          <h1 className="text-xl font-bold text-white">Portfolio Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            No verified developer portfolio matches ID <span className="font-mono text-white">{id}</span>.
          </p>
          <button
            onClick={() => navigate(user.isLoggedIn ? '/dashboard' : '/')}
            className="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold"
          >
            {user.isLoggedIn ? 'Return to Workspace' : 'Explore SimSKILLS'}
          </button>
        </div>
      </div>
    );
  }

  const projects = portfolio.verifiedProjects || [];
  const passedProjects = projects.filter(p => p.score >= 70);
  const avgScore =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.score, 0) / projects.length)
      : 0;

  // Compute aggregate 5-axis skill matrix across all submissions
  const aggregateMatrix = projects.length > 0
    ? {
        coding: Math.round(projects.reduce((s, p) => s + (p.skillMatrix?.coding || 75), 0) / projects.length),
        logic: Math.round(projects.reduce((s, p) => s + (p.skillMatrix?.logic || 75), 0) / projects.length),
        bestPractices: Math.round(projects.reduce((s, p) => s + (p.skillMatrix?.bestPractices || 75), 0) / projects.length),
        completeness: Math.round(projects.reduce((s, p) => s + (p.skillMatrix?.completeness || 75), 0) / projects.length),
        creativity: Math.round(projects.reduce((s, p) => s + (p.skillMatrix?.creativity || 75), 0) / projects.length)
      }
    : {
        coding: 82,
        logic: 85,
        bestPractices: 78,
        completeness: 88,
        creativity: 80
      };

  const radarData = [
    { subject: 'Coding', A: aggregateMatrix.coding, fullMark: 100 },
    { subject: 'Logic', A: aggregateMatrix.logic, fullMark: 100 },
    { subject: 'Best Practices', A: aggregateMatrix.bestPractices, fullMark: 100 },
    { subject: 'Completeness', A: aggregateMatrix.completeness, fullMark: 100 },
    { subject: 'Architecture', A: aggregateMatrix.creativity, fullMark: 100 }
  ];

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title={`${portfolio.name} — Verified Engineering Portfolio | SimSKILLS`}
        description={`Verified software engineering simulations, code reviews, and architectural assessments for ${portfolio.name}.`}
      />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 h-14 border-b border-white/[0.07] bg-[#06070a]/85 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(user.isLoggedIn ? '/dashboard' : '/')}
            className="text-slate-400 hover:text-white flex items-center gap-2 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{user.isLoggedIn ? 'Workspace' : 'SimSKILLS Home'}</span>
          </button>
          <span className="text-white/15">|</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Verified Proof-of-Work Record
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedCertProject(passedProjects[0] || projects[0] || null);
              setShowCertModal(true);
            }}
            className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Credential Card</span>
          </button>
          <button
            onClick={handleCopyShareUrl}
            className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share Portfolio</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-8">
        {/* Hero Developer Profile + 5-Axis Radar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Developer Identity & Key Metrics */}
          <div className="lg:col-span-7 surface-card rounded-xl p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  ID: {portfolio.portfolioId}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Member since {portfolio.joinedDate}
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {portfolio.name}
                </h1>
                <p className="text-sm font-medium text-slate-300 mt-1">
                  {portfolio.title}
                </p>
              </div>

              <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl">
                {portfolio.bio}
              </p>
            </div>

            {/* 4 Key Telemetry KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.07]">
              <div className="surface-recessed rounded-lg p-3.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Verified Builds
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                  {passedProjects.length}
                </div>
              </div>
              <div className="surface-recessed rounded-lg p-3.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Avg Review Score
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                  {avgScore > 0 ? `${avgScore}/100` : '—'}
                </div>
              </div>
              <div className="surface-recessed rounded-lg p-3.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Engineering Lvl
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                  Lvl {portfolio.level}
                </div>
              </div>
              <div className="surface-recessed rounded-lg p-3.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Total XP
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-indigo-400 mt-1">
                  {portfolio.xp.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Aggregate 5-Axis Engineering Radar */}
          <div className="lg:col-span-5 surface-card rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Verified Competency Matrix
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Aggregated across automated code reviews
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-400">5-Axis Telemetry</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Competency"
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
        </div>

        {/* Verified Simulations & Code Inspector */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Verified Engineering Simulations & Code Reviews
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each record includes the developer’s submitted source code, unit test results, and Senior Staff AI review.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {projects.length} {projects.length === 1 ? 'Submission' : 'Submissions'}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="surface-card rounded-xl p-10 text-center space-y-3">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
              <h3 className="text-sm font-semibold text-white">
                No Verified Simulations Published Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Complete any chapter coding assignment in the IDE and submit it for Staff Review to publish your first verified engineering record here.
              </p>
              {user.isLoggedIn && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold mt-2"
                >
                  Go to Workspace Tracks
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {projects
                .slice()
                .reverse()
                .map((item, idx) => {
                  const uniqueKey = `${item.projectId}-${item.timestamp}-${idx}`;
                  const isExpanded = expandedCodeId === uniqueKey;
                  const verifyId =
                    item.verificationHash ||
                    `SIM-${item.projectId.slice(0, 4).toUpperCase()}-${String(item.timestamp).slice(-4)}`;
                  const submittedFiles = item.submittedFiles
                    ? Object.entries(item.submittedFiles)
                    : [];

                  return (
                    <div key={uniqueKey} className="surface-card rounded-xl overflow-hidden">
                      <div className="p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                VERIFIED #{verifyId}
                              </span>
                              {item.careerTitle && (
                                <span className="text-slate-400">· {item.careerTitle}</span>
                              )}
                              {item.testTotalCount !== undefined && (
                                <span className="text-indigo-400">
                                  · {item.testPassCount ?? item.testTotalCount}/{item.testTotalCount} Unit Tests Passed
                                </span>
                              )}
                              <span className="text-slate-500">
                                · {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-white">
                              {item.projectTitle}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="surface-recessed rounded-lg px-3.5 py-2 text-right font-mono">
                              <span
                                className={`text-lg font-bold tabular-nums ${
                                  item.score >= 80
                                    ? 'text-emerald-400'
                                    : item.score >= 70
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                {item.score}
                              </span>
                              <span className="text-xs text-slate-500">/100</span>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedCertProject(item);
                                setShowCertModal(true);
                              }}
                              className="btn-secondary px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                              <Award className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Certificate</span>
                            </button>

                            {submittedFiles.length > 0 && (
                              <button
                                onClick={() =>
                                  setExpandedCodeId(isExpanded ? null : uniqueKey)
                                }
                                className="btn-secondary px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5"
                              >
                                <Code2 className="w-3.5 h-3.5" />
                                <span>{isExpanded ? 'Hide Code' : 'Inspect Code'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.feedbackSummary}
                        </p>

                        {/* Strengths & Suggestions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {item.strengths && item.strengths.length > 0 && (
                            <div className="surface-recessed rounded-lg p-3.5 space-y-1.5">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                                Verified Engineering Strengths
                              </div>
                              <ul className="space-y-1 text-xs text-slate-300">
                                {item.strengths.slice(0, 3).map((s, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-emerald-400 font-mono">+</span>
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.suggestions && item.suggestions.length > 0 && (
                            <div className="surface-recessed rounded-lg p-3.5 space-y-1.5">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
                                Staff Review Notes
                              </div>
                              <ul className="space-y-1 text-xs text-slate-300">
                                {item.suggestions.slice(0, 3).map((s, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-indigo-400 font-mono">→</span>
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Multi-File Source Code Inspector */}
                      {isExpanded && submittedFiles.length > 0 && (
                        <div className="border-t border-white/[0.07] bg-[#050608] p-6 space-y-4">
                          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                            Submitted Source Files ({submittedFiles.length})
                          </div>
                          {submittedFiles.map(([filename, fileObj]) => (
                            <div
                              key={filename}
                              className="rounded-lg border border-white/[0.07] overflow-hidden"
                            >
                              <div className="px-4 py-2 bg-[#0b0d13] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-300">
                                <span>{filename}</span>
                                <span className="text-slate-500 uppercase">{fileObj.language}</span>
                              </div>
                              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                                <code>{fileObj.content}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </main>

      {showCertModal && (
        <CertificateModal
          user={{
            isLoggedIn: true,
            name: portfolio.name,
            email: portfolio.email,
            title: portfolio.title,
            bio: portfolio.bio,
            portfolioId: portfolio.portfolioId,
            isPro: portfolio.isPro,
            xp: portfolio.xp,
            streak: portfolio.streak,
            level: portfolio.level,
            completedProjects: [],
            projectHistory: portfolio.verifiedProjects,
            joinedDate: portfolio.joinedDate
          }}
          projectItem={selectedCertProject}
          careerTitle={portfolio.title}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};

export default PortfolioPage;
