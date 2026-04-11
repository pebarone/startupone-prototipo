import type { FastifyInstance } from "fastify";
import { requireAdminApiKey, requireOrganizationAdminOrAdmin } from "../../security/admin-auth";
import { organizationParamsSchema, type OrganizationParams } from "../organizations/organizations.schemas";
import { getDashboardController, getOrganizationDashboardController } from "./dashboard.controller";

const dashboardSchema = {
  response: {
    200: {
      type: "object",
      required: [
        "total_lockers",
        "free_lockers",
        "occupied_lockers",
        "maintenance_lockers",
        "active_rentals",
        "finished_rentals",
        "total_rentals",
        "successful_unlocks",
        "failed_unlocks"
      ],
      properties: {
        total_lockers: { type: "integer", minimum: 0 },
        free_lockers: { type: "integer", minimum: 0 },
        occupied_lockers: { type: "integer", minimum: 0 },
        maintenance_lockers: { type: "integer", minimum: 0 },
        active_rentals: { type: "integer", minimum: 0 },
        finished_rentals: { type: "integer", minimum: 0 },
        total_rentals: { type: "integer", minimum: 0 },
        successful_unlocks: { type: "integer", minimum: 0 },
        failed_unlocks: { type: "integer", minimum: 0 }
      }
    }
  }
} as const;

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", { schema: dashboardSchema, preHandler: requireAdminApiKey }, getDashboardController);
  app.get("/platform/dashboard", { schema: dashboardSchema, preHandler: requireAdminApiKey }, getDashboardController);
  app.get<{ Params: OrganizationParams }>(
    "/organizations/:organizationId/dashboard",
    {
      schema: {
        ...dashboardSchema,
        params: organizationParamsSchema
      },
      preHandler: requireOrganizationAdminOrAdmin
    },
    getOrganizationDashboardController
  );
}
