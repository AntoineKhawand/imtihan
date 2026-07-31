"use client";

/**
 * Student auth context + hook.
 * Separate from the teacher AuthContext — subscribes to student_profiles/{uid}
 * and handles student-only registration flow.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { StudentProfile } from "@/types/student";

// ─── Context type ─────────────────────────────────────────────────────────────

interface StudentAuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    schoolName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType>({
  user: null,
  studentProfile: null,
  loading: true,
  signIn: async () => {},
  register: async () => {},
  signOut: async () => {},
});

export const useStudentAuth = () => useContext(StudentAuthContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileUnsub = useRef<(() => void) | null>(null);

  function subscribeToStudentProfile(currentUser: User) {
    profileUnsub.current?.();

    const ref = doc(db, "student_profiles", currentUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setStudentProfile(snap.data() as StudentProfile);
        } else {
          setStudentProfile(null);
        }
      },
      (err) => {
        console.warn("[StudentAuth] profile listener error:", err.message);
        setStudentProfile(null);
      }
    );
    profileUnsub.current = unsub;
  }

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await currentUser.getIdToken();
        subscribeToStudentProfile(currentUser);
      } else {
        profileUnsub.current?.();
        profileUnsub.current = null;
        setStudentProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      profileUnsub.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ────────────────────────────────────────────────────────────

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(
    email: string,
    password: string,
    displayName: string,
    schoolName?: string
  ) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = credential.user;

    // Update Firebase Auth display name
    await updateProfile(credential.user, { displayName });

    const now = Date.now();

    // Write student_profiles document
    const profileData: StudentProfile = {
      uid,
      email,
      displayName,
      createdAt: now,
      role: "student",
      ...(schoolName ? { schoolName } : {}),
    };
    await setDoc(doc(db, "student_profiles", uid), {
      ...profileData,
      createdAt: serverTimestamp(),
    });

    // Write a minimal users/{uid} record so the teacher AuthContext
    // does NOT auto-create a teacher profile for this user.
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      displayName,
      role: "student",
      createdAt: serverTimestamp(),
      examsGenerated: 0,
      country: "LB",
      subscription: { status: "none", tier: "free" },
    });
  }

  async function signOut() {
    await firebaseSignOut(auth);
    // Clear the server-side session cookie used by teacher routes
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
  }

  return (
    <StudentAuthContext.Provider
      value={{ user, studentProfile, loading, signIn, register, signOut }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}
