export interface EmailSendResult {
  sent: number;
  failed: number;
  skipped: number;
  results: { uid: string; email: string; success: boolean; skipped?: boolean; error?: string }[];
}
