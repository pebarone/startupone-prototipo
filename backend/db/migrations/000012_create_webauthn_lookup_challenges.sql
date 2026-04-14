-- ============================================================
-- Migration 000012: lookup challenges for generic WebAuthn retrieval
-- Allows retrieval flows that start without a rental_id and resolve
-- the active rental from the biometric credential itself.
-- ============================================================

CREATE TABLE IF NOT EXISTS webauthn_lookup_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webauthn_lookup_challenges_expiry_idx
  ON webauthn_lookup_challenges (expires_at)
  WHERE used_at IS NULL;
