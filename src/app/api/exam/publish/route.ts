import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { exam, settings } = await req.json();

    if (!exam || !exam.exercises) {
      return NextResponse.json({ error: "Invalid exam data" }, { status: 400 });
    }

    // Publish to Firestore
    const examRef = await addDoc(collection(db, "live_exams"), {
      title: exam.title,
      context: exam.context,
      exercises: exam.exercises.map((ex: any, idx: number) => ({
        ...ex,
        id: ex.id || `ex-${idx}`,
        // Remove corrigé for student view
        solution: undefined,
        methodology: undefined
      })),
      settings: {
        timeLimit: settings.timeLimit || 60,
        shuffleQuestions: settings.shuffleQuestions || false,
        antiCheating: settings.antiCheating || true,
        showResults: settings.showResults || false
      },
      teacherId: exam.teacherId || "anonymous",
      createdAt: serverTimestamp(),
      isActive: true
    });

    return NextResponse.json({ 
      success: true, 
      examId: examRef.id,
      link: `${new URL(req.url).origin}/exam/${examRef.id}`
    });

  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: "Failed to publish exam" }, { status: 500 });
  }
}
