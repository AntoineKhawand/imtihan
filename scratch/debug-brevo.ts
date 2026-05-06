import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function debugBrevo() {
  const apiKey = process.env.BREVO_API_KEY;
  const url = "https://api.brevo.com/v3/smtp/email";
  
  const payload = {
    sender: { name: "Imtihan", email: "admin@imtihan.live" },
    to: [{ email: "antoinekhawand04@gmail.com", name: "Antoine" }],
    subject: "Final Logo & Feature Fix Test",
    htmlContent: "<h1>Logo Fix Test</h1><p>If you see this, the API key and connection are working.</p>"
  };

  console.log("Sending with Key:", apiKey?.slice(0, 10) + "...");
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey as string
    },
    body: JSON.stringify(payload)
  });

  const status = res.status;
  const text = await res.text();
  
  console.log("Status:", status);
  console.log("Response:", text);
}

debugBrevo();
