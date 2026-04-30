const { adminDb } = require("../src/lib/firebase-admin");

async function grantPro(email, days) {
  try {
    const snap = await adminDb.collection("users").where("email", "==", email).get();
    if (snap.empty) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    const userDoc = snap.docs[0];
    const uid = userDoc.id;
    const currentData = userDoc.data();
    
    const currentExpiry = currentData.proExpiresAt || Date.now();
    const newExpiry = Math.max(currentExpiry, Date.now()) + (days * 24 * 60 * 60 * 1000);
    const planType = days >= 365 ? "yearly" : "monthly";

    await adminDb.collection("users").doc(uid).update({
      proExpiresAt: newExpiry,
      planType: planType,
      monthlyExamsGenerated: 0,
      monthlyPeriodStart: Date.now(),
      renewalRequested: false,
    });

    console.log(`Successfully granted ${days} days of Pro to ${email}.`);
    console.log(`New expiry: ${new Date(newExpiry).toISOString()}`);
  } catch (error) {
    console.error("Error granting Pro:", error);
  }
}

grantPro("bassel_yassine74@hotmail.com", 30);
