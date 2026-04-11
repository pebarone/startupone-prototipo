import { pool } from "../../db/pool";

export type DashboardMetrics = {
  total_lockers: number;
  free_lockers: number;
  occupied_lockers: number;
  maintenance_lockers: number;
  active_rentals: number;
  finished_rentals: number;
  total_rentals: number;
  successful_unlocks: number;
  failed_unlocks: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const result = await pool.query<DashboardMetrics>(`
    SELECT
      (SELECT count(*)::int FROM lockers) AS total_lockers,
      (SELECT count(*)::int FROM lockers WHERE status = 'free') AS free_lockers,
      (SELECT count(*)::int FROM lockers WHERE status = 'occupied') AS occupied_lockers,
      (SELECT count(*)::int FROM lockers WHERE status = 'maintenance') AS maintenance_lockers,
      (SELECT count(*)::int FROM rentals WHERE status = 'active') AS active_rentals,
      (SELECT count(*)::int FROM rentals WHERE status = 'finished') AS finished_rentals,
      (SELECT count(*)::int FROM rentals) AS total_rentals,
      (SELECT count(*)::int FROM unlock_events WHERE success = true) AS successful_unlocks,
      (SELECT count(*)::int FROM unlock_events WHERE success = false) AS failed_unlocks
  `);

  return result.rows[0];
}

export async function getOrganizationDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
  const result = await pool.query<DashboardMetrics>(
    `
    SELECT
      (SELECT count(*)::int FROM lockers WHERE organization_id = $1) AS total_lockers,
      (SELECT count(*)::int FROM lockers WHERE organization_id = $1 AND status = 'free') AS free_lockers,
      (SELECT count(*)::int FROM lockers WHERE organization_id = $1 AND status = 'occupied') AS occupied_lockers,
      (SELECT count(*)::int FROM lockers WHERE organization_id = $1 AND status = 'maintenance') AS maintenance_lockers,
      (SELECT count(*)::int FROM rentals WHERE organization_id = $1 AND status = 'active') AS active_rentals,
      (SELECT count(*)::int FROM rentals WHERE organization_id = $1 AND status = 'finished') AS finished_rentals,
      (SELECT count(*)::int FROM rentals WHERE organization_id = $1) AS total_rentals,
      (SELECT count(*)::int FROM unlock_events WHERE organization_id = $1 AND success = true) AS successful_unlocks,
      (SELECT count(*)::int FROM unlock_events WHERE organization_id = $1 AND success = false) AS failed_unlocks
    `,
    [organizationId]
  );

  return result.rows[0];
}
