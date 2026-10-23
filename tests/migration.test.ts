import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Phase 2: Database Migration Integrity", () => {
  it("verifies 0002_provider_provenance.sql exists and contains valid DDL/DML statements", () => {
    const migrationPath = path.resolve(__dirname, "../supabase/migrations/0002_provider_provenance.sql");
    expect(fs.existsSync(migrationPath)).toBe(true);

    const sql = fs.readFileSync(migrationPath, "utf-8");

    // DDL assertions
    expect(sql).toContain("create type public.provider_category");
    expect(sql).toContain("alter table public.providers");
    expect(sql).toContain("add column if not exists category public.provider_category");
    expect(sql).toContain("add column if not exists source_url text");
    expect(sql).toContain("add column if not exists last_verified_at date");
    expect(sql).toContain("create table if not exists public.persona_rules");

    // RLS policy assertions
    expect(sql).toContain("alter table public.persona_rules enable row level security");
    expect(sql).toContain("create policy \"Persona rules are publicly readable\"");

    // Seed assertions for key providers
    expect(sql).toContain("'wise'");
    expect(sql).toContain("'niyo-global'");
    expect(sql).toContain("'flywire'");
    expect(sql).toContain("'airwallex-style'");
    expect(sql).toContain("https://wise.com/in/pricing/");
    expect(sql).toContain("https://www.goniyo.com/zero-forex-markup-card/");
  });
});
