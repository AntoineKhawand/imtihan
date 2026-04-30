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
const auth = admin.auth();

async function anonymizeUser(oldEmail, newEmail, newName) {
  try {
    const snap = await db.collection("users").where("email", "==", oldEmail).get();
    if (snap.empty) {
      console.log(`User with email ${oldEmail} not found in Firestore.`);
      process.exit(1);
    }

    const userDoc = snap.docs[0];
    const uid = userDoc.id;

    // 1. Update Firestore
    await db.collection("users").doc(uid).update({
      email: newEmail,
      displayName: newName
    });
    console.log(`Updated Firestore: ${oldEmail} -> ${newEmail}, Name -> ${newName}`);

    // 2. Update Auth (if exists)
    try {
      await auth.updateUser(uid, {
        email: newEmail,
        displayName: newName
      });
      console.log(`Updated Firebase Auth for UID: ${uid}`);
    } catch (authError) {
      console.warn("Could not update Firebase Auth (user might only exist in Firestore):", authError.message);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error anonymizing user:", error);
    process.exit(1);
  }
}

const OLD_EMAIL = "antoinekhawand04@gmail.com";
const NEW_EMAIL = "jp.mansour@imtihan.live";
const NEW_NAME = "Jean-Paul Mansour";

anonymizeUser(OLD_EMAIL, NEW_EMAIL, NEW_NAME);
