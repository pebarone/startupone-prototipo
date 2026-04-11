import { getDashboardMetrics, getOrganizationDashboard } from "./dashboard.repository";

export function getDashboardMetricsService() {
  return getDashboardMetrics();
}

export function getOrganizationDashboardService(organizationId: string) {
  return getOrganizationDashboard(organizationId);
}
