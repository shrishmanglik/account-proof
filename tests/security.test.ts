import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public and persistence boundaries", () => {
  it("keeps public product surfaces explicit about their TAM scope", () => {
    const publicFiles = ["README.md", "src/app/page.tsx", "src/components/account-workspace.tsx"];
    for (const path of publicFiles) {
      const source = readFileSync(path, "utf8");
      expect(source).toMatch(/AccountProof|AccountWorkspace/);
    }
    const workspace = readFileSync("src/components/account-workspace.tsx", "utf8");
    expect(workspace).toContain("Evidence-bound technical account operations");
    expect(workspace).toContain("no employer affiliation");
  });

  it("enables RLS on every application table", () => {
    const migration = readFileSync("supabase/migrations/0001_accountproof.sql", "utf8");
    const tables = ["tenants", "tenant_memberships", "accounts", "evidence_items", "health_reviews", "review_decisions", "audit_events"];
    for (const table of tables) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
      expect(migration).toMatch(new RegExp(`create policy[\\s\\S]+?on public\\.${table}\\b`, "i"));
    }
  });
});
