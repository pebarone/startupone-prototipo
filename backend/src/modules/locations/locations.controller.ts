import type { FastifyReply, FastifyRequest } from "fastify";
import { getRequestContext } from "../../context/request-context";
import {
  createLocationService,
  deleteLocationService,
  listOrganizationLocationsService,
  listPublicLocationsService,
  updateLocationService
} from "./locations.service";
import type {
  CreateLocationBody,
  ListOrganizationLocationsQuery,
  ListPublicLocationsQuery,
  OrganizationLocationParams,
  UpdateLocationBody
} from "./locations.schemas";

export async function listPublicLocationsController(request: FastifyRequest<{ Querystring: ListPublicLocationsQuery }>) {
  return listPublicLocationsService(request.query);
}

export async function listOrganizationLocationsController(
  request: FastifyRequest<{ Params: { organizationId: string }; Querystring: ListOrganizationLocationsQuery }>
) {
  return listOrganizationLocationsService(request.params.organizationId, request.query);
}

export async function createLocationController(
  request: FastifyRequest<{ Params: { organizationId: string }; Body: CreateLocationBody }>,
  reply: FastifyReply
) {
  const location = await createLocationService(
    request.params.organizationId,
    request.body,
    getRequestContext(request, "admin")
  );

  return reply.code(201).send(location);
}

export async function updateLocationController(
  request: FastifyRequest<{ Params: OrganizationLocationParams; Body: UpdateLocationBody }>
) {
  return updateLocationService(
    request.params.organizationId,
    request.params.id,
    request.body,
    getRequestContext(request, "admin")
  );
}

export async function deleteLocationController(
  request: FastifyRequest<{ Params: OrganizationLocationParams }>,
  reply: FastifyReply
) {
  await deleteLocationService(
    request.params.organizationId,
    request.params.id,
    getRequestContext(request, "admin")
  );

  return reply.code(204).send();
}
