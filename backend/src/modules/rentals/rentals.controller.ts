import type { FastifyReply, FastifyRequest } from "fastify";
import { getRequestContext } from "../../context/request-context";
import { createRentalService, getRentalByIdService } from "./rentals.service";
import type { CreateRentalBody, RentalParams } from "./rentals.schemas";

export async function createRentalController(
  request: FastifyRequest<{ Body: CreateRentalBody }>,
  reply: FastifyReply
) {
  const rental = await createRentalService(request.body.locker_id, getRequestContext(request, "anonymous"));
  return reply.code(201).send(rental);
}

export async function getRentalController(request: FastifyRequest<{ Params: RentalParams }>) {
  return getRentalByIdService(request.params.id);
}
