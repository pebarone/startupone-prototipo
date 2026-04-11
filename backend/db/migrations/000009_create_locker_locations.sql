CREATE TABLE IF NOT EXISTS locker_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS locker_locations_organization_name_unique
  ON locker_locations (organization_id, lower(name));

CREATE INDEX IF NOT EXISTS locker_locations_org_idx
  ON locker_locations (organization_id);

ALTER TABLE lockers
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locker_locations(id);

CREATE INDEX IF NOT EXISTS lockers_location_id_idx
  ON lockers (location_id);

ALTER TABLE IF EXISTS locker_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS locker_locations_select_member ON locker_locations;
CREATE POLICY locker_locations_select_member
  ON locker_locations
  FOR SELECT
  TO authenticated
  USING (private.is_active_organization_member(organization_id));
