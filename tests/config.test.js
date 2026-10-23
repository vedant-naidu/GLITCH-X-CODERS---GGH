const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

test("A. Configuration Tests", async (t) => {
  await t.test("GEMINI_API_KEY and GEMINI_MODEL are defined in .env.local", () => {
    const envLocalPath = path.resolve(__dirname, "../.env.local");
    assert.strictEqual(fs.existsSync(envLocalPath), true, ".env.local must exist");
    const content = fs.readFileSync(envLocalPath, "utf-8");
    assert.match(content, /GEMINI_API_KEY=/);
    assert.match(content, /GEMINI_MODEL=/);
  });

  await t.test(".env.example contains empty placeholders and no secrets", () => {
    const examplePath = path.resolve(__dirname, "../.env.example");
    const content = fs.readFileSync(examplePath, "utf-8");
    assert.match(content, /GEMINI_API_KEY=/);
    assert.doesNotMatch(content, /AQ\./, "No real API keys in .env.example");
    assert.doesNotMatch(content, /sk-/, "No OpenAI keys in .env.example");
  });

  await t.test(".gitignore properly ignores secret files", () => {
    const gitignorePath = path.resolve(__dirname, "../.gitignore");
    const content = fs.readFileSync(gitignorePath, "utf-8");
    assert.match(content, /\.env\*/, ".gitignore must ignore .env*");
  });

  await t.test("No client-side source code exposes GEMINI_API_KEY", () => {
    const srcDir = path.resolve(__dirname, "../src");
    function checkDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          checkDir(full);
        } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
          const content = fs.readFileSync(full, "utf-8");
          assert.doesNotMatch(
            content,
            /AQ\.Ab8RN6Juc0C6f8ydD3U3KDMx_Wjki9cSdSBqpAWwLQkwn-AkdA/,
            `Secret leaked in ${full}`
          );
        }
      }
    }
    checkDir(srcDir);
  });
});
