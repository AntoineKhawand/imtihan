"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, increment, serverTimestamp, onSnapshot } from "firebase/firestore";
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
  incrementUsage: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Holds the Firestore onSnapshot unsubscribe so we can clean it up
  const profileUnsub = useRef<(() => void) | null>(null);

  async function syncSessionCookie(currentUser: User | null) {
    try {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } else {
        await fetch("/api/auth/session", { method: "DELETE" });
      }
    } catch { /* non-fatal */ }
  }

  async function fetchProfileFromApi(): Promise<UserProfile | null> {
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const { profile } = await res.json();
        return profile as UserProfile;
      }
    } catch { /* non-fatal */ }
    return null;
  }

  async function subscribeToProfile(currentUser: User) {
    // Cancel any previous listener
    profileUnsub.current?.();

    // Force a token fetch so Firestore has the latest auth state before we subscribe.
    try {
      await currentUser.getIdToken();
    } catch { /* non-fatal */ }

    const userRef = doc(db, "users", currentUser.uid);

    const unsub = onSnapshot(userRef, async (snap) => {
      if (snap.exists()) {
        // Profile exists — update local state on every Firestore change
        setProfile(snap.data() as UserProfile);
      } else {
        // First sign-in — create the profile document
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email ?? "",
          displayName: currentUser.displayName ?? "Educator",
          createdAt: Date.now(),
          role: "teacher",
          country: "LB",
          examsGenerated: 0,
          subscription: { status: "none", tier: "free" },
        };
        try {
          await setDoc(userRef, { ...newProfile, createdAt: serverTimestamp() });
          // onSnapshot will fire again with the new document

          // 🎉 Send welcome newsletter (fire-and-forget — non-blocking)
          fetch("/api/auth/welcome", { method: "POST" }).catch(() => {
            // Non-fatal — cron backfill will catch missed sends
          });
        } catch (err) {
          console.error("[AuthContext] Failed to create profile:", err);
          setProfile(newProfile); // fallback
        }
      }
    }, async (err) => {
      // Firestore read failed (e.g. security rules not yet deployed, or transient auth delay).
      // Fall back to fetching the profile from the server-side API which uses the Admin SDK.
      console.warn("[AuthContext] Firestore listener error — falling back to API:", err.message);
      const apiProfile = await fetchProfileFromApi();
      if (apiProfile) {
        setProfile(apiProfile);
        // Poll every 15s so plan upgrades propagate without a hard refresh
        const intervalId = setInterval(async () => {
          const updated = await fetchProfileFromApi();
          if (updated) setProfile(updated);
        }, 15_000);
        // Store the interval cleanup in the unsub ref slot (overwrite Firestore unsub)
        profileUnsub.current = () => clearInterval(intervalId);
      }
    });

    profileUnsub.current = unsub;
  }

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      syncSessionCookie(currentUser);

      if (currentUser) {
        // subscribeToProfile fetches the ID token internally before attaching onSnapshot
        await subscribeToProfile(currentUser);
        // Update last login timestamp (token is already valid after subscribeToProfile)
        updateDoc(doc(db, "users", currentUser.uid), {
          lastLoginAt: Date.now()
        }).catch(err => console.error("Failed to update lastLoginAt:", err));
      } else {
        // Signed out — tear down the profile listener
        profileUnsub.current?.();
        profileUnsub.current = null;
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      profileUnsub.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const incrementUsage = async () => {
    if (!user) return;
    try {
      // Increment the lifetime counter — onSnapshot propagates the change automatically
      await updateDoc(doc(db, "users", user.uid), {
        examsGenerated: increment(1),
      });
    } catch (err) {
      console.error("[AuthContext] incrementUsage error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, incrementUsage }}>
      {children}
    </AuthContext.Provider>
  );
}
