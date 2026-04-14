import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { getRequestContext } from "../../context/request-context";
import {
  completeRegistrationService,
  confirmRetrievalPaymentService,
  createAuthenticationOptionsService,
  createRetrievalAuthenticationOptionsService,
  createRegistrationOptionsService,
  createRentalService,
  deleteRentalHistoryBatchService,
  deleteRentalHistoryService,
  getRentalByIdService,
  listRentalsByOrg,
  overrideReleaseService,
  retrieveByCredentialService,
  startStoringService,
  retrieveLockerService
} from "./rentals.service";
import type {
  BulkDeleteRentalsBody,
  CompleteRegistrationBody,
  CreateRentalBody,
  DeleteOrganizationRentalParams,
  OrganizationAuditParams,
  OverrideReleaseBody,
  RentalParams,
  RetrievalLookupResult,
  RetrieveLockerBody,
  StartStoringBody
} from "./rentals.schemas";

export async function createRentalController(
  request: FastifyRequest<{ Body: CreateRentalBody }>,
  reply: FastifyReply
) {
  const rental = await createRentalService(request.body.locker_id, getRequestContext(request, "anonymous"));
  return reply.code(201).send(rental);
}

export async function getRentalController(request: FastifyRequest<{ Params: RentalParams }>) {
  return getRentalByIdService(request.params.id);
}

export async function createRegistrationOptionsController(
  request: FastifyRequest<{ Params: RentalParams }>,
  reply: FastifyReply
) {
  const options = await createRegistrationOptionsService(request.params.id, getRequestContext(request, "anonymous"));
  return reply.code(200).send(options);
}

export async function completeRegistrationController(
  request: FastifyRequest<{ Params: RentalParams; Body: CompleteRegistrationBody }>,
  reply: FastifyReply
) {
  const rental = await completeRegistrationService(
    request.params.id,
    request.body.credential as RegistrationResponseJSON,
    getRequestContext(request, "anonymous")
  );
  return reply.code(200).send(rental);
}

export async function createAuthenticationOptionsController(
  request: FastifyRequest<{ Params: RentalParams }>,
  reply: FastifyReply
) {
  const options = await createAuthenticationOptionsService(request.params.id, getRequestContext(request, "anonymous"));
  return reply.code(200).send(options);
}

export async function createRetrievalAuthenticationOptionsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const options = await createRetrievalAuthenticationOptionsService(getRequestContext(request, "anonymous"));
  return reply.code(200).send(options);
}

export async function startStoringController(
  request: FastifyRequest<{ Params: RentalParams; Body: StartStoringBody }>,
  reply: FastifyReply
) {
  const rental = await startStoringService(
    request.params.id,
    getRequestContext(request, "anonymous")
  );
  return reply.code(200).send(rental);
}

export async function retrieveLockerController(
  request: FastifyRequest<{ Params: RentalParams; Body: RetrieveLockerBody }>,
  reply: FastifyReply
) {
  const result = await retrieveLockerService(
    request.params.id,
    request.body.credential as AuthenticationResponseJSON,
    getRequestContext(request, "anonymous")
  );
  return reply.code(200).send(result);
}

export async function retrieveByCredentialController(
  request: FastifyRequest<{ Body: RetrieveLockerBody }>,
  reply: FastifyReply
) {
  const result: RetrievalLookupResult = await retrieveByCredentialService(
    request.body.credential as AuthenticationResponseJSON,
    getRequestContext(request, "anonymous")
  );
  return reply.code(200).send(result);
}

export async function confirmRetrievalController(
  request: FastifyRequest<{ Params: RentalParams }>,
  reply: FastifyReply
) {
  const rental = await confirmRetrievalPaymentService(
    request.params.id,
    getRequestContext(request, "anonymous")
  );
  return reply.code(200).send(rental);
}

export async function listOrgRentalsController(
  request: FastifyRequest<{
    Params: OrganizationAuditParams;
    Querystring: { location_id?: string; limit?: string; offset?: string };
  }>,
  reply: FastifyReply
) {
  const { organizationId } = request.params;
  const { location_id, limit, offset } = request.query;
  const rows = await listRentalsByOrg(
    organizationId,
    location_id || null,
    limit ? parseInt(limit, 10) : 100,
    offset ? parseInt(offset, 10) : 0
  );
  return reply.code(200).send(rows);
}

export async function deleteRentalController(
  request: FastifyRequest<{ Params: DeleteOrganizationRentalParams }>,
  reply: FastifyReply
) {
  const result = await deleteRentalHistoryService(
    request.params.id,
    request.params.organizationId,
    getRequestContext(request, "partner")
  );
  return reply.code(200).send(result);
}

export async function bulkDeleteRentalsController(
  request: FastifyRequest<{ Params: OrganizationAuditParams; Body: BulkDeleteRentalsBody }>,
  reply: FastifyReply
) {
  const result = await deleteRentalHistoryBatchService(
    request.body.rental_ids,
    request.params.organizationId,
    getRequestContext(request, "partner")
  );
  return reply.code(200).send(result);
}

export async function overrideReleaseController(
  request: FastifyRequest<{ Params: DeleteOrganizationRentalParams; Body: OverrideReleaseBody }>,
  reply: FastifyReply
) {
  const rental = await overrideReleaseService(
    request.params.id,
    request.params.organizationId,
    request.body.reason,
    getRequestContext(request, "partner")
  );
  return reply.code(200).send(rental);
}
