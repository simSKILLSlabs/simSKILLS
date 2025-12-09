import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { UserProfile, CareerRoadmap, ProjectDraft, ProjectFile } from '../types';

// Helper to remove undefined values (Firestore doesn't like them)
const sanitizeData = (data: any): any => {
    const newData = { ...data };
    Object.keys(newData).forEach(key => {
        if (newData[key] === undefined) {
            delete newData[key];
        } else if (typeof newData[key] === 'object' && newData[key] !== null && !Array.isArray(newData[key])) {
            newData[key] = sanitizeData(newData[key]);
        }
    });
    return newData;
}

export const saveUser = async (user: UserProfile) => {
    if (!user.email) return;
    try {
        const sanitizedUser = sanitizeData(user);
        await setDoc(doc(db, "users", user.email), sanitizedUser, { merge: true });
    } catch (e) {
        console.error("Error saving user: ", e);
        throw e; // Propagate error to caller
    }
};

export const getUser = async (email: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, "users", email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
    } catch (e) {
        console.error("Error getting user: ", e);
        throw e;
    }
    return null;
};

export const saveRoadmaps = async (email: string, roadmaps: CareerRoadmap[]) => {
    if (!email) return;
    try {
        await setDoc(doc(db, "users", email, "data", "roadmaps"), { list: roadmaps });
    } catch (e) {
        console.error("Error saving roadmaps: ", e);
        throw e;
    }
};

export const getRoadmaps = async (email: string): Promise<CareerRoadmap[]> => {
    try {
        const docRef = doc(db, "users", email, "data", "roadmaps");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().list as CareerRoadmap[];
        }
    } catch (e) {
        console.error("Error getting roadmaps: ", e);
    }
    return [];
};

export const saveFeedback = async (feedback: any) => {
    try {
        await addDoc(collection(db, "feedback"), feedback);
    } catch (error) {
        console.error("Error saving feedback: ", error);
        throw error;
    }
};

export const saveProjectDraft = async (email: string, projectId: string, files: Record<string, ProjectFile>) => {
    try {
        await setDoc(doc(db, "users", email, "drafts", projectId), {
            files,
            lastModified: Date.now()
        });
    } catch (error) {
        console.error("Error saving draft: ", error);
    }
};

export const getProjectDraft = async (email: string, projectId: string): Promise<ProjectDraft | null> => {
    try {
        const snap = await getDoc(doc(db, "users", email, "drafts", projectId));
        return snap.exists() ? snap.data() as ProjectDraft : null;
    } catch (error) {
        console.error("Error getting draft: ", error);
        return null; // Return null instead of empty string for better checking
    }
};
