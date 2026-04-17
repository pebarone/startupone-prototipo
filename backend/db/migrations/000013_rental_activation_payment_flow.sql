-- ============================================================
-- Migration 000013: Split biometric registration and PIX payment
-- Adds explicit pre-activation states so the locker is only
-- reserved after the initial payment is confirmed.
-- ============================================================

ALTER TABLE rentals
  DROP CONSTRAINT IF EXISTS rentals_status_check;

ALTER TABLE rentals
  ADD CONSTRAINT rentals_status_check
    CHECK (
      status IN (
        'pending_registration',
        'pending_activation_payment',
        'active',
        'storing',
        'pending_retrieval_payment',
        'finished',
        'cancelled'
      )
    );

DROP INDEX IF EXISTS rentals_single_live_per_locker;

CREATE UNIQUE INDEX IF NOT EXISTS rentals_single_live_per_locker
  ON rentals (locker_id)
  WHERE status IN (
    'pending_registration',
    'pending_activation_payment',
    'active',
    'storing',
    'pending_retrieval_payment'
  );

CREATE UNIQUE INDEX IF NOT EXISTS rentals_live_access_code_unique
  ON rentals (access_code)
  WHERE status IN (
    'pending_registration',
    'pending_activation_payment',
    'active',
    'storing',
    'pending_retrieval_payment'
  );
