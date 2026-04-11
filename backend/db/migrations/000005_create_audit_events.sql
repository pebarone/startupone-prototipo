CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type text NOT NULL CHECK (actor_type IN ('anonymous', 'authenticated', 'partner', 'admin', 'system')),
  actor_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_action_idx ON audit_events (action);
CREATE INDEX IF NOT EXISTS audit_events_resource_idx ON audit_events (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON audit_events (created_at);
