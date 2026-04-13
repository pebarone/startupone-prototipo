import type { RequestContext } from "../../context/request-context";
import type { Queryable } from "../../db/pool";
import { withTransaction } from "../../db/transaction";
import { conflictError, isPgError, notFoundError, validationError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import { findLocationById } from "../locations/locations.repository";
import {
  deleteLockerById,
  findLockerById,
  findPublicLockerContextById,
  insertLocker,
  listOrganizationLockers,
  listPublicLockers,
  updateLockerById
} from "./lockers.repository";
import type {
  CreateLockerBody,
  ListOrganizationLockersQuery,
  ListPublicLockersQuery,
  Locker,
  PublicLockerContext,
  UpdateLockerBody
} from "./lockers.schemas";

const DEFAULT_INITIAL_FEE_CENTS = 500;
const DEFAULT_HOURLY_RATES: Record<string, number> = {
  P: 500,
  M: 1000,
  G: 1500
};

export function listPublicLockersService(query: ListPublicLockersQuery) {
  return listPublicLockers(query);
}

export async function getPublicLockerContextService(lockerId: string): Promise<PublicLockerContext> {
  const locker = await findPublicLockerContextById(lockerId);

  if (!locker) {
    throw notFoundError("Locker not found.");
  }

  const hourlyRateCents = resolveHourlyRate(locker.size, {
    hourly_rate_small: locker.location_hourly_rate_small,
    hourly_rate_medium: locker.location_hourly_rate_medium,
    hourly_rate_large: locker.location_hourly_rate_large
  });

  const initialFeeCents = locker.location_initial_fee_cents ?? DEFAULT_INITIAL_FEE_CENTS;
  const mode = locker.status === "maintenance"
    ? "maintenance"
    : locker.status === "free"
      ? "rent"
      : "retrieve";

  return {
    mode,
    locker: {
      id: locker.id,
      organization_id: locker.organization_id,
      location_id: locker.location_id,
      code: locker.code,
      size: locker.size,
      status: locker.status,
      created_at: locker.created_at,
      updated_at: locker.updated_at
    },
    location_name: locker.location_name,
    location_address: locker.location_address,
    initial_fee_cents: initialFeeCents,
    hourly_rate_cents: locker.rental_hourly_rate_cents ?? hourlyRateCents,
    active_rental: locker.rental_status
      ? {
          id: locker.public_rental_id,
          status: locker.rental_status,
          started_at: locker.rental_started_at!,
          unlocked_at: locker.rental_unlocked_at,
          retrieved_at: locker.rental_retrieved_at,
          initial_fee_cents: locker.rental_initial_fee_cents ?? initialFeeCents,
          hourly_rate_cents: locker.rental_hourly_rate_cents ?? hourlyRateCents,
          extra_charge_cents: locker.rental_extra_charge_cents ?? 0,
          total_cents: locker.rental_total_cents ?? (locker.rental_initial_fee_cents ?? initialFeeCents),
          can_authenticate: locker.rental_status !== "active" && !!locker.public_rental_id
        }
      : null
  };
}

export function listOrganizationLockersService(organizationId: string, query: ListOrganizationLockersQuery) {
  return listOrganizationLockers(organizationId, query);
}

export async function createLockerService(
  organizationId: string,
  input: CreateLockerBody,
  context: RequestContext
): Promise<Locker> {
  try {
    return await withTransaction(async (client) => {
      await assertLocationBelongsToOrganization(organizationId, input.location_id, client);

      const locker = await insertLocker(organizationId, input, client);
      await recordAuditEvent(
        {
          ...context,
          action: "locker.created",
          resource_type: "locker",
          resource_id: locker.id,
          metadata: { code: locker.code, size: locker.size, status: locker.status, location_id: locker.location_id }
        },
        client
      );

      return locker;
    });
  } catch (error) {
    if (isPgError(error, "23505")) {
      throw conflictError("A locker with this code already exists.");
    }

    if (isPgError(error, "23503")) {
      throw validationError("The selected location does not exist.");
    }

    throw error;
  }
}

export async function updateLockerService(
  organizationId: string,
  id: string,
  input: UpdateLockerBody,
  context: RequestContext
): Promise<Locker> {
  if (Object.keys(input).length === 0) {
    throw validationError("At least one locker field must be provided.");
  }

  try {
    return await withTransaction(async (client) => {
      if (input.location_id !== undefined) {
        await assertLocationBelongsToOrganization(organizationId, input.location_id, client);
      }

      const locker = await updateLockerById(organizationId, id, input, client);

      if (!locker) {
        throw notFoundError("Locker not found.");
      }

      await recordAuditEvent(
        {
          ...context,
          action: "locker.updated",
          resource_type: "locker",
          resource_id: locker.id,
          metadata: {
            changed_fields: Object.keys(input),
            status: locker.status,
            size: locker.size,
            code: locker.code,
            location_id: locker.location_id
          }
        },
        client
      );

      return locker;
    });
  } catch (error) {
    if (isPgError(error, "23505")) {
      throw conflictError("A locker with this code already exists.");
    }

    if (isPgError(error, "23503")) {
      throw validationError("The selected location does not exist.");
    }

    throw error;
  }
}

export async function deleteLockerService(
  organizationId: string,
  id: string,
  context: RequestContext
): Promise<void> {
  try {
    await withTransaction(async (client) => {
      const locker = await findLockerById(organizationId, id, client);

      if (!locker) {
        throw notFoundError("Locker not found.");
      }

      const deleted = await deleteLockerById(organizationId, id, client);

      if (!deleted) {
        throw notFoundError("Locker not found.");
      }

      await recordAuditEvent(
        {
          ...context,
          action: "locker.deleted",
          resource_type: "locker",
          resource_id: id,
          metadata: {
            code: locker.code,
            size: locker.size,
            status: locker.status,
            location_id: locker.location_id
          }
        },
        client
      );
    });
  } catch (error) {
    if (isPgError(error, "23503")) {
      throw conflictError("Cannot delete this locker because it has related history.");
    }

    throw error;
  }
}

async function assertLocationBelongsToOrganization(
  organizationId: string,
  locationId: string | null | undefined,
  db: Queryable
) {
  if (!locationId) {
    return;
  }

  const location = await findLocationById(organizationId, locationId, db);

  if (!location) {
    throw validationError("The selected location does not belong to this organization.");
  }
}

function resolveHourlyRate(
  size: string,
  rates: {
    hourly_rate_small: number | null;
    hourly_rate_medium: number | null;
    hourly_rate_large: number | null;
  }
): number {
  if (size === "P") {
    return rates.hourly_rate_small ?? DEFAULT_HOURLY_RATES.P;
  }

  if (size === "M") {
    return rates.hourly_rate_medium ?? DEFAULT_HOURLY_RATES.M;
  }

  return rates.hourly_rate_large ?? DEFAULT_HOURLY_RATES.G;
}
