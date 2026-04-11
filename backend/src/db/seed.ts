import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env";
import { pool } from "./pool";

async function main() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run seeds.");
  }

  const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const seedsDir = resolve(backendRoot, "db/seeds");
  const seedFiles = await getSqlFiles(seedsDir);
  const client = await pool.connect();

  try {
    for (const filePath of seedFiles) {
      const fileName = basename(filePath);
      const sql = await readFile(filePath, "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log(`Applied seed ${fileName}`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Failed to apply seed ${fileName}`);
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

async function getSqlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => resolve(directory, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

void main();
