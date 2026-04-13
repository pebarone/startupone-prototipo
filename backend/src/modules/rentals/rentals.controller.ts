import type { FastifyReply, FastifyRequest } from "fastify";
import { getRequestContext } from "../../context/request-context";
import {
  deleteRentalHistoryBatchService,
  deleteRentalHistoryService,
  confirmRetrievalPaymentService,
  createRentalService,
  getRentalByIdService,
  registerBiometricService,
  retrieveLockerService
} from "./rentals.service";
import { listRentalsByOrg } from "./rentals.repository";
import type {
  BulkDeleteRentalsBody,
  CreateRentalBody,
  DeleteOrganizationRentalParams,
  OrganizationAuditParams,
  RegisterBiometricBody,
  RentalParams,
  RetrieveLockerBody
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

export async function registerBiometricController(
  request: FastifyRequest<{ Params: RentalParams; Body: RegisterBiometricBody }>,
  reply: FastifyReply
) {
  const rental = await registerBiometricService(
    request.params.id,
    request.body.biometric_token,
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
    request.body.biometric_token,
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
