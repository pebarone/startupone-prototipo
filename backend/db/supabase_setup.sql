-- Arquivo consolidado para Supabase SQL Editor.
-- A fonte principal continua sendo backend/db/migrations/*.sql.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text CHECK (email IS NULL OR email = lower(email)),
  full_name text,
  avatar_url text,
  last_sign_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_unique
  ON app_users (lower(email))
  WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug = lower(slug)),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by_user_id uuid REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations (status);

CREATE TABLE IF NOT EXISTS organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  invite_email text CHECK (invite_email IS NULL OR invite_email = lower(invite_email)),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'viewer')),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'disabled')),
  created_by_user_id uuid REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (status = 'invited' AND user_id IS NULL AND invite_email IS NOT NULL)
    OR (status IN ('active', 'disabled') AND user_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_memberships_org_user_unique
  ON organization_memberships (organization_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS organization_memberships_org_invite_email_unique
  ON organization_memberships (organization_id, lower(invite_email))
  WHERE invite_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS organization_memberships_user_id_idx
  ON organization_memberships (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS organization_memberships_org_status_idx
  ON organization_memberships (organization_id, status);

CREATE TABLE IF NOT EXISTS lockers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  size text NOT NULL CHECK (size IN ('P', 'M', 'G')),
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'maintenance')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS lockers_organization_code_unique ON lockers (organization_id, code);
CREATE INDEX IF NOT EXISTS lockers_status_idx ON lockers (status);
CREATE INDEX IF NOT EXISTS lockers_size_idx ON lockers (size);
CREATE INDEX IF NOT EXISTS lockers_organization_status_idx ON lockers (organization_id, status);
CREATE INDEX IF NOT EXISTS lockers_organization_size_idx ON lockers (organization_id, size);

CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
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
CREATE INDEX IF NOT EXISTS rentals_organization_id_idx ON rentals (organization_id);
CREATE INDEX IF NOT EXISTS rentals_organization_status_idx ON rentals (organization_id, status);

CREATE TABLE IF NOT EXISTS unlock_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  rental_id uuid REFERENCES rentals(id),
  locker_id uuid REFERENCES lockers(id),
  access_code text NOT NULL,
  success boolean NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS unlock_events_created_at_idx ON unlock_events (created_at);
CREATE INDEX IF NOT EXISTS unlock_events_success_idx ON unlock_events (success);
CREATE INDEX IF NOT EXISTS unlock_events_organization_id_idx ON unlock_events (organization_id);

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type text NOT NULL CHECK (actor_type IN ('anonymous', 'authenticated', 'partner', 'admin', 'system')),
  actor_id uuid,
  organization_id uuid REFERENCES organizations(id),
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
CREATE INDEX IF NOT EXISTS audit_events_organization_id_idx ON audit_events (organization_id, created_at DESC);

CREATE OR REPLACE FUNCTION private.sync_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.app_users (
    id,
    email,
    full_name,
    avatar_url,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.last_sign_in_at,
    COALESCE(NEW.created_at, now()),
    COALESCE(NEW.updated_at, now())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_synced ON auth.users;
CREATE TRIGGER on_auth_user_synced
AFTER INSERT OR UPDATE OF email, raw_user_meta_data, last_sign_in_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.sync_auth_user();

CREATE OR REPLACE FUNCTION private.claim_memberships_for_app_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.organization_memberships
    SET
      user_id = NEW.id,
      invite_email = NEW.email,
      status = 'active',
      updated_at = now()
    WHERE user_id IS NULL
      AND status = 'invited'
      AND invite_email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_app_user_claim_memberships ON public.app_users;
CREATE TRIGGER on_app_user_claim_memberships
AFTER INSERT OR UPDATE OF email ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION private.claim_memberships_for_app_user();

CREATE OR REPLACE FUNCTION private.is_active_organization_member(target_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_memberships
    WHERE organization_id = target_organization_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

ALTER TABLE IF EXISTS schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unlock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_users_select_self ON app_users;
CREATE POLICY app_users_select_self
  ON app_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS organizations_select_member ON organizations;
CREATE POLICY organizations_select_member
  ON organizations
  FOR SELECT
  TO authenticated
  USING (private.is_active_organization_member(id));

DROP POLICY IF EXISTS organization_memberships_select_member ON organization_memberships;
CREATE POLICY organization_memberships_select_member
  ON organization_memberships
  FOR SELECT
  TO authenticated
  USING (private.is_active_organization_member(organization_id));

DROP POLICY IF EXISTS lockers_select_member ON lockers;
CREATE POLICY lockers_select_member
  ON lockers
  FOR SELECT
  TO authenticated
  USING (private.is_active_organization_member(organization_id));

DROP POLICY IF EXISTS rentals_select_member ON rentals;
CREATE POLICY rentals_select_member
  ON rentals
  FOR SELECT
  TO authenticated
  USING (private.is_active_organization_member(organization_id));

DROP POLICY IF EXISTS unlock_events_select_member ON unlock_events;
CREATE POLICY unlock_events_select_member
  ON unlock_events
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND private.is_active_organization_member(organization_id)
  );

DROP POLICY IF EXISTS audit_events_select_member ON audit_events;
CREATE POLICY audit_events_select_member
  ON audit_events
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND private.is_active_organization_member(organization_id)
  );

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

INSERT INTO schema_migrations (id, name)
VALUES
  ('000001', '000001_create_migrations_table.sql'),
  ('000002', '000002_create_lockers.sql'),
  ('000003', '000003_create_rentals.sql'),
  ('000004', '000004_create_unlock_events.sql'),
  ('000005', '000005_create_audit_events.sql'),
  ('000006', '000006_enable_rls.sql'),
  ('000007', '000007_create_organizations_and_users.sql'),
  ('000008', '000008_enable_multi_tenant_rls.sql'),
  ('000009', '000009_create_locker_locations.sql')
ON CONFLICT (id) DO NOTHING;

WITH demo_organization AS (
  INSERT INTO organizations (name, slug, status)
  VALUES ('Demo Organization', 'demo-organization', 'active')
  ON CONFLICT (slug) DO UPDATE
  SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id
),
legacy_organization AS (
  INSERT INTO organizations (name, slug, status)
  VALUES ('Legacy Organization', 'legacy-organization', 'active')
  ON CONFLICT (slug) DO UPDATE
  SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id
)
INSERT INTO lockers (organization_id, code, size, status)
SELECT demo_organization.id, seeded_values.code, seeded_values.size, seeded_values.status
FROM demo_organization
CROSS JOIN (
  VALUES
    ('LCK-001', 'P', 'free'),
    ('LCK-002', 'M', 'free'),
    ('LCK-003', 'G', 'free'),
    ('LCK-004', 'M', 'maintenance'),
    ('LCK-005', 'P', 'free')
) AS seeded_values(code, size, status)
ON CONFLICT (organization_id, code) DO NOTHING;

WITH seeded_locations AS (
  INSERT INTO locker_locations (organization_id, name, address, latitude, longitude)
  VALUES
    (
      (SELECT id FROM organizations WHERE slug = 'demo-organization'),
      'Estacao da Se',
      'Praca da Se, Se, Sao Paulo - SP',
      -23.55052,
      -46.633308
    ),
    (
      (SELECT id FROM organizations WHERE slug = 'demo-organization'),
      'Paulista MASP',
      'Avenida Paulista, 1578, Bela Vista, Sao Paulo - SP',
      -23.561414,
      -46.655881
    ),
    (
      (SELECT id FROM organizations WHERE slug = 'legacy-organization'),
      'Pinheiros',
      'Rua dos Pinheiros, 450, Pinheiros, Sao Paulo - SP',
      -23.567742,
      -46.692867
    ),
    (
      (SELECT id FROM organizations WHERE slug = 'legacy-organization'),
      'Vila Mariana',
      'Rua Domingos de Morais, 2565, Vila Mariana, Sao Paulo - SP',
      -23.589034,
      -46.634631
    )
  ON CONFLICT DO NOTHING
  RETURNING id
)
SELECT count(*) FROM seeded_locations;

UPDATE lockers
SET location_id = (
  SELECT id
  FROM locker_locations
  WHERE organization_id = lockers.organization_id
    AND name = 'Estacao da Se'
  LIMIT 1
)
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'demo-organization')
  AND code IN ('LCK-001', 'LCK-002');

UPDATE lockers
SET location_id = (
  SELECT id
  FROM locker_locations
  WHERE organization_id = lockers.organization_id
    AND name = 'Paulista MASP'
  LIMIT 1
)
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'demo-organization')
  AND code IN ('LCK-003', 'LCK-004', 'LCK-005');

UPDATE lockers
SET location_id = (
  SELECT id
  FROM locker_locations
  WHERE organization_id = lockers.organization_id
    AND name = 'Pinheiros'
  LIMIT 1
)
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'legacy-organization')
  AND location_id IS NULL;
