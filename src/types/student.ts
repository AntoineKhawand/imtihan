export interface StudentProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
  role: "student";
  schoolName?: string;
}

export interface StudentAttempt {
  id?: string;
  exerciseId: string;
  userId: string;
  isCorrect: boolean;
  score: number;
  timestamp: number;
  category: string;
  exerciseTitle: string;
  difficulty?: string;
}
