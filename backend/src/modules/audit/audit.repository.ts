import type { Queryable } from "../../db/pool";
import { pool } from "../../db/pool";
import type { RequestContext } from "../../context/request-context";

type AuditEventInput = RequestContext & {
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
};

export async function recordAuditEvent(input: AuditEventInput, db: Queryable = pool): Promise<void> {
  await db.query(
    `
    INSERT INTO audit_events (
      actor_type,
      actor_id,
      organization_id,
      action,
      resource_type,
      resource_id,
      metadata,
      request_id,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
    `,
    [
      input.actor_type,
      input.actor_id ?? null,
      input.organization_id ?? null,
      input.action,
      input.resource_type,
      input.resource_id ?? null,
      JSON.stringify(input.metadata ?? {}),
      input.request_id,
      input.ip_address ?? null,
      input.user_agent ?? null
    ]
  );
}
