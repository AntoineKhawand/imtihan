import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export let auth: Auth;
export let db: Firestore;
export let storage: FirebaseStorage;

export function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function initFirebase() {
  // Never run during SSR / Next.js build-time prerendering.
  // Firebase client SDK requires a real browser and valid env vars.
  if (typeof window === "undefined") return;

  const config = getFirebaseConfig();
  if (!config.apiKey) {
    console.error("[firebase] NEXT_PUBLIC_FIREBASE_API_KEY is not set — skipping init");
    return;
  }

  let app: FirebaseApp;
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
  } catch (e) {
    console.error("[firebase] initializeApp error:", e);
    return;
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

initFirebase();
