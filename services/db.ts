import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
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
        // We store roadmaps as a subcollection or just a field?
        // Storing as a field in a separate document to avoid size limits on user doc if many roadmaps
        // Or better, a subcollection. Let's use a subcollection 'data' and doc 'roadmaps'
        // Actually, for simplicity given the current app structure, let's store them in a separate collection "roadmaps" keyed by user email or inside the user doc if small.
        // The app loads all roadmaps at once. Let's store them in the user document for now for simplicity, or a separate doc.
        // Let's use a separate document `users/{email}/data/roadmaps` to keep the user profile light.

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
