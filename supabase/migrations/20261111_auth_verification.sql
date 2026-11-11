-- =============================================================================
-- PronaX – Migration: Auth Verification Codes (6-Digit OTP Login)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.auth_verification_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  code_hash     TEXT NOT NULL,
  attempts      INTEGER NOT NULL DEFAULT 0,
  max_attempts  INTEGER NOT NULL DEFAULT 5,
  expires_at    TIMESTAMPTZ NOT NULL,
  verified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy email lookups
CREATE INDEX IF NOT EXISTS idx_verification_email ON public.auth_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON public.auth_verification_codes(expires_at);

-- RLS
ALTER TABLE public.auth_verification_codes ENABLE ROW LEVEL SECURITY;

-- Service role only
DROP POLICY IF EXISTS "Service role full access on verification codes" ON public.auth_verification_codes;
CREATE POLICY "Service role full access on verification codes"
  ON public.auth_verification_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.auth_verification_codes IS
  'Ruan kodet 6-shifrore të verifikimit me hash SHA-256 dhe afat skadimi 5 minuta.';
