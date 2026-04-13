-- ============================================================
-- Migration 000011: WebAuthn credentials for public locker flow
-- Adds challenge/credential persistence for rental-scoped
-- passkeys and enforces at most one live rental per locker.
-- ============================================================

CREATE TABLE IF NOT EXISTS rental_webauthn_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL UNIQUE REFERENCES rentals(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  locker_id uuid NOT NULL REFERENCES lockers(id) ON DELETE CASCADE,
  credential_id text NOT NULL UNIQUE,
  public_key bytea NOT NULL,
  counter integer NOT NULL DEFAULT 0,
  transports text[] NOT NULL DEFAULT '{}',
  device_type text NOT NULL CHECK (device_type IN ('singleDevice', 'multiDevice')),
  backed_up boolean NOT NULL DEFAULT false,
  last_authenticated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rental_webauthn_credentials_org_idx
  ON rental_webauthn_credentials (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS rental_webauthn_credentials_locker_idx
  ON rental_webauthn_credentials (locker_id);

CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('registration', 'authentication')),
  challenge text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS webauthn_challenges_rental_purpose_open_unique
  ON webauthn_challenges (rental_id, purpose)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS webauthn_challenges_expiry_idx
  ON webauthn_challenges (expires_at)
  WHERE used_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS rentals_single_live_per_locker
  ON rentals (locker_id)
  WHERE status IN ('active', 'storing', 'pending_retrieval_payment');
