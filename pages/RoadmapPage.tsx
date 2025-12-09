import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoadmapView from '../components/RoadmapView';
import { useAuth } from '../contexts/AuthContext';
import { generateLevelDetails, generatePracticeProject, extendRoadmap } from '../services/geminiService';
import Loader from '../components/Loader';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { Level, ProjectTask } from '../types';
import LevelDetail from '../components/LevelDetail';
import ProjectGrader from '../components/ProjectGrader';

const RoadmapPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, roadmaps, refreshRoadmaps, updateUser } = useAuth();

    // We can't rely just on context roadmaps because they might not be loaded yet or this is a direct link
    // But AuthContext handles loading state.

    const roadmap = roadmaps.find(r => r.id === id);

    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [activeProject, setActiveProject] = useState<ProjectTask | null>(null);
    const [gradingLevelContext, setGradingLevelContext] = useState<Level | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Save helper using db service
    const saveAllRoadmaps = async (newRoadmaps: any[]) => {
        const { saveRoadmaps } = await import('../services/db');
        if (user.email) await saveRoadmaps(user.email, newRoadmaps);
        await refreshRoadmaps();
    };

    if (!roadmap) {
        return <div className="p-10 text-center text-gray-500">Roadmap not found. <button onClick={() => navigate('/dashboard')} className="text-emerald-500 underline">Return to Dashboard</button></div>;
    }

    const handleLevelSelect = async (level: Level) => {
        setSelectedLevel(level);

        if (!level.teaching || !level.projects) {
            setIsDetailLoading(true);
            try {
                const details = await generateLevelDetails(level.title, roadmap.careerTitle, level.topics);
                const updatedLevel = { ...level, ...details as any };

                // Update local state for immediate feedback
                setSelectedLevel(updatedLevel);

                // Update persistent store
                const updatedRoadmaps = roadmaps.map(r => {
                    if (r.id === roadmap.id) {
                        return { ...r, levels: r.levels.map(l => l.id === level.id ? updatedLevel : l) };
                    }
                    return r;
                });
                await saveAllRoadmaps(updatedRoadmaps);

            } catch (error) {
                toast.error("Failed to fetch level details");
            } finally {
                setIsDetailLoading(false);
            }
        }
    };

    const handleGeneratePractice = async () => {
        setLoading(true);
        setLoadingText("GENERATING CHALLENGE");
        try {
            const newProject = await generatePracticeProject(roadmap.careerTitle, user.xp);
            const updatedRoadmaps = roadmaps.map(r => {
                if (r.id === roadmap.id) {
                    return { ...r, extraProjects: [newProject, ...(r.extraProjects || [])] };
                }
                return r;
            });
            await saveAllRoadmaps(updatedRoadmaps);
            toast.success("New Challenge Generated");
        } catch (e) {
            toast.error("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExtend = async () => {
        setLoading(true);
        setLoadingText("EXPANDING UNIVERSE");
        try {
            const newLevels = await extendRoadmap(roadmap);
            const updatedRoadmaps = roadmaps.map(r => {
                if (r.id === roadmap.id) {
                    return { ...r, levels: [...r.levels, ...newLevels] };
                }
                return r;
            });
            await saveAllRoadmaps(updatedRoadmaps);
            toast.success("Roadmap Extended");
        } catch (e) {
            toast.error("Extension failed");
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (id: string) => {
        if (confirm("Are you sure you want to delete this simulation?")) {
            const updatedRoadmaps = roadmaps.filter(r => r.id !== id);
            await saveAllRoadmaps(updatedRoadmaps);
            navigate('/dashboard');
        }
    };

    const handleProjectComplete = async (xpEarned: number, result?: any) => {
        let newXp = user.xp + xpEarned;
        let projs = [...user.completedProjects];

        if (activeProject && !projs.includes(activeProject.id)) {
            projs.push(activeProject.id);
        }

        await updateUser({
            xp: newXp,
            level: Math.floor(newXp / 1000) + 1,
            completedProjects: projs,
            // We should also append history
            projectHistory: result && activeProject ? [{
                ...result,
                projectId: activeProject.id,
                projectTitle: activeProject.title,
                timestamp: Date.now()
            }, ...user.projectHistory] : user.projectHistory
        });

        setActiveProject(null);
        setGradingLevelContext(null);
        toast.success(`+${xpEarned} XP Awarded!`);
    };

    return (
        <>
            <SEO title={roadmap.careerTitle} />
            <RoadmapView
                roadmap={roadmap}
                user={user}
                onSelectLevel={handleLevelSelect}
                onBack={() => navigate('/dashboard')}
                onUpgrade={() => toast("Upgrade to Pro to unlock this feature")} // Simplified
                onGeneratePractice={handleGeneratePractice}
                onSelectPractice={(p) => {
                    setActiveProject(p);
                    setGradingLevelContext({
                        id: 999,
                        title: "Practice Arena",
                        difficulty: "Advanced" as any,
                        description: "Infinite Practice Mode",
                        topics: [],
                        teaching: { conceptExplanation: "", practicalGuide: "", keyTakeaway: "" }, // Dummy
                        resources: [],
                        projects: []
                    });
                }}
                onExtend={handleExtend}
                onUnenroll={handleUnenroll}
            />

            {loading && <Loader text={loadingText} />}

            {selectedLevel && !activeProject && (
                <LevelDetail
                    level={selectedLevel}
                    isLoading={isDetailLoading}
                    completedProjectIds={user.completedProjects}
                    onClose={() => setSelectedLevel(null)}
                    onStartProject={(p) => {
                        setActiveProject(p);
                        setGradingLevelContext(selectedLevel);
                    }}
                />
            )}

            {activeProject && gradingLevelContext && (
                <ProjectGrader
                    project={activeProject}
                    level={gradingLevelContext}
                    onClose={() => setActiveProject(null)}
                    onComplete={handleProjectComplete}
                />
            )}
        </>
    );
};

export default RoadmapPage;
