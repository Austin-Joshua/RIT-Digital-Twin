import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration using environment variables
// These should be added to your .env.local file
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const hasFirebaseConfig =
    typeof firebaseConfig.apiKey === "string" &&
    firebaseConfig.apiKey.trim().length > 0 &&
    typeof firebaseConfig.authDomain === "string" &&
    firebaseConfig.authDomain.trim().length > 0 &&
    typeof firebaseConfig.projectId === "string" &&
    firebaseConfig.projectId.trim().length > 0 &&
    typeof firebaseConfig.appId === "string" &&
    firebaseConfig.appId.trim().length > 0;

let app = null;
let analytics = null;
let auth = null;
let googleProvider = null;

if (hasFirebaseConfig) {
    try {
        app = initializeApp(firebaseConfig);
        analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } catch (error) {
        console.warn("[Firebase] Initialization failed. Google login disabled.", error);
    }
} else {
    console.info("[Firebase] Missing env config. Google login disabled.");
}

export { app, analytics, auth, googleProvider };

// Optional: Force account selection when Google provider is active
if (googleProvider) {
    googleProvider.setCustomParameters({
        prompt: "select_account",
    });
}

export default app;
