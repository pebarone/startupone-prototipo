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

export type DashboardLockerPreview = {
  id: string;
  code: string;
  size: "P" | "M" | "G";
  status: "free" | "occupied" | "maintenance";
  location_id: string | null;
};

export type OrganizationDashboard = DashboardMetrics & {
  lockers_preview: DashboardLockerPreview[];
};

const uuidSchema = { type: "string", format: "uuid" } as const;
const lockerSizeSchema = { type: "string", enum: ["P", "M", "G"] } as const;
const lockerStatusSchema = { type: "string", enum: ["free", "occupied", "maintenance"] } as const;

export const dashboardMetricsSchema = {
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
} as const;

export const dashboardLockerPreviewSchema = {
  type: "object",
  required: ["id", "code", "size", "status", "location_id"],
  properties: {
    id: uuidSchema,
    code: { type: "string" },
    size: lockerSizeSchema,
    status: lockerStatusSchema,
    location_id: { anyOf: [uuidSchema, { type: "null" }] }
  }
} as const;

export const organizationDashboardSchema = {
  type: "object",
  required: [...dashboardMetricsSchema.required, "lockers_preview"],
  properties: {
    ...dashboardMetricsSchema.properties,
    lockers_preview: {
      type: "array",
      items: dashboardLockerPreviewSchema
    }
  }
} as const;
