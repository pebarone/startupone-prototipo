import { organizationParamsSchema } from "../organizations/organizations.schemas";

export const lockerSizes = ["P", "M", "G"] as const;
export const lockerStatuses = ["free", "occupied", "maintenance"] as const;

export type LockerSize = (typeof lockerSizes)[number];
export type LockerStatus = (typeof lockerStatuses)[number];

export type Locker = {
  id: string;
  organization_id: string;
  code: string;
  size: LockerSize;
  status: LockerStatus;
  created_at: Date;
  updated_at: Date;
};

export type LockerListFilters = {
  status?: LockerStatus;
  size?: LockerSize;
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
};

export type UpdateLockerBody = {
  code?: string;
  size?: LockerSize;
  status?: LockerStatus;
};

export type LockerParams = {
  id: string;
};

export type OrganizationLockerParams = {
  organizationId: string;
  id: string;
};

const uuidSchema = { type: "string", format: "uuid" };
const timestampSchema = { type: "string", format: "date-time" };

export const lockerSchema = {
  type: "object",
  required: ["id", "organization_id", "code", "size", "status", "created_at", "updated_at"],
  properties: {
    id: uuidSchema,
    organization_id: uuidSchema,
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

// organization_id is optional for public endpoint (used in /use flow without org selection)
export const listPublicLockersSchema = {
  querystring: {
    type: "object",
    required: [],
    properties: {
      organization_id: { type: "string", format: "uuid" },
      status: { type: "string", enum: lockerStatuses },
      size: { type: "string", enum: lockerSizes },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
      offset: { type: "integer", minimum: 0, default: 0 }
    },
    additionalProperties: false
  },
  response: {
    200: listLockersResponseSchema
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
      size: { type: "string", enum: lockerSizes }
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
      status: { type: "string", enum: lockerStatuses }
    },
    additionalProperties: false
  },
  response: {
    200: lockerSchema
  }
} as const;
