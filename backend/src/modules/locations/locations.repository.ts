import { pool, type Queryable } from "../../db/pool";
import type {
  CreateLocationBody,
  ListOrganizationLocationsQuery,
  ListPublicLocationsQuery,
  LocationWithStats,
  LockerLocation,
  PublicLocationWithStats,
  UpdateLocationBody
} from "./locations.schemas";

type CountRow = {
  total: number;
};

export async function listLocationsByOrganization(
  organizationId: string,
  query: ListOrganizationLocationsQuery,
  db: Queryable = pool
): Promise<{
  data: LocationWithStats[];
  pagination: { limit: number; offset: number; total: number; has_more: boolean };
}> {
  const limit = query.limit ?? 100;
  const offset = query.offset ?? 0;

  const countResult = await db.query<CountRow>(
    `
    SELECT count(*)::int AS total
    FROM locker_locations
    WHERE organization_id = $1
    `,
    [organizationId]
  );

  const result = await db.query<LocationWithStats>(
    `
    SELECT
      locations.id,
      locations.organization_id,
      locations.name,
      locations.address,
      locations.latitude,
      locations.longitude,
      locations.initial_fee_cents,
      locations.hourly_rate_small,
      locations.hourly_rate_medium,
      locations.hourly_rate_large,
      locations.created_at,
      locations.updated_at,
      count(lockers.id)::int AS total_lockers,
      count(*) FILTER (WHERE lockers.status = 'free')::int AS free_lockers
    FROM locker_locations AS locations
    LEFT JOIN lockers ON lockers.location_id = locations.id
    WHERE locations.organization_id = $1
    GROUP BY locations.id
    ORDER BY locations.name ASC, locations.created_at ASC
    LIMIT $2
    OFFSET $3
    `,
    [organizationId, limit, offset]
  );

  const total = countResult.rows[0]?.total ?? 0;

  return {
    data: result.rows,
    pagination: {
      limit,
      offset,
      total,
      has_more: offset + result.rows.length < total
    }
  };
}

export async function listPublicLocationsWithStats(
  query: ListPublicLocationsQuery,
  db: Queryable = pool
): Promise<{
  data: PublicLocationWithStats[];
  pagination: { limit: number; offset: number; total: number; has_more: boolean };
}> {
  const limit = query.limit ?? 200;
  const offset = query.offset ?? 0;
  const values: unknown[] = [];
  const conditions: string[] = ["organizations.status = 'active'"];

  if (query.organization_id) {
    values.push(query.organization_id);
    conditions.push(`locations.organization_id = $${values.length}`);
  }

  const whereSql = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await db.query<CountRow>(
    `
    SELECT count(*)::int AS total
    FROM locker_locations AS locations
    INNER JOIN organizations ON organizations.id = locations.organization_id
    ${whereSql}
      AND EXISTS (
        SELECT 1
        FROM lockers
        WHERE lockers.location_id = locations.id
      )
    `,
    values
  );

  const dataValues = [...values, limit, offset];
  const result = await db.query<PublicLocationWithStats>(
    `
    SELECT
      locations.id,
      locations.organization_id,
      locations.name,
      locations.address,
      locations.latitude,
      locations.longitude,
      locations.initial_fee_cents,
      locations.hourly_rate_small,
      locations.hourly_rate_medium,
      locations.hourly_rate_large,
      locations.created_at,
      locations.updated_at,
      count(lockers.id)::int AS total_lockers,
      count(*) FILTER (WHERE lockers.status = 'free')::int AS free_lockers,
      COALESCE(
        json_agg(
          json_build_object(
            'id', lockers.id,
            'code', lockers.code,
            'size', lockers.size
          )
          ORDER BY lockers.code ASC
        ) FILTER (WHERE lockers.status = 'free'),
        '[]'::json
      ) AS available_lockers
    FROM locker_locations AS locations
    INNER JOIN organizations ON organizations.id = locations.organization_id
    LEFT JOIN lockers ON lockers.location_id = locations.id
    ${whereSql}
    GROUP BY locations.id
    HAVING count(lockers.id) > 0
    ORDER BY free_lockers DESC, total_lockers DESC, locations.name ASC
    LIMIT $${dataValues.length - 1}
    OFFSET $${dataValues.length}
    `,
    dataValues
  );

  const total = countResult.rows[0]?.total ?? 0;

  return {
    data: result.rows,
    pagination: {
      limit,
      offset,
      total,
      has_more: offset + result.rows.length < total
    }
  };
}

export async function findLocationById(
  organizationId: string,
  id: string,
  db: Queryable = pool
): Promise<LocationWithStats | null> {
  const result = await db.query<LocationWithStats>(
    `
    SELECT
      locations.id,
      locations.organization_id,
      locations.name,
      locations.address,
      locations.latitude,
      locations.longitude,
      locations.initial_fee_cents,
      locations.hourly_rate_small,
      locations.hourly_rate_medium,
      locations.hourly_rate_large,
      locations.created_at,
      locations.updated_at,
      count(lockers.id)::int AS total_lockers,
      count(*) FILTER (WHERE lockers.status = 'free')::int AS free_lockers
    FROM locker_locations AS locations
    LEFT JOIN lockers ON lockers.location_id = locations.id
    WHERE locations.organization_id = $1
      AND locations.id = $2
    GROUP BY locations.id
    `,
    [organizationId, id]
  );

  return result.rows[0] ?? null;
}

export async function insertLocation(
  organizationId: string,
  input: CreateLocationBody,
  db: Queryable = pool
): Promise<LockerLocation> {
  const result = await db.query<LockerLocation>(
    `
    INSERT INTO locker_locations (organization_id, name, address, latitude, longitude, initial_fee_cents, hourly_rate_small, hourly_rate_medium, hourly_rate_large)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, organization_id, name, address, latitude, longitude, initial_fee_cents, hourly_rate_small, hourly_rate_medium, hourly_rate_large, created_at, updated_at
    `,
    [
      organizationId,
      input.name,
      input.address,
      input.latitude,
      input.longitude,
      input.initial_fee_cents ?? 500,
      input.hourly_rate_small ?? 500,
      input.hourly_rate_medium ?? 1000,
      input.hourly_rate_large ?? 1500
    ]
  );

  return result.rows[0];
}

export async function updateLocationById(
  organizationId: string,
  id: string,
  input: UpdateLocationBody,
  db: Queryable = pool
): Promise<LockerLocation | null> {
  const values: unknown[] = [];
  const assignments: string[] = [];

  if (input.name !== undefined) {
    values.push(input.name);
    assignments.push(`name = $${values.length}`);
  }

  if (input.address !== undefined) {
    values.push(input.address);
    assignments.push(`address = $${values.length}`);
  }

  if (input.latitude !== undefined) {
    values.push(input.latitude);
    assignments.push(`latitude = $${values.length}`);
  }

  if (input.longitude !== undefined) {
    values.push(input.longitude);
    assignments.push(`longitude = $${values.length}`);
  }

  if (input.initial_fee_cents !== undefined) {
    values.push(input.initial_fee_cents);
    assignments.push(`initial_fee_cents = $${values.length}`);
  }

  if (input.hourly_rate_small !== undefined) {
    values.push(input.hourly_rate_small);
    assignments.push(`hourly_rate_small = $${values.length}`);
  }

  if (input.hourly_rate_medium !== undefined) {
    values.push(input.hourly_rate_medium);
    assignments.push(`hourly_rate_medium = $${values.length}`);
  }

  if (input.hourly_rate_large !== undefined) {
    values.push(input.hourly_rate_large);
    assignments.push(`hourly_rate_large = $${values.length}`);
  }

  if (assignments.length === 0) {
    return null;
  }

  values.push(organizationId, id);

  const result = await db.query<LockerLocation>(
    `
    UPDATE locker_locations
    SET ${assignments.join(", ")}, updated_at = now()
    WHERE organization_id = $${values.length - 1}
      AND id = $${values.length}
    RETURNING id, organization_id, name, address, latitude, longitude, initial_fee_cents, hourly_rate_small, hourly_rate_medium, hourly_rate_large, created_at, updated_at
    `,
    values
  );

  return result.rows[0] ?? null;
}

export async function countLockersForLocation(
  organizationId: string,
  locationId: string,
  db: Queryable = pool
): Promise<number> {
  const result = await db.query<CountRow>(
    `
    SELECT count(*)::int AS total
    FROM lockers
    WHERE organization_id = $1
      AND location_id = $2
    `,
    [organizationId, locationId]
  );

  return result.rows[0]?.total ?? 0;
}

export async function deleteLocationById(
  organizationId: string,
  id: string,
  db: Queryable = pool
): Promise<boolean> {
  const result = await db.query(
    `
    DELETE FROM locker_locations
    WHERE organization_id = $1
      AND id = $2
    `,
    [organizationId, id]
  );

  return (result.rowCount ?? 0) > 0;
}
