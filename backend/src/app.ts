import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { fileURLToPath } from "node:url";
import { env, parseCorsOrigin } from "./config/env";
import { handleFastifyError } from "./errors";
import { registerFrontend } from "./http/register-frontend";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { lockersRoutes } from "./modules/lockers/lockers.routes";
import { locationsRoutes } from "./modules/locations/locations.routes";
import { organizationsRoutes } from "./modules/organizations/organizations.routes";
import { rentalsRoutes } from "./modules/rentals/rentals.routes";
import { unlockRoutes } from "./modules/unlock/unlock.routes";

export async function buildApp() {
  const openApiBaseDir = fileURLToPath(new URL("..", import.meta.url));

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL
    }
  });

  app.setErrorHandler(handleFastifyError);

  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Request-ID", request.id);
  });

  app.register(helmet);

  app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW
  });

  app.register(cors, {
    origin: parseCorsOrigin()
  });

  app.register(swagger, {
    mode: "static",
    specification: {
      path: "openapi.yaml",
      baseDir: openApiBaseDir
    }
  });

  app.register(swaggerUi, {
    routePrefix: "/api-docs"
  });

  app.get(
    "/api/health",
    {
      schema: {
        response: {
          200: {
            type: "object",
            required: ["status"],
            properties: {
              status: { type: "string", const: "ok" }
            }
          }
        }
      }
    },
    async () => ({ status: "ok" })
  );

  app.register(lockersRoutes, { prefix: "/api" });
  app.register(locationsRoutes, { prefix: "/api" });
  app.register(rentalsRoutes, { prefix: "/api" });
  app.register(unlockRoutes, { prefix: "/api" });
  app.register(dashboardRoutes, { prefix: "/api" });
  app.register(organizationsRoutes, { prefix: "/api" });
  await registerFrontend(app);

  return app;
}
