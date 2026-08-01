import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? process.env.ComSpec : "npm";
const commandArguments = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm.cmd run test:controls"]
  : ["run", "test:controls"];
const run = (disabled) => spawnSync(command, commandArguments, {
  cwd: process.cwd(),
  env: { ...process.env, ACCOUNTPROOF_DISABLED_DETECTOR: disabled ?? "" },
  encoding: "utf8",
});

const mutated = run("CP-R11");
if (mutated.status === 0) {
  console.error("MUTATION_NOT_CAUGHT: disabling CP-R11 left the control suite green");
  process.exit(1);
}
console.log("MUTATION_CAUGHT detector=CP-R11 mutated_exit=" + mutated.status);

const restored = run();
if (restored.status !== 0) {
  console.error(restored.stdout);
  console.error(restored.stderr);
  console.error("RESTORED_CONTROL_FAILED exit=" + restored.status);
  process.exit(1);
}
console.log("RESTORED_CONTROL_PASSED detector=CP-R11 restored_exit=0");
