export const organizationStatuses = ["active", "inactive"] as const;
export const organizationMembershipRoles = ["owner", "admin", "viewer"] as const;
export const organizationMembershipStatuses = ["invited", "active", "disabled"] as const;

export type OrganizationStatus = (typeof organizationStatuses)[number];
export type OrganizationMembershipRole = (typeof organizationMembershipRoles)[number];
export type OrganizationMembershipStatus = (typeof organizationMembershipStatuses)[number];

export type AppUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_sign_in_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CurrentOrganizationMembership = {
  id: string;
  role: OrganizationMembershipRole;
  status: OrganizationMembershipStatus;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  created_by_user_id: string | null;
  created_at: Date;
  updated_at: Date;
  current_membership?: CurrentOrganizationMembership | null;
};

export type OrganizationMembership = {
  id: string;
  organization_id: string;
  user_id: string | null;
  invite_email: string | null;
  role: OrganizationMembershipRole;
  status: OrganizationMembershipStatus;
  created_by_user_id: string | null;
  created_at: Date;
  updated_at: Date;
  organization?: Organization | null;
  user?: AppUser | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
};

export type ListOrganizationsQuery = {
  status?: OrganizationStatus;
  limit?: number;
  offset?: number;
};

export type CreateOrganizationBody = {
  name: string;
  slug?: string;
  owner_user_id?: string;
  owner_email?: string;
};

export type OrganizationParams = {
  organizationId: string;
};

export type ListOrganizationMembershipsQuery = {
  role?: OrganizationMembershipRole;
  status?: OrganizationMembershipStatus;
  limit?: number;
  offset?: number;
};

export type CreateOrganizationMembershipBody = {
  user_id?: string;
  email?: string;
  role: OrganizationMembershipRole;
};

export type MembershipParams = {
  organizationId: string;
  membershipId: string;
};

export type UpdateOrganizationMembershipBody = {
  role?: OrganizationMembershipRole;
  status?: Extract<OrganizationMembershipStatus, "active" | "disabled">;
};

const uuidSchema = { type: "string", format: "uuid" };
const timestampSchema = { type: "string", format: "date-time" };
const nullableStringSchema = { anyOf: [{ type: "string" }, { type: "null" }] };

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

export const appUserSchema = {
  type: "object",
  required: ["id", "email", "full_name", "avatar_url", "last_sign_in_at", "created_at", "updated_at"],
  properties: {
    id: uuidSchema,
    email: nullableStringSchema,
    full_name: nullableStringSchema,
    avatar_url: nullableStringSchema,
    last_sign_in_at: { anyOf: [timestampSchema, { type: "null" }] },
    created_at: timestampSchema,
    updated_at: timestampSchema
  }
} as const;

export const currentOrganizationMembershipSchema = {
  type: "object",
  required: ["id", "role", "status"],
  properties: {
    id: uuidSchema,
    role: { type: "string", enum: organizationMembershipRoles },
    status: { type: "string", enum: organizationMembershipStatuses }
  }
} as const;

export const organizationSchema = {
  type: "object",
  required: ["id", "name", "slug", "status", "created_by_user_id", "created_at", "updated_at"],
  properties: {
    id: uuidSchema,
    name: { type: "string" },
    slug: { type: "string" },
    status: { type: "string", enum: organizationStatuses },
    created_by_user_id: { anyOf: [uuidSchema, { type: "null" }] },
    created_at: timestampSchema,
    updated_at: timestampSchema,
    current_membership: { anyOf: [currentOrganizationMembershipSchema, { type: "null" }] }
  }
} as const;

export const organizationMembershipSchema = {
  type: "object",
  required: [
    "id",
    "organization_id",
    "user_id",
    "invite_email",
    "role",
    "status",
    "created_by_user_id",
    "created_at",
    "updated_at"
  ],
  properties: {
    id: uuidSchema,
    organization_id: uuidSchema,
    user_id: { anyOf: [uuidSchema, { type: "null" }] },
    invite_email: nullableStringSchema,
    role: { type: "string", enum: organizationMembershipRoles },
    status: { type: "string", enum: organizationMembershipStatuses },
    created_by_user_id: { anyOf: [uuidSchema, { type: "null" }] },
    created_at: timestampSchema,
    updated_at: timestampSchema,
    organization: { anyOf: [organizationSchema, { type: "null" }] },
    user: { anyOf: [appUserSchema, { type: "null" }] }
  }
} as const;

export const organizationParamsSchema = {
  type: "object",
  required: ["organizationId"],
  properties: {
    organizationId: uuidSchema
  },
  additionalProperties: false
} as const;

export const membershipParamsSchema = {
  type: "object",
  required: ["organizationId", "membershipId"],
  properties: {
    organizationId: uuidSchema,
    membershipId: uuidSchema
  },
  additionalProperties: false
} as const;

export const listOrganizationsSchema = {
  querystring: {
    type: "object",
    properties: {
      status: { type: "string", enum: organizationStatuses },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
      offset: { type: "integer", minimum: 0, default: 0 }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "object",
      required: ["data", "pagination"],
      properties: {
        data: {
          type: "array",
          items: organizationSchema
        },
        pagination: paginationSchema
      }
    }
  }
} as const;

export const createOrganizationSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 2, maxLength: 120 },
      slug: { type: "string", minLength: 2, maxLength: 120, pattern: "^[a-z0-9-]+$" },
      owner_user_id: uuidSchema,
      owner_email: { type: "string", format: "email", maxLength: 255 }
    },
    additionalProperties: false
  },
  response: {
    201: organizationSchema
  }
} as const;

export const getOrganizationSchema = {
  params: organizationParamsSchema,
  response: {
    200: organizationSchema
  }
} as const;

export const listOrganizationMembershipsSchema = {
  params: organizationParamsSchema,
  querystring: {
    type: "object",
    properties: {
      role: { type: "string", enum: organizationMembershipRoles },
      status: { type: "string", enum: organizationMembershipStatuses },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
      offset: { type: "integer", minimum: 0, default: 0 }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "object",
      required: ["data", "pagination"],
      properties: {
        data: {
          type: "array",
          items: organizationMembershipSchema
        },
        pagination: paginationSchema
      }
    }
  }
} as const;

export const createOrganizationMembershipSchema = {
  params: organizationParamsSchema,
  body: {
    type: "object",
    required: ["role"],
    properties: {
      user_id: uuidSchema,
      email: { type: "string", format: "email", maxLength: 255 },
      role: { type: "string", enum: organizationMembershipRoles }
    },
    additionalProperties: false,
    oneOf: [{ required: ["user_id"] }, { required: ["email"] }]
  },
  response: {
    201: organizationMembershipSchema
  }
} as const;

export const updateOrganizationMembershipSchema = {
  params: membershipParamsSchema,
  body: {
    type: "object",
    minProperties: 1,
    properties: {
      role: { type: "string", enum: organizationMembershipRoles },
      status: { type: "string", enum: ["active", "disabled"] }
    },
    additionalProperties: false
  },
  response: {
    200: organizationMembershipSchema
  }
} as const;
