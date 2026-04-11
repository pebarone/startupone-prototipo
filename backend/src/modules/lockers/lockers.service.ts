import type { RequestContext } from "../../context/request-context";
import type { Queryable } from "../../db/pool";
import { withTransaction } from "../../db/transaction";
import { conflictError, isPgError, notFoundError, validationError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import { findLocationById } from "../locations/locations.repository";
import {
  deleteLockerById,
  findLockerById,
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
  UpdateLockerBody
} from "./lockers.schemas";

export function listPublicLockersService(query: ListPublicLockersQuery) {
  return listPublicLockers(query);
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
