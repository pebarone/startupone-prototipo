import type { FastifyInstance } from "fastify";
import { requireOrganizationAdminOrAdmin, requireOrganizationMemberOrAdmin } from "../../security/admin-auth";
import {
  createLocationController,
  deleteLocationController,
  listOrganizationLocationsController,
  listPublicLocationsController,
  updateLocationController
} from "./locations.controller";
import {
  createLocationSchema,
  deleteLocationSchema,
  listOrganizationLocationsSchema,
  listPublicLocationsSchema,
  updateLocationSchema,
  type CreateLocationBody,
  type ListOrganizationLocationsQuery,
  type ListPublicLocationsQuery,
  type OrganizationLocationParams,
  type UpdateLocationBody
} from "./locations.schemas";

export async function locationsRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ListPublicLocationsQuery }>(
    "/locations",
    { schema: listPublicLocationsSchema },
    listPublicLocationsController
  );

  app.get<{ Params: { organizationId: string }; Querystring: ListOrganizationLocationsQuery }>(
    "/organizations/:organizationId/locations",
    { schema: listOrganizationLocationsSchema, preHandler: requireOrganizationMemberOrAdmin },
    listOrganizationLocationsController
  );

  app.post<{ Params: { organizationId: string }; Body: CreateLocationBody }>(
    "/organizations/:organizationId/locations",
    { schema: createLocationSchema, preHandler: requireOrganizationAdminOrAdmin },
    createLocationController
  );

  app.patch<{ Params: OrganizationLocationParams; Body: UpdateLocationBody }>(
    "/organizations/:organizationId/locations/:id",
    { schema: updateLocationSchema, preHandler: requireOrganizationAdminOrAdmin },
    updateLocationController
  );

  app.delete<{ Params: OrganizationLocationParams }>(
    "/organizations/:organizationId/locations/:id",
    { schema: deleteLocationSchema, preHandler: requireOrganizationAdminOrAdmin },
    deleteLocationController
  );
}
