import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/brevo";
import { generateWordDocument } from "@/app/api/export/route";

// Same schema as /api/export
const RequestSchema = z.object({
  context: z.object({
    subject: z.string(),
    curriculumId: z.string(),
    levelId: z.string(),
    language: z.enum(["english", "french", "arabic"]),
    examType: z.string(),
    duration: z.number(),
    totalPoints: z.number(),
  }),
  templateId: z.string(),
  exercises: z.array(z.any()),
  header: z.object({
    schoolName: z.string().optional(),
    teacherName: z.string().optional(),
  }).optional(),
  to: z.string().email(),
});

/**
 * Generate and Send in one step to avoid Vercel payload limits.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { context, templateId, exercises, header, to } = parsed.data;

    // 1. Generate the buffer on the server
    const buffer = await generateWordDocument(context, templateId, exercises, header ?? {});
    const base64 = Buffer.from(buffer).toString("base64");
    const fileName = `Imtihan_${context.subject}_${context.levelId}.docx`;

    // 2. Send via Brevo directly
    const subject = `Your Exam: ${context.subject} — ${context.levelId}`;
    const result = await sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #1a5e3f;">Imtihan</h2>
          <p>Your generated exam is ready!</p>
          <p><strong>Subject:</strong> ${context.subject}</p>
          <p><strong>Level:</strong> ${context.levelId}</p>
          <br/>
          <p style="color: #666; font-size: 13px;">Attached is your professional Word document (.docx). It includes the complete corrigé.</p>
        </div>
      `,
      attachment: { name: fileName, content: base64 },
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Email failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/export/send]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
