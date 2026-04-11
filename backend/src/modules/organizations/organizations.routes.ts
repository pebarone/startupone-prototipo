import type { FastifyInstance } from "fastify";
import {
  requireAuthenticatedUser,
  requireAuthenticatedUserOrAdmin,
  requireOrganizationAdminOrAdmin,
  requireOrganizationMemberOrAdmin
} from "../../security/admin-auth";
import {
  createOrganizationMembershipController,
  createOrganizationController,
  getMeController,
  getOrganizationController,
  listOrganizationMembershipsController,
  listOrganizationsController,
  updateOrganizationMembershipController
} from "./organizations.controller";
import {
  appUserSchema,
  createOrganizationMembershipSchema,
  createOrganizationSchema,
  getOrganizationSchema,
  listOrganizationMembershipsSchema,
  listOrganizationsSchema,
  organizationMembershipSchema,
  updateOrganizationMembershipSchema,
  type CreateOrganizationBody,
  type CreateOrganizationMembershipBody,
  type ListOrganizationMembershipsQuery,
  type ListOrganizationsQuery,
  type MembershipParams,
  type OrganizationParams,
  type UpdateOrganizationMembershipBody
} from "./organizations.schemas";

const meSchema = {
  response: {
    200: {
      type: "object",
      required: ["user", "memberships"],
      properties: {
        user: { anyOf: [appUserSchema, { type: "null" }] },
        memberships: {
          type: "array",
          items: organizationMembershipSchema
        }
      }
    }
  }
} as const;

export async function organizationsRoutes(app: FastifyInstance) {
  app.get("/me", { schema: meSchema, preHandler: requireAuthenticatedUser }, getMeController);

  app.get<{ Querystring: ListOrganizationsQuery }>(
    "/organizations",
    { schema: listOrganizationsSchema, preHandler: requireAuthenticatedUserOrAdmin },
    listOrganizationsController
  );

  app.post<{ Body: CreateOrganizationBody }>(
    "/organizations",
    { schema: createOrganizationSchema, preHandler: requireAuthenticatedUserOrAdmin },
    createOrganizationController
  );

  app.get<{ Params: OrganizationParams }>(
    "/organizations/:organizationId",
    { schema: getOrganizationSchema, preHandler: requireOrganizationMemberOrAdmin },
    getOrganizationController
  );

  app.get<{ Params: OrganizationParams; Querystring: ListOrganizationMembershipsQuery }>(
    "/organizations/:organizationId/memberships",
    { schema: listOrganizationMembershipsSchema, preHandler: requireOrganizationAdminOrAdmin },
    listOrganizationMembershipsController
  );

  app.post<{ Params: OrganizationParams; Body: CreateOrganizationMembershipBody }>(
    "/organizations/:organizationId/memberships",
    { schema: createOrganizationMembershipSchema, preHandler: requireOrganizationAdminOrAdmin },
    createOrganizationMembershipController
  );

  app.patch<{ Params: MembershipParams; Body: UpdateOrganizationMembershipBody }>(
    "/organizations/:organizationId/memberships/:membershipId",
    { schema: updateOrganizationMembershipSchema, preHandler: requireOrganizationAdminOrAdmin },
    updateOrganizationMembershipController
  );
}
