import pg from "pg";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { env } from "../config/env";

const { Pool } = pg;

export interface Queryable {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined
});

pool.on("error", (error) => {
  console.error("Unexpected idle Postgres client error", error);
});

export type DbClient = PoolClient;
