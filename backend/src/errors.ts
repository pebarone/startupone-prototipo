import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

type ProblemError = {
  field?: string;
  message?: string;
};

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: ProblemError[];
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly title: string;
  readonly type: string;
  readonly errors?: ProblemError[];

  constructor(statusCode: number, title: string, detail: string, slug: string, errors?: ProblemError[]) {
    super(detail);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.title = title;
    this.type = `https://api.fastlock.local/errors/${slug}`;
    this.errors = errors;
  }
}

export function validationError(detail = "Request validation failed.", errors?: ProblemError[]): AppError {
  return new AppError(400, "Validation Error", detail, "validation-error", errors);
}

export function notFoundError(detail = "Resource not found."): AppError {
  return new AppError(404, "Resource Not Found", detail, "resource-not-found");
}

export function conflictError(detail = "Request conflicts with the current resource state."): AppError {
  return new AppError(409, "Conflict", detail, "conflict");
}

export function unauthorizedError(detail = "Missing or invalid credentials."): AppError {
  return new AppError(401, "Unauthorized", detail, "unauthorized");
}

export function forbiddenError(detail = "You do not have permission to access this resource."): AppError {
  return new AppError(403, "Forbidden", detail, "forbidden");
}

export function rateLimitError(detail = "Rate limit exceeded. Try again later."): AppError {
  return new AppError(429, "Too Many Requests", detail, "rate-limit-exceeded");
}

export function internalError(detail = "An unexpected error occurred."): AppError {
  return new AppError(500, "Internal Server Error", detail, "internal-server-error");
}

export function isPgError(error: unknown, code?: string): error is { code: string; constraint?: string } {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return code ? (error as { code?: string }).code === code : true;
}

export function handleFastifyError(error: FastifyError, request: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof AppError) {
    sendProblem(reply, {
      type: error.type,
      title: error.title,
      status: error.statusCode,
      detail: error.message,
      instance: request.url,
      errors: error.errors
    });
    return;
  }

  if (error.validation) {
    const errors = error.validation.map((item) => ({
      field: item.instancePath || item.schemaPath,
      message: item.message
    }));

    const appError = validationError("Invalid request payload or parameters.", errors);
    sendProblem(reply, {
      type: appError.type,
      title: "Validation Error",
      status: appError.statusCode,
      detail: appError.message,
      instance: request.url,
      errors: appError.errors
    });
    return;
  }

  if (error.statusCode === 429) {
    const appError = rateLimitError();
    sendProblem(reply, {
      type: appError.type,
      title: appError.title,
      status: appError.statusCode,
      detail: appError.message,
      instance: request.url
    });
    return;
  }

  request.log.error({ err: error }, "Unhandled API error");
  const appError = internalError();
  sendProblem(reply, {
    type: appError.type,
    title: "Internal Server Error",
    status: appError.statusCode,
    detail: appError.message,
    instance: request.url
  });
}

function sendProblem(reply: FastifyReply, problem: ProblemDetails): void {
  reply.type("application/problem+json").code(problem.status).send(problem);
}
