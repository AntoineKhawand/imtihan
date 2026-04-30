const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf-8");
  env.split("\n").forEach(line => {
    const [key, ...value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
}

const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "")
  .replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    })
  });
}

const db = admin.firestore();

async function grantPro(email, days) {
  try {
    const snap = await db.collection("users").where("email", "==", email).get();
    if (snap.empty) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    const userDoc = snap.docs[0];
    const uid = userDoc.id;
    const currentData = userDoc.data();
    
    const currentExpiry = currentData.proExpiresAt || Date.now();
    const newExpiry = Math.max(currentExpiry, Date.now()) + (days * 24 * 60 * 60 * 1000);

    await db.collection("users").doc(uid).update({
      proExpiresAt: newExpiry,
      planType: "monthly",
      monthlyExamsGenerated: 0,
      monthlyPeriodStart: Date.now(),
      renewalRequested: false,
    });

    console.log(`Successfully granted ${days} days of Pro to ${email}.`);
    console.log(`New expiry: ${new Date(newExpiry).toISOString()}`);
    process.exit(0);
  } catch (error) {
    console.error("Error granting Pro:", error);
    process.exit(1);
  }
}

grantPro("bassel_yassine74@hotmail.com", 30);
