import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env";
import { pool } from "./pool";

const ensureMigrationsTableSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`;

async function main() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const migrationsDir = resolve(backendRoot, "db/migrations");
  const migrationFiles = await getSqlFiles(migrationsDir);
  const client = await pool.connect();

  try {
    await client.query(ensureMigrationsTableSql);
    const applied = await client.query<{ id: string }>("SELECT id FROM schema_migrations");
    const appliedIds = new Set(applied.rows.map((row) => row.id));

    for (const filePath of migrationFiles) {
      const fileName = basename(filePath);
      const migrationId = fileName.slice(0, 6);

      if (appliedIds.has(migrationId)) {
        console.log(`Skipping already applied migration ${fileName}`);
        continue;
      }

      const sql = await readFile(filePath, "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (id, name) VALUES ($1, $2)", [migrationId, fileName]);
        await client.query("COMMIT");
        console.log(`Applied migration ${fileName}`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Failed to apply migration ${fileName}`);
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
