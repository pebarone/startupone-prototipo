import { pool, type Queryable } from "../../db/pool";
import type { AppUser } from "../organizations/organizations.schemas";

export type UpsertAppUserInput = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  last_sign_in_at?: string | null;
};

export async function upsertAppUser(input: UpsertAppUserInput, db: Queryable = pool): Promise<AppUser> {
  const result = await db.query<AppUser>(
    `
    INSERT INTO app_users (
      id,
      email,
      full_name,
      avatar_url,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, now(), now())
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      last_sign_in_at = EXCLUDED.last_sign_in_at,
      updated_at = now()
    RETURNING id, email, full_name, avatar_url, last_sign_in_at, created_at, updated_at
    `,
    [input.id, normalizeEmail(input.email), input.full_name ?? null, input.avatar_url ?? null, input.last_sign_in_at ?? null]
  );

  return result.rows[0];
}

export async function findAppUserById(id: string, db: Queryable = pool): Promise<AppUser | null> {
  const result = await db.query<AppUser>(
    `
    SELECT id, email, full_name, avatar_url, last_sign_in_at, created_at, updated_at
    FROM app_users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function findAppUserByEmail(email: string, db: Queryable = pool): Promise<AppUser | null> {
  const result = await db.query<AppUser>(
    `
    SELECT id, email, full_name, avatar_url, last_sign_in_at, created_at, updated_at
    FROM app_users
    WHERE email = $1
    `,
    [normalizeEmail(email)]
  );

  return result.rows[0] ?? null;
}

function normalizeEmail(email?: string | null): string | null {
  return email?.trim().toLowerCase() || null;
}
