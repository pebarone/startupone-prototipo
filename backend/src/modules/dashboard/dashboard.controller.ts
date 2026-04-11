import type { FastifyRequest } from "fastify";
import { getDashboardMetricsService, getOrganizationDashboardMetricsService } from "./dashboard.service";

export async function getDashboardController() {
  return getDashboardMetricsService();
}

export async function getOrganizationDashboardController(
  request: FastifyRequest<{ Params: { organizationId: string } }>
) {
  return getOrganizationDashboardMetricsService(request.params.organizationId);
}
