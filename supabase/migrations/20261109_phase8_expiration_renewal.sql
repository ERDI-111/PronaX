-- ==============================================================================
-- PronaX Kosovo Real Estate Marketplace
-- Database Migration: Phase 8 - Automatic 30-Day Expiration & Manual Renewal
-- ==============================================================================

-- 1. ADD EXPIRATION NOTIFICATION TRACKING COLUMNS TO PROPERTIES
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS expiration_warning_3d_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expiration_warning_1d_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expired_notification_sent_at TIMESTAMPTZ;

-- 2. CREATE COMPOSITE INDEX FOR ULTRA-FAST CRON & EXPIRATION QUERIES
CREATE INDEX IF NOT EXISTS idx_properties_expiration_cron 
ON public.properties(status, expires_at);

-- 3. IN-APP NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'expiration_warning_3d', 'expiration_warning_1d', 'property_expired', 'renewal_successful', 'renewal_failed'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications"
    ON public.notifications FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. DATABASE FUNCTION: EXECUTE EXPIRATIONS & AUDIT
CREATE OR REPLACE FUNCTION public.execute_property_expirations()
RETURNS TABLE (
    expired_count INTEGER,
    processed_at TIMESTAMPTZ
) AS $$
DECLARE
    affected_count INTEGER := 0;
BEGIN
    -- Update properties that reached their 30-day expiration date
    WITH expired_props AS (
        UPDATE public.properties
        SET status = 'expired',
            updated_at = NOW(),
            expired_notification_sent_at = NOW()
        WHERE status = 'published'
          AND expires_at IS NOT NULL
          AND expires_at <= NOW()
        RETURNING id, owner_id, title
    )
    -- Automatically insert in-app expiration notifications for owners
    INSERT INTO public.notifications (user_id, property_id, type, title, message, action_url)
    SELECT 
        owner_id, 
        id, 
        'property_expired',
        'Prona juaj ka skaduar',
        'Periudha 30-ditore e publikimit për pronën "' || title || '" ka përfunduar. Prona nuk shfaqet më publikisht. Mund ta rinovoni manualisht për 30 ditë shtesë me tarifën 7.00 €.',
        '/pagesa/' || id || '?purpose=renewal'
    FROM expired_props;

    GET DIAGNOSTICS affected_count = ROW_COUNT;

    RETURN QUERY SELECT affected_count, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCTION: SEND 3-DAY AND 1-DAY EXPIRATION NOTIFICATIONS
CREATE OR REPLACE FUNCTION public.check_expiring_notifications()
RETURNS TABLE (
    warning_3d_count INTEGER,
    warning_1d_count INTEGER
) AS $$
DECLARE
    w3d_count INTEGER := 0;
    w1d_count INTEGER := 0;
BEGIN
    -- 1. Check for 3-Day warnings (expires in 2 to 3 days, warning not yet sent)
    WITH expiring_3d AS (
        UPDATE public.properties
        SET expiration_warning_3d_sent_at = NOW()
        WHERE status = 'published'
          AND expires_at IS NOT NULL
          AND expires_at <= NOW() + INTERVAL '3 days'
          AND expires_at > NOW() + INTERVAL '1 day'
          AND expiration_warning_3d_sent_at IS NULL
        RETURNING id, owner_id, title, expires_at
    )
    INSERT INTO public.notifications (user_id, property_id, type, title, message, action_url)
    SELECT 
        owner_id, 
        id, 
        'expiration_warning_3d',
        'Kujdes: Prona juaj skadon pas 3 ditësh',
        'Prona "' || title || '" do të skadojë pas 3 ditësh. Rinovoni para skadimit për të ruajtur vazhdimësinë e publikimit me tarifë 7.00 €.',
        '/pagesa/' || id || '?purpose=renewal'
    FROM expiring_3d;
    GET DIAGNOSTICS w3d_count = ROW_COUNT;

    -- 2. Check for 1-Day warnings (expires in less than 24 hours, warning not yet sent)
    WITH expiring_1d AS (
        UPDATE public.properties
        SET expiration_warning_1d_sent_at = NOW()
        WHERE status = 'published'
          AND expires_at IS NOT NULL
          AND expires_at <= NOW() + INTERVAL '1 day'
          AND expires_at > NOW()
          AND expiration_warning_1d_sent_at IS NULL
        RETURNING id, owner_id, title, expires_at
    )
    INSERT INTO public.notifications (user_id, property_id, type, title, message, action_url)
    SELECT 
        owner_id, 
        id, 
        'expiration_warning_1d',
        'Urgjente: Prona juaj skadon nesër!',
        'Kanë mbetur më pak se 24 orë deri në skadimin e pronës "' || title || '". Rinovoni tani me 7.00 € për 30 ditë të tjera.',
        '/pagesa/' || id || '?purpose=renewal'
    FROM expiring_1d;
    GET DIAGNOSTICS w1d_count = ROW_COUNT;

    RETURN QUERY SELECT w3d_count, w1d_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
