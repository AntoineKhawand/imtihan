"use client";
import { useState } from "react";
import { EmailConfiguration } from "@/components/admin/EmailConfiguration";
import { EmailSendReport } from "@/components/admin/EmailSendReport";
const user = { getIdToken: async () => "qa-not-a-real-token" };
export function AdminEmailFixture() {
  const [show, setShow] = useState(true);
  return <main className="min-h-screen bg-[var(--bg)] p-4 text-[var(--text)]">
    <div className="mx-auto max-w-4xl space-y-6">
      <h1>Admin email QA — fixture data only</h1>
      <button onClick={() => { document.documentElement.classList.toggle("dark"); document.documentElement.setAttribute("data-theme", document.documentElement.classList.contains("dark") ? "dark" : "light"); }}>Toggle theme</button>
      <EmailConfiguration user={user} />
      {show && <EmailSendReport onDismiss={() => setShow(false)} result={{ sent: 1, failed: 2, skipped: 1, results: [
        { uid: "accepted", email: "accepted@example.test", success: true },
        { uid: "rejected", email: `${"long".repeat(20)}@example.test`, success: false, error: '<script>alert("fixture")</script> Provider rejected sender approval.' },
        { uid: "unknown", email: "unknown@example.test", success: false, error: "Delivery status unknown after a connection error. Check Brevo logs before retrying to avoid duplicates." },
        { uid: "optout", email: "optout@example.test", success: false, skipped: true, error: "Recipient opted out of promotional emails." },
      ] }} />}
    </div>
  </main>;
}
