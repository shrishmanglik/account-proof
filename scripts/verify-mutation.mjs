import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? process.env.ComSpec : "npm";
const commandArguments = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm.cmd exec vitest run tests/account-health.test.ts"]
  : ["exec", "vitest", "run", "tests/account-health.test.ts"];
const run = () => spawnSync(command, commandArguments, {
  cwd: process.cwd(),
  env: process.env,
  encoding: "utf8",
});

const target = "src/services/account-health.ts";
const original = readFileSync(target, "utf8");
const detector = "const missing = input.expectedSystems.filter((system) => !bySystem.has(system));";
const disabled = "const missing: EvidenceSystem[] = []; // MUTATION: CP-R11 reconciliation detector disabled";

if (original.split(detector).length !== 2) {
  console.error("MUTATION_SETUP_FAILED: expected one runtime reconciliation detector");
  process.exit(1);
}

let mutated;
try {
  writeFileSync(target, original.replace(detector, disabled), "utf8");
  mutated = run();
} finally {
  writeFileSync(target, original, "utf8");
}

if (mutated.status === 0) {
  console.error("MUTATION_NOT_CAUGHT: disabling the runtime reconciliation detector left its service test green");
  process.exit(1);
}
console.log("MUTATION_CAUGHT detector=runtime-expected-source-reconciliation mutated_exit=" + mutated.status);

if (readFileSync(target, "utf8") !== original) {
  console.error("SOURCE_RESTORE_FAILED: runtime validator was not restored byte-for-byte");
  process.exit(1);
}

const restored = run();
if (restored.status !== 0) {
  console.error(restored.stdout);
  console.error(restored.stderr);
  console.error("RESTORED_CONTROL_FAILED exit=" + restored.status);
  process.exit(1);
}
console.log("RESTORED_CONTROL_PASSED detector=runtime-expected-source-reconciliation restored_exit=0");
