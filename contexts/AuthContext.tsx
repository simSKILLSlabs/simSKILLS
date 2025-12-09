import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { getUser, saveUser as saveUserDb, getRoadmaps } from '../services/db';
import { UserProfile, CareerRoadmap } from '../types';

interface AuthContextType {
    user: UserProfile;
    loading: boolean;
    roadmaps: CareerRoadmap[];
    refreshRoadmaps: () => Promise<void>;
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
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
        const targetEmail = email || user.email;
        if (targetEmail) {
            const maps = await getRoadmaps(targetEmail);
            setRoadmaps(maps);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                try {
                    const email = currentUser.email || '';
                    const savedUser = await getUser(email);

                    if (savedUser) {
                        setUser({ ...savedUser, isLoggedIn: true });
                    } else {
                        // New user or missing db record
                        const newUser = {
                            ...defaultUser,
                            isLoggedIn: true,
                            name: currentUser.displayName || email.split('@')[0],
                            email: email,
                            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        };
                        setUser(newUser);
                        await saveUserDb(newUser);
                    }
                    // Fetch roadmaps
                    refreshRoadmaps(email);
                } catch (error) {
                    console.error("Auth sync error", error);
                }
            } else {
                setUser(defaultUser);
                setRoadmaps([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateUser = async (updates: Partial<UserProfile>) => {
        setUser(prev => {
            const newState = { ...prev, ...updates };
            // Fire and forget save for now, or we can await it if critical
            // ideally we debounce this in the db service or here.
            saveUserDb(newState).catch(e => console.error("Save failed", e));
            return newState;
        });
    };

    const logout = async () => {
        await saveUserDb({ ...user, isLoggedIn: false });
        await signOut(auth);
        setUser(defaultUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, roadmaps, refreshRoadmaps, updateUser, logout, isAdmin: false }}>
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
