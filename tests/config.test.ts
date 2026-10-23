import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("A. Configuration & Credential Tests", () => {
  it("GEMINI_API_KEY and GEMINI_MODEL are defined in .env.local", () => {
    const envLocalPath = path.resolve(__dirname, "../.env.local");
    expect(fs.existsSync(envLocalPath)).toBe(true);
    const content = fs.readFileSync(envLocalPath, "utf-8");
    expect(content).toMatch(/GEMINI_API_KEY=/);
    expect(content).toMatch(/GEMINI_MODEL=/);
  });

  it(".env.example contains empty placeholders and no secrets", () => {
    const examplePath = path.resolve(__dirname, "../.env.example");
    const content = fs.readFileSync(examplePath, "utf-8");
    expect(content).toMatch(/GEMINI_API_KEY=/);
    expect(content).not.toMatch(/AQ\./);
    expect(content).not.toMatch(/sk-/);
  });

  it(".gitignore properly ignores secret files", () => {
    const gitignorePath = path.resolve(__dirname, "../.gitignore");
    const content = fs.readFileSync(gitignorePath, "utf-8");
    expect(content).toMatch(/\.env\*/);
  });

  it("No client-side source code exposes GEMINI_API_KEY", () => {
    const srcDir = path.resolve(__dirname, "../src");
    function checkDir(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          checkDir(full);
        } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
          const content = fs.readFileSync(full, "utf-8");
          expect(content).not.toMatch(/AQ\.Ab8RN6Juc0C6f8ydD3U3KDMx_Wjki9cSdSBqpAWwLQkwn-AkdA/);
        }
      }
    }
    checkDir(srcDir);
  });
});
