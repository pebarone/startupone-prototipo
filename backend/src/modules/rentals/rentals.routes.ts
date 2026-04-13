import type { FastifyInstance } from "fastify";
import { requireOrganizationAdminOrAdmin } from "../../security/admin-auth";
import {
  bulkDeleteRentalsController,
  confirmRetrievalController,
  createRentalController,
  deleteRentalController,
  getRentalController,
  listOrgRentalsController,
  registerBiometricController,
  retrieveLockerController
} from "./rentals.controller";
import {
  bulkDeleteRentalsSchema,
  confirmRetrievalSchema,
  createRentalSchema,
  deleteOrganizationRentalSchema,
  getRentalSchema,
  listOrganizationAuditSchema,
  registerBiometricSchema,
  retrieveLockerSchema,
  type BulkDeleteRentalsBody,
  type CreateRentalBody,
  type DeleteOrganizationRentalParams,
  type OrganizationAuditParams,
  type RegisterBiometricBody,
  type RentalParams,
  type RetrieveLockerBody
} from "./rentals.schemas";

export async function rentalsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateRentalBody }>("/rentals", { schema: createRentalSchema }, createRentalController);

  app.get<{ Params: RentalParams }>("/rentals/:id", { schema: getRentalSchema }, getRentalController);

  app.post<{ Params: RentalParams; Body: RegisterBiometricBody }>(
    "/rentals/:id/biometric",
    { schema: registerBiometricSchema },
    registerBiometricController
  );

  app.post<{ Params: RentalParams; Body: RetrieveLockerBody }>(
    "/rentals/:id/retrieve",
    { schema: retrieveLockerSchema },
    retrieveLockerController
  );

  app.post<{ Params: RentalParams }>(
    "/rentals/:id/confirm-retrieval",
    { schema: confirmRetrievalSchema },
    confirmRetrievalController
  );

  app.get<{ Params: OrganizationAuditParams; Querystring: { location_id?: string; limit?: string; offset?: string } }>(
    "/org/:organizationId/audit",
    { schema: listOrganizationAuditSchema, preHandler: requireOrganizationAdminOrAdmin },
    listOrgRentalsController
  );

  app.delete<{ Params: DeleteOrganizationRentalParams }>(
    "/org/:organizationId/rentals/:id",
    { schema: deleteOrganizationRentalSchema, preHandler: requireOrganizationAdminOrAdmin },
    deleteRentalController
  );

  app.post<{ Params: OrganizationAuditParams; Body: BulkDeleteRentalsBody }>(
    "/org/:organizationId/rentals/bulk-delete",
    { schema: bulkDeleteRentalsSchema, preHandler: requireOrganizationAdminOrAdmin },
    bulkDeleteRentalsController
  );
}
