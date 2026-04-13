import type { FastifyInstance } from "fastify";
import { requireOrganizationAdminOrAdmin, requireOrganizationMemberOrAdmin } from "../../security/admin-auth";
import {
  createLockerController,
  deleteLockerController,
  getPublicLockerContextController,
  listOrganizationLockersController,
  listPublicLockersController,
  updateLockerController
} from "./lockers.controller";
import {
  createLockerSchema,
  deleteLockerSchema,
  getPublicLockerContextSchema,
  listOrganizationLockersSchema,
  listPublicLockersSchema,
  updateLockerSchema,
  type CreateLockerBody,
  type ListOrganizationLockersQuery,
  type ListPublicLockersQuery,
  type LockerParams,
  type OrganizationLockerParams,
  type UpdateLockerBody
} from "./lockers.schemas";

export async function lockersRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ListPublicLockersQuery }>(
    "/lockers",
    { schema: listPublicLockersSchema },
    listPublicLockersController
  );

  app.get<{ Params: LockerParams }>(
    "/lockers/:id/public-context",
    { schema: getPublicLockerContextSchema },
    getPublicLockerContextController
  );

  app.get<{ Params: { organizationId: string }; Querystring: ListOrganizationLockersQuery }>(
    "/organizations/:organizationId/lockers",
    { schema: listOrganizationLockersSchema, preHandler: requireOrganizationMemberOrAdmin },
    listOrganizationLockersController
  );

  app.post<{ Params: { organizationId: string }; Body: CreateLockerBody }>(
    "/organizations/:organizationId/lockers",
    { schema: createLockerSchema, preHandler: requireOrganizationAdminOrAdmin },
    createLockerController
  );

  app.patch<{ Params: OrganizationLockerParams; Body: UpdateLockerBody }>(
    "/organizations/:organizationId/lockers/:id",
    { schema: updateLockerSchema, preHandler: requireOrganizationAdminOrAdmin },
    updateLockerController
  );

  app.delete<{ Params: OrganizationLockerParams }>(
    "/organizations/:organizationId/lockers/:id",
    { schema: deleteLockerSchema, preHandler: requireOrganizationAdminOrAdmin },
    deleteLockerController
  );
}
