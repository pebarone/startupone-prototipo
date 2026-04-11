import { paginationSchema, organizationParamsSchema } from "../organizations/organizations.schemas";
import { lockerSizes } from "../lockers/lockers.schemas";

export type LockerLocation = {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: Date;
  updated_at: Date;
};

export type LocationLockerPreview = {
  id: string;
  code: string;
  size: (typeof lockerSizes)[number];
};

export type LocationWithStats = LockerLocation & {
  total_lockers: number;
  free_lockers: number;
};

export type PublicLocationWithStats = LocationWithStats & {
  available_lockers: LocationLockerPreview[];
};

export type ListPublicLocationsQuery = {
  organization_id?: string;
  limit?: number;
  offset?: number;
};

export type ListOrganizationLocationsQuery = {
  limit?: number;
  offset?: number;
};

export type CreateLocationBody = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type UpdateLocationBody = {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type LocationParams = {
  id: string;
};

export type OrganizationLocationParams = {
  organizationId: string;
  id: string;
};

const uuidSchema = { type: "string", format: "uuid" };
const timestampSchema = { type: "string", format: "date-time" };
const coordinateNumberSchema = { type: "number" };

export const lockerLocationSchema = {
  type: "object",
  required: ["id", "organization_id", "name", "address", "latitude", "longitude", "created_at", "updated_at"],
  properties: {
    id: uuidSchema,
    organization_id: uuidSchema,
    name: { type: "string" },
    address: { type: "string" },
    latitude: coordinateNumberSchema,
    longitude: coordinateNumberSchema,
    created_at: timestampSchema,
    updated_at: timestampSchema
  }
} as const;

export const locationLockerPreviewSchema = {
  type: "object",
  required: ["id", "code", "size"],
  properties: {
    id: uuidSchema,
    code: { type: "string" },
    size: { type: "string", enum: lockerSizes }
  }
} as const;

export const locationWithStatsSchema = {
  type: "object",
  required: ["total_lockers", "free_lockers"],
  properties: {
    ...lockerLocationSchema.properties,
    total_lockers: { type: "integer", minimum: 0 },
    free_lockers: { type: "integer", minimum: 0 }
  }
} as const;

export const publicLocationWithStatsSchema = {
  type: "object",
  required: ["available_lockers"],
  properties: {
    ...locationWithStatsSchema.properties,
    available_lockers: {
      type: "array",
      items: locationLockerPreviewSchema
    }
  }
} as const;

const locationCollectionQuerySchema = {
  type: "object",
  properties: {
    limit: { type: "integer", minimum: 1, maximum: 200, default: 100 },
    offset: { type: "integer", minimum: 0, default: 0 }
  },
  additionalProperties: false
} as const;

const paginatedPublicLocationsSchema = {
  type: "object",
  required: ["data", "pagination"],
  properties: {
    data: {
      type: "array",
      items: publicLocationWithStatsSchema
    },
    pagination: paginationSchema
  }
} as const;

const paginatedOrganizationLocationsSchema = {
  type: "object",
  required: ["data", "pagination"],
  properties: {
    data: {
      type: "array",
      items: locationWithStatsSchema
    },
    pagination: paginationSchema
  }
} as const;

export const listPublicLocationsSchema = {
  querystring: {
    type: "object",
    properties: {
      organization_id: { type: "string", format: "uuid" },
      limit: { type: "integer", minimum: 1, maximum: 200, default: 100 },
      offset: { type: "integer", minimum: 0, default: 0 }
    },
    additionalProperties: false
  },
  response: {
    200: paginatedPublicLocationsSchema
  }
} as const;

export const listOrganizationLocationsSchema = {
  params: organizationParamsSchema,
  querystring: locationCollectionQuerySchema,
  response: {
    200: paginatedOrganizationLocationsSchema
  }
} as const;

export const createLocationSchema = {
  params: organizationParamsSchema,
  body: {
    type: "object",
    required: ["name", "address", "latitude", "longitude"],
    properties: {
      name: { type: "string", minLength: 2, maxLength: 120 },
      address: { type: "string", minLength: 5, maxLength: 255 },
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 }
    },
    additionalProperties: false
  },
  response: {
    201: locationWithStatsSchema
  }
} as const;

export const updateLocationSchema = {
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
      name: { type: "string", minLength: 2, maxLength: 120 },
      address: { type: "string", minLength: 5, maxLength: 255 },
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 }
    },
    additionalProperties: false
  },
  response: {
    200: locationWithStatsSchema
  }
} as const;

export const deleteLocationSchema = {
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
