import { pool, type Queryable } from "../../db/pool";
import type { LockerStatus } from "../lockers/lockers.schemas";
import type { Rental, RentalWithLocker } from "./rentals.schemas";

export type LockerForRental = {
  id: string;
  organization_id: string;
  status: LockerStatus;
};

export async function findLockerForRentalUpdate(lockerId: string, db: Queryable): Promise<LockerForRental | null> {
  const locker = await db.query<LockerForRental>(
    "SELECT id, organization_id, status FROM lockers WHERE id = $1 FOR UPDATE",
    [lockerId]
  );
  return locker.rows[0] ?? null;
}

export async function insertActiveRental(
  organizationId: string,
  lockerId: string,
  accessCode: string,
  db: Queryable
): Promise<Rental | null> {
  const result = await db.query<Rental>(
    `
    INSERT INTO rentals (organization_id, locker_id, access_code, status)
    VALUES ($1, $2, $3, 'active')
    ON CONFLICT DO NOTHING
    RETURNING id, organization_id, locker_id, access_code, status, started_at, finished_at, created_at, updated_at
    `,
    [organizationId, lockerId, accessCode]
  );

  return result.rows[0] ?? null;
}

export async function markLockerOccupied(lockerId: string, db: Queryable): Promise<void> {
  await db.query("UPDATE lockers SET status = 'occupied', updated_at = now() WHERE id = $1", [lockerId]);
}

export async function findRentalById(id: string): Promise<RentalWithLocker | null> {
  const result = await pool.query<RentalWithLocker>(
    `
    SELECT
      r.id,
      r.organization_id,
      r.locker_id,
      r.access_code,
      r.status,
      r.started_at,
      r.finished_at,
      r.created_at,
      r.updated_at,
      json_build_object(
        'id', l.id,
        'organization_id', l.organization_id,
        'location_id', l.location_id,
        'code', l.code,
        'size', l.size,
        'status', l.status,
        'created_at', l.created_at,
        'updated_at', l.updated_at
      ) AS locker
    FROM rentals r
    INNER JOIN lockers l ON l.id = r.locker_id
    WHERE r.id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
