import type { FastifyReply, FastifyRequest } from "fastify";
import { getRequestContext } from "../../context/request-context";
import {
  createLockerService,
  deleteLockerService,
  getPublicLockerContextService,
  listOrganizationLockersService,
  listPublicLockersService,
  updateLockerService
} from "./lockers.service";
import type {
  CreateLockerBody,
  ListOrganizationLockersQuery,
  ListPublicLockersQuery,
  LockerParams,
  OrganizationLockerParams,
  UpdateLockerBody
} from "./lockers.schemas";

export async function listPublicLockersController(request: FastifyRequest<{ Querystring: ListPublicLockersQuery }>) {
  return listPublicLockersService(request.query);
}

export async function getPublicLockerContextController(request: FastifyRequest<{ Params: LockerParams }>) {
  return getPublicLockerContextService(request.params.id);
}

export async function listOrganizationLockersController(
  request: FastifyRequest<{ Params: { organizationId: string }; Querystring: ListOrganizationLockersQuery }>
) {
  return listOrganizationLockersService(request.params.organizationId, request.query);
}

export async function createLockerController(
  request: FastifyRequest<{ Params: { organizationId: string }; Body: CreateLockerBody }>,
  reply: FastifyReply
) {
  const locker = await createLockerService(request.params.organizationId, request.body, getRequestContext(request, "admin"));
  return reply.code(201).send(locker);
}

export async function updateLockerController(
  request: FastifyRequest<{ Params: OrganizationLockerParams; Body: UpdateLockerBody }>
) {
  return updateLockerService(
    request.params.organizationId,
    request.params.id,
    request.body,
    getRequestContext(request, "admin")
  );
}

export async function deleteLockerController(
  request: FastifyRequest<{ Params: OrganizationLockerParams }>,
  reply: FastifyReply
) {
  await deleteLockerService(
    request.params.organizationId,
    request.params.id,
    getRequestContext(request, "admin")
  );

  return reply.code(204).send();
}
