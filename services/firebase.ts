import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with settings to force long polling if websockets are blocked
// This often fixes the "client is offline" error on some networks/browsers
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
}, "skillstorage");

export const googleProvider = new GoogleAuthProvider();

export const githubProvider = new GithubAuthProvider();

