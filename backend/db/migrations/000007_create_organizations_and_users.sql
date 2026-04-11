CREATE SCHEMA IF NOT EXISTS private;

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

INSERT INTO app_users (id, email, full_name, avatar_url, last_sign_in_at, created_at, updated_at)
SELECT
  id,
  lower(email),
  COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  raw_user_meta_data ->> 'avatar_url',
  last_sign_in_at,
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  last_sign_in_at = EXCLUDED.last_sign_in_at,
  updated_at = now();

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

INSERT INTO organizations (name, slug, status)
SELECT 'Legacy Organization', 'legacy-organization', 'active'
WHERE EXISTS (SELECT 1 FROM lockers)
ON CONFLICT (slug) DO NOTHING;

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

ALTER TABLE lockers ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

UPDATE lockers
SET organization_id = (SELECT id FROM organizations WHERE slug = 'legacy-organization')
WHERE organization_id IS NULL;

ALTER TABLE lockers ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE lockers DROP CONSTRAINT IF EXISTS lockers_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS lockers_organization_code_unique ON lockers (organization_id, code);
CREATE INDEX IF NOT EXISTS lockers_organization_status_idx ON lockers (organization_id, status);
CREATE INDEX IF NOT EXISTS lockers_organization_size_idx ON lockers (organization_id, size);

ALTER TABLE rentals ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

UPDATE rentals AS rentals_to_update
SET organization_id = lockers.organization_id
FROM lockers
WHERE rentals_to_update.locker_id = lockers.id
  AND rentals_to_update.organization_id IS NULL;

ALTER TABLE rentals ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS rentals_organization_id_idx ON rentals (organization_id);
CREATE INDEX IF NOT EXISTS rentals_organization_status_idx ON rentals (organization_id, status);

ALTER TABLE unlock_events ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

UPDATE unlock_events AS unlock_events_to_update
SET organization_id = rentals.organization_id
FROM rentals
WHERE unlock_events_to_update.rental_id = rentals.id
  AND unlock_events_to_update.organization_id IS NULL;

UPDATE unlock_events AS unlock_events_to_update
SET organization_id = lockers.organization_id
FROM lockers
WHERE unlock_events_to_update.locker_id = lockers.id
  AND unlock_events_to_update.organization_id IS NULL;

CREATE INDEX IF NOT EXISTS unlock_events_organization_id_idx ON unlock_events (organization_id);

ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

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

UPDATE organization_memberships AS memberships
SET
  user_id = users.id,
  invite_email = users.email,
  status = 'active',
  updated_at = now()
FROM app_users AS users
WHERE memberships.user_id IS NULL
  AND memberships.status = 'invited'
  AND memberships.invite_email = users.email;
