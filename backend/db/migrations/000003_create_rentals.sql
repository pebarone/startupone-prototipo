CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locker_id uuid NOT NULL REFERENCES lockers(id),
  access_code text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rentals_active_access_code_unique
  ON rentals (access_code)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS rentals_locker_id_idx ON rentals (locker_id);
CREATE INDEX IF NOT EXISTS rentals_status_idx ON rentals (status);
