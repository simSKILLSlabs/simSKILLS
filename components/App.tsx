
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import RoadmapView from './components/RoadmapView';
import LevelDetail from './components/LevelDetail';
import ProjectGrader from './components/ProjectGrader';
import ProfileView from './components/ProfileView';
import Loader from './components/Loader';
import AuthModal from './components/AuthModal';
import AssessmentModal from './components/AssessmentModal';
import PricingModal from './components/PricingModal';
import { generateRoadmap, generatePracticeProject, generateLevelDetails, extendRoadmap } from './services/geminiService';
import { CareerRoadmap, Level, ProjectTask, UserProfile, Assessment } from './types';

function App() {
  // 1. Initialize State from LocalStorage (The "Database")
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('simSkill_user');
    return saved ? JSON.parse(saved) : {
      isLoggedIn: false,
      name: '',
      email: '',
      isPro: false,
      xp: 0,
      streak: 1,
      level: 1,
      completedProjects: [],
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  });

  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>(() => {
    const saved = localStorage.getItem('simSkill_roadmaps');
    let loaded: CareerRoadmap[] = saved ? JSON.parse(saved) : [];
    
    // Legacy Data Patch: If roadmap has no ID, give it one.
    // This fixes the issue where old roadmaps couldn't be deleted.
    const patched = loaded.map(r => {
        if (!r.id) {
            return { ...r, id: `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        }
        return r;
    });
    
    return patched;
  });

  // 2. Persistence Hooks (Auto-Save)
  useEffect(() => {
    localStorage.setItem('simSkill_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('simSkill_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);

  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectTask | null>(null);
  const [gradingLevelContext, setGradingLevelContext] = useState<Level | null>(null);

  // View State
  const [view, setView] = useState<'dashboard' | 'roadmap' | 'profile'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("CONSTRUCTING ROADMAP");
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Modal State
  const [showAuth, setShowAuth] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Helper: Get Current Roadmap
  const currentRoadmap = roadmaps.find(r => r.id === activeRoadmapId) || null;

  const handleStart = () => {
    if (user.isLoggedIn) {
      if (roadmaps.length === 0) {
        setShowAssessment(true);
      } else {
        setView('dashboard');
      }
    } else {
      setShowAuth(true);
    }
  };

  const handleLogin = (name: string, email: string) => {
    setUser(prev => ({ ...prev, isLoggedIn: true, name, email }));
    setShowAuth(false);
    
    // If they have roadmaps, go to dashboard, else ask for one
    if (roadmaps.length > 0) {
        setView('dashboard');
    } else {
        setShowAssessment(true);
    }
  };

  const handleLogout = () => {
    setUser({
        isLoggedIn: false,
        name: '',
        email: '',
        isPro: false,
        xp: 0,
        streak: 1,
        level: 1,
        completedProjects: [],
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
    setRoadmaps([]);
    setView('dashboard');
    localStorage.removeItem('simSkill_user');
    localStorage.removeItem('simSkill_roadmaps');
  };

  const handleAssessmentComplete = async (assessment: Assessment, career: string) => {
    setShowAssessment(false);
    setLoading(true);
    setLoadingText("ARCHITECTING CAREER SKELETON");
    try {
      const data = await generateRoadmap(career, assessment, user.isPro);
      setRoadmaps(prev => [...prev, data]);
      setActiveRoadmapId(data.id);
      setView('roadmap');
    } catch (error) {
      alert("Failed to generate roadmap. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSelect = (isPro: boolean) => {
    setUser(prev => ({ ...prev, isPro }));
    setShowPricing(false);
  };

  const handleProjectComplete = (xpEarned: number) => {
    // Add XP and update project counts
    if (activeProject && !user.completedProjects.includes(activeProject.id)) {
        setUser(prev => ({ 
            ...prev, 
            xp: prev.xp + xpEarned, 
            completedProjects: [...prev.completedProjects, activeProject.id],
            // Simple level up logic: every 1000 XP
            level: Math.floor((prev.xp + xpEarned) / 1000) + 1
        }));
    } else {
        // Practice mode or re-doing project gives raw XP
         setUser(prev => ({ 
            ...prev, 
            xp: prev.xp + xpEarned,
            level: Math.floor((prev.xp + xpEarned) / 1000) + 1
        }));
    }
    setActiveProject(null);
    setGradingLevelContext(null);
  };

  // Lazy Loading Level Details
  const handleLevelSelect = async (level: Level) => {
    setSelectedLevel(level);

    // If level details are missing (lazy load), fetch them now
    if (!level.teaching || !level.projects) {
        if(!currentRoadmap) return;
        setIsDetailLoading(true);
        try {
            const details = await generateLevelDetails(level.title, currentRoadmap.careerTitle, level.topics);
            
            // Update the roadmap with the new details so we don't fetch again
            const updatedLevel = { ...level, ...details };
            setSelectedLevel(updatedLevel); // Update modal view immediately

            setRoadmaps(prev => prev.map(r => {
                if (r.id === currentRoadmap.id) {
                    return {
                        ...r,
                        levels: r.levels.map(l => l.id === level.id ? updatedLevel : l)
                    };
                }
                return r;
            }));

        } catch (error) {
            console.error("Failed to fetch level details");
        } finally {
            setIsDetailLoading(false);
        }
    }
  };

  const handleGeneratePractice = async () => {
    if (!currentRoadmap) return;
    setLoading(true);
    setLoadingText("GENERATING CHALLENGE");
    try {
      const newProject = await generatePracticeProject(currentRoadmap.careerTitle, user.xp);
      // Append to specific roadmap
      setRoadmaps(prev => prev.map(r => {
        if (r.id === currentRoadmap.id) {
            return {
                ...r,
                extraProjects: [newProject, ...(r.extraProjects || [])]
            };
        }
        return r;
      }));
    } catch (e) {
      alert("Could not generate practice project.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = (id: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
    if (activeRoadmapId === id) {
        setActiveRoadmapId(null);
        setView('dashboard');
    }
  };

  const handleExtendRoadmap = async () => {
    if (!currentRoadmap) return;
    setLoading(true);
    setLoadingText("EXPANDING ARCHITECTURE");
    try {
        const newLevels = await extendRoadmap(currentRoadmap);
        setRoadmaps(prev => prev.map(r => {
            if (r.id === currentRoadmap.id) {
                return {
                    ...r,
                    levels: [...r.levels, ...newLevels]
                };
            }
            return r;
        }));
    } catch (error) {
        alert("Failed to extend roadmap.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500 selection:text-black grid-bg font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        
        {/* Modals */}
        {showAuth && <AuthModal onLogin={handleLogin} onClose={() => setShowAuth(false)} />}
        {showAssessment && <AssessmentModal onComplete={handleAssessmentComplete} onCancel={() => setShowAssessment(false)} />}
        {showPricing && <PricingModal onSelect={handleSubscriptionSelect} onClose={() => setShowPricing(false)} />}
        {loading && <Loader text={loadingText} />}

        {/* Main Views */}
        {!user.isLoggedIn && (
          <Hero onStart={handleStart} />
        )}

        {user.isLoggedIn && view === 'dashboard' && !loading && (
          <Dashboard 
            user={user} 
            roadmaps={roadmaps}
            onResume={(id) => {
                setActiveRoadmapId(id);
                setView('roadmap');
            }}
            onNewPath={() => setShowAssessment(true)} 
            onUpgrade={() => setShowPricing(true)} 
            onProfile={() => setView('profile')}
            onUnenroll={() => {}} // Deprecated in dashboard
          />
        )}

        {user.isLoggedIn && view === 'profile' && !loading && (
            <ProfileView 
                user={user} 
                onUpdate={setUser} 
                onBack={() => setView('dashboard')} 
                onLogout={handleLogout}
            />
        )}

        {user.isLoggedIn && view === 'roadmap' && currentRoadmap && !loading && (
          <RoadmapView 
            roadmap={currentRoadmap} 
            user={user}
            onSelectLevel={handleLevelSelect} 
            onBack={() => setView('dashboard')}
            onUpgrade={() => setShowPricing(true)}
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
            onExtend={handleExtendRoadmap}
            onUnenroll={handleUnenroll}
          />
        )}

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
      </div>
    </div>
  );
}

export default App;
