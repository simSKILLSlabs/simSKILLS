import React, { useState } from 'react';
import { UserProfile, ProjectHistoryItem } from '../types';
import {
    ArrowLeft,
    Mail,
    Save,
    Shield,
    Calendar,
    LifeBuoy,
    AlertTriangle,
    X,
    ChevronRight,
    Clock,
    MessageSquare,
    ShieldCheck,
    Award,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPortfolioIdForUser } from '../services/db';
import GradingReport from './GradingReport';
import FeedbackModal from './FeedbackModal';
import CertificateModal from './CertificateModal';

interface ProfileViewProps {
    user: UserProfile;
    onUpdate: (updatedUser: UserProfile) => void;
    onBack: () => void;
    onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onBack, onLogout }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<ProjectHistoryItem | null>(null);
    const [certModalItem, setCertModalItem] = useState<ProjectHistoryItem | null>(null);
    const [showCertModal, setShowCertModal] = useState(false);

    const [formData, setFormData] = useState({
        name: user.name,
        title: user.title || 'Software Engineer',
        bio: user.bio || 'Building software and completing engineering tracks.',
        email: user.email
    });

    const portfolioId = getPortfolioIdForUser(user);

    const handleSave = () => {
        onUpdate({
            ...user,
            name: formData.name,
            title: formData.title,
            bio: formData.bio,
            email: formData.email
        });
        setIsEditing(false);
    };

    const handleSupport = () => {
        window.location.href = "mailto:support@simskill.com?subject=SimSKILLS Support Request";
    };

    const confirmCancelSubscription = () => {
        onUpdate({
            ...user,
            isPro: false
        });
        setShowCancelConfirm(false);
    };

    return (
        <div className="min-h-screen text-[#f0f2f5]">
            {/* Top Bar */}
            <header className="border-b border-white/[0.08] bg-[#06070a]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Overview</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate(`/portfolio/${portfolioId}`)}
                            className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Public Portfolio</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10 space-y-10 pb-24">
                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="surface-card p-6 rounded-2xl max-w-md w-full">
                            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                Cancel Pro Plan?
                            </h3>
                            <p className="text-neutral-300 text-xs mb-6 leading-relaxed">
                                Are you sure you want to cancel your Pro subscription? You will revert to the Hobby tier immediately.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="btn-secondary px-3.5 py-2 text-xs rounded-lg"
                                >
                                    Keep Plan
                                </button>
                                <button
                                    onClick={confirmCancelSubscription}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Modal */}
                {selectedHistoryItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                        <div className="surface-card w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-[#080a0f]">
                                <div>
                                    <h2 className="text-base font-bold text-white">
                                        {selectedHistoryItem.projectTitle}
                                    </h2>
                                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                                        Reviewed on {new Date(selectedHistoryItem.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedHistoryItem(null)}
                                    className="btn-secondary w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#06070a]">
                                <GradingReport
                                    result={selectedHistoryItem}
                                    projectTitle={selectedHistoryItem.projectTitle}
                                    careerTitle={selectedHistoryItem.careerTitle || user.title || 'Software Engineering'}
                                    onRetry={() => setSelectedHistoryItem(null)}
                                    onContinue={() => setSelectedHistoryItem(null)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <FeedbackModal
                    isOpen={showFeedback}
                    onClose={() => setShowFeedback(false)}
                    userId={user.email}
                    userEmail={user.email}
                />

                {showCertModal && (
                    <CertificateModal
                        user={user}
                        projectItem={certModalItem}
                        careerTitle={certModalItem?.careerTitle || user.title || 'Software Engineering'}
                        onClose={() => setShowCertModal(false)}
                    />
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Identity */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="surface-card rounded-2xl p-6 flex flex-col items-start">
                            <div className="w-16 h-16 rounded-2xl surface-recessed flex items-center justify-center text-xl font-bold text-white mb-4">
                                {user.name.charAt(0).toUpperCase()}
                            </div>

                            {!isEditing ? (
                                <div className="w-full space-y-2.5">
                                    <div>
                                        <h2 className="text-lg font-bold text-white tracking-tight">{user.name}</h2>
                                        <p className="text-indigo-300/90 font-mono text-xs mb-2">{user.title || 'Software Engineer'}</p>
                                        <p className="text-neutral-300/85 text-xs leading-relaxed mb-4">{user.bio || 'No bio set.'}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/portfolio/${portfolioId}`)}
                                        className="btn-primary w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Open Public Portfolio</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCertModalItem(user.projectHistory?.[0] || null);
                                            setShowCertModal(true);
                                        }}
                                        className="btn-secondary w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2"
                                    >
                                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Share Credential Card</span>
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-secondary w-full py-2 rounded-lg text-xs font-medium"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full space-y-3">
                                    <input
                                        className="w-full surface-recessed rounded-lg px-3 py-2 text-white text-xs focus:border-white/30 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Name"
                                    />
                                    <input
                                        className="w-full surface-recessed rounded-lg px-3 py-2 text-white text-xs focus:border-white/30 outline-none"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Role (e.g. Frontend Engineer)"
                                    />
                                    <textarea
                                        className="w-full surface-recessed rounded-lg px-3 py-2 text-white text-xs focus:border-white/30 outline-none resize-none h-20"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Short bio..."
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="btn-secondary flex-1 py-2 text-xs rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="btn-primary flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                                        >
                                            <Save className="w-3 h-3" /> Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="surface-card rounded-2xl p-6 space-y-4">
                            <h3 className="text-indigo-300/90 text-xs font-mono">Account Details</h3>
                            <div className="space-y-3 text-xs text-neutral-300">
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Shield className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{user.isPro ? "Pro Plan" : "Hobby Plan"}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Joined {user.joinedDate || '2025'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="surface-card rounded-2xl p-5">
                                <div className="text-indigo-300/90 text-xs font-mono mb-1">Total XP</div>
                                <div className="text-2xl font-bold text-white font-mono tabular-nums">{user.xp.toLocaleString()}</div>
                            </div>
                            <div className="surface-card rounded-2xl p-5">
                                <div className="text-indigo-300/90 text-xs font-mono mb-1">Active Streak</div>
                                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                                    {user.streak || 0} <span className="text-xs font-normal text-neutral-400">days</span>
                                </div>
                            </div>
                            <div className="surface-card rounded-2xl p-5">
                                <div className="text-indigo-300/90 text-xs font-mono mb-1">Completed</div>
                                <div className="text-2xl font-bold text-white font-mono tabular-nums">{user.completedProjects.length}</div>
                            </div>
                        </div>

                        {/* Past Grades */}
                        <div className="surface-card rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white tracking-tight">
                                    Verified Assignment Submissions
                                </h3>
                                <button
                                    onClick={() => navigate(`/portfolio/${portfolioId}`)}
                                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                    <span>View Public Portfolio</span>
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>

                            {user.projectHistory && user.projectHistory.length > 0 ? (
                                <div className="space-y-2.5">
                                    {user.projectHistory.map((item, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedHistoryItem(item)}
                                            className="flex items-center justify-between p-4 surface-interactive rounded-xl cursor-pointer group"
                                        >
                                            <div>
                                                <h4 className="text-white font-semibold text-xs mb-1">
                                                    {item.projectTitle}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-400 tabular-nums">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(item.timestamp).toLocaleDateString()}
                                                    </span>
                                                    <span>·</span>
                                                    <span className={item.score >= 80 ? 'text-emerald-400' : item.score >= 60 ? 'text-amber-400' : 'text-red-400'}>
                                                        Score {item.score}/100
                                                    </span>
                                                    {item.verificationHash && (
                                                        <>
                                                            <span>·</span>
                                                            <span className="text-slate-500">{item.verificationHash}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCertModalItem(item);
                                                        setShowCertModal(true);
                                                    }}
                                                    className="btn-secondary px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1"
                                                >
                                                    <Award className="w-3 h-3 text-indigo-400" />
                                                    <span>Cert</span>
                                                </button>
                                                <span className="text-xs font-mono text-indigo-300 tabular-nums">
                                                    +{item.xpAwarded} XP
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-neutral-400 text-xs surface-recessed rounded-xl">
                                    No assignments graded yet. Complete an assignment in the IDE to generate your first verified credential.
                                </div>
                            )}
                        </div>

                        {/* Settings Area */}
                        <div className="surface-card rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-white tracking-tight">Workspace Preferences</h3>
                            <div className="divide-y divide-white/[0.06] text-xs">
                                {user.isPro && (
                                    <div className="flex justify-between items-center py-3">
                                        <div>
                                            <p className="text-white font-medium">Pro Plan Subscription</p>
                                            <p className="text-neutral-400 mt-0.5">Manage your active billing status.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowCancelConfirm(true)}
                                            className="px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-950/30 transition-colors"
                                        >
                                            Cancel Plan
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <p className="text-white font-medium flex items-center gap-2">
                                            <LifeBuoy className="w-3.5 h-3.5 text-indigo-300" /> Support
                                        </p>
                                        <p className="text-neutral-400 mt-0.5">Contact engineering support for account or billing help.</p>
                                    </div>
                                    <button
                                        onClick={handleSupport}
                                        className="btn-secondary px-3 py-1.5 rounded-lg"
                                    >
                                        Contact Support
                                    </button>
                                </div>

                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <p className="text-white font-medium flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5 text-indigo-300" /> Product Feedback
                                        </p>
                                        <p className="text-neutral-400 mt-0.5">Report an issue or request a curriculum topic.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowFeedback(true)}
                                        className="btn-secondary px-3 py-1.5 rounded-lg"
                                    >
                                        Send Feedback
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfileView;
