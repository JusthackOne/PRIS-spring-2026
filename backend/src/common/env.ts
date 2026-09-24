import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../.env") });
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is required`);
  return value;
}
