-- ==============================================================================
-- PronaX Kosovo Real Estate Marketplace
-- Database Migration: Phase 7 - Payment System & 30-Day Listing Lifecycle
-- ==============================================================================

-- 1. ENUMS FOR STATUSES
DO $$ BEGIN
    CREATE TYPE property_status AS ENUM (
        'draft',
        'pending_payment',
        'pending_moderation',
        'published',
        'expired',
        'rejected',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'processing',
        'successful',
        'failed',
        'cancelled',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_purpose AS ENUM (
        'new_listing',
        'renewal'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_provider AS ENUM (
        'paysera',
        'procredit_pos',
        'nlb_pos',
        'sandbox'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROPERTIES TABLE (If not already created)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(300) UNIQUE,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    listing_type VARCHAR(20) NOT NULL, -- 'shitje', 'qira'
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    municipality_id VARCHAR(100) NOT NULL,
    settlement_id VARCHAR(100),
    address VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    area_m2 NUMERIC(10, 2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    floor INTEGER,
    total_floors INTEGER,
    furnished BOOLEAN DEFAULT false,
    heating_type VARCHAR(50),
    parking BOOLEAN DEFAULT false,
    balcony BOOLEAN DEFAULT false,
    status property_status NOT NULL DEFAULT 'pending_payment',
    rejection_reason TEXT,
    renewal_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Indexes for performance & searching
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_expires_at ON public.properties(expires_at);
CREATE INDEX IF NOT EXISTS idx_properties_municipality ON public.properties(municipality_id);

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL,
    amount_cents INTEGER NOT NULL DEFAULT 700, -- Exactly 7.00 EUR (700 cents)
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    purpose payment_purpose NOT NULL DEFAULT 'new_listing',
    provider payment_provider NOT NULL DEFAULT 'sandbox',
    provider_transaction_id VARCHAR(255),
    provider_fee_cents INTEGER DEFAULT 0, -- Gateway fee where provided
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'card', -- 'card_visa', 'card_mastercard', etc.
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx ON public.payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON public.payments(idempotency_key);

-- 4. PAYMENT AUDIT LOG / WEBHOOK EVENTS
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'webhook_received', 'signature_verified', 'status_changed', etc.
    provider VARCHAR(50) NOT NULL,
    raw_payload JSONB NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON public.payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON public.payment_events(created_at);

-- 5. LISTING RENEWALS TABLE (Audit trail for 30-day manual renewals)
CREATE TABLE IF NOT EXISTS public.listing_renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    previous_expires_at TIMESTAMPTZ,
    new_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_renewals_property_id ON public.listing_renewals(property_id);

-- 6. SITE SETTINGS TABLE (Configurable listing price, duration, moderation)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
    ('listing_fee_eur', '7.00'::jsonb, 'Tarifa e publikimit dhe rinovimit në Euro (€)'),
    ('listing_duration_days', '30'::jsonb, 'Kohëzgjatja e publikimit të pronës në ditë (saktësisht 30 ditë)'),
    ('require_moderation_after_payment', 'true'::jsonb, 'A kërkohet aprovimi i administratorit pas pagesës së suksesshme?'),
    ('active_payment_provider', '"sandbox"'::jsonb, 'Ofruesi aktiv i pagesave: paysera, procredit_pos, nlb_pos, sandbox')
ON CONFLICT (key) DO NOTHING;

-- 7. FUNCTION: AUTO-EXPIRE LISTINGS (Runs via pg_cron or Supabase Edge Functions)
CREATE OR REPLACE FUNCTION public.check_expired_properties()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.properties
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'published'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_renewals ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to payments"
    ON public.payments FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Payment events policies (Admin / Service role only)
CREATE POLICY "Service role has full access to payment_events"
    ON public.payment_events FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Renewals policies
CREATE POLICY "Users can view renewals for their properties"
    ON public.listing_renewals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = listing_renewals.property_id
              AND p.owner_id = auth.uid()
        )
    );
