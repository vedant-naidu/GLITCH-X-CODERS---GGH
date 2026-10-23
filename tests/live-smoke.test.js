const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

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

test("C. Live Gemini API Smoke Test", async (t) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    t.skip("GEMINI_API_KEY is not configured, skipping live smoke test");
    return;
  }

  const { GoogleGenAI } = require("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  await t.test("Live authentication and basic content generation", async () => {
    const response = await ai.models.generateContent({
      model,
      contents: "Answer in one sentence: What is a forex spread?",
    });

    assert.ok(response.text, "Response must contain non-empty text");
    assert.strictEqual(typeof response.text, "string");
    assert.ok(response.text.length > 10, "Response must be a descriptive sentence");
    assert.match(response.text.toLowerCase(), /rate|difference|spread|currency|exchange/);
  });

  await t.test("Live fintech advice generation with FXWise system instruction", async () => {
    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify({
        question: "Should I use Wise or PayPal to send 1000 USD to India?",
        quotes: [
          { provider: "Wise", fee: 8.5, hiddenMarkup: 0.2, score: 92 },
          { provider: "PayPal", fee: 38.0, hiddenMarkup: 3.8, score: 61 },
        ],
      }),
      config: {
        systemInstruction:
          "You are FXWise, a fintech assistant. Answer using the supplied comparison data only and reference the current providers, costs, and transparency scores.",
        temperature: 0.2,
      },
    });

    assert.ok(response.text, "Response must contain non-empty text");
    assert.match(response.text, /Wise/i, "Advice should mention Wise based on data");
  });
});
