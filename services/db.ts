import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { UserProfile, CareerRoadmap } from '../types';

export const saveUser = async (user: UserProfile) => {
    if (!user.email) return;
    try {
        await setDoc(doc(db, "users", user.email), user, { merge: true });
    } catch (e) {
        console.error("Error saving user: ", e);
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
    }
    return null;
};

export const saveRoadmaps = async (email: string, roadmaps: CareerRoadmap[]) => {
    if (!email) return;
    try {
        await setDoc(doc(db, "users", email, "data", "roadmaps"), { list: roadmaps });
    } catch (e) {
        console.error("Error saving roadmaps: ", e);
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
