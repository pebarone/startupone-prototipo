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
