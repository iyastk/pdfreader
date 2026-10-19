import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDFEbRePoY9ceZwjjWzHNo9aqJTtaJdl8w",
  authDomain: "pdfreader-f74ea.firebaseapp.com",
  projectId: "pdfreader-f74ea",
  storageBucket: "pdfreader-f74ea.firebasestorage.app",
  messagingSenderId: "777347589000",
  appId: "1:777347589000:web:b1c0e512855b0dd0ab103d",
  measurementId: "G-FDPQJN3Z9X"
};

// Prevent re-initialization in Next.js dev mode (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
