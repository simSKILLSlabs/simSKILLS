import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import { generateRoadmap } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import AssessmentModal from '../components/AssessmentModal';
import PricingModal from '../components/PricingModal';
import AlertModal from '../components/AlertModal';
import Loader from '../components/Loader';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { Assessment } from '../types';
import BugHunterModal from '../components/BugHunterModal';
import { Bug } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { user, roadmaps, refreshRoadmaps, updateUser } = useAuth();
    const navigate = useNavigate();

    const [showAssessment, setShowAssessment] = useState(false);
    const [showBugHunt, setShowBugHunt] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [pricingMessage, setPricingMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleResume = (id: string) => {
        navigate(`/roadmap/${id}`);
    };

    const handleNewPath = () => {
        if (!user.isPro && roadmaps.length >= 2) {
            setPricingMessage("Limit reached (2 simulations). Upgrade for unlimited.");
            setShowPricing(true);
        } else {
            setShowAssessment(true);
        }
    };

    const handleQuickStart = async (career: string) => {
        if (!user.isPro && roadmaps.length >= 2) {
            setPricingMessage("Limit reached. Upgrade for unlimited.");
            setShowPricing(true);
            return;
        }

        const defaultAssessment: Assessment = {
            experience: 'Beginner',
            goal: 'Career',
            commitment: 'Casual'
        };
        await handleAssessmentComplete(defaultAssessment, career);
    };

    const handleAssessmentComplete = async (assessment: Assessment, career: string) => {
        setShowAssessment(false);
        setLoading(true);
        setLoadingText("Building Curriculum Track");
        try {
            const data = await generateRoadmap(career, assessment, user.isPro);
            const newRoadmaps = [...roadmaps, data];
            const { saveRoadmaps } = await import('../services/db');
            if (user.email) await saveRoadmaps(user.email, newRoadmaps);

            await refreshRoadmaps();
            navigate(`/roadmap/${data.id}`);
            toast.success("Learning track created");
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to generate.");
            setShowAssessment(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddXP = async (amount: number) => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = user.lastActivityDate;

        let newStreak = user.streak || 0;

        if (lastActive !== today) {
            // Check if last active was yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActive === yesterdayStr) {
                newStreak += 1;
                toast.success(`🔥 Streak Increased! ${newStreak} Days!`);
            } else {
                newStreak = 1; // Reset or Start
                if (lastActive) toast.info("Streak Reset. Keep it up daily!");
            }
        }

        const newXp = user.xp + amount;
        await updateUser({
            xp: newXp,
            level: Math.floor(newXp / 1000) + 1,
            lastActivityDate: today,
            lastChallengeDate: today,
            streak: newStreak
        });
        toast.success(`+${amount} XP`);
    };

    return (
        <>
            <SEO title="Dashboard" />
            <Dashboard
                user={user}
                roadmaps={roadmaps}
                onResume={handleResume}
                onNewPath={handleNewPath}
                onQuickStart={handleQuickStart}
                onAddXP={handleAddXP}
                onUpgrade={(msg) => {
                    if (msg) setPricingMessage(msg);
                    setShowPricing(true);
                }}
                onProfile={() => navigate('/profile')}
                onBugHunt={() => setShowBugHunt(true)}
            />

            {showBugHunt && <BugHunterModal onClose={() => setShowBugHunt(false)} careerPath={roadmaps.length > 0 ? roadmaps[0].careerTitle : "General Computer Science"} />}

            {showAssessment && <AssessmentModal onComplete={handleAssessmentComplete} onCancel={() => setShowAssessment(false)} />}
            {showPricing && <PricingModal onSelect={async (isPro) => {
                await updateUser({ isPro });
                setShowPricing(false);
                toast.success("Subscription updated!");
            }} onClose={() => setShowPricing(false)} message={pricingMessage} />}
            {errorMessage && <AlertModal message={errorMessage} onClose={() => setErrorMessage(null)} />}
            {loading && <Loader text={loadingText} />}
        </>
    );
};

export default DashboardPage;
