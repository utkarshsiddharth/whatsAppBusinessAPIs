import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
const app = express();
const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = "my_secret_token"; // Same token used in Meta webhook setup

// Middleware to parse JSON
app.use(bodyParser.json());

const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0/550374258168588/messages";
const ACCESS_TOKEN = "EAAYeLz5WOyEBO5ZC5cYJDH5HVNXPmmF5ob8FQozeTJEJZBuOh7SZAjowR16ubf9hZBsJxooZCZCcjMoCtDn3ZC5qwcoSWlg6ZCGNr14WowrQCOZBmhZAxZAeTQGNr6iG9HFBTpgy2Opv593nzqfmqZBSdu3HPPkBe1VbmLxqn0ZBgyPyEZBMxlCQe6p7avzBLz4a8k9SlVNnrDwolmZA5Clr08BMCHbylUOMqQZD";

// POST /send-message
app.post("/send-message", async (req, res) => {
  const { to, templateName } = req.body;

  if (!to || !templateName) {
    return res.status(400).json({ error: "Missing 'to' or 'templateName' in request body" });
  }

  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en_US"
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({ success: true, response: response.data });
  } catch (err) {
    console.error("Error sending WhatsApp message:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send message", details: err.response?.data || err.message });
  }
});

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



