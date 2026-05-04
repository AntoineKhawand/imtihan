import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from "firebase/firestore";
import type { BankExercise } from "./storage";

/**
 * Shares an exercise from a teacher's personal bank to their school's shared repository.
 */
export async function shareToSchoolBank(
  entry: BankExercise, 
  schoolName: string, 
  contributor: string
) {
  if (typeof window === "undefined" || !db) return;

  const schoolBankRef = collection(db, "school_bank");
  
  // Create a Firestore-friendly version of the exercise
  // Removing any potentially incompatible fields if necessary
  const docData = {
    exercise: entry.exercise,
    subject: entry.subject,
    curriculumId: entry.curriculumId,
    language: entry.language,
    tags: entry.tags || [],
    school: schoolName,
    contributor: contributor,
    sharedAt: serverTimestamp(),
    originalId: entry.id // Keep track of the original personal ID
  };

  try {
    const docRef = await addDoc(schoolBankRef, docData);
    return docRef.id;
  } catch (err) {
    console.error("[schoolBank] Failed to share exercise:", err);
    throw err;
  }
}

/**
 * Fetches all shared exercises for a specific school.
 */
export async function getSchoolBankExercises(schoolName: string): Promise<any[]> {
  if (typeof window === "undefined" || !db || !schoolName) return [];

  const schoolBankRef = collection(db, "school_bank");
  const q = query(
    schoolBankRef, 
    where("school", "==", schoolName),
    orderBy("sharedAt", "desc")
  );
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to number if needed for UI consistency
        savedAt: data.sharedAt?.toMillis() || Date.now(),
      };
    });
  } catch (err) {
    console.error("[schoolBank] Failed to fetch shared exercises:", err);
    return [];
  }
}
