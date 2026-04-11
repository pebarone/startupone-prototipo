import { buildApp } from "./app";
import { env } from "./config/env";
import { pool } from "./db/pool";

let appPromise: ReturnType<typeof buildApp> | null = null;

async function start() {
  appPromise = buildApp();
  const app = await appPromise;

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error(error);
    await pool.end();
    process.exit(1);
  }
}

const shutdown = async (signal: string) => {
  if (!appPromise) {
    await pool.end();
    return;
  }

  const app = await appPromise;

  app.log.info({ signal }, "Shutting down API");
  await app.close();
  await pool.end();
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start();
