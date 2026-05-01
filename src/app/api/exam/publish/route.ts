import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { exam, settings } = await req.json();

    if (!exam || !exam.exercises) {
      return NextResponse.json({ error: "Invalid exam data" }, { status: 400 });
    }

    // Publish to Firestore using Admin SDK
    const examRef = await adminDb.collection("live_exams").add({
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
