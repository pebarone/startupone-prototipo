import type { FastifyRequest } from "fastify";
import { getRequestContext } from "../../context/request-context";
import { unlockWithAccessCodeService } from "./unlock.service";
import type { UnlockBody } from "./unlock.schemas";

export async function unlockController(request: FastifyRequest<{ Body: UnlockBody }>) {
  const result = await unlockWithAccessCodeService(request.body.access_code, getRequestContext(request, "anonymous"));

  return {
    message: "Locker aberto",
    rental_id: result.rental_id,
    locker_id: result.locker_id
  };
}
