import { getDashboardMetrics, getOrganizationDashboardMetrics } from "./dashboard.repository";

export function getDashboardMetricsService() {
  return getDashboardMetrics();
}

export function getOrganizationDashboardMetricsService(organizationId: string) {
  return getOrganizationDashboardMetrics(organizationId);
}
