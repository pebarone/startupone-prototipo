import type { ActorType } from "../context/request-context";
import type { AppUser, OrganizationMembershipRole } from "../modules/organizations/organizations.schemas";

declare module "fastify" {
  interface FastifyRequest {
    auth?: {
      actor_type: ActorType;
      actor_id?: string;
      user_email?: string;
      app_role?: string;
      organization_id?: string;
      organization_role?: OrganizationMembershipRole;
      user?: AppUser;
    };
  }
}
