import type { RequestContext } from "../../context/request-context";
import { withTransaction } from "../../db/transaction";
import { conflictError, isPgError, notFoundError, validationError } from "../../errors";
import { recordAuditEvent } from "../audit/audit.repository";
import {
  countLockersForLocation,
  deleteLocationById,
  findLocationById,
  insertLocation,
  listLocationsByOrganization,
  listPublicLocationsWithStats,
  updateLocationById
} from "./locations.repository";
import type {
  CreateLocationBody,
  ListOrganizationLocationsQuery,
  ListPublicLocationsQuery,
  LocationWithStats,
  PublicLocationWithStats,
  UpdateLocationBody
} from "./locations.schemas";

export function listPublicLocationsService(query: ListPublicLocationsQuery): Promise<{
  data: PublicLocationWithStats[];
  pagination: { limit: number; offset: number; total: number; has_more: boolean };
}> {
  return listPublicLocationsWithStats(query);
}

export function listOrganizationLocationsService(
  organizationId: string,
  query: ListOrganizationLocationsQuery
): Promise<{
  data: LocationWithStats[];
  pagination: { limit: number; offset: number; total: number; has_more: boolean };
}> {
  return listLocationsByOrganization(organizationId, query);
}

export async function getLocationByIdService(organizationId: string, id: string): Promise<LocationWithStats> {
  const location = await findLocationById(organizationId, id);

  if (!location) {
    throw notFoundError("Location not found.");
  }

  return location;
}

export async function createLocationService(
  organizationId: string,
  input: CreateLocationBody,
  context: RequestContext
): Promise<LocationWithStats> {
  const normalizedInput = normalizeLocationInput(input);

  try {
    return await withTransaction(async (client) => {
      const location = await insertLocation(organizationId, normalizedInput, client);

      await recordAuditEvent(
        {
          ...context,
          organization_id: organizationId,
          action: "locker_location.created",
          resource_type: "locker_location",
          resource_id: location.id,
          metadata: {
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude
          }
        },
        client
      );

      const hydratedLocation = await findLocationById(organizationId, location.id, client);

      if (!hydratedLocation) {
        throw notFoundError("Location not found after creation.");
      }

      return hydratedLocation;
    });
  } catch (error) {
    if (isPgError(error, "23505")) {
      throw conflictError("A location with this name already exists in the organization.");
    }

    throw error;
  }
}

export async function updateLocationService(
  organizationId: string,
  id: string,
  input: UpdateLocationBody,
  context: RequestContext
): Promise<LocationWithStats> {
  if (Object.keys(input).length === 0) {
    throw validationError("At least one location field must be provided.");
  }

  const normalizedInput = normalizeLocationInput(input);

  try {
    return await withTransaction(async (client) => {
      const location = await updateLocationById(organizationId, id, normalizedInput, client);

      if (!location) {
        throw notFoundError("Location not found.");
      }

      await recordAuditEvent(
        {
          ...context,
          organization_id: organizationId,
          action: "locker_location.updated",
          resource_type: "locker_location",
          resource_id: location.id,
          metadata: {
            changed_fields: Object.keys(normalizedInput),
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude
          }
        },
        client
      );

      const hydratedLocation = await findLocationById(organizationId, id, client);

      if (!hydratedLocation) {
        throw notFoundError("Location not found after update.");
      }

      return hydratedLocation;
    });
  } catch (error) {
    if (isPgError(error, "23505")) {
      throw conflictError("A location with this name already exists in the organization.");
    }

    throw error;
  }
}

export async function deleteLocationService(
  organizationId: string,
  id: string,
  context: RequestContext
): Promise<void> {
  await withTransaction(async (client) => {
    const location = await findLocationById(organizationId, id, client);

    if (!location) {
      throw notFoundError("Location not found.");
    }

    const linkedLockers = await countLockersForLocation(organizationId, id, client);

    if (linkedLockers > 0) {
      throw conflictError("Cannot delete a location while lockers are assigned to it.");
    }

    const deleted = await deleteLocationById(organizationId, id, client);

    if (!deleted) {
      throw notFoundError("Location not found.");
    }

    await recordAuditEvent(
      {
        ...context,
        organization_id: organizationId,
        action: "locker_location.deleted",
        resource_type: "locker_location",
        resource_id: id,
        metadata: {
          name: location.name,
          address: location.address
        }
      },
      client
    );
  });
}

function normalizeLocationInput<T extends Partial<CreateLocationBody>>(input: T): T {
  const normalized = { ...input };

  if (normalized.name !== undefined) {
    normalized.name = normalizeText(normalized.name, "Location name");
  }

  if (normalized.address !== undefined) {
    normalized.address = normalizeText(normalized.address, "Location address");
  }

  return normalized;
}

function normalizeText(value: string, label: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw validationError(`${label} is required.`);
  }

  return normalized;
}
