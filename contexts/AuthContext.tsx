import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUser, saveUser as saveUserDb, getRoadmaps } from '../services/db';
import { UserProfile, CareerRoadmap } from '../types';

const CURRENT_USER_EMAIL_KEY = 'simskills_current_email';

interface AuthContextType {
    user: UserProfile;
    loading: boolean;
    roadmaps: CareerRoadmap[];
    refreshRoadmaps: (email?: string) => Promise<void>;
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
    loginLocal: (name: string, email: string) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean; // Future proofing
}

const defaultUser: UserProfile = {
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile>(defaultUser);
    const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshRoadmaps = async (email?: string) => {
        const targetEmail = email || user.email || localStorage.getItem(CURRENT_USER_EMAIL_KEY) || '';
        if (targetEmail) {
            const maps = await getRoadmaps(targetEmail);
            setRoadmaps(maps);
        }
    };

    const syncUserByEmail = async (email: string, displayName?: string) => {
        const savedUser = await getUser(email);
        if (savedUser) {
            const activeUser = {
                ...savedUser,
                name: displayName || savedUser.name || email.split('@')[0],
                isLoggedIn: true
            };
            setUser(activeUser);
            await saveUserDb(activeUser);
        } else {
            const newUser: UserProfile = {
                ...defaultUser,
                isLoggedIn: true,
                name: displayName || email.split('@')[0],
                email: email,
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            };
            setUser(newUser);
            await saveUserDb(newUser);
        }
        localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
        await refreshRoadmaps(email);
    };

    useEffect(() => {
        if (isFirebaseConfigured && auth) {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                setLoading(true);
                if (currentUser && currentUser.email) {
                    try {
                        await syncUserByEmail(currentUser.email, currentUser.displayName || undefined);
                    } catch (error) {
                        console.error("Auth sync error", error);
                    }
                } else {
                    const localEmail = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
                    if (localEmail) {
                        await syncUserByEmail(localEmail);
                    } else {
                        setUser(defaultUser);
                        setRoadmaps([]);
                    }
                }
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            // Local storage session restoration
            const restoreLocalSession = async () => {
                setLoading(true);
                try {
                    const savedEmail = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
                    if (savedEmail) {
                        await syncUserByEmail(savedEmail);
                    } else {
                        setUser(defaultUser);
                        setRoadmaps([]);
                    }
                } catch (e) {
                    console.error("Local session restore error", e);
                } finally {
                    setLoading(false);
                }
            };
            restoreLocalSession();
        }
    }, []);

    const loginLocal = async (name: string, email: string) => {
        const normalizedEmail = email.trim().toLowerCase() || 'developer@simskills.local';
        const resolvedName = name.trim() || normalizedEmail.split('@')[0];
        await syncUserByEmail(normalizedEmail, resolvedName);
    };

    const updateUser = async (updates: Partial<UserProfile>) => {
        setUser(prev => {
            const newState = { ...prev, ...updates };
            saveUserDb(newState).catch(e => console.error("Save failed", e));
            return newState;
        });
    };

    const logout = async () => {
        if (user.email) {
            await saveUserDb({ ...user, isLoggedIn: false });
        }
        localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
        if (isFirebaseConfigured && auth) {
            try {
                await signOut(auth);
            } catch (e) {
                console.warn("Firebase signOut error:", e);
            }
        }
        setUser(defaultUser);
        setRoadmaps([]);
    };

    return (
        <AuthContext.Provider value={{ user, loading, roadmaps, refreshRoadmaps, updateUser, loginLocal, logout, isAdmin: false }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

