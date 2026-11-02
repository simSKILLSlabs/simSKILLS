import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, Auth } from "firebase/auth";
import { initializeFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "undefined" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "undefined"
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        authInstance = getAuth(app);
        dbInstance = initializeFirestore(app, {
            experimentalForceLongPolling: true,
        }, "skillstorage");
    } catch (error) {
        console.warn("Firebase initialization skipped or failed, falling back to local storage:", error);
    }
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();


