import type { FastifyReply, FastifyRequest } from "fastify";
import { getRequestContext } from "../../context/request-context";
import {
  createOrganizationMembershipService,
  createOrganizationService,
  getOrganizationService,
  listMyMembershipsService,
  listOrganizationMembershipsService,
  listOrganizationsService,
  updateOrganizationMembershipService
} from "./organizations.service";
import type {
  CreateOrganizationBody,
  CreateOrganizationMembershipBody,
  ListOrganizationMembershipsQuery,
  ListOrganizationsQuery,
  MembershipParams,
  OrganizationParams,
  UpdateOrganizationMembershipBody
} from "./organizations.schemas";

export async function listOrganizationsController(request: FastifyRequest<{ Querystring: ListOrganizationsQuery }>) {
  return listOrganizationsService(request.query, getRequestContext(request, "authenticated"));
}

export async function createOrganizationController(
  request: FastifyRequest<{ Body: CreateOrganizationBody }>,
  reply: FastifyReply
) {
  const organization = await createOrganizationService(request.body, getRequestContext(request, "authenticated"));
  return reply.code(201).send(organization);
}

export async function getOrganizationController(request: FastifyRequest<{ Params: OrganizationParams }>) {
  return getOrganizationService(request.params.organizationId, getRequestContext(request, "authenticated"));
}

export async function listOrganizationMembershipsController(
  request: FastifyRequest<{ Params: OrganizationParams; Querystring: ListOrganizationMembershipsQuery }>
) {
  return listOrganizationMembershipsService(request.params.organizationId, request.query);
}

export async function createOrganizationMembershipController(
  request: FastifyRequest<{ Params: OrganizationParams; Body: CreateOrganizationMembershipBody }>,
  reply: FastifyReply
) {
  const membership = await createOrganizationMembershipService(
    request.params.organizationId,
    request.body,
    getRequestContext(request, "authenticated")
  );

  return reply.code(201).send(membership);
}

export async function updateOrganizationMembershipController(
  request: FastifyRequest<{ Params: MembershipParams; Body: UpdateOrganizationMembershipBody }>
) {
  return updateOrganizationMembershipService(
    request.params.organizationId,
    request.params.membershipId,
    request.body,
    getRequestContext(request, "authenticated")
  );
}

export async function getMeController(request: FastifyRequest) {
  const context = getRequestContext(request, "authenticated");

  if (!context.actor_id) {
    return {
      user: null,
      memberships: []
    };
  }

  const memberships = await listMyMembershipsService(context.actor_id);

  return {
    user: request.auth?.user ?? null,
    memberships
  };
}
