import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCEdMfA6EeaZS_37TdMtGjIsCcEfQXtbHE",
  authDomain: "abhyaas-quiz.firebaseapp.com",
  projectId: "abhyaas-quiz",
  storageBucket: "abhyaas-quiz.firebasestorage.app",
  messagingSenderId: "680297613965",
  appId: "1:680297613965:web:d7bd9f1f67b146382db0c4",
  measurementId: "G-TTSZTJ044G"
};

// Singleton pattern to prevent multiple instances
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;