import { pool } from "../../db/pool";
import type { DashboardMetrics, OrganizationDashboard } from "./dashboard.schemas";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const result = await pool.query<DashboardMetrics>(`
    WITH locker_stats AS (
      SELECT
        count(*)::int AS total_lockers,
        count(*) FILTER (WHERE status = 'free')::int AS free_lockers,
        count(*) FILTER (WHERE status = 'occupied')::int AS occupied_lockers,
        count(*) FILTER (WHERE status = 'maintenance')::int AS maintenance_lockers
      FROM lockers
    ),
    rental_stats AS (
      SELECT
        count(*) FILTER (WHERE status = 'active')::int AS active_rentals,
        count(*) FILTER (WHERE status = 'finished')::int AS finished_rentals,
        count(*)::int AS total_rentals
      FROM rentals
    ),
    unlock_stats AS (
      SELECT
        count(*) FILTER (WHERE success = true)::int AS successful_unlocks,
        count(*) FILTER (WHERE success = false)::int AS failed_unlocks
      FROM unlock_events
    )
    SELECT
      locker_stats.total_lockers,
      locker_stats.free_lockers,
      locker_stats.occupied_lockers,
      locker_stats.maintenance_lockers,
      rental_stats.active_rentals,
      rental_stats.finished_rentals,
      rental_stats.total_rentals,
      unlock_stats.successful_unlocks,
      unlock_stats.failed_unlocks
    FROM locker_stats
    CROSS JOIN rental_stats
    CROSS JOIN unlock_stats
  `);

  return result.rows[0];
}

export async function getOrganizationDashboard(
  organizationId: string,
  previewLimit = 8
): Promise<OrganizationDashboard> {
  const result = await pool.query<OrganizationDashboard>(
    `
    WITH locker_stats AS (
      SELECT
        count(*)::int AS total_lockers,
        count(*) FILTER (WHERE status = 'free')::int AS free_lockers,
        count(*) FILTER (WHERE status = 'occupied')::int AS occupied_lockers,
        count(*) FILTER (WHERE status = 'maintenance')::int AS maintenance_lockers
      FROM lockers
      WHERE organization_id = $1
    ),
    rental_stats AS (
      SELECT
        count(*) FILTER (WHERE status = 'active')::int AS active_rentals,
        count(*) FILTER (WHERE status = 'finished')::int AS finished_rentals,
        count(*)::int AS total_rentals
      FROM rentals
      WHERE organization_id = $1
    ),
    unlock_stats AS (
      SELECT
        count(*) FILTER (WHERE success = true)::int AS successful_unlocks,
        count(*) FILTER (WHERE success = false)::int AS failed_unlocks
      FROM unlock_events
      WHERE organization_id = $1
    ),
    locker_preview AS (
      SELECT
        COALESCE(
          json_agg(row_to_json(preview_row) ORDER BY preview_row.code),
          '[]'::json
        ) AS lockers_preview
      FROM (
        SELECT id, code, size, status, location_id
        FROM lockers
        WHERE organization_id = $1
        ORDER BY code ASC
        LIMIT $2
      ) AS preview_row
    )
    SELECT
      locker_stats.total_lockers,
      locker_stats.free_lockers,
      locker_stats.occupied_lockers,
      locker_stats.maintenance_lockers,
      rental_stats.active_rentals,
      rental_stats.finished_rentals,
      rental_stats.total_rentals,
      unlock_stats.successful_unlocks,
      unlock_stats.failed_unlocks,
      locker_preview.lockers_preview
    FROM locker_stats
    CROSS JOIN rental_stats
    CROSS JOIN unlock_stats
    CROSS JOIN locker_preview
    `,
    [organizationId, previewLimit]
  );

  return result.rows[0];
}
