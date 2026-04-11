import { pool, type Queryable } from "../../db/pool";
import type {
  AppUser,
  CreateOrganizationBody,
  CurrentOrganizationMembership,
  ListOrganizationMembershipsQuery,
  ListOrganizationsQuery,
  Organization,
  OrganizationMembership,
  OrganizationMembershipRole,
  OrganizationMembershipStatus,
  PaginatedResponse
} from "./organizations.schemas";

type OrganizationRow = Omit<Organization, "current_membership"> & {
  current_membership: CurrentOrganizationMembership | null;
};

type CountRow = {
  total: number;
};

type OrganizationMembershipRow = Omit<OrganizationMembership, "organization" | "user"> & {
  organization: Organization | null;
  user: AppUser | null;
};

export type InsertOrganizationInput = Pick<CreateOrganizationBody, "name"> & {
  slug: string;
  created_by_user_id?: string;
};

export type InsertOrganizationMembershipInput = {
  organization_id: string;
  user_id?: string;
  invite_email?: string;
  role: OrganizationMembershipRole;
  status: OrganizationMembershipStatus;
  created_by_user_id?: string;
};

export type UpdateOrganizationMembershipRecordInput = {
  user_id?: string;
  invite_email?: string;
  role?: OrganizationMembershipRole;
  status?: OrganizationMembershipStatus;
};

export async function listOrganizations(
  query: ListOrganizationsQuery,
  userId?: string,
  db: Queryable = pool
): Promise<PaginatedResponse<Organization>> {
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (userId) {
    values.push(userId);
    conditions.push(`EXISTS (
      SELECT 1
      FROM organization_memberships memberships
      WHERE memberships.organization_id = organizations.id
        AND memberships.user_id = $${values.length}
        AND memberships.status = 'active'
    )`);
  }

  if (query.status) {
    values.push(query.status);
    conditions.push(`organizations.status = $${values.length}`);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await db.query<CountRow>(
    `
    SELECT count(*)::int AS total
    FROM organizations
    ${whereSql}
    `,
    values
  );

  const dataValues = [...values, limit, offset];
  const organizationsResult = await db.query<OrganizationRow>(
    `
    SELECT
      organizations.id,
      organizations.name,
      organizations.slug,
      organizations.status,
      organizations.created_by_user_id,
      organizations.created_at,
      organizations.updated_at,
      ${
        userId
          ? `(
              SELECT json_build_object(
                'id', memberships.id,
                'role', memberships.role,
                'status', memberships.status
              )
              FROM organization_memberships memberships
              WHERE memberships.organization_id = organizations.id
                AND memberships.user_id = $1
                AND memberships.status = 'active'
              LIMIT 1
            )`
          : "NULL::json"
      } AS current_membership
    FROM organizations
    ${whereSql}
    ORDER BY organizations.created_at DESC, organizations.name ASC
    LIMIT $${dataValues.length - 1}
    OFFSET $${dataValues.length}
    `,
    dataValues
  );

  const total = countResult.rows[0]?.total ?? 0;

  return {
    data: organizationsResult.rows.map(mapOrganizationRow),
    pagination: {
      limit,
      offset,
      total,
      has_more: offset + organizationsResult.rows.length < total
    }
  };
}

export async function findOrganizationById(
  organizationId: string,
  userId?: string,
  db: Queryable = pool
): Promise<Organization | null> {
  const values: unknown[] = [organizationId];
  let membershipSelect = "NULL::json";
  let accessCondition = "";

  if (userId) {
    values.push(userId);
    membershipSelect = `(
      SELECT json_build_object(
        'id', memberships.id,
        'role', memberships.role,
        'status', memberships.status
      )
      FROM organization_memberships memberships
      WHERE memberships.organization_id = organizations.id
        AND memberships.user_id = $2
        AND memberships.status = 'active'
      LIMIT 1
    )`;
    accessCondition = `
      AND EXISTS (
        SELECT 1
        FROM organization_memberships memberships
        WHERE memberships.organization_id = organizations.id
          AND memberships.user_id = $2
          AND memberships.status = 'active'
      )
    `;
  }

  const result = await db.query<OrganizationRow>(
    `
    SELECT
      organizations.id,
      organizations.name,
      organizations.slug,
      organizations.status,
      organizations.created_by_user_id,
      organizations.created_at,
      organizations.updated_at,
      ${membershipSelect} AS current_membership
    FROM organizations
    WHERE organizations.id = $1
    ${accessCondition}
    `,
    values
  );

  return result.rows[0] ? mapOrganizationRow(result.rows[0]) : null;
}

export async function insertOrganization(input: InsertOrganizationInput, db: Queryable = pool): Promise<Organization> {
  const result = await db.query<OrganizationRow>(
    `
    INSERT INTO organizations (name, slug, status, created_by_user_id)
    VALUES ($1, $2, 'active', $3)
    RETURNING id, name, slug, status, created_by_user_id, created_at, updated_at, NULL::json AS current_membership
    `,
    [input.name, input.slug, input.created_by_user_id ?? null]
  );

  return mapOrganizationRow(result.rows[0]);
}

export async function findOrganizationMembershipForUser(
  organizationId: string,
  userId: string,
  db: Queryable = pool
): Promise<OrganizationMembership | null> {
  const result = await db.query<OrganizationMembershipRow>(
    `
    SELECT
      memberships.id,
      memberships.organization_id,
      memberships.user_id,
      memberships.invite_email,
      memberships.role,
      memberships.status,
      memberships.created_by_user_id,
      memberships.created_at,
      memberships.updated_at,
      NULL::json AS organization,
      NULL::json AS user
    FROM organization_memberships memberships
    WHERE memberships.organization_id = $1
      AND memberships.user_id = $2
      AND memberships.status = 'active'
    LIMIT 1
    `,
    [organizationId, userId]
  );

  return result.rows[0] ? mapOrganizationMembershipRow(result.rows[0]) : null;
}

export async function listOrganizationMemberships(
  organizationId: string,
  query: ListOrganizationMembershipsQuery,
  db: Queryable = pool
): Promise<PaginatedResponse<OrganizationMembership>> {
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  const values: unknown[] = [organizationId];
  const conditions: string[] = ["memberships.organization_id = $1"];

  if (query.role) {
    values.push(query.role);
    conditions.push(`memberships.role = $${values.length}`);
  }

  if (query.status) {
    values.push(query.status);
    conditions.push(`memberships.status = $${values.length}`);
  }

  const whereSql = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await db.query<CountRow>(
    `
    SELECT count(*)::int AS total
    FROM organization_memberships memberships
    ${whereSql}
    `,
    values
  );

  const dataValues = [...values, limit, offset];
  const result = await db.query<OrganizationMembershipRow>(
    `
    SELECT
      memberships.id,
      memberships.organization_id,
      memberships.user_id,
      memberships.invite_email,
      memberships.role,
      memberships.status,
      memberships.created_by_user_id,
      memberships.created_at,
      memberships.updated_at,
      json_build_object(
        'id', organizations.id,
        'name', organizations.name,
        'slug', organizations.slug,
        'status', organizations.status,
        'created_by_user_id', organizations.created_by_user_id,
        'created_at', organizations.created_at,
        'updated_at', organizations.updated_at
      ) AS organization,
      CASE
        WHEN users.id IS NULL THEN NULL
        ELSE json_build_object(
          'id', users.id,
          'email', users.email,
          'full_name', users.full_name,
          'avatar_url', users.avatar_url,
          'last_sign_in_at', users.last_sign_in_at,
          'created_at', users.created_at,
          'updated_at', users.updated_at
        )
      END AS user
    FROM organization_memberships memberships
    INNER JOIN organizations ON organizations.id = memberships.organization_id
    LEFT JOIN app_users users ON users.id = memberships.user_id
    ${whereSql}
    ORDER BY memberships.created_at DESC
    LIMIT $${dataValues.length - 1}
    OFFSET $${dataValues.length}
    `,
    dataValues
  );

  const total = countResult.rows[0]?.total ?? 0;

  return {
    data: result.rows.map(mapOrganizationMembershipRow),
    pagination: {
      limit,
      offset,
      total,
      has_more: offset + result.rows.length < total
    }
  };
}

export async function listMembershipsForUser(userId: string, db: Queryable = pool): Promise<OrganizationMembership[]> {
  const result = await db.query<OrganizationMembershipRow>(
    `
    SELECT
      memberships.id,
      memberships.organization_id,
      memberships.user_id,
      memberships.invite_email,
      memberships.role,
      memberships.status,
      memberships.created_by_user_id,
      memberships.created_at,
      memberships.updated_at,
      json_build_object(
        'id', organizations.id,
        'name', organizations.name,
        'slug', organizations.slug,
        'status', organizations.status,
        'created_by_user_id', organizations.created_by_user_id,
        'created_at', organizations.created_at,
        'updated_at', organizations.updated_at
      ) AS organization,
      json_build_object(
        'id', users.id,
        'email', users.email,
        'full_name', users.full_name,
        'avatar_url', users.avatar_url,
        'last_sign_in_at', users.last_sign_in_at,
        'created_at', users.created_at,
        'updated_at', users.updated_at
      ) AS user
    FROM organization_memberships memberships
    INNER JOIN organizations ON organizations.id = memberships.organization_id
    INNER JOIN app_users users ON users.id = memberships.user_id
    WHERE memberships.user_id = $1
    ORDER BY memberships.created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapOrganizationMembershipRow);
}

export async function findOrganizationMembershipById(
  organizationId: string,
  membershipId: string,
  db: Queryable = pool
): Promise<OrganizationMembership | null> {
  const result = await db.query<OrganizationMembershipRow>(
    `
    SELECT
      memberships.id,
      memberships.organization_id,
      memberships.user_id,
      memberships.invite_email,
      memberships.role,
      memberships.status,
      memberships.created_by_user_id,
      memberships.created_at,
      memberships.updated_at,
      json_build_object(
        'id', organizations.id,
        'name', organizations.name,
        'slug', organizations.slug,
        'status', organizations.status,
        'created_by_user_id', organizations.created_by_user_id,
        'created_at', organizations.created_at,
        'updated_at', organizations.updated_at
      ) AS organization,
      CASE
        WHEN users.id IS NULL THEN NULL
        ELSE json_build_object(
          'id', users.id,
          'email', users.email,
          'full_name', users.full_name,
          'avatar_url', users.avatar_url,
          'last_sign_in_at', users.last_sign_in_at,
          'created_at', users.created_at,
          'updated_at', users.updated_at
        )
      END AS user
    FROM organization_memberships memberships
    INNER JOIN organizations ON organizations.id = memberships.organization_id
    LEFT JOIN app_users users ON users.id = memberships.user_id
    WHERE memberships.organization_id = $1
      AND memberships.id = $2
    LIMIT 1
    `,
    [organizationId, membershipId]
  );

  return result.rows[0] ? mapOrganizationMembershipRow(result.rows[0]) : null;
}

export async function findOrganizationMembershipByUserId(
  organizationId: string,
  userId: string,
  db: Queryable = pool
): Promise<OrganizationMembership | null> {
  const result = await db.query<OrganizationMembershipRow>(
    `
    SELECT
      memberships.id,
      memberships.organization_id,
      memberships.user_id,
      memberships.invite_email,
      memberships.role,
      memberships.status,
      memberships.created_by_user_id,
      memberships.created_at,
      memberships.updated_at,
      NULL::json AS organization,
      NULL::json AS user
    FROM organization_memberships memberships
    WHERE memberships.organization_id = $1
      AND memberships.user_id = $2
    LIMIT 1
    `,
    [organizationId, userId]
  );

  return result.rows[0] ? mapOrganizationMembershipRow(result.rows[0]) : null;
}

export async function findPendingOrganizationMembershipByEmail(
  organizationId: string,
  email: string,
  db: Queryable = pool
): Promise<OrganizationMembership | null> {
  const result = await db.query<OrganizationMembershipRow>(
    `
    SELECT
      memberships.id,
      memberships.organization_id,
      memberships.user_id,
      memberships.invite_email,
      memberships.role,
      memberships.status,
      memberships.created_by_user_id,
      memberships.created_at,
      memberships.updated_at,
      NULL::json AS organization,
      NULL::json AS user
    FROM organization_memberships memberships
    WHERE memberships.organization_id = $1
      AND memberships.invite_email = $2
      AND memberships.user_id IS NULL
      AND memberships.status = 'invited'
    LIMIT 1
    `,
    [organizationId, email.trim().toLowerCase()]
  );

  return result.rows[0] ? mapOrganizationMembershipRow(result.rows[0]) : null;
}

export async function insertOrganizationMembership(
  input: InsertOrganizationMembershipInput,
  db: Queryable = pool
): Promise<OrganizationMembership> {
  const result = await db.query<OrganizationMembershipRow>(
    `
    INSERT INTO organization_memberships (
      organization_id,
      user_id,
      invite_email,
      role,
      status,
      created_by_user_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      organization_id,
      user_id,
      invite_email,
      role,
      status,
      created_by_user_id,
      created_at,
      updated_at,
      NULL::json AS organization,
      NULL::json AS user
    `,
    [
      input.organization_id,
      input.user_id ?? null,
      input.invite_email ?? null,
      input.role,
      input.status,
      input.created_by_user_id ?? null
    ]
  );

  return mapOrganizationMembershipRow(result.rows[0]);
}

export async function updateOrganizationMembershipById(
  organizationId: string,
  membershipId: string,
  input: UpdateOrganizationMembershipRecordInput,
  db: Queryable = pool
): Promise<OrganizationMembership | null> {
  const values: unknown[] = [];
  const assignments: string[] = [];

  if (input.user_id !== undefined) {
    values.push(input.user_id);
    assignments.push(`user_id = $${values.length}`);
  }

  if (input.invite_email !== undefined) {
    values.push(input.invite_email);
    assignments.push(`invite_email = $${values.length}`);
  }

  if (input.role !== undefined) {
    values.push(input.role);
    assignments.push(`role = $${values.length}`);
  }

  if (input.status !== undefined) {
    values.push(input.status);
    assignments.push(`status = $${values.length}`);
  }

  if (assignments.length === 0) {
    return findOrganizationMembershipById(organizationId, membershipId, db);
  }

  values.push(organizationId, membershipId);

  const result = await db.query<OrganizationMembershipRow>(
    `
    UPDATE organization_memberships
    SET ${assignments.join(", ")}, updated_at = now()
    WHERE organization_id = $${values.length - 1}
      AND id = $${values.length}
    RETURNING
      id,
      organization_id,
      user_id,
      invite_email,
      role,
      status,
      created_by_user_id,
      created_at,
      updated_at,
      NULL::json AS organization,
      NULL::json AS user
    `,
    values
  );

  return result.rows[0] ? mapOrganizationMembershipRow(result.rows[0]) : null;
}

function mapOrganizationRow(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    created_by_user_id: row.created_by_user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    current_membership: row.current_membership
  };
}

function mapOrganizationMembershipRow(row: OrganizationMembershipRow): OrganizationMembership {
  return {
    id: row.id,
    organization_id: row.organization_id,
    user_id: row.user_id,
    invite_email: row.invite_email,
    role: row.role,
    status: row.status,
    created_by_user_id: row.created_by_user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    organization: row.organization,
    user: row.user
  };
}
