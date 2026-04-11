import { lockerSchema, type Locker } from "../lockers/lockers.schemas";

export const rentalStatuses = ["active", "finished", "cancelled"] as const;
export type RentalStatus = (typeof rentalStatuses)[number];

export type Rental = {
  id: string;
  organization_id: string;
  locker_id: string;
  access_code: string;
  status: RentalStatus;
  started_at: Date;
  finished_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type RentalWithLocker = Rental & {
  locker: Locker;
};

export type CreateRentalBody = {
  locker_id: string;
};

export type RentalParams = {
  id: string;
};

const uuidSchema = { type: "string", format: "uuid" };
const timestampSchema = { type: "string", format: "date-time" };

export const rentalSchema = {
  type: "object",
  required: ["id", "organization_id", "locker_id", "access_code", "status", "started_at", "created_at", "updated_at"],
  properties: {
    id: uuidSchema,
    organization_id: uuidSchema,
    locker_id: uuidSchema,
    access_code: { type: "string" },
    status: { type: "string", enum: rentalStatuses },
    started_at: timestampSchema,
    finished_at: { anyOf: [timestampSchema, { type: "null" }] },
    created_at: timestampSchema,
    updated_at: timestampSchema
  }
} as const;

export const rentalWithLockerSchema = {
  type: "object",
  required: [
    "id",
    "locker_id",
    "access_code",
    "status",
    "started_at",
    "created_at",
    "updated_at",
    "locker"
  ],
  properties: {
    ...rentalSchema.properties,
    locker: lockerSchema
  }
} as const;

export const createRentalSchema = {
  body: {
    type: "object",
    required: ["locker_id"],
    properties: {
      locker_id: uuidSchema
    },
    additionalProperties: false
  },
  response: {
    201: rentalSchema
  }
} as const;

export const getRentalSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: uuidSchema
    },
    additionalProperties: false
  },
  response: {
    200: rentalWithLockerSchema
  }
} as const;
