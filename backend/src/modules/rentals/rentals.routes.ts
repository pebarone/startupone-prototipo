import type { FastifyInstance } from "fastify";
import { requireOrganizationAdminOrAdmin } from "../../security/admin-auth";
import {
  bulkDeleteRentalsController,
  completeRegistrationController,
  confirmRetrievalController,
  createAuthenticationOptionsController,
  createRegistrationOptionsController,
  createRentalController,
  deleteRentalController,
  getRentalController,
  listOrgRentalsController,
  overrideReleaseController,
  retrieveLockerController
} from "./rentals.controller";
import {
  authenticationOptionsSchema,
  bulkDeleteRentalsSchema,
  completeRegistrationSchema,
  confirmRetrievalSchema,
  createRentalSchema,
  deleteOrganizationRentalSchema,
  getRentalSchema,
  listOrganizationAuditSchema,
  overrideReleaseSchema,
  registrationOptionsSchema,
  retrieveLockerSchema,
  type BulkDeleteRentalsBody,
  type CompleteRegistrationBody,
  type CreateRentalBody,
  type DeleteOrganizationRentalParams,
  type OrganizationAuditParams,
  type OverrideReleaseBody,
  type RentalParams,
  type RetrieveLockerBody
} from "./rentals.schemas";

export async function rentalsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateRentalBody }>("/rentals", { schema: createRentalSchema }, createRentalController);

  app.get<{ Params: RentalParams }>("/rentals/:id", { schema: getRentalSchema }, getRentalController);

  app.post<{ Params: RentalParams }>(
    "/rentals/:id/webauthn/registration-options",
    { schema: registrationOptionsSchema },
    createRegistrationOptionsController
  );

  app.post<{ Params: RentalParams; Body: CompleteRegistrationBody }>(
    "/rentals/:id/webauthn/registrations",
    { schema: completeRegistrationSchema },
    completeRegistrationController
  );

  app.post<{ Params: RentalParams }>(
    "/rentals/:id/webauthn/authentication-options",
    { schema: authenticationOptionsSchema },
    createAuthenticationOptionsController
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

  app.post<{ Params: DeleteOrganizationRentalParams; Body: OverrideReleaseBody }>(
    "/organizations/:organizationId/rentals/:id/override-release",
    { schema: overrideReleaseSchema, preHandler: requireOrganizationAdminOrAdmin },
    overrideReleaseController
  );
}
