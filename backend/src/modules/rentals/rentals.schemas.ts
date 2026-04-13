import { lockerSchema, type Locker } from "../lockers/lockers.schemas";

export const rentalStatuses = ["active", "storing", "pending_retrieval_payment", "finished", "cancelled"] as const;
export type RentalStatus = (typeof rentalStatuses)[number];

export type Rental = {
  id: string;
  organization_id: string;
  locker_id: string;
  access_code: string;
  status: RentalStatus;
  // Pricing snapshot
  initial_fee_cents: number;
  hourly_rate_cents: number;
  // Biometric
  biometric_token: string | null;
  // Lifecycle
  started_at: Date;
  unlocked_at: Date | null;
  retrieved_at: Date | null;
  finished_at: Date | null;
  // Financial outcome
  extra_charge_cents: number;
  total_cents: number;
  elapsed_seconds?: number | null;
  created_at: Date;
  updated_at: Date;
};

export type RentalWithLocker = Rental & {
  locker: Locker;
};

export type CreateRentalBody = {
  locker_id: string;
};

export type RegisterBiometricBody = {
  biometric_token: string;
};

export type RetrieveLockerBody = {
  biometric_token: string;
};

export type RetrievalResult = {
  rental_id: string;
  locker_id: string;
  minutes_used: number;
  extra_charge_cents: number;
  total_cents: number;
  payment_required: boolean;
};

export type RentalParams = {
  id: string;
};

export type OrganizationAuditParams = {
  organizationId: string;
};

export type DeleteOrganizationRentalParams = OrganizationAuditParams & {
  id: string;
};

export type BulkDeleteRentalsBody = {
  rental_ids: string[];
};

const uuidSchema = { type: "string", format: "uuid" };
const timestampSchema = { type: "string", format: "date-time" };
const nullableTimestamp = { anyOf: [timestampSchema, { type: "null" }] };

export const rentalSchema = {
  type: "object",
  required: ["id", "organization_id", "locker_id", "access_code", "status", "initial_fee_cents", "hourly_rate_cents", "extra_charge_cents", "total_cents", "started_at", "created_at", "updated_at"],
  properties: {
    id: uuidSchema,
    organization_id: uuidSchema,
    locker_id: uuidSchema,
    access_code: { type: "string" },
    status: { type: "string", enum: rentalStatuses },
    initial_fee_cents: { type: "integer", minimum: 0 },
    hourly_rate_cents: { type: "integer", minimum: 0 },
    biometric_token: { anyOf: [{ type: "string" }, { type: "null" }] },
    started_at: timestampSchema,
    unlocked_at: nullableTimestamp,
    retrieved_at: nullableTimestamp,
    finished_at: nullableTimestamp,
    extra_charge_cents: { type: "integer", minimum: 0 },
    total_cents: { type: "integer", minimum: 0 },
    elapsed_seconds: { anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }] },
    created_at: timestampSchema,
    updated_at: timestampSchema
  }
} as const;

export const rentalWithLockerSchema = {
  type: "object",
  required: [
    "id", "locker_id", "access_code", "status", "initial_fee_cents", "hourly_rate_cents",
    "extra_charge_cents", "total_cents", "started_at", "created_at", "updated_at", "locker"
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
    properties: { id: uuidSchema },
    additionalProperties: false
  },
  response: {
    200: rentalWithLockerSchema
  }
} as const;

export const registerBiometricSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: uuidSchema },
    additionalProperties: false
  },
  body: {
    type: "object",
    required: ["biometric_token"],
    properties: {
      biometric_token: { type: "string", minLength: 4 }
    },
    additionalProperties: false
  },
  response: {
    200: rentalSchema
  }
} as const;

export const retrieveLockerSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: uuidSchema },
    additionalProperties: false
  },
  body: {
    type: "object",
    required: ["biometric_token"],
    properties: {
      biometric_token: { type: "string", minLength: 4 }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "object",
      required: ["rental_id", "locker_id", "minutes_used", "extra_charge_cents", "total_cents", "payment_required"],
      properties: {
        rental_id: uuidSchema,
        locker_id: uuidSchema,
        minutes_used: { type: "integer", minimum: 0 },
        extra_charge_cents: { type: "integer", minimum: 0 },
        total_cents: { type: "integer", minimum: 0 },
        payment_required: { type: "boolean" }
      }
    }
  }
} as const;

export const confirmRetrievalSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: uuidSchema },
    additionalProperties: false
  },
  response: {
    200: rentalSchema
  }
} as const;

const organizationAuditParamsSchema = {
  type: "object",
  required: ["organizationId"],
  properties: {
    organizationId: uuidSchema
  },
  additionalProperties: false
} as const;

export const listOrganizationAuditSchema = {
  params: organizationAuditParamsSchema,
  querystring: {
    type: "object",
    properties: {
      location_id: uuidSchema,
      limit: { type: "string", pattern: "^[0-9]+$" },
      offset: { type: "string", pattern: "^[0-9]+$" }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        required: [
          "id",
          "organization_id",
          "locker_id",
          "locker_code",
          "locker_size",
          "status",
          "initial_fee_cents",
          "hourly_rate_cents",
          "extra_charge_cents",
          "total_cents",
          "started_at",
          "created_at",
          "updated_at"
        ],
        properties: {
          ...rentalSchema.properties,
          locker_code: { type: "string" },
          locker_size: { type: "string", enum: ["P", "M", "G"] },
          location_id: { anyOf: [uuidSchema, { type: "null" }] },
          location_name: { anyOf: [{ type: "string" }, { type: "null" }] }
        }
      }
    }
  }
} as const;

export const deleteOrganizationRentalSchema = {
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
    200: {
      type: "object",
      required: ["deleted_count", "deleted_ids"],
      properties: {
        deleted_count: { type: "integer", minimum: 0 },
        deleted_ids: {
          type: "array",
          items: uuidSchema
        }
      }
    }
  }
} as const;

export const bulkDeleteRentalsSchema = {
  params: organizationAuditParamsSchema,
  body: {
    type: "object",
    required: ["rental_ids"],
    properties: {
      rental_ids: {
        type: "array",
        minItems: 1,
        items: uuidSchema
      }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "object",
      required: ["deleted_count", "deleted_ids"],
      properties: {
        deleted_count: { type: "integer", minimum: 0 },
        deleted_ids: {
          type: "array",
          items: uuidSchema
        }
      }
    }
  }
} as const;
