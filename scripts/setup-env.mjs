import { randomBytes } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const target = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(target)) {
  console.log(".env already exists; left unchanged.");
  process.exit(0);
}
const dbPassword = randomBytes(20).toString("hex");
writeFileSync(
  target,
  `POSTGRES_USER=citypulse\nPOSTGRES_PASSWORD=${dbPassword}\nPOSTGRES_DB=citypulse\nPOSTGRES_PORT=15432\nDATABASE_URL=postgresql://citypulse:${dbPassword}@localhost:15432/citypulse?schema=public\nJWT_SECRET=${randomBytes(32).toString("hex")}\nSEED_PASSWORD=Demo-${randomBytes(8).toString("hex")}\nCORS_ORIGIN=http://localhost:8080,http://localhost:5173\nPORT=3000\n`,
  { flag: "wx" },
);
console.log(
  "Created .env with random local credentials. Demo account password is in SEED_PASSWORD.",
);
