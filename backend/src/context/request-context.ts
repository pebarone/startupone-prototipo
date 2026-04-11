import type { FastifyRequest } from "fastify";

export type ActorType = "anonymous" | "authenticated" | "partner" | "admin" | "system";

export type RequestContext = {
  actor_type: ActorType;
  actor_id?: string;
  organization_id?: string;
  request_id: string;
  ip_address?: string;
  user_agent?: string;
};

export function getRequestContext(request: FastifyRequest, actorType: ActorType): RequestContext {
  const userAgent = request.headers["user-agent"];

  return {
    actor_type: request.auth?.actor_type ?? actorType,
    actor_id: request.auth?.actor_id,
    organization_id: request.auth?.organization_id,
    request_id: request.id,
    ip_address: request.ip,
    user_agent: Array.isArray(userAgent) ? userAgent[0] : userAgent
  };
}
