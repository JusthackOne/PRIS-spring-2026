import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const compiler = spawn(
  process.execPath,
  [require.resolve("typescript/bin/tsc"), "-w", "-p", "tsconfig.json"],
  { stdio: "inherit" },
);
const server = spawn(process.execPath, ["--watch", "dist/src/main.js"], {
  stdio: "inherit",
});
function stop() {
  compiler.kill();
  server.kill();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
compiler.on("exit", () => server.kill());
server.on("exit", () => compiler.kill());
