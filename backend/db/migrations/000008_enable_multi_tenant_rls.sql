ALTER TABLE IF EXISTS app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unlock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_events ENABLE ROW LEVEL SECURITY;

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
