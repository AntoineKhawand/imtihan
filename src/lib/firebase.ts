import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export let auth: Auth;
export let db: Firestore;
export let storage: FirebaseStorage;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export { getFirebaseConfig };

function initFirebase() {
  const config = getFirebaseConfig();
  
  console.log("[firebase] Init with config:", JSON.stringify(config, null, 2));
  
  if (!config.apiKey) {
    console.error("[firebase] MISSING API KEY - env vars not set");
    return;
  }

  let app: FirebaseApp;
  try {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(config);
    }
  } catch (e) {
    console.error("[firebase] Init error:", e);
    return;
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log("[firebase] Initialized. Auth:", !!auth, "Db:", !!db);
}

initFirebase();