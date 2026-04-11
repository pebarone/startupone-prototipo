import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoots = [
  fileURLToPath(new URL("../../public", import.meta.url)),
  fileURLToPath(new URL("../../../frontend/dist", import.meta.url))
];

function shouldServeSpa(pathname: string): boolean {
  if (!pathname || pathname === "/") {
    return true;
  }

  return !pathname.startsWith("/api") &&
    !pathname.startsWith("/api-docs") &&
    !pathname.startsWith("/assets/") &&
    !path.extname(pathname);
}

export async function registerFrontend(app: FastifyInstance) {
  let frontendDistRoot: string | null = null;

  for (const candidateRoot of frontendRoots) {
    const candidateIndexPath = path.join(candidateRoot, "index.html");
    const candidateAssetsRoot = path.join(candidateRoot, "assets");

    try {
      await Promise.all([access(candidateIndexPath), access(candidateAssetsRoot)]);
      frontendDistRoot = candidateRoot;
      break;
    } catch {
      continue;
    }
  }

  if (!frontendDistRoot) {
    app.log.info({ frontendRoots }, "Frontend bundle not found; skipping static hosting");
    return;
  }

  const assetsRoot = path.join(frontendDistRoot, "assets");
  const indexPath = path.join(frontendDistRoot, "index.html");
  const indexHtml = await readFile(indexPath, "utf8");

  await app.register(fastifyStatic, {
    root: assetsRoot,
    prefix: "/assets/",
    decorateReply: false,
    cacheControl: true,
    immutable: true,
    maxAge: "30d"
  });

  app.get("/", async (_request, reply) => {
    reply.header("Cache-Control", "no-cache");
    return reply.type("text/html; charset=utf-8").send(indexHtml);
  });

  app.setNotFoundHandler((request, reply) => {
    const pathname = request.url.split("?")[0] || "/";

    if (request.method === "GET" && shouldServeSpa(pathname)) {
      reply.header("Cache-Control", "no-cache");
      return reply.type("text/html; charset=utf-8").send(indexHtml);
    }

    return reply.code(404).send({
      message: "Route not found"
    });
  });

  app.log.info({ frontendDistRoot }, "Frontend static hosting enabled");
}
