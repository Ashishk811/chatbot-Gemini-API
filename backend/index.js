import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load env vars
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// In-memory chat history (resets on refresh)
let chatHistory = [];

// Route: chat
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Add user message to history
  chatHistory.push({ role: "user", content: message });

  try {
    // Send the whole chat history to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: chatHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const reply = response.text;

    // Save Gemini's reply in history
    chatHistory.push({ role: "model", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({ error: "Failed to get response from Gemini" });
  }
});

// Optional: reset history manually (if needed)
app.post("/reset", (req, res) => {
  console.log("Resetting chat history");
  chatHistory = [];
  res.json({ message: "Chat history reset" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
