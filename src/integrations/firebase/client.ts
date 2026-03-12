import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseGoogleClientId =
  import.meta.env.VITE_FIREBASE_GOOGLE_CLIENT_ID ||
  "1005700612642-42gmksngin863v58vi9qosg2t5v98trj.apps.googleusercontent.com";

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

const app = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
  client_id: firebaseGoogleClientId,
});
