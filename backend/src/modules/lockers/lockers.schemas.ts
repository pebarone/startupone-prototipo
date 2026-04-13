import type { RentalStatus } from "../rentals/rentals.schemas";
import { organizationParamsSchema } from "../organizations/organizations.schemas";

export const lockerSizes = ["P", "M", "G"] as const;
export const lockerStatuses = ["free", "occupied", "maintenance"] as const;
export const publicLockerContextModes = ["rent", "retrieve", "maintenance"] as const;

export type LockerSize = (typeof lockerSizes)[number];
export type LockerStatus = (typeof lockerStatuses)[number];
export type PublicLockerContextMode = (typeof publicLockerContextModes)[number];

export type Locker = {
  id: string;
  organization_id: string;
  location_id: string | null;
  code: string;
  size: LockerSize;
  status: LockerStatus;
  created_at: Date;
  updated_at: Date;
};

export type LockerListFilters = {
  status?: LockerStatus;
  size?: LockerSize;
  location_id?: string;
  limit?: number;
  offset?: number;
};

export type ListPublicLockersQuery = LockerListFilters & {
  organization_id?: string;
};

export type ListOrganizationLockersQuery = LockerListFilters;

export type CreateLockerBody = {
  code: string;
  size: LockerSize;
  location_id?: string | null;
};

export type UpdateLockerBody = {
  code?: string;
  size?: LockerSize;
  status?: LockerStatus;
  location_id?: string | null;
};

export type LockerParams = {
  id: string;
};

export type OrganizationLockerParams = {
  organizationId: string;
  id: string;
};

export type PublicLockerContextActiveRental = {
  id: string | null;
  status: Extract<RentalStatus, "active" | "storing" | "pending_retrieval_payment">;
  started_at: Date;
  unlocked_at: Date | null;
  retrieved_at: Date | null;
  initial_fee_cents: number;
  hourly_rate_cents: number;
  extra_charge_cents: number;
  total_cents: number;
  can_authenticate: boolean;
};

export type PublicLockerContext = {
  mode: PublicLockerContextMode;
  locker: Locker;
  location_name: string | null;
  location_address: string | null;
  initial_fee_cents: number;
  hourly_rate_cents: number;
  active_rental: PublicLockerContextActiveRental | null;
};

const uuidSchema = { type: "string", format: "uuid" };
const timestampSchema = { type: "string", format: "date-time" };

export const lockerSchema = {
  type: "object",
  required: ["id", "organization_id", "location_id", "code", "size", "status", "created_at", "updated_at"],
  properties: {
    id: uuidSchema,
    organization_id: uuidSchema,
    location_id: { anyOf: [uuidSchema, { type: "null" }] },
    code: { type: "string" },
    size: { type: "string", enum: lockerSizes },
    status: { type: "string", enum: lockerStatuses },
    created_at: timestampSchema,
    updated_at: timestampSchema
  }
} as const;

export const paginationSchema = {
  type: "object",
  required: ["limit", "offset", "total", "has_more"],
  properties: {
    limit: { type: "integer", minimum: 1 },
    offset: { type: "integer", minimum: 0 },
    total: { type: "integer", minimum: 0 },
    has_more: { type: "boolean" }
  }
} as const;

export const idParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: uuidSchema
  },
  additionalProperties: false
} as const;

const listLockersQuerySchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: lockerStatuses },
    size: { type: "string", enum: lockerSizes },
    location_id: uuidSchema,
    limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
    offset: { type: "integer", minimum: 0, default: 0 }
  },
  additionalProperties: false
} as const;

const listLockersResponseSchema = {
  type: "object",
  required: ["data", "pagination"],
  properties: {
    data: {
      type: "array",
      items: lockerSchema
    },
    pagination: paginationSchema
  }
} as const;

const publicLockerContextActiveRentalSchema = {
  type: "object",
  required: [
    "id",
    "status",
    "started_at",
    "unlocked_at",
    "retrieved_at",
    "initial_fee_cents",
    "hourly_rate_cents",
    "extra_charge_cents",
    "total_cents",
    "can_authenticate"
  ],
  properties: {
    id: { anyOf: [uuidSchema, { type: "null" }] },
    status: { type: "string", enum: ["active", "storing", "pending_retrieval_payment"] },
    started_at: timestampSchema,
    unlocked_at: { anyOf: [timestampSchema, { type: "null" }] },
    retrieved_at: { anyOf: [timestampSchema, { type: "null" }] },
    initial_fee_cents: { type: "integer", minimum: 0 },
    hourly_rate_cents: { type: "integer", minimum: 0 },
    extra_charge_cents: { type: "integer", minimum: 0 },
    total_cents: { type: "integer", minimum: 0 },
    can_authenticate: { type: "boolean" }
  }
} as const;

export const publicLockerContextSchema = {
  type: "object",
  required: ["mode", "locker", "location_name", "location_address", "initial_fee_cents", "hourly_rate_cents", "active_rental"],
  properties: {
    mode: { type: "string", enum: publicLockerContextModes },
    locker: lockerSchema,
    location_name: { anyOf: [{ type: "string" }, { type: "null" }] },
    location_address: { anyOf: [{ type: "string" }, { type: "null" }] },
    initial_fee_cents: { type: "integer", minimum: 0 },
    hourly_rate_cents: { type: "integer", minimum: 0 },
    active_rental: { anyOf: [publicLockerContextActiveRentalSchema, { type: "null" }] }
  }
} as const;

export const listPublicLockersSchema = {
  querystring: {
    type: "object",
    required: [],
    properties: {
      organization_id: { type: "string", format: "uuid" },
      status: { type: "string", enum: lockerStatuses },
      size: { type: "string", enum: lockerSizes },
      location_id: uuidSchema,
      limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
      offset: { type: "integer", minimum: 0, default: 0 }
    },
    additionalProperties: false
  },
  response: {
    200: listLockersResponseSchema
  }
} as const;

export const getPublicLockerContextSchema = {
  params: idParamsSchema,
  response: {
    200: publicLockerContextSchema
  }
} as const;

export const listOrganizationLockersSchema = {
  params: organizationParamsSchema,
  querystring: listLockersQuerySchema,
  response: {
    200: listLockersResponseSchema
  }
} as const;

export const createLockerSchema = {
  params: organizationParamsSchema,
  body: {
    type: "object",
    required: ["code", "size"],
    properties: {
      code: { type: "string", minLength: 3, maxLength: 32, pattern: "^[A-Z0-9-]+$" },
      size: { type: "string", enum: lockerSizes },
      location_id: { anyOf: [uuidSchema, { type: "null" }] }
    },
    additionalProperties: false
  },
  response: {
    201: lockerSchema
  }
} as const;

export const updateLockerSchema = {
  params: {
    type: "object",
    required: ["organizationId", "id"],
    properties: {
      organizationId: uuidSchema,
      id: uuidSchema
    },
    additionalProperties: false
  },
  body: {
    type: "object",
    minProperties: 1,
    properties: {
      code: { type: "string", minLength: 3, maxLength: 32, pattern: "^[A-Z0-9-]+$" },
      size: { type: "string", enum: lockerSizes },
      status: { type: "string", enum: lockerStatuses },
      location_id: { anyOf: [uuidSchema, { type: "null" }] }
    },
    additionalProperties: false
  },
  response: {
    200: lockerSchema
  }
} as const;

export const deleteLockerSchema = {
  params: {
    type: "object",
    required: ["organizationId", "id"],
    properties: {
      organizationId: uuidSchema,
      id: uuidSchema
    },
    additionalProperties: false
  },
  response: {
    204: { type: "null" }
  }
} as const;
