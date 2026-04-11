CREATE TABLE IF NOT EXISTS lockers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  size text NOT NULL CHECK (size IN ('P', 'M', 'G')),
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'maintenance')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lockers_status_idx ON lockers (status);
CREATE INDEX IF NOT EXISTS lockers_size_idx ON lockers (size);
