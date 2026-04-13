import { timingSafeEqual } from "node:crypto";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getSupabaseAuthClient } from "../auth/supabase";
import { env } from "../config/env";
import { forbiddenError, internalError, unauthorizedError, validationError } from "../errors";
import { findOrganizationMembershipForUser } from "../modules/organizations/organizations.repository";
import type { OrganizationMembershipRole } from "../modules/organizations/organizations.schemas";
import { upsertAppUser } from "../modules/users/users.repository";

const ADMIN_API_KEY_HEADER = "x-admin-api-key";

export async function requireAdminApiKey(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  ensureAdminApiKey(request);
  request.auth = {
    actor_type: "admin"
  };
}

export async function requireAuthenticatedUser(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (request.auth?.actor_type === "authenticated" || request.auth?.actor_type === "admin") {
    return;
  }

  const token = readBearerToken(request);

  if (!token) {
    throw unauthorizedError("Missing Supabase access token.");
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw unauthorizedError("Invalid or expired Supabase access token.");
  }

  const appUser = await upsertAppUser({
    id: data.user.id,
    email: data.user.email,
    full_name: readProfileString(data.user, "full_name") ?? readProfileString(data.user, "name"),
    avatar_url: readProfileString(data.user, "avatar_url"),
    last_sign_in_at: data.user.last_sign_in_at ?? null
  });

  request.auth = {
    actor_type: "authenticated",
    actor_id: appUser.id,
    user_email: appUser.email ?? undefined,
    app_role: readAppRole(data.user.app_metadata),
    user: appUser
  };
}

export async function requireAuthenticatedUserOrAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (trySetAdminAuth(request)) {
    return;
  }

  await requireAuthenticatedUser(request, reply);
}

export async function requireOrganizationMemberOrAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await requireOrganizationRole(request, reply, "viewer");
}

export async function requireOrganizationAdminOrAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await requireOrganizationRole(request, reply, "admin");
}

function readHeader(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function readBearerToken(request: FastifyRequest): string | undefined {
  const authorization = readHeader(request, "authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorization.slice("Bearer ".length).trim();
}

function readAppRole(appMetadata: Record<string, unknown>): string | undefined {
  const role = appMetadata.role;

  if (typeof role === "string") {
    return role;
  }

  return undefined;
}

function readProfileString(user: SupabaseUser, key: string): string | undefined {
  const value = user.user_metadata[key];

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return undefined;
}

async function requireOrganizationRole(
  request: FastifyRequest,
  reply: FastifyReply,
  minimumRole: OrganizationMembershipRole
): Promise<void> {
  const organizationId = readOrganizationIdParam(request);

  if (!organizationId) {
    throw validationError("organizationId route parameter is required.");
  }

  if (trySetAdminAuth(request, organizationId)) {
    return;
  }

  await requireAuthenticatedUser(request, reply);

  if (!request.auth?.actor_id) {
    throw unauthorizedError("Missing authenticated user context.");
  }

  const membership = await findOrganizationMembershipForUser(organizationId, request.auth.actor_id);

  if (!membership) {
    throw forbiddenError("You do not belong to this organization.");
  }

  if (!hasRequiredRole(membership.role, minimumRole)) {
    throw forbiddenError("You do not have the required organization role.");
  }

  request.auth = {
    ...request.auth,
    organization_id: organizationId,
    organization_role: membership.role
  };
}

function readOrganizationIdParam(request: FastifyRequest): string | undefined {
  if (!request.params || typeof request.params !== "object") {
    return undefined;
  }

  const params = request.params as Record<string, unknown>;
  const value = params.organizationId ?? params.orgId;
  return typeof value === "string" ? value : undefined;
}

function hasRequiredRole(actualRole: OrganizationMembershipRole, minimumRole: OrganizationMembershipRole): boolean {
  return roleRank(actualRole) >= roleRank(minimumRole);
}

function roleRank(role: OrganizationMembershipRole): number {
  switch (role) {
    case "owner":
      return 3;
    case "admin":
      return 2;
    case "viewer":
      return 1;
  }
}

function ensureAdminApiKey(request: FastifyRequest): void {
  if (!env.ADMIN_API_KEY) {
    request.log.error("ADMIN_API_KEY is not configured");
    throw internalError("Administrative authentication is not configured.");
  }

  const providedKey = readHeader(request, ADMIN_API_KEY_HEADER);

  if (!providedKey || !secureEquals(providedKey, env.ADMIN_API_KEY)) {
    throw unauthorizedError("Missing or invalid admin API key.");
  }
}

function trySetAdminAuth(request: FastifyRequest, organizationId?: string): boolean {
  const providedKey = readHeader(request, ADMIN_API_KEY_HEADER);

  if (!env.ADMIN_API_KEY || !providedKey || !secureEquals(providedKey, env.ADMIN_API_KEY)) {
    return false;
  }

  request.auth = {
    actor_type: "admin",
    organization_id: organizationId
  };

  return true;
}

function secureEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
