import { z } from "zod";

export const UploadPurposeSchema = z.enum(["content", "inspiration", "structure", "branding"]);
export const UploadIntentSchema = z.object({
  purposes: z.array(UploadPurposeSchema).min(1).max(4),
  instructions: z.string().max(1500).default(""),
});
export const DocumentHeaderSchema = z.object({
  schoolName: z.string().max(250).optional(), className: z.string().max(250).optional(),
  teacherName: z.string().max(250).optional(), date: z.string().max(100).optional(),
});
export const PaperSectionSchema = z.object({
  title: z.string().min(1).max(160),
  marks: z.array(z.number().positive().max(200)).min(1).max(20),
  answerCount: z.number().int().min(1).max(20),
  instructions: z.string().max(1000).default(""),
}).superRefine((section, ctx) => {
  if (section.answerCount > section.marks.length) ctx.addIssue({ code: "custom", message: "Answer count exceeds offered questions." });
  if (section.answerCount < section.marks.length && new Set(section.marks).size !== 1)
    ctx.addIssue({ code: "custom", message: "Optional questions must have equal marks so every choice has the same total." });
});
export const PaperCompositionSchema = z.object({
  origin: z.enum(["custom", "profile", "uploaded"]), profileId: z.string().max(100).optional(),
  title: z.string().max(250).default(""), instructions: z.array(z.string().max(1000)).max(15).default([]),
  sections: z.array(PaperSectionSchema).min(1).max(10),
  footerText: z.string().max(250).default(""), answerSpaceLines: z.number().int().min(0).max(12).default(0),
}).superRefine((paper, ctx) => {
  if (paper.sections.flatMap(s => s.marks).length > 20) ctx.addIssue({ code: "custom", message: "A paper can offer at most 20 questions." });
});
export const DocumentStructureSchema = z.object({
  title: z.string().max(250).default(""), instructions: z.array(z.string().max(1000)).max(15).default([]),
  sections: z.array(PaperSectionSchema).max(10).default([]),
  header: DocumentHeaderSchema.optional(), footerText: z.string().max(250).default(""),
  uncertainties: z.array(z.string().max(500)).max(15).default([]),
});
export const SourceDocumentSchema = z.object({
  id: z.string().max(100), name: z.string().max(250), intent: UploadIntentSchema,
  structure: DocumentStructureSchema.optional(),
});
export const UPLOAD_MAX_BYTES = 3 * 1024 * 1024;
export const DocumentBase64Schema = z.string().max(4 * UPLOAD_MAX_BYTES / 3 + 100);
export const DocumentMimeSchema = z.enum(["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
export const UploadedFileSchema = z.object({ name: z.string().max(250), size: z.number().max(UPLOAD_MAX_BYTES), type: DocumentMimeSchema, base64: DocumentBase64Schema.min(1) });
export type UploadIntent = z.infer<typeof UploadIntentSchema>;
export type UploadPurpose = z.infer<typeof UploadPurposeSchema>;
export type PaperComposition = z.infer<typeof PaperCompositionSchema>;
export type PaperSection = z.infer<typeof PaperSectionSchema>;
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;
export type UploadedFile = z.infer<typeof UploadedFileSchema>;
