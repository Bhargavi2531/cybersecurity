// backend/server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// API endpoint
app.get("/api/check", (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const parsed = new URL(targetUrl);

    let isSafe = parsed.protocol === "https:";
    let reasons = [];

    if (!isSafe) {
      reasons.push("Uses HTTP instead of HTTPS (connection not encrypted)");
    }

    res.json({
      safe: isSafe,
      host: parsed.hostname,
      protocol: parsed.protocol,
      reasons,
    });

  } catch (err) {
    res.status(400).json({ error: "Invalid URL" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
