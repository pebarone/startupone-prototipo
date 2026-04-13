import { pool, type Queryable } from "../../db/pool";
import type { LockerStatus } from "../lockers/lockers.schemas";
import type { Rental, RentalWithLocker } from "./rentals.schemas";

export type LockerForRental = {
  id: string;
  organization_id: string;
  location_id: string | null;
  size: string;
  status: LockerStatus;
};

export type LocationPricing = {
  initial_fee_cents: number;
  hourly_rate_small: number;
  hourly_rate_medium: number;
  hourly_rate_large: number;
};

export type ActiveRentalForRegistration = {
  id: string;
  organization_id: string;
  locker_id: string;
  status: string;
};

export type ActiveStoringRental = {
  id: string;
  organization_id: string;
  locker_id: string;
  hourly_rate_cents: number;
  initial_fee_cents: number;
  unlocked_at: Date;
};

export type RentalWebAuthnCredential = {
  id: string;
  rental_id: string;
  organization_id: string;
  locker_id: string;
  credential_id: string;
  public_key: Buffer;
  counter: number;
  transports: string[];
  device_type: "singleDevice" | "multiDevice";
  backed_up: boolean;
  last_authenticated_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type WebAuthnChallengePurpose = "registration" | "authentication";

export type RentalWebAuthnChallenge = {
  id: string;
  rental_id: string;
  purpose: WebAuthnChallengePurpose;
  challenge: string;
  expires_at: Date;
  used_at: Date | null;
  ip_address: string | null;
  user_agent: string | null;
};

export type RentalHistoryRow = Rental & {
  locker_code: string;
  locker_size: string;
  location_id: string | null;
  location_name: string | null;
};

export type RentalHistoryDeleteCandidate = {
  id: string;
  organization_id: string;
  locker_id: string;
  locker_code: string;
  status: string;
};

export async function findLockerForRentalUpdate(lockerId: string, db: Queryable): Promise<LockerForRental | null> {
  const locker = await db.query<LockerForRental>(
    "SELECT id, organization_id, location_id, size, status FROM lockers WHERE id = $1 FOR UPDATE",
    [lockerId]
  );
  return locker.rows[0] ?? null;
}

export async function findLocationPricing(locationId: string, db: Queryable): Promise<LocationPricing | null> {
  const result = await db.query<LocationPricing>(
    "SELECT initial_fee_cents, hourly_rate_small, hourly_rate_medium, hourly_rate_large FROM locker_locations WHERE id = $1",
    [locationId]
  );
  return result.rows[0] ?? null;
}

export async function insertActiveRental(
  organizationId: string,
  lockerId: string,
  accessCode: string,
  initialFeeCents: number,
  hourlyRateCents: number,
  db: Queryable
): Promise<Rental | null> {
  const result = await db.query<Rental>(
    `
    INSERT INTO rentals (organization_id, locker_id, access_code, status, initial_fee_cents, hourly_rate_cents, total_cents)
    VALUES ($1, $2, $3, 'active', $4, $5, $4)
    ON CONFLICT DO NOTHING
    RETURNING id, organization_id, locker_id, access_code, status, initial_fee_cents, hourly_rate_cents,
              started_at, unlocked_at, retrieved_at, finished_at, extra_charge_cents, total_cents, created_at, updated_at
    `,
    [organizationId, lockerId, accessCode, initialFeeCents, hourlyRateCents]
  );

  return result.rows[0] ?? null;
}

export async function markLockerOccupied(lockerId: string, db: Queryable): Promise<void> {
  await db.query("UPDATE lockers SET status = 'occupied', updated_at = now() WHERE id = $1", [lockerId]);
}

export async function markLockerFreeById(lockerId: string, db: Queryable): Promise<void> {
  await db.query("UPDATE lockers SET status = 'free', updated_at = now() WHERE id = $1", [lockerId]);
}

export async function findRentalById(id: string, db: Queryable = pool): Promise<RentalWithLocker | null> {
  const result = await db.query<RentalWithLocker>(
    `
    SELECT
      r.id, r.organization_id, r.locker_id, r.access_code, r.status,
      r.initial_fee_cents, r.hourly_rate_cents,
      r.started_at, r.unlocked_at, r.retrieved_at, r.finished_at,
      r.extra_charge_cents, r.total_cents, r.created_at, r.updated_at,
      CASE
        WHEN r.unlocked_at IS NULL THEN NULL
        ELSE GREATEST(
          0,
          FLOOR(EXTRACT(EPOCH FROM (COALESCE(r.retrieved_at, now()) - r.unlocked_at)))
        )::integer
      END AS elapsed_seconds,
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

export async function findActiveRentalByIdForUpdate(
  rentalId: string,
  db: Queryable
): Promise<ActiveRentalForRegistration | null> {
  const result = await db.query<ActiveRentalForRegistration>(
    `
    SELECT id, organization_id, locker_id, status
    FROM rentals
    WHERE id = $1 AND status = 'active'
    FOR UPDATE
    `,
    [rentalId]
  );

  return result.rows[0] ?? null;
}

export async function clearPendingWebAuthnChallenges(
  rentalId: string,
  purpose: WebAuthnChallengePurpose,
  db: Queryable
): Promise<void> {
  await db.query(
    `
    DELETE FROM webauthn_challenges
    WHERE rental_id = $1
      AND purpose = $2
      AND used_at IS NULL
    `,
    [rentalId, purpose]
  );
}

export async function insertWebAuthnChallenge(
  input: {
    rental_id: string;
    purpose: WebAuthnChallengePurpose;
    challenge: string;
    expires_at: Date;
    ip_address?: string;
    user_agent?: string;
  },
  db: Queryable
): Promise<RentalWebAuthnChallenge> {
  const result = await db.query<RentalWebAuthnChallenge>(
    `
    INSERT INTO webauthn_challenges (rental_id, purpose, challenge, expires_at, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, rental_id, purpose, challenge, expires_at, used_at, ip_address, user_agent
    `,
    [input.rental_id, input.purpose, input.challenge, input.expires_at, input.ip_address ?? null, input.user_agent ?? null]
  );

  return result.rows[0];
}

export async function findOpenWebAuthnChallengeForUpdate(
  rentalId: string,
  purpose: WebAuthnChallengePurpose,
  db: Queryable
): Promise<RentalWebAuthnChallenge | null> {
  const result = await db.query<RentalWebAuthnChallenge>(
    `
    SELECT id, rental_id, purpose, challenge, expires_at, used_at, ip_address, user_agent
    FROM webauthn_challenges
    WHERE rental_id = $1
      AND purpose = $2
      AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE
    `,
    [rentalId, purpose]
  );

  return result.rows[0] ?? null;
}

export async function markWebAuthnChallengeUsed(challengeId: string, db: Queryable): Promise<void> {
  await db.query(
    `
    UPDATE webauthn_challenges
    SET used_at = now(), updated_at = now()
    WHERE id = $1
    `,
    [challengeId]
  );
}

export async function upsertRentalWebAuthnCredential(
  input: {
    rental_id: string;
    organization_id: string;
    locker_id: string;
    credential_id: string;
    public_key: Buffer;
    counter: number;
    transports: string[];
    device_type: "singleDevice" | "multiDevice";
    backed_up: boolean;
  },
  db: Queryable
): Promise<RentalWebAuthnCredential> {
  const result = await db.query<RentalWebAuthnCredential>(
    `
    INSERT INTO rental_webauthn_credentials (
      rental_id, organization_id, locker_id, credential_id, public_key, counter, transports, device_type, backed_up
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9)
    ON CONFLICT (rental_id) DO UPDATE
    SET
      credential_id = EXCLUDED.credential_id,
      public_key = EXCLUDED.public_key,
      counter = EXCLUDED.counter,
      transports = EXCLUDED.transports,
      device_type = EXCLUDED.device_type,
      backed_up = EXCLUDED.backed_up,
      updated_at = now()
    RETURNING id, rental_id, organization_id, locker_id, credential_id, public_key, counter, transports, device_type,
              backed_up, last_authenticated_at, created_at, updated_at
    `,
    [
      input.rental_id,
      input.organization_id,
      input.locker_id,
      input.credential_id,
      input.public_key,
      input.counter,
      input.transports,
      input.device_type,
      input.backed_up
    ]
  );

  return result.rows[0];
}

export async function activateRentalAfterRegistration(rentalId: string, db: Queryable): Promise<Rental | null> {
  const result = await db.query<Rental>(
    `
    UPDATE rentals
    SET status = 'storing', unlocked_at = now(), updated_at = now()
    WHERE id = $1 AND status = 'active'
    RETURNING id, organization_id, locker_id, access_code, status, initial_fee_cents, hourly_rate_cents,
              started_at, unlocked_at, retrieved_at, finished_at, extra_charge_cents, total_cents, created_at, updated_at
    `,
    [rentalId]
  );

  return result.rows[0] ?? null;
}

export async function findRentalWebAuthnCredentialByRentalId(
  rentalId: string,
  db: Queryable
): Promise<RentalWebAuthnCredential | null> {
  const result = await db.query<RentalWebAuthnCredential>(
    `
    SELECT id, rental_id, organization_id, locker_id, credential_id, public_key, counter, transports, device_type,
           backed_up, last_authenticated_at, created_at, updated_at
    FROM rental_webauthn_credentials
    WHERE rental_id = $1
    LIMIT 1
    `,
    [rentalId]
  );

  return result.rows[0] ?? null;
}

export async function updateRentalWebAuthnCounter(
  rentalId: string,
  counter: number,
  db: Queryable
): Promise<void> {
  await db.query(
    `
    UPDATE rental_webauthn_credentials
    SET counter = $2, last_authenticated_at = now(), updated_at = now()
    WHERE rental_id = $1
    `,
    [rentalId, counter]
  );
}

export async function findStoringRentalByIdForUpdate(
  rentalId: string,
  db: Queryable
): Promise<ActiveStoringRental | null> {
  const result = await db.query<ActiveStoringRental>(
    `
    SELECT id, organization_id, locker_id, hourly_rate_cents, initial_fee_cents, unlocked_at
    FROM rentals
    WHERE id = $1 AND status = 'storing'
    FOR UPDATE
    `,
    [rentalId]
  );

  return result.rows[0] ?? null;
}

export async function setRentalRetrievalCharges(
  rentalId: string,
  extraChargeCents: number,
  totalCents: number,
  db: Queryable
): Promise<Rental | null> {
  const result = await db.query<Rental>(
    `
    UPDATE rentals
    SET status = 'pending_retrieval_payment', extra_charge_cents = $2, total_cents = $3,
        retrieved_at = now(), updated_at = now()
    WHERE id = $1 AND status = 'storing'
    RETURNING id, organization_id, locker_id, access_code, status, initial_fee_cents, hourly_rate_cents,
              started_at, unlocked_at, retrieved_at, finished_at, extra_charge_cents, total_cents, created_at, updated_at
    `,
    [rentalId, extraChargeCents, totalCents]
  );

  return result.rows[0] ?? null;
}

export async function finishRentalById(rentalId: string, db: Queryable): Promise<Rental | null> {
  const result = await db.query<Rental>(
    `
    UPDATE rentals
    SET status = 'finished', finished_at = now(), updated_at = now()
    WHERE id = $1 AND status IN ('pending_retrieval_payment', 'storing')
    RETURNING id, organization_id, locker_id, access_code, status, initial_fee_cents, hourly_rate_cents,
              started_at, unlocked_at, retrieved_at, finished_at, extra_charge_cents, total_cents, created_at, updated_at
    `,
    [rentalId]
  );

  return result.rows[0] ?? null;
}

export async function cancelLiveRentalById(
  rentalId: string,
  organizationId: string,
  db: Queryable
): Promise<Rental | null> {
  const result = await db.query<Rental>(
    `
    UPDATE rentals
    SET status = 'cancelled', finished_at = now(), updated_at = now()
    WHERE id = $1
      AND organization_id = $2
      AND status IN ('active', 'storing', 'pending_retrieval_payment')
    RETURNING id, organization_id, locker_id, access_code, status, initial_fee_cents, hourly_rate_cents,
              started_at, unlocked_at, retrieved_at, finished_at, extra_charge_cents, total_cents, created_at, updated_at
    `,
    [rentalId, organizationId]
  );

  return result.rows[0] ?? null;
}

export async function listRentalsByOrg(
  organizationId: string,
  locationId?: string | null,
  limit = 100,
  offset = 0
): Promise<RentalHistoryRow[]> {
  const params: (string | number)[] = [organizationId, limit, offset];
  let whereClause = "r.organization_id = $1";

  if (locationId) {
    params.push(locationId);
    whereClause += ` AND l.location_id = $${params.length}`;
  }

  const result = await pool.query<RentalHistoryRow>(
    `
    SELECT
      r.id, r.organization_id, r.locker_id, r.access_code, r.status,
      r.initial_fee_cents, r.hourly_rate_cents,
      r.started_at, r.unlocked_at, r.retrieved_at, r.finished_at,
      r.extra_charge_cents, r.total_cents, r.created_at, r.updated_at,
      l.code AS locker_code, l.size AS locker_size, l.location_id,
      ll.name AS location_name
    FROM rentals r
    INNER JOIN lockers l ON l.id = r.locker_id
    LEFT JOIN locker_locations ll ON ll.id = l.location_id
    WHERE ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    params
  );

  return result.rows;
}

export async function deleteRentalById(rentalId: string, organizationId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM rentals WHERE id = $1 AND organization_id = $2 AND status IN ('finished','cancelled','active')`,
    [rentalId, organizationId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findRentalHistoryDeleteCandidatesForUpdate(
  organizationId: string,
  rentalIds: string[],
  db: Queryable
): Promise<RentalHistoryDeleteCandidate[]> {
  if (!rentalIds.length) {
    return [];
  }

  const result = await db.query<RentalHistoryDeleteCandidate>(
    `
    SELECT
      r.id,
      r.organization_id,
      r.locker_id,
      r.status,
      l.code AS locker_code
    FROM rentals r
    INNER JOIN lockers l ON l.id = r.locker_id
    WHERE r.organization_id = $1
      AND r.id = ANY($2::uuid[])
    FOR UPDATE OF r, l
    `,
    [organizationId, rentalIds]
  );

  return result.rows;
}

export async function deleteUnlockEventsByRentalIds(
  organizationId: string,
  rentalIds: string[],
  db: Queryable
): Promise<void> {
  if (!rentalIds.length) {
    return;
  }

  await db.query(
    `
    DELETE FROM unlock_events
    WHERE organization_id = $1
      AND rental_id = ANY($2::uuid[])
    `,
    [organizationId, rentalIds]
  );
}

export async function deleteAuditEventsByRentalIds(
  organizationId: string,
  rentalIds: string[],
  db: Queryable
): Promise<void> {
  if (!rentalIds.length) {
    return;
  }

  await db.query(
    `
    DELETE FROM audit_events
    WHERE organization_id = $1
      AND resource_type = 'rental'
      AND resource_id = ANY($2::uuid[])
    `,
    [organizationId, rentalIds]
  );
}

export async function deleteRentalHistoryByIds(
  organizationId: string,
  rentalIds: string[],
  db: Queryable
): Promise<number> {
  if (!rentalIds.length) {
    return 0;
  }

  const result = await db.query(
    `
    DELETE FROM rentals
    WHERE organization_id = $1
      AND id = ANY($2::uuid[])
    `,
    [organizationId, rentalIds]
  );

  return result.rowCount ?? 0;
}
