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

async function listUsers() {
  try {
    const snap = await db.collection("users").get();
    console.log(`Total users: ${snap.size}`);
    snap.docs.forEach(doc => {
      console.log(`- ${doc.data().email} (UID: ${doc.id})`);
    });
    process.exit(0);
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }
}

listUsers();
