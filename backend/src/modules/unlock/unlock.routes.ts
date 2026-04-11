import type { FastifyInstance } from "fastify";
import { unlockController } from "./unlock.controller";
import { unlockSchema, type UnlockBody } from "./unlock.schemas";

export async function unlockRoutes(app: FastifyInstance) {
  app.post<{ Body: UnlockBody }>("/unlock-events", { schema: unlockSchema }, unlockController);
}
