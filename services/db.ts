import { db, isFirebaseConfigured } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { UserProfile, CareerRoadmap, ProjectDraft, ProjectFile, Level, PublicPortfolioSnapshot } from '../types';

const USER_STORAGE_PREFIX = 'simskills_user_';
const ROADMAPS_STORAGE_PREFIX = 'simskills_roadmaps_';
const DRAFT_STORAGE_PREFIX = 'simskills_draft_';
const CHAPTER_CACHE_PREFIX = 'simskills_chapter_cache_';
const PORTFOLIO_STORAGE_PREFIX = 'simskills_portfolio_';
const FEEDBACK_STORAGE_KEY = 'simskills_feedback';

// Helper to remove undefined values (Firestore doesn't like them)
const sanitizeData = (data: any): any => {
    if (data === null || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(sanitizeData);
    const newData: any = {};
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            newData[key] = sanitizeData(data[key]);
        }
    });
    return newData;
};

export const getPortfolioIdForUser = (user: Pick<UserProfile, 'name' | 'email' | 'portfolioId'>): string => {
    if (user.portfolioId) return user.portfolioId;
    const base = (user.name || user.email?.split('@')[0] || 'developer')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const emailHash = (user.email || 'local')
        .split('')
        .reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
    const shortSuffix = Math.abs(emailHash).toString(36).slice(0, 4);
    return `${base}-${shortSuffix}`;
};

export const buildPortfolioSnapshot = (user: UserProfile): PublicPortfolioSnapshot => {
    const portfolioId = getPortfolioIdForUser(user);
    return {
        portfolioId,
        name: user.name || user.email?.split('@')[0] || 'Software Engineer',
        email: user.email || '',
        title: user.title || 'Full-Stack Software Engineer',
        bio: user.bio || 'Building and verifying production software engineering skills through interactive code simulations.',
        joinedDate: user.joinedDate || 'Oct 2026',
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 1,
        isPro: Boolean(user.isPro),
        verifiedProjects: Array.isArray(user.projectHistory) ? user.projectHistory : [],
        updatedAt: Date.now()
    };
};

export const savePublicPortfolio = async (user: UserProfile): Promise<string> => {
    const snapshot = sanitizeData(buildPortfolioSnapshot(user)) as PublicPortfolioSnapshot;
    const portfolioId = snapshot.portfolioId;

    try {
        localStorage.setItem(`${PORTFOLIO_STORAGE_PREFIX}${portfolioId}`, JSON.stringify(snapshot));
    } catch (e) {
        console.warn("Local storage savePublicPortfolio warning:", e);
    }

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "public_portfolios", portfolioId), snapshot, { merge: true });
        } catch (e) {
            console.warn("Firestore savePublicPortfolio fallback:", e);
        }
    }

    return portfolioId;
};

export const getPublicPortfolio = async (portfolioId: string): Promise<PublicPortfolioSnapshot | null> => {
    if (!portfolioId) return null;

    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDoc(doc(db, "public_portfolios", portfolioId));
            if (snap.exists()) {
                const remote = snap.data() as PublicPortfolioSnapshot;
                localStorage.setItem(`${PORTFOLIO_STORAGE_PREFIX}${portfolioId}`, JSON.stringify(remote));
                return remote;
            }
        } catch (e) {
            console.warn("Firestore getPublicPortfolio fallback:", e);
        }
    }

    try {
        const localRaw = localStorage.getItem(`${PORTFOLIO_STORAGE_PREFIX}${portfolioId}`);
        if (localRaw) {
            return JSON.parse(localRaw) as PublicPortfolioSnapshot;
        }

        // Scan any local user profiles in case portfolio link was opened before explicit sync
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(USER_STORAGE_PREFIX)) {
                const rawUser = localStorage.getItem(key);
                if (rawUser) {
                    const parsedUser = JSON.parse(rawUser) as UserProfile;
                    if (getPortfolioIdForUser(parsedUser) === portfolioId) {
                        const built = buildPortfolioSnapshot(parsedUser);
                        localStorage.setItem(`${PORTFOLIO_STORAGE_PREFIX}${portfolioId}`, JSON.stringify(built));
                        return built;
                    }
                }
            }
        }
    } catch (e) {
        console.warn("Local getPublicPortfolio warning:", e);
    }

    return null;
};

// --- SHARED GLOBAL CURRICULUM CACHE (D) ---

export const getCachedChapter = async (cacheKey: string): Promise<Partial<Level> | null> => {
    if (!cacheKey) return null;

    // 1. Check fast localStorage cache first
    try {
        const localRaw = localStorage.getItem(`${CHAPTER_CACHE_PREFIX}${cacheKey}`);
        if (localRaw) {
            const parsed = JSON.parse(localRaw) as Partial<Level>;
            if (parsed && parsed.teaching && parsed.projects) {
                return { ...parsed, isCached: true };
            }
        }
    } catch (e) {
        console.warn("Local chapter cache read warning:", e);
    }

    // 2. Check shared Firestore curriculum_cache collection
    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDoc(doc(db, "curriculum_cache", cacheKey));
            if (snap.exists()) {
                const data = snap.data() as Partial<Level>;
                if (data && data.teaching && data.projects) {
                    const cachedLevel = { ...data, isCached: true };
                    localStorage.setItem(`${CHAPTER_CACHE_PREFIX}${cacheKey}`, JSON.stringify(cachedLevel));
                    return cachedLevel;
                }
            }
        } catch (e) {
            console.warn("Firestore curriculum_cache read fallback:", e);
        }
    }

    return null;
};

export const saveCachedChapter = async (cacheKey: string, details: Partial<Level>): Promise<void> => {
    if (!cacheKey || !details.teaching) return;
    const payload = sanitizeData({
        ...details,
        isCached: true,
        cachedAt: Date.now()
    });

    try {
        localStorage.setItem(`${CHAPTER_CACHE_PREFIX}${cacheKey}`, JSON.stringify(payload));
    } catch (e) {
        console.warn("Local chapter cache write warning:", e);
    }

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "curriculum_cache", cacheKey), payload, { merge: true });
        } catch (e) {
            console.warn("Firestore curriculum_cache write fallback:", e);
        }
    }
};

export const saveUser = async (user: UserProfile) => {
    if (!user.email) return;
    const portfolioId = getPortfolioIdForUser(user);
    const sanitizedUser = sanitizeData({ ...user, portfolioId });

    // Always mirror to localStorage for instant resilience
    try {
        localStorage.setItem(`${USER_STORAGE_PREFIX}${user.email}`, JSON.stringify(sanitizedUser));
    } catch (e) {
        console.warn("Local storage saveUser warning:", e);
    }

    // Keep public portfolio snapshot in sync
    await savePublicPortfolio(sanitizedUser);

    if (!isFirebaseConfigured || !db) return;

    try {
        await setDoc(doc(db, "users", user.email), sanitizedUser, { merge: true });
    } catch (e) {
        console.error("Error saving user to Firestore, using localStorage fallback: ", e);
    }
};

export const getUser = async (email: string): Promise<UserProfile | null> => {
    if (!email) return null;

    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "users", email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const remoteUser = docSnap.data() as UserProfile;
                if (!remoteUser.portfolioId) {
                    remoteUser.portfolioId = getPortfolioIdForUser(remoteUser);
                }
                localStorage.setItem(`${USER_STORAGE_PREFIX}${email}`, JSON.stringify(remoteUser));
                return remoteUser;
            }
        } catch (e) {
            console.error("Error getting user from Firestore, falling back to localStorage: ", e);
        }
    }

    try {
        const localData = localStorage.getItem(`${USER_STORAGE_PREFIX}${email}`);
        if (localData) {
            const parsed = JSON.parse(localData) as UserProfile;
            if (!parsed.portfolioId) {
                parsed.portfolioId = getPortfolioIdForUser(parsed);
            }
            return parsed;
        }
    } catch (e) {
        console.warn("Local storage getUser warning:", e);
    }

    return null;
};

export const saveRoadmaps = async (email: string, roadmaps: CareerRoadmap[]) => {
    if (!email) return;

    try {
        localStorage.setItem(`${ROADMAPS_STORAGE_PREFIX}${email}`, JSON.stringify(roadmaps));
    } catch (e) {
        console.warn("Local storage saveRoadmaps warning:", e);
    }

    if (!isFirebaseConfigured || !db) return;

    try {
        await setDoc(doc(db, "users", email, "data", "roadmaps"), { list: sanitizeData({ list: roadmaps }).list });
    } catch (e) {
        console.error("Error saving roadmaps to Firestore, saved to localStorage: ", e);
    }
};

export const getRoadmaps = async (email: string): Promise<CareerRoadmap[]> => {
    if (!email) return [];

    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "users", email, "data", "roadmaps");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const list = docSnap.data().list as CareerRoadmap[];
                localStorage.setItem(`${ROADMAPS_STORAGE_PREFIX}${email}`, JSON.stringify(list));
                return list;
            }
        } catch (e) {
            console.error("Error getting roadmaps from Firestore, falling back to localStorage: ", e);
        }
    }

    try {
        const localData = localStorage.getItem(`${ROADMAPS_STORAGE_PREFIX}${email}`);
        if (localData) {
            return JSON.parse(localData) as CareerRoadmap[];
        }
    } catch (e) {
        console.warn("Local storage getRoadmaps warning:", e);
    }

    return [];
};

export const saveFeedback = async (feedback: any) => {
    try {
        const existingRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(feedback);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
        console.warn("Local storage saveFeedback warning:", e);
    }

    if (!isFirebaseConfigured || !db) return;

    try {
        await addDoc(collection(db, "feedback"), feedback);
    } catch (error) {
        console.error("Error saving feedback to Firestore, saved to localStorage: ", error);
    }
};

export const saveProjectDraft = async (email: string, projectId: string, files: Record<string, ProjectFile>) => {
    if (!email || !projectId) return;
    const draft: ProjectDraft = {
        files,
        lastModified: Date.now()
    };

    try {
        localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${email}_${projectId}`, JSON.stringify(draft));
    } catch (e) {
        console.warn("Local storage saveProjectDraft warning:", e);
    }

    if (!isFirebaseConfigured || !db) return;

    try {
        await setDoc(doc(db, "users", email, "drafts", projectId), draft);
    } catch (error) {
        console.error("Error saving draft to Firestore, saved to localStorage: ", error);
    }
};

export const getProjectDraft = async (email: string, projectId: string): Promise<ProjectDraft | null> => {
    if (!email || !projectId) return null;

    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDoc(doc(db, "users", email, "drafts", projectId));
            if (snap.exists()) {
                const draft = snap.data() as ProjectDraft;
                localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${email}_${projectId}`, JSON.stringify(draft));
                return draft;
            }
        } catch (error) {
            console.error("Error getting draft from Firestore, falling back to localStorage: ", error);
        }
    }

    try {
        const localDraft = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${email}_${projectId}`);
        if (localDraft) {
            return JSON.parse(localDraft) as ProjectDraft;
        }
    } catch (e) {
        console.warn("Local storage getProjectDraft warning:", e);
    }

    return null;
};
