import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/brevo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.imtihan.live";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";
const LOGO_URL = `${APP_URL}/Imtihan-logo.png`;
const tw = (code: string, _alt?: string, _size = 22) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildNewsletterHtml(firstName: string): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media screen and (max-width:620px){.container{width:100%!important}.hero{padding:28px 24px!important}.body-content{padding:28px 24px!important}.footer{padding:24px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a">
<div style="max-width:620px;margin:32px auto;padding:0 16px 48px">
  <div class="hero" style="background:linear-gradient(160deg,#0f3d28 0%,#1a5e3f 50%,#2d8f5f 100%);border-radius:20px 20px 0 0;padding:40px 44px 36px;position:relative;overflow:hidden">
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px"><tr>
      <td style="padding-right:14px;vertical-align:middle"><img src="${LOGO_URL}" alt="Imtihan" width="48" height="48" style="border-radius:12px;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.3)" /></td>
      <td style="vertical-align:middle"><span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.3px">Imtihan</span><br/><span style="font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.8px;text-transform:uppercase">AI Exam Generator</span></td>
    </tr></table>
    <h1 style="margin:0 0 10px;font-size:28px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-0.5px">Your monthly update from the Imtihan team</h1>
    <p style="margin:0;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.65;max-width:440px">New features, teaching tips, and everything you need to get more out of Imtihan this month.</p>
  </div>
  <div style="background:#fff;padding:44px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
    <p style="color:#475569;line-height:1.75;margin:0 0 36px;font-size:15px">Hi ${firstName},<br/><br/>It's been a productive month for Lebanese educators on Imtihan. Here's what's new and what's improved.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:16px;overflow:hidden;background:#fff">
      <tr><td style="padding:22px 24px"><table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:16px;vertical-align:top;padding-top:2px"><div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;line-height:44px"><img src="${tw("1f4ca")}" width="22" height="22" /></div></td>
        <td><strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">Barème & Micro-barème in every corrigé</strong><p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">Every generated exam now includes a detailed marking grid. Grade in half the time.</p></td>
      </tr></table></td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:16px;overflow:hidden;background:#fff">
      <tr><td style="padding:22px 24px"><table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:16px;vertical-align:top;padding-top:2px"><div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;line-height:44px"><img src="${tw("1f500")}" width="22" height="22" /></div></td>
        <td><strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">Version A & B — Anti-cheating exams</strong><p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">Generate two parallel versions with different numbers and shuffled questions.</p></td>
      </tr></table></td></tr></table>
    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}/create" style="display:inline-block;background:linear-gradient(135deg,#1a5e3f,#2d8f5f);color:#fff;text-decoration:none;padding:16px 48px;border-radius:13px;font-weight:700;font-size:16px;box-shadow:0 4px 20px rgba(26,94,63,0.35)">Generate an exam now →</a>
      <p style="color:#94a3b8;font-size:12px;margin:12px 0 0">2 free exams · No credit card required</p>
    </div>
  </div>
  <div style="background:#1e293b;border-radius:0 0 20px 20px;padding:32px 44px;text-align:center">
    <p style="color:#475569;font-size:11px;margin:0;line-height:1.7">Imtihan · Beirut, Lebanon · <a href="${APP_URL}/contact" style="color:#64748b;text-decoration:none">Contact</a></p>
  </div>
</div></body></html>`;
}

function buildActivationHtml(firstName: string): string {
  return `<!doctype html><html>
<head><meta charset="UTF-8"><style>@media screen and (max-width:600px){.email-container{width:100%!important}.header-section{padding:32px 24px!important}.content-section{padding:32px 24px!important}}</style></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">
<tr><td class="header-section" style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:48px;position:relative;overflow:hidden">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><img src="${LOGO_URL}" width="44" height="44" style="display:block;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.25)" /></td>
<td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;vertical-align:middle;">Getting Started</td></tr></table>
<div style="margin-top:32px;"><h1 style="margin:0;font-size:30px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.5px;">Hi ${firstName}, your first exam is waiting</h1>
<p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.8);line-height:1.6;">It takes just 30 seconds to generate your first exam.</p></div>
</td></tr>
<tr><td class="content-section" style="padding:48px;">
<p style="margin:0 0 28px;font-size:16px;color:#334155;line-height:1.7;">Just <strong>3 simple steps</strong> and you'll have a complete exam with corrigé:</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
<tr><td style="padding-bottom:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:14px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>
<td width="44" style="vertical-align:top;"><div style="width:36px;height:36px;background:#1a5e3f;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#fff;font-size:16px;">1</div></td>
<td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:3px;">Describe your exam</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.5;">Type your subject and topics in any language.</p></td></tr></table></td></tr>
<tr><td style="padding-bottom:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:14px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>
<td width="44" style="vertical-align:top;"><div style="width:36px;height:36px;background:#1a5e3f;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#fff;font-size:16px;">2</div></td>
<td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:3px;">Pick your curriculum</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.5;">Bac Libanais, Bac Français, IB, or University.</p></td></tr></table></td></tr>
<tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:14px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>
<td width="44" style="vertical-align:top;"><div style="width:36px;height:36px;background:#1a5e3f;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#fff;font-size:16px;">3</div></td>
<td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:3px;">Generate & Download</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.5;">Your exam + corrigé appears in under 30 seconds.</p></td></tr></table></td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);border-radius:18px;border:1px solid #bbf7d0;margin-bottom:32px;">
<tr><td style="padding:28px 32px;"><table cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:16px;vertical-align:top;font-size:36px;">🎁</td>
<td><div style="font-weight:800;color:#166534;font-size:16px;margin-bottom:6px;">Your 2 free exams are ready</div><p style="margin:0;color:#15803d;font-size:14px;line-height:1.6;">No credit card needed.</p></td></tr></table></td></tr></table>
<div style="text-align:center;"><a href="${APP_URL}/create" style="display:inline-block;background:linear-gradient(135deg,#1a5e3f,#2d8f5f);color:#fff;text-decoration:none;padding:16px 44px;border-radius:14px;font-weight:800;font-size:16px;box-shadow:0 8px 24px rgba(26,94,63,0.35);">Generate my first exam →</a></div>
</td></tr>
<tr><td style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #eef2f6;"><p style="margin:0;color:#94a3b8;font-size:12px;">Imtihan · Built for Lebanese teachers</p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildEngagementHtml(firstName: string, count: number): string {
  return `<!doctype html><html>
<head><meta charset="UTF-8"><style>@media screen and (max-width:600px){.email-container{width:100%!important}.header-section{padding:32px 24px!important}.content-section{padding:32px 24px!important}}</style></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">
<tr><td class="header-section" style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:40px 48px;position:relative;overflow:hidden">
<img src="${LOGO_URL}" width="40" height="40" style="border-radius:12px;margin-bottom:24px;box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
<h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">How's it going, ${firstName}?</h1>
</td></tr>
<tr><td class="content-section" style="padding:48px;">
<p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">You've already generated <strong>${count} exam${count > 1 ? "s" : ""}</strong> with Imtihan — that's amazing! We hope it's saving you hours of work.</p>
<div style="background:#f0fdf4;border-radius:20px;padding:32px;border:1px solid #dcfce7;margin-bottom:32px;">
<div style="font-weight:800;color:#166534;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Pro Tips</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f500")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Version A & B</b>: Create parallel versions to stop cheating.</td></tr>
<tr><td style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f4cb")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Full Barème</b>: Points breakdown included in every key.</td></tr>
<tr><td style="color:#166534;font-size:15px;"><img src="${tw("1f516")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Exercise Bank</b>: Save your favorite AI questions.</td></tr>
</table></div>
<a href="${APP_URL}/create" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(26,94,63,0.3);">Generate another exam →</a>
</td></tr>
<tr><td style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #eef2f6;"><p style="margin:0;color:#94a3b8;font-size:12px;">Imtihan · Built for Lebanese teachers</p></td></tr>
</table></td></tr></table></body></html>`;
}

export async function POST(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { template, subject, html, targetUids }: { template: string; subject?: string; html?: string; targetUids: string[] } = body;

    if (!targetUids || targetUids.length === 0) {
      return NextResponse.json({ error: "No users selected" }, { status: 400 });
    }

    const results: { uid: string; email: string; success: boolean; error?: string }[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const targetUid of targetUids) {
      const userDoc = await adminDb.collection("users").doc(targetUid).get();
      if (!userDoc.exists) {
        results.push({ uid: targetUid, email: "", success: false, error: "User not found" });
        failCount++;
        continue;
      }

      const userData = userDoc.data();
      const email = userData?.email;
      const name = userData?.displayName ?? "";
      const firstName = name?.split(" ")[0] || "there";
      const examCount = userData?.examsGenerated ?? 0;

      if (!email) {
        results.push({ uid: targetUid, email: "", success: false, error: "No email" });
        failCount++;
        continue;
      }

      let finalSubject = subject ?? "Imtihan";
      let finalHtml = html ?? "";

      switch (template) {
        case "newsletter":
          finalSubject = "Imtihan Newsletter — Latest Updates";
          finalHtml = buildNewsletterHtml(firstName);
          break;
        case "activation":
          finalSubject = "Your first exam is waiting — takes 30 seconds ⚡";
          finalHtml = buildActivationHtml(firstName);
          break;
        case "engagement":
          finalSubject = "How's your experience with Imtihan so far? 💬";
          finalHtml = buildEngagementHtml(firstName, examCount);
          break;
        case "custom":
          if (!subject || !html) {
            results.push({ uid: targetUid, email, success: false, error: "Custom template requires subject and html" });
            failCount++;
            continue;
          }
          break;
        default:
          results.push({ uid: targetUid, email, success: false, error: "Unknown template" });
          failCount++;
          continue;
      }

      const res = await sendEmail({ to: email, toName: name || email, subject: finalSubject, html: finalHtml });
      if (res.ok) {
        successCount++;
        results.push({ uid: targetUid, email, success: true });
      } else {
        failCount++;
        results.push({ uid: targetUid, email, success: false, error: res.error });
      }
    }

    return NextResponse.json({ success: true, sent: successCount, failed: failCount, results });
  } catch (err) {
    console.error("[/api/admin/send-email]", err);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
