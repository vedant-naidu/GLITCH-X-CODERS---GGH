import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

// Load .env.local if present
const envLocalPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...v] = trimmed.split("=");
      process.env[k.trim()] = v.join("=").trim();
    }
  }
}

describe("C. Live Gemini API Smoke Test", () => {
  const apiKey = process.env.GEMINI_API_KEY;

  it("authenticates and returns basic content", async () => {
    if (!apiKey) return;
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    const response = await ai.models.generateContent({
      model,
      contents: "Answer in one sentence: What is a forex spread?",
    });

    expect(response.text).toBeDefined();
    expect(response.text!.length).toBeGreaterThan(10);
  }, 15000);

  it("generates fintech advice using system instructions", async () => {
    if (!apiKey) return;
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify({
        question: "Should I use Wise or PayPal for 1000 USD to India?",
        quotes: [
          { provider: "Wise", fee: 8.5, hiddenMarkup: 0.2, score: 92 },
          { provider: "PayPal", fee: 38.0, hiddenMarkup: 3.8, score: 61 },
        ],
      }),
      config: {
        systemInstruction:
          "You are FXWise, a fintech assistant. Answer using the supplied comparison data only.",
        temperature: 0.2,
      },
    });

    expect(response.text).toBeDefined();
    expect(response.text).toMatch(/Wise/i);
  }, 15000);
});
