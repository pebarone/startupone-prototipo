import type { FastifyInstance } from "fastify";
import { createRentalController, getRentalController } from "./rentals.controller";
import {
  createRentalSchema,
  getRentalSchema,
  type CreateRentalBody,
  type RentalParams
} from "./rentals.schemas";

export async function rentalsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateRentalBody }>("/rentals", { schema: createRentalSchema }, createRentalController);

  app.get<{ Params: RentalParams }>("/rentals/:id", { schema: getRentalSchema }, getRentalController);
}
