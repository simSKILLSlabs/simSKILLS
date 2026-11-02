import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoadmapView from '../components/RoadmapView';
import { useAuth } from '../contexts/AuthContext';
import {
    generateLevelDetails,
    fetchGroundedResources,
    generatePracticeProject,
    extendRoadmap
} from '../services/geminiService';
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

    const roadmap = roadmaps.find(r => r.id === id);

    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [activeProject, setActiveProject] = useState<ProjectTask | null>(null);
    const [gradingLevelContext, setGradingLevelContext] = useState<Level | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Track in-flight level generation promises so prefetch and click share the same request
    const inFlightLevelPromises = useRef<Record<number, Promise<Level>>>({});
    const roadmapsRef = useRef(roadmaps);
    roadmapsRef.current = roadmaps;

    // Save helper using db service
    const saveAllRoadmaps = async (newRoadmaps: any[]) => {
        const { saveRoadmaps } = await import('../services/db');
        if (user.email) await saveRoadmaps(user.email, newRoadmaps);
        await refreshRoadmaps();
    };

    const isLevelMissingDeepContent = (level: Level) => {
        return (
            !level.teaching ||
            !Array.isArray(level.teaching.sections) ||
            level.teaching.sections.length === 0 ||
            level.teaching.sections.some(s => !s.codeOutput) ||
            !level.projects ||
            level.projects.some(p => !Array.isArray(p.requirements))
        );
    };

    const persistUpdatedLevel = async (updatedLevel: Level) => {
        if (!roadmap) return;
        const currentList = roadmapsRef.current;
        const updatedRoadmaps = currentList.map(r => {
            if (r.id === roadmap.id) {
                return {
                    ...r,
                    levels: r.levels.map(l => (l.id === updatedLevel.id ? updatedLevel : l))
                };
            }
            return r;
        });
        await saveAllRoadmaps(updatedRoadmaps);
    };

    // Enrich level with Google Search grounded YouTube videos in the background (0ms blocking)
    const enrichResourcesInBackground = (levelObj: Level) => {
        if (!roadmap) return;
        fetchGroundedResources(levelObj.title, roadmap.careerTitle, levelObj.topics || [])
            .then(async grounded => {
                if (!grounded || grounded.length === 0) return;
                const existing = (levelObj.resources || []).filter(r => r.type === 'video' || !r.type);
                const seen = new Set(grounded.map(g => g.url));
                const merged = [...grounded, ...existing.filter(e => !seen.has(e.url))].slice(0, 6);
                const enrichedLevel: Level = { ...levelObj, resources: merged };

                setSelectedLevel(prev => (prev && prev.id === enrichedLevel.id ? enrichedLevel : prev));
                await persistUpdatedLevel(enrichedLevel);
            })
            .catch(() => {
                // ignore background grounding failure
            });
    };

    const getPreviousLevelsSummary = (levelId: number): string => {
        if (!roadmap) return "";
        return roadmap.levels
            .filter(l => l.id < levelId)
            .map(l => `Chapter ${l.id}: ${l.title} (${(l.topics || []).join(", ")})`)
            .join("; ");
    };

    const fetchOrGetLevelPromise = (
        level: Level,
        forceRefresh: boolean = false
    ): Promise<Level> => {
        if (!roadmap) return Promise.resolve(level);

        if (!forceRefresh && inFlightLevelPromises.current[level.id]) {
            return inFlightLevelPromises.current[level.id];
        }

        const promise = (async () => {
            try {
                const previousSummary = getPreviousLevelsSummary(level.id);
                const details = await generateLevelDetails(
                    level.title,
                    roadmap.careerTitle,
                    level.topics || [],
                    level.difficulty,
                    level.id,
                    previousSummary
                );
                const updatedLevel: Level = { ...level, ...(details as any) };
                await persistUpdatedLevel(updatedLevel);
                // Kick off non-blocking search grounding in the background
                enrichResourcesInBackground(updatedLevel);
                return updatedLevel;
            } finally {
                delete inFlightLevelPromises.current[level.id];
            }
        })();

        inFlightLevelPromises.current[level.id] = promise;
        return promise;
    };

    // Automatically prefetch Level 1 (or first uncached level) as soon as the roadmap loads
    useEffect(() => {
        if (!roadmap || !roadmap.levels || roadmap.levels.length === 0) return;
        const firstUncached = roadmap.levels.find(l => isLevelMissingDeepContent(l));
        if (firstUncached && firstUncached.id <= 2) {
            fetchOrGetLevelPromise(firstUncached).catch(() => {
                // silent background prefetch
            });
        }
    }, [roadmap?.id]);

    if (!roadmap) {
        return <div className="p-10 text-center text-gray-500">Roadmap not found. <button onClick={() => navigate('/dashboard')} className="text-emerald-500 underline">Return to Dashboard</button></div>;
    }

    const handleLevelSelect = async (
        level: Level,
        forceRefresh: boolean = false
    ) => {
        // Check latest version from roadmaps state in case background prefetch finished
        const latestRoadmap = roadmapsRef.current.find(r => r.id === roadmap.id) || roadmap;
        const freshLevel = latestRoadmap.levels.find(l => l.id === level.id) || level;

        setSelectedLevel(freshLevel);

        const needsFetch = forceRefresh || isLevelMissingDeepContent(freshLevel);

        if (needsFetch) {
            setIsDetailLoading(true);
            try {
                const updatedLevel = await fetchOrGetLevelPromise(freshLevel, forceRefresh);
                setSelectedLevel(updatedLevel);
                if (forceRefresh) {
                    toast.success("Chapter regenerated");
                }
            } catch (error) {
                toast.error("Failed to load chapter details");
            } finally {
                setIsDetailLoading(false);
            }
        }

        // Prefetch the NEXT level in the background while the student reads this level
        const nextLevel = latestRoadmap.levels.find(l => l.id === freshLevel.id + 1);
        if (nextLevel && isLevelMissingDeepContent(nextLevel)) {
            fetchOrGetLevelPromise(nextLevel).catch(() => {
                // silent background prefetch
            });
        }
    };

    const handleGeneratePractice = async () => {
        setLoading(true);
        setLoadingText("Generating Practice Assignment");
        try {
            const newProject = await generatePracticeProject(roadmap.careerTitle, user.xp);
            const updatedRoadmaps = roadmaps.map(r => {
                if (r.id === roadmap.id) {
                    return { ...r, extraProjects: [newProject, ...(r.extraProjects || [])] };
                }
                return r;
            });
            await saveAllRoadmaps(updatedRoadmaps);
            toast.success("Practice assignment generated");
        } catch (e) {
            toast.error("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExtend = async () => {
        setLoading(true);
        setLoadingText("Generating Advanced Chapters");
        try {
            const newLevels = await extendRoadmap(roadmap);
            const updatedRoadmaps = roadmaps.map(r => {
                if (r.id === roadmap.id) {
                    return { ...r, levels: [...r.levels, ...newLevels] };
                }
                return r;
            });
            await saveAllRoadmaps(updatedRoadmaps);
            toast.success("Advanced chapters added");
        } catch (e) {
            toast.error("Extension failed");
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (id: string) => {
        const updatedRoadmaps = roadmaps.filter(r => r.id !== id);
        await saveAllRoadmaps(updatedRoadmaps);
        toast.info("Learning track removed");
        navigate('/dashboard');
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
                onUpgrade={() => toast("Upgrade to Pro to unlock this feature")}
                onGeneratePractice={handleGeneratePractice}
                onSelectPractice={(p) => {
                    setActiveProject(p);
                    setGradingLevelContext({
                        id: 999,
                        title: "Practice Arena",
                        difficulty: "Advanced" as any,
                        description: "Infinite Practice Mode",
                        topics: [],
                        teaching: { conceptExplanation: "", practicalGuide: "", keyTakeaway: "" },
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
                    totalLevels={roadmap.levels.length}
                    careerTitle={roadmap.careerTitle}
                    isLoading={isDetailLoading}
                    completedProjectIds={user.completedProjects}
                    onClose={() => setSelectedLevel(null)}
                    onRegenerate={() => handleLevelSelect(selectedLevel, true)}
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
                    careerTitle={roadmap.careerTitle}
                    onClose={() => setActiveProject(null)}
                    onComplete={handleProjectComplete}
                />
            )}
        </>
    );
};

export default RoadmapPage;


