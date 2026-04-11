import type { Queryable } from "../../db/pool";

export type ActiveRentalForUnlock = {
  rental_id: string;
  locker_id: string;
  organization_id: string;
};

export async function findActiveRentalByAccessCodeForUpdate(
  accessCode: string,
  db: Queryable
): Promise<ActiveRentalForUnlock | null> {
  const activeRental = await db.query<ActiveRentalForUnlock>(
    `
    SELECT r.id AS rental_id, l.id AS locker_id, r.organization_id
    FROM rentals r
    INNER JOIN lockers l ON l.id = r.locker_id
    WHERE r.access_code = $1 AND r.status = 'active'
    FOR UPDATE OF r, l
    `,
    [accessCode]
  );

  return activeRental.rows[0] ?? null;
}

export async function recordUnlockEvent(
  input: {
    access_code: string;
    success: boolean;
    organization_id?: string;
    rental_id?: string;
    locker_id?: string;
    reason?: string;
  },
  db: Queryable
): Promise<void> {
  await db.query(
    `
    INSERT INTO unlock_events (organization_id, rental_id, locker_id, access_code, success, reason)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      input.organization_id ?? null,
      input.rental_id ?? null,
      input.locker_id ?? null,
      input.access_code,
      input.success,
      input.reason ?? null
    ]
  );
}

export async function finishRental(rentalId: string, db: Queryable): Promise<void> {
  await db.query(
    `
    UPDATE rentals
    SET status = 'finished', finished_at = now(), updated_at = now()
    WHERE id = $1
    `,
    [rentalId]
  );
}

export async function markLockerFree(lockerId: string, db: Queryable): Promise<void> {
  await db.query("UPDATE lockers SET status = 'free', updated_at = now() WHERE id = $1", [lockerId]);
}
