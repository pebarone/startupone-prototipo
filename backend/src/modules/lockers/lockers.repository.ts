import { pool, type Queryable } from "../../db/pool";
import type {
  CreateLockerBody,
  ListOrganizationLockersQuery,
  ListPublicLockersQuery,
  Locker,
  LockerListFilters,
  UpdateLockerBody
} from "./lockers.schemas";

type PaginatedLockers = {
  data: Locker[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
};

export async function listLockersByOrganization(
  organizationId: string,
  query: LockerListFilters,
  db: Queryable = pool
): Promise<PaginatedLockers> {
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  const values: unknown[] = [organizationId];
  const conditions: string[] = ["organization_id = $1"];

  if (query.status) {
    values.push(query.status);
    conditions.push(`status = $${values.length}`);
  }

  if (query.size) {
    values.push(query.size);
    conditions.push(`size = $${values.length}`);
  }

  if (query.location_id) {
    values.push(query.location_id);
    conditions.push(`location_id = $${values.length}`);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const count = await db.query<{ total: number }>(`SELECT count(*)::int AS total FROM lockers ${whereSql}`, values);

  values.push(limit, offset);
  const lockers = await db.query<Locker>(
    `
    SELECT id, organization_id, location_id, code, size, status, created_at, updated_at
    FROM lockers
    ${whereSql}
    ORDER BY code ASC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
    `,
    values
  );

  const total = count.rows[0]?.total ?? 0;

  return {
    data: lockers.rows,
    pagination: {
      limit,
      offset,
      total,
      has_more: offset + lockers.rows.length < total
    }
  };
}

export async function listPublicLockers(query: ListPublicLockersQuery, db: Queryable = pool): Promise<PaginatedLockers> {
  if (query.organization_id) {
    // Specific org requested
    return listLockersByOrganization(query.organization_id, query, db);
  }

  // No org specified — return free lockers from all organizations
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (query.status) {
    values.push(query.status);
    conditions.push(`status = $${values.length}`);
  }

  if (query.size) {
    values.push(query.size);
    conditions.push(`size = $${values.length}`);
  }

  if (query.location_id) {
    values.push(query.location_id);
    conditions.push(`location_id = $${values.length}`);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const count = await db.query<{ total: number }>(`SELECT count(*)::int AS total FROM lockers ${whereSql}`, values);

  values.push(limit, offset);
  const lockers = await db.query<Locker>(
    `
    SELECT id, organization_id, location_id, code, size, status, created_at, updated_at
    FROM lockers
    ${whereSql}
    ORDER BY code ASC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
    `,
    values
  );

  const total = count.rows[0]?.total ?? 0;

  return {
    data: lockers.rows,
    pagination: {
      limit,
      offset,
      total,
      has_more: offset + lockers.rows.length < total
    }
  };
}


export function listOrganizationLockers(
  organizationId: string,
  query: ListOrganizationLockersQuery,
  db: Queryable = pool
): Promise<PaginatedLockers> {
  return listLockersByOrganization(organizationId, query, db);
}

export async function insertLocker(organizationId: string, input: CreateLockerBody, db: Queryable = pool): Promise<Locker> {
  const result = await db.query<Locker>(
    `
    INSERT INTO lockers (organization_id, location_id, code, size, status)
    VALUES ($1, $2, $3, $4, 'free')
    RETURNING id, organization_id, location_id, code, size, status, created_at, updated_at
    `,
    [organizationId, input.location_id ?? null, input.code, input.size]
  );

  return result.rows[0];
}

export async function findLockerById(
  organizationId: string,
  id: string,
  db: Queryable = pool
): Promise<Locker | null> {
  const result = await db.query<Locker>(
    `
    SELECT id, organization_id, location_id, code, size, status, created_at, updated_at
    FROM lockers
    WHERE organization_id = $1
      AND id = $2
    `,
    [organizationId, id]
  );

  return result.rows[0] ?? null;
}

export async function updateLockerById(
  organizationId: string,
  id: string,
  input: UpdateLockerBody,
  db: Queryable = pool
): Promise<Locker | null> {
  const values: unknown[] = [];
  const assignments: string[] = [];

  if (input.code !== undefined) {
    values.push(input.code);
    assignments.push(`code = $${values.length}`);
  }

  if (input.size !== undefined) {
    values.push(input.size);
    assignments.push(`size = $${values.length}`);
  }

  if (input.status !== undefined) {
    values.push(input.status);
    assignments.push(`status = $${values.length}`);
  }

  if (input.location_id !== undefined) {
    values.push(input.location_id);
    assignments.push(`location_id = $${values.length}`);
  }

  if (assignments.length === 0) {
    return null;
  }

  values.push(organizationId, id);

  const result = await db.query<Locker>(
    `
    UPDATE lockers
    SET ${assignments.join(", ")}, updated_at = now()
    WHERE organization_id = $${values.length - 1}
      AND id = $${values.length}
    RETURNING id, organization_id, location_id, code, size, status, created_at, updated_at
    `,
    values
  );

  return result.rows[0] ?? null;
}

export async function deleteLockerById(
  organizationId: string,
  id: string,
  db: Queryable = pool
): Promise<boolean> {
  const result = await db.query(
    `
    DELETE FROM lockers
    WHERE organization_id = $1
      AND id = $2
    `,
    [organizationId, id]
  );

  return (result.rowCount ?? 0) > 0;
}
