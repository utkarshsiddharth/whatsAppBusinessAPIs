import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = "my_secret_token"; // Same token used in Meta webhook setup

// Middleware to parse JSON
app.use(bodyParser.json());

// Webhook Verification (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(req.query,"query");
  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook Receiver (POST)
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    body.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        if (change.value.messages) {
          const msg = change.value.messages[0];
          console.log("📥 New Message Received:");
          console.log(JSON.stringify(msg, null, 2));
        }
      });
    });
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



