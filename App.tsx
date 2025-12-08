
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
import AlertModal from './components/AlertModal';
import { generateRoadmap, generatePracticeProject, generateLevelDetails, extendRoadmap } from './services/geminiService';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { saveUser, getUser, saveRoadmaps, getRoadmaps } from './services/db';
import { CareerRoadmap, Level, ProjectTask, UserProfile, Assessment, GradingResult } from './types';


function App() {
  // 1. Initialize State
  const [user, setUser] = useState<UserProfile>({
    isLoggedIn: false,
    name: '',
    email: '',
    isPro: false,
    xp: 0,
    streak: 1,
    level: 1,
    completedProjects: [],
    projectHistory: [],
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  });

  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);

  // 2. Auth & Data Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is signed in
        const email = currentUser.email || '';
        const name = currentUser.displayName || email.split('@')[0];

        // Fetch user data
        const savedUser = await getUser(email);
        if (savedUser) {
          setUser({ ...savedUser, isLoggedIn: true });
        } else {
          // New user, save initial profile
          const newUser = {
            ...user,
            isLoggedIn: true,
            name,
            email,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };
          setUser(newUser);
          saveUser(newUser);
        }

        // Fetch roadmaps
        const savedRoadmaps = await getRoadmaps(email);
        setRoadmaps(savedRoadmaps);

      } else {
        // User is signed out
        setUser({
          isLoggedIn: false,
          name: '',
          email: '',
          isPro: false,
          xp: 0,
          streak: 1,
          level: 1,
          completedProjects: [],
          projectHistory: [],
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });
        setRoadmaps([]);
        setView('dashboard');
      }
    });

    return () => unsubscribe();
  }, []);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // 3. Persistence & Logic (Streak, Dates, etc)
  useEffect(() => {
    const syncUser = async () => {
      if (user.isLoggedIn && user.email) {
        setSaveStatus('saving');
        try {
          await saveUser(user);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 2000);
        } catch (e) {
          console.error("Save failed", e);
          setSaveStatus('error');
        }
      }
    };
    syncUser();
  }, [user]);

  useEffect(() => {
    const syncRoadmaps = async () => {
      if (user.isLoggedIn && user.email) {
        setSaveStatus('saving');
        try {
          await saveRoadmaps(user.email, roadmaps);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 2000);
        } catch (e) {
          setSaveStatus('error');
        }
      }
    };
    syncRoadmaps();
  }, [roadmaps]);

  // Daily Reset & Streak Logic Helper
  const checkDailyLogic = (currentUser: UserProfile) => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = currentUser.lastActivityDate;

    let newStreak = currentUser.streak;
    let newChallengesToday = currentUser.dailyChallengesCompleted || 0;

    // Reset daily challenges if new day
    if (currentUser.lastChallengeDate !== today) {
      newChallengesToday = 0;
    }

    // Streak Logic
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActive === yesterdayStr) {
        // Continued streak (only processed on valid action, but we can't auto-increment here without action)
        // Actually, we increment streak ONLY when they do an action (addXP).
        // Here we just check if they broke it.
      } else if (lastActive && lastActive < yesterdayStr) {
        // Broken streak
        newStreak = 1;
      }
    }

    return { newStreak, newChallengesToday };
  }



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
  const [pricingMessage, setPricingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    // Auth state listener handles the state update
    setShowAuth(false);
  };


  const handleLogout = async () => {
    if (user.email) {
      await saveUser({ ...user, isLoggedIn: false });
    }
    auth.signOut();
    // State reset is handled by onAuthStateChanged
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
      setShowAssessment(false);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to generate roadmap. Please check your input and try again.");
      setShowAssessment(true); // Re-open assessment modal to let user retry underneath the alert
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSelect = (isPro: boolean) => {
    setUser(prev => ({ ...prev, isPro }));
    setShowPricing(false);
    setPricingMessage(null);
  };

  const handleProjectComplete = (xpEarned: number, result?: GradingResult) => {
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

    // Save Grading History
    if (result && activeProject) {
      const historyItem: any = {
        ...result,
        projectId: activeProject.id,
        projectTitle: activeProject.title,
        timestamp: Date.now()
      };

      setUser(prev => ({
        ...prev,
        projectHistory: [historyItem, ...(prev.projectHistory || [])]
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
      if (!currentRoadmap) return;
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


  const handleQuickStart = async (career: string) => {
    // Check Limits
    if (!user.isPro && roadmaps.length >= 2) {
      setPricingMessage("You have reached the limit of 2 active simulations. Upgrade to Pro for unlimited access.");
      setShowPricing(true);
      return;
    }

    // Default assessment for quick start
    const defaultAssessment: Assessment = {
      experience: 'Beginner',
      goal: 'Career',
      commitment: 'Casual'
    };
    await handleAssessmentComplete(defaultAssessment, career);
  };

  const handleAddXP = (amount: number, isChallenge: boolean = false) => {
    setUser(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = prev.lastActivityDate;

      let newStreak = prev.streak;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
          newStreak += 1; // Increment if active yesterday
        } else {
          newStreak = 1; // Reset if gap > 1 day or first time
        }
      }

      let challengesCompleted = prev.dailyChallengesCompleted || 0;
      let lastChallengeDate = prev.lastChallengeDate;

      if (isChallenge) {
        if (lastChallengeDate !== today) {
          challengesCompleted = 1;
          lastChallengeDate = today;
        } else {
          challengesCompleted += 1;
        }
      } else {
        // Check if we need to reset count for a new day even if not doing a challenge right now
        if (lastChallengeDate !== today) {
          challengesCompleted = 0;
        }
      }

      return {
        ...prev,
        xp: prev.xp + amount,
        level: Math.floor((prev.xp + amount) / 1000) + 1,
        streak: newStreak,
        lastActivityDate: today,
        dailyChallengesCompleted: challengesCompleted,
        lastChallengeDate: lastChallengeDate
      };
    });
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
        {showPricing && <PricingModal onSelect={handleSubscriptionSelect} onClose={() => { setShowPricing(false); setPricingMessage(null); }} message={pricingMessage} />}
        {errorMessage && <AlertModal message={errorMessage} onClose={() => setErrorMessage(null)} />}
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
            onNewPath={() => {
              if (!user.isPro && roadmaps.length >= 2) {
                setPricingMessage("You have reached the limit of 2 active simulations. Upgrade to Pro for unlimited access.");
                setShowPricing(true);
              } else {
                setShowAssessment(true);
              }
            }}
            onQuickStart={handleQuickStart}
            onAddXP={(amount, isChallenge) => handleAddXP(amount, isChallenge)}
            onUpgrade={(msg) => {
              if (typeof msg === 'string') setPricingMessage(msg);
              setShowPricing(true);
            }}
            onProfile={() => setView('profile')}
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
            onUpgrade={(msg) => {
              if (typeof msg === 'string') setPricingMessage(msg);
              setShowPricing(true);
            }}
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

        {/* Save Status Indicator */}
        <div className="fixed bottom-4 right-4 z-50">
          {saveStatus === 'saving' && <span className="text-xs text-yellow-500 font-mono bg-black/50 px-2 py-1 rounded">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-xs text-emerald-500 font-mono bg-black/50 px-2 py-1 rounded">Saved</span>}
          {saveStatus === 'error' && <span className="text-xs text-red-500 font-mono bg-black/80 px-2 py-1 rounded border border-red-500">Save Failed! Check Console/Network</span>}
        </div>
      </div>
    </div>
  );
}

export default App;
