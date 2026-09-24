import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const result = spawnSync(
  process.execPath,
  [require.resolve("prisma/build/index.js"), ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
