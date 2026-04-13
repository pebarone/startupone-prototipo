-- ============================================================
-- Migration 000010: Rental Pricing & Biometric Flow
-- Adds per-size hourly rates + initial fee to locker_locations
-- Extends rentals table with biometric token, timestamps, and
-- financial tracking for the new time-based rental cycle.
-- ============================================================

-- ── 1. Pricing fields on locker_locations ──────────────────

ALTER TABLE locker_locations
  ADD COLUMN IF NOT EXISTS initial_fee_cents   INTEGER NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS hourly_rate_small   INTEGER NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS hourly_rate_medium  INTEGER NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS hourly_rate_large   INTEGER NOT NULL DEFAULT 1500;

COMMENT ON COLUMN locker_locations.initial_fee_cents  IS 'Activation fee charged at rental start (centavos)';
COMMENT ON COLUMN locker_locations.hourly_rate_small  IS 'Price per hour for size P lockers (centavos)';
COMMENT ON COLUMN locker_locations.hourly_rate_medium IS 'Price per hour for size M lockers (centavos)';
COMMENT ON COLUMN locker_locations.hourly_rate_large  IS 'Price per hour for size G lockers (centavos)';

-- ── 2. Extend rentals table ────────────────────────────────

-- New lifecycle statuses
ALTER TABLE rentals
  DROP CONSTRAINT IF EXISTS rentals_status_check;

ALTER TABLE rentals
  ADD CONSTRAINT rentals_status_check
    CHECK (status IN ('active', 'storing', 'pending_retrieval_payment', 'finished', 'cancelled'));

-- Financial snapshot (captured at rental creation)
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS initial_fee_cents   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hourly_rate_cents   INTEGER NOT NULL DEFAULT 0;

-- Biometric token (simulated fingerprint/face hash)
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS biometric_token     TEXT;

-- Lifecycle timestamps
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS unlocked_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retrieved_at        TIMESTAMPTZ;

-- Financial outcome
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS extra_charge_cents  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cents         INTEGER NOT NULL DEFAULT 0;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS rentals_status_storing_idx
  ON rentals (status)
  WHERE status = 'storing';

CREATE INDEX IF NOT EXISTS rentals_biometric_token_idx
  ON rentals (biometric_token)
  WHERE biometric_token IS NOT NULL;
