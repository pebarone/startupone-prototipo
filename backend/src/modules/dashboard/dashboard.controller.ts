import type { FastifyRequest } from "fastify";
import { getDashboardMetricsService, getOrganizationDashboardService } from "./dashboard.service";

export async function getDashboardController() {
  return getDashboardMetricsService();
}

export async function getOrganizationDashboardController(
  request: FastifyRequest<{ Params: { organizationId: string } }>
) {
  return getOrganizationDashboardService(request.params.organizationId);
}
