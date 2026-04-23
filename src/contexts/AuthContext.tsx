"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

import { UserProfile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  incrementUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase auth state with our custom session cookie for Next.js Middleware
  const syncSessionCookie = async (user: User | null) => {
    try {
      console.log("[AuthContext] Syncing session cookie. User:", user?.email || "null");
      if (user) {
        const token = await user.getIdToken();
        console.log("[AuthContext] Got ID token. Sending to /api/auth/session...");
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        console.log("[AuthContext] Session API response status:", res.status);
      } else {
        console.log("[AuthContext] No user. Clearing session...");
        await fetch("/api/auth/session", { method: "DELETE" });
        console.log("[AuthContext] Session cleared.");
      }
    } catch (error) {
      console.error("[AuthContext] syncSessionCookie error:", error);
    }
  };

  // Ensure user exists in Firestore
  const ensureUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          createdAt: Date.now(),
          role: "teacher", // Default role
          country: "LB",
          examsGenerated: 0,
          subscription: {
            status: "none",
            tier: "free",
          },
        };
        await setDoc(userRef, {
          ...newUserProfile,
          createdAt: serverTimestamp(),
        });
        setProfile(newUserProfile);
      } else {
        setProfile(userSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error("Failed to create/fetch user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      // Non-blocking sync to prevent UI freezes
      syncSessionCookie(currentUser).catch(err => console.error("[AuthContext] Session sync error:", err));
      
      if (currentUser) {
        ensureUserProfile(currentUser).catch(err => console.error("[AuthContext] Profile ensure error:", err));
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // syncSessionCookie(null) is handled automatically by onAuthStateChanged
  };

  const incrementUsage = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        examsGenerated: increment(1)
      });
      // Refresh profile
      const snap = await getDoc(userRef);
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, incrementUsage }}>
      {children}
    </AuthContext.Provider>
  );
}
