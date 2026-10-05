# GA4 Setup — Granting Imtihan Read Access to Real Analytics Data

> Written for the founder. You do not need to understand what a "service account" is
> conceptually — just follow the numbered steps below in order, using the exact menu names
> given. This unlocks a capability that's already built in the code
> (`src/lib/analytics-reporting.ts`) but currently has nothing to connect to — the app works
> completely normally without this; nothing breaks if you skip it or do it later.
>
> **What this is for:** lets Imtihan's tooling pull real numbers out of Google Analytics (GA4) —
> sessions, traffic sources, sign-ups, exams generated — automatically, instead of someone opening
> the GA4 website and copying numbers into `METRICS.md` by hand.
>
> **Time needed:** about 10 minutes. **Risk:** read-only access — the account you create in Step 2
> cannot change or delete anything in your Analytics data, it can only view it.

---

## Before you start: find your Google Cloud project name

Imtihan already has a Google Cloud project set up for Firebase (the login/database system). You'll
reuse that same project rather than creating a new one — you just need its name on hand for Step 2.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with the
   Google account you used to set up Imtihan.
2. Click on the **Imtihan** project.
3. Click the gear icon next to "Project Overview" (top left) → **Project settings**.
4. Under the **General** tab, note the value next to **Project ID** (not "Project name" — the ID,
   which looks like `imtihan-xxxxx` with lowercase letters and a dash). You'll need this in Step 2.

---

## Step 1 — Open Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in with the same
   Google account.
2. At the top of the page, click the project dropdown (next to the "Google Cloud" logo) and select
   the same project whose ID you noted above (it should appear in the list — it's the same project
   Firebase created for you).

---

## Step 2 — Create a service account

A "service account" is just a special Google account that code (not a human) can log in as. It has
no password — it logs in with a key file instead.

1. In the search bar at the top of Google Cloud Console, type **Service Accounts** and click the
   result under "IAM & Admin."
2. Click **+ Create Service Account** near the top.
3. For **Service account name**, type: `imtihan-ga4-reporting`
4. Leave everything else on this first screen as default. Click **Create and Continue**.
5. On the next screen ("Grant this service account access to project"), click **Continue** without
   selecting a role — you do **not** need to grant any Google Cloud role here. (The real access
   grant happens inside Google Analytics itself, in Step 4 — Cloud IAM roles and GA4's own access
   list are two separate systems, and this service account only needs the GA4-side one.)
6. Click **Done**.

You should now see `imtihan-ga4-reporting` in the list of service accounts, with an email address
that looks like `imtihan-ga4-reporting@<your-project-id>.iam.gserviceaccount.com`. **Copy this
email address somewhere — you'll need it twice (Step 4 and Step 5).**

---

## Step 3 — Create a key file for the service account

1. Still on the Service Accounts page, click on `imtihan-ga4-reporting` (the one you just created).
2. Click the **Keys** tab.
3. Click **Add Key** → **Create new key**.
4. Choose **JSON** (should already be selected) and click **Create**.
5. A `.json` file will download to your computer automatically. **Keep this file private** — anyone
   who has it can read your Analytics data. Don't email it or paste it into a chat; you'll copy two
   values out of it in Step 5 and then you can delete the file.

---

## Step 4 — Grant that service account access inside Google Analytics

This is the step people most often get wrong: creating the service account in Google Cloud (Steps
2-3) does **not** automatically give it any Analytics access. You have to separately add it inside
the Google Analytics website itself.

1. Go to [analytics.google.com](https://analytics.google.com) and sign in.
2. Make sure you're looking at the **Imtihan** GA4 property (check the property switcher near the
   top left if you have more than one).
3. Click the gear icon (bottom left) labeled **Admin**.
4. Under the **Property** column, click **Property Access Management**.
5. Click the blue **+** button (top right) → **Add users**.
6. In the "Email addresses" box, paste the service account email you copied in Step 2 (the one
   ending in `.iam.gserviceaccount.com`).
7. Under "Direct roles and data restrictions," check **Viewer**. Leave everything else unchecked.
8. Click **Add** (top right).

The service account can now *read* (never edit or delete) your GA4 data.

---

## Step 5 — Find your GA4 Property ID

1. Still in GA4 Admin (gear icon, bottom left), under the **Property** column, click
   **Property details** (sometimes just called "Property Settings").
2. Note the number labeled **Property ID** — it's a plain number, e.g. `123456789` (not the same
   as the Google Cloud Project ID from earlier, and not the "Measurement ID" that starts with
   `G-`, which is a different thing used elsewhere in the app).

---

## Step 6 — Fill in the 3 values

You now have everything needed. Open the `.json` file you downloaded in Step 3 in any text editor
(Notepad is fine). It contains several lines; you need exactly two of them, plus the Property ID
from Step 5:

| Env var name | Where to find the value |
|---|---|
| `GA4_PROPERTY_ID` | The number from Step 5 (just the number, e.g. `123456789` — no `properties/` prefix) |
| `GA4_SERVICE_ACCOUNT_EMAIL` | The `"client_email"` line in the downloaded JSON file |
| `GA4_SERVICE_ACCOUNT_PRIVATE_KEY` | The `"private_key"` line in the downloaded JSON file — copy the **entire** value between the quotes, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts and every `\n` exactly as it appears |

### Where to paste them

**A — Local development** (`.env.local` in the project folder, same file that already has your
Firebase keys): add three new lines, e.g.:

```
GA4_PROPERTY_ID=123456789
GA4_SERVICE_ACCOUNT_EMAIL=imtihan-ga4-reporting@imtihan-xxxxx.iam.gserviceaccount.com
GA4_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

Keep the quotation marks around the private key exactly as shown, and keep every `\n` in it as the
two characters backslash-then-n, not an actual line break — this matches how the existing
`FIREBASE_ADMIN_PRIVATE_KEY` value is already stored in the same file, right above it.

**B — Production (Vercel)**, so the live site/automation can use it too:

1. Go to [vercel.com](https://vercel.com), open the **Imtihan** project.
2. Click **Settings** → **Environment Variables**.
3. Add each of the 3 names above as its own entry, with the matching value, for the
   **Production** environment (and **Preview** too, if you want it available there as well).
4. Click **Save** for each one.

---

## Step 7 — Let engineering know

Once all 3 values are set (locally and/or on Vercel), post a one-line note in `TEAM_CHAT.md` or
tell the team directly — the reading code already exists (`src/lib/analytics-reporting.ts`) but is
intentionally not wired into any page, API route, or the nightly automation yet. Deciding how/where
to surface real GA4 numbers is a separate follow-up task, not something this setup alone turns on.

## If something goes wrong

- **"Permission denied" / no data comes back**: almost always Step 4 was skipped or the email
  pasted there has a typo — go back and re-check the exact email address matches what's in the
  downloaded JSON file's `"client_email"` field.
- **You want to revoke access later**: go back to Step 4's Property Access Management screen,
  find the service account's email in the user list, and remove it. You can also delete the whole
  service account from Google Cloud Console's Service Accounts page (Step 2) — either one fully
  cuts off access.
