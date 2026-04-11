import type { FastifyInstance } from "fastify";
import { requireAdminApiKey, requireOrganizationAdminOrAdmin } from "../../security/admin-auth";
import { organizationParamsSchema, type OrganizationParams } from "../organizations/organizations.schemas";
import { getDashboardController, getOrganizationDashboardController } from "./dashboard.controller";
import { dashboardMetricsSchema, organizationDashboardSchema } from "./dashboard.schemas";

const platformDashboardSchema = {
  response: {
    200: dashboardMetricsSchema
  }
} as const;

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", { schema: platformDashboardSchema, preHandler: requireAdminApiKey }, getDashboardController);
  app.get("/platform/dashboard", { schema: platformDashboardSchema, preHandler: requireAdminApiKey }, getDashboardController);
  app.get<{ Params: OrganizationParams }>(
    "/organizations/:organizationId/dashboard",
    {
      schema: {
        response: {
          200: organizationDashboardSchema
        },
        params: organizationParamsSchema
      },
      preHandler: requireOrganizationAdminOrAdmin
    },
    getOrganizationDashboardController
  );
}
