CREATE TABLE IF NOT EXISTS unlock_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id),
  locker_id uuid REFERENCES lockers(id),
  access_code text NOT NULL,
  success boolean NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS unlock_events_created_at_idx ON unlock_events (created_at);
CREATE INDEX IF NOT EXISTS unlock_events_success_idx ON unlock_events (success);
