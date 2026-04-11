import type { RequestContext } from "../../context/request-context";
import { withTransaction } from "../../db/transaction";
import { conflictError, isPgError, notFoundError, validationError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import { insertLocker, listOrganizationLockers, listPublicLockers, updateLockerById } from "./lockers.repository";
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
      const locker = await insertLocker(organizationId, input, client);
      await recordAuditEvent(
        {
          ...context,
          action: "locker.created",
          resource_type: "locker",
          resource_id: locker.id,
          metadata: { code: locker.code, size: locker.size, status: locker.status }
        },
        client
      );

      return locker;
    });
  } catch (error) {
    if (isPgError(error, "23505")) {
      throw conflictError("A locker with this code already exists.");
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
          metadata: { changed_fields: Object.keys(input), status: locker.status, size: locker.size, code: locker.code }
        },
        client
      );

      return locker;
    });
  } catch (error) {
    if (isPgError(error, "23505")) {
      throw conflictError("A locker with this code already exists.");
    }

    throw error;
  }
}
