WITH seeded_organization AS (
  INSERT INTO organizations (name, slug, status)
  VALUES ('Demo Organization', 'demo-organization', 'active')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, updated_at = now()
  RETURNING id
)
INSERT INTO lockers (organization_id, code, size, status)
SELECT seeded_organization.id, values_to_insert.code, values_to_insert.size, values_to_insert.status
FROM seeded_organization
CROSS JOIN (
  VALUES
    ('LCK-001', 'P', 'free'),
    ('LCK-002', 'M', 'free'),
    ('LCK-003', 'G', 'free'),
    ('LCK-004', 'M', 'maintenance'),
    ('LCK-005', 'P', 'free')
) AS values_to_insert(code, size, status)
ON CONFLICT (organization_id, code) DO NOTHING;
