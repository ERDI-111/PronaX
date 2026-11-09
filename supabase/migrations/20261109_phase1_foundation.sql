-- ==============================================================================
-- PronaX Kosovo Real Estate Marketplace
-- Database Migration: Phase 1 (FOUNDATION) - Complete Schema
-- Run this FIRST before any other migration
-- ==============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ==============================================================================
-- ENUMS
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'agency', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM (
        'draft', 'pending_payment', 'pending_moderation',
        'published', 'expired', 'rejected', 'archived'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_purpose AS ENUM ('new_listing', 'renewal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_provider AS ENUM ('paysera', 'procredit_pos', 'nlb_pos', 'sandbox');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE listing_type AS ENUM ('shitje', 'qira');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    suspension_reason TEXT,
    agency_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- MUNICIPALITIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.municipalities (
    id TEXT PRIMARY KEY,                  -- e.g. 'prishtine'
    name TEXT NOT NULL,                   -- e.g. 'Prishtinë'
    name_sr TEXT,                         -- Serbian name if applicable
    region TEXT,                          -- e.g. 'Prishtinë'
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SETTLEMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settlements (
    id TEXT PRIMARY KEY,                  -- e.g. 'prishtine-veternik'
    name TEXT NOT NULL,                   -- e.g. 'Veternik'
    municipality_id TEXT REFERENCES public.municipalities(id) ON DELETE CASCADE,
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AGENCIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    municipality_id TEXT REFERENCES public.municipalities(id),
    arbk_license TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    social_facebook TEXT,
    social_instagram TEXT,
    owner_user_id UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PROPERTIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id),
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(350) UNIQUE,
    description TEXT,

    -- Categorization
    listing_type listing_type NOT NULL DEFAULT 'shitje',
    property_type TEXT NOT NULL,

    -- Pricing
    price NUMERIC(14, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    price_negotiable BOOLEAN DEFAULT false,

    -- Location
    municipality_id TEXT REFERENCES public.municipalities(id),
    settlement_id TEXT REFERENCES public.settlements(id),
    address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    show_exact_address BOOLEAN DEFAULT false,

    -- Dimensions
    area_m2 NUMERIC(10, 2),
    land_area_m2 NUMERIC(12, 2),

    -- Residential details
    bedrooms SMALLINT,
    bathrooms SMALLINT,
    living_rooms SMALLINT,
    floor SMALLINT,
    total_floors SMALLINT,
    year_built SMALLINT,

    -- Features (boolean flags)
    furnished TEXT,                        -- 'i mobiluar' | 'i pamobiluar' | 'gjysmë i mobiluar'
    heating_type TEXT,
    has_balcony BOOLEAN DEFAULT false,
    has_terrace BOOLEAN DEFAULT false,
    has_garage BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_elevator BOOLEAN DEFAULT false,
    has_ac BOOLEAN DEFAULT false,
    has_swimming_pool BOOLEAN DEFAULT false,
    has_garden BOOLEAN DEFAULT false,
    has_basement BOOLEAN DEFAULT false,
    energy_class TEXT,

    -- Land-specific
    land_category TEXT,
    has_construction_permit BOOLEAN DEFAULT false,
    has_road_access BOOLEAN DEFAULT false,
    has_electricity BOOLEAN DEFAULT false,
    has_water BOOLEAN DEFAULT false,
    has_sewage BOOLEAN DEFAULT false,

    -- Commercial-specific
    commercial_usage_type TEXT,
    commercial_facilities TEXT,

    -- Seller contact
    seller_name TEXT,
    seller_phone TEXT,
    seller_phone_visible BOOLEAN DEFAULT true,
    seller_email TEXT,
    seller_whatsapp TEXT,
    seller_type TEXT DEFAULT 'privat',    -- 'privat' | 'agjenci'
    preferred_contact TEXT DEFAULT 'phone',

    -- Media
    cover_image TEXT,
    video_url TEXT,
    floor_plan_url TEXT,

    -- Status & lifecycle
    status property_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- ==============================================================================
-- PROPERTY IMAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order SMALLINT DEFAULT 0,
    is_cover BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- FAVORITES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, property_id)
);

-- ==============================================================================
-- SAVED SEARCHES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    filters JSONB NOT NULL DEFAULT '{}',
    notify_email BOOLEAN DEFAULT true,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- CONVERSATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_archived BOOLEAN DEFAULT false,
    is_reported BOOLEAN DEFAULT false,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PAYMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    purpose payment_purpose NOT NULL DEFAULT 'new_listing',
    provider payment_provider NOT NULL DEFAULT 'sandbox',
    amount_eur NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    status payment_status DEFAULT 'pending',
    provider_transaction_id TEXT,
    provider_order_id TEXT UNIQUE,
    provider_fee_eur NUMERIC(10, 2),
    idempotency_key TEXT UNIQUE,
    webhook_received_at TIMESTAMPTZ,
    failure_reason TEXT,
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PAYMENT EVENTS TABLE (audit log of payment state changes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    old_status payment_status,
    new_status payment_status,
    provider_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- LISTING RENEWALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.listing_renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id),
    renewed_at TIMESTAMPTZ DEFAULT NOW(),
    new_expires_at TIMESTAMPTZ NOT NULL,
    previous_expires_at TIMESTAMPTZ,
    renewed_by UUID REFERENCES public.profiles(id)
);

-- ==============================================================================
-- REPORTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending',       -- 'pending' | 'reviewed' | 'dismissed' | 'actioned'
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ADMIN LOGS TABLE (audit trail)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,                    -- 'property' | 'user' | 'agency' | 'payment'
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SITE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================

-- Properties
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_municipality ON public.properties(municipality_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_expires_at ON public.properties(expires_at);
CREATE INDEX IF NOT EXISTS idx_properties_published_at ON public.properties(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(status, expires_at) WHERE status = 'published';

-- Location indexes
CREATE INDEX IF NOT EXISTS idx_settlements_municipality ON public.settlements(municipality_id);

-- Favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON public.favorites(property_id);

-- Messages & Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(conversation_id, is_read) WHERE is_read = false;

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_property ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON public.payments(idempotency_key);

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Public tables (no RLS needed)
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "Profiles are viewable by owner" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ---- MUNICIPALITIES & SETTLEMENTS (public read) ----
CREATE POLICY "Anyone can read municipalities" ON public.municipalities
    FOR SELECT USING (true);
CREATE POLICY "Anyone can read settlements" ON public.settlements
    FOR SELECT USING (true);

-- ---- AGENCIES (public read) ----
CREATE POLICY "Anyone can read active agencies" ON public.agencies
    FOR SELECT USING (is_active = true);
CREATE POLICY "Agency owners can manage their agency" ON public.agencies
    FOR ALL USING (auth.uid() = owner_user_id);

-- ---- PROPERTIES ----
-- Public can see published properties
CREATE POLICY "Anyone can read published properties" ON public.properties
    FOR SELECT USING (status = 'published' AND expires_at > NOW());
-- Owners can see all their own properties
CREATE POLICY "Owners can manage their properties" ON public.properties
    FOR ALL USING (auth.uid() = owner_id);
-- Admin can see all
CREATE POLICY "Admins can manage all properties" ON public.properties
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ---- PROPERTY IMAGES ----
CREATE POLICY "Anyone can view property images" ON public.property_images
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'published')
    );
CREATE POLICY "Owners can manage their property images" ON public.property_images
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );

-- ---- FAVORITES ----
CREATE POLICY "Users can manage their favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- ---- SAVED SEARCHES ----
CREATE POLICY "Users can manage their saved searches" ON public.saved_searches
    FOR ALL USING (auth.uid() = user_id);

-- ---- CONVERSATIONS ----
CREATE POLICY "Users can view their own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ---- MESSAGES ----
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );
CREATE POLICY "Users can send messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

-- ---- NOTIFICATIONS ----
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ---- PAYMENTS ----
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ---- LISTING RENEWALS ----
CREATE POLICY "Users can view renewals for their properties" ON public.listing_renewals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );

-- ---- REPORTS ----
CREATE POLICY "Users can submit reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage reports" ON public.reports
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ---- ADMIN LOGS (admin only) ----
CREATE POLICY "Admins can view audit logs" ON public.admin_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE
            WHEN NEW.email = 'pronaxestate@gmail.com' THEN 'admin'::user_role
            ELSE 'user'::user_role
        END
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate slug for properties
CREATE OR REPLACE FUNCTION public.generate_property_slug(title TEXT, id UUID)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := lower(trim(regexp_replace(
        unaccent(title), '[^a-z0-9]+', '-', 'g'
    )));
    base_slug := trim(both '-' from base_slug);
    base_slug := left(base_slug, 80);
    final_slug := base_slug || '-' || left(id::text, 8);
    RETURN final_slug;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_updated_at ON public.properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-increment view count
CREATE OR REPLACE FUNCTION public.increment_property_view(property_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.properties
    SET view_count = view_count + 1
    WHERE id = property_id AND status = 'published';
END;
$$;

-- ==============================================================================
-- SEED: 38 Kosovo Municipalities
-- ==============================================================================

INSERT INTO public.municipalities (id, name, region, lat, lng, sort_order) VALUES
    ('decan', 'Deçan', 'Pejë', 42.5406, 20.2888, 1),
    ('dragash', 'Dragash', 'Prizren', 42.0569, 20.6531, 2),
    ('ferizaj', 'Ferizaj', 'Ferizaj', 42.3703, 21.1483, 3),
    ('fushe-kosove', 'Fushë Kosovë', 'Prishtinë', 42.6333, 21.1000, 4),
    ('gjakove', 'Gjakovë', 'Gjakovë', 42.3833, 20.4333, 5),
    ('gjilan', 'Gjilan', 'Gjilan', 42.4648, 21.4694, 6),
    ('gracanice', 'Graçanicë', 'Prishtinë', 42.6039, 21.1944, 7),
    ('hani-elezit', 'Hani i Elezit', 'Ferizaj', 42.1517, 21.2947, 8),
    ('istog', 'Istog', 'Pejë', 42.7822, 20.4886, 9),
    ('junik', 'Junik', 'Gjakovë', 42.4769, 20.2742, 10),
    ('kacanik', 'Kaçanik', 'Ferizaj', 42.2317, 21.2583, 11),
    ('kamenice', 'Kamenicë', 'Gjilan', 42.5775, 21.5806, 12),
    ('kline', 'Klinë', 'Pejë', 42.6214, 20.5750, 13),
    ('kllokot', 'Kllokot', 'Gjilan', 42.3722, 21.3806, 14),
    ('leposaviq', 'Leposaviq', 'Mitrovicë', 43.1017, 20.8019, 15),
    ('lipjan', 'Lipjan', 'Prishtinë', 42.5225, 21.1239, 16),
    ('malisheve', 'Malishevë', 'Prizren', 42.4833, 20.7417, 17),
    ('mamushe', 'Mamushë', 'Prizren', 42.3061, 20.7139, 18),
    ('mitrovice-jugut', 'Mitrovicë e Jugut', 'Mitrovicë', 42.8906, 20.8667, 19),
    ('mitrovice-veriut', 'Mitrovicë e Veriut', 'Mitrovicë', 42.9014, 20.8647, 20),
    ('novoberde', 'Novobërdë', 'Gjilan', 42.6069, 21.4347, 21),
    ('obilic', 'Obiliq', 'Prishtinë', 42.6872, 21.0697, 22),
    ('partesh', 'Partesh', 'Gjilan', 42.3914, 21.4453, 23),
    ('peje', 'Pejë', 'Pejë', 42.6592, 20.2900, 24),
    ('podujeve', 'Podujevë', 'Prishtinë', 42.9108, 21.1894, 25),
    ('prishtine', 'Prishtinë', 'Prishtinë', 42.6629, 21.1655, 26),
    ('prizren', 'Prizren', 'Prizren', 42.2139, 20.7406, 27),
    ('rahovec', 'Rahovec', 'Prizren', 42.3989, 20.6553, 28),
    ('ranillug', 'Ranillug', 'Gjilan', 42.4867, 21.5736, 29),
    ('shterpc', 'Shtërpcë', 'Ferizaj', 42.2383, 21.0303, 30),
    ('shtime', 'Shtime', 'Ferizaj', 42.4333, 21.0417, 31),
    ('skenderaj', 'Skenderaj', 'Mitrovicë', 42.7458, 20.7900, 32),
    ('suhareke', 'Suharekë', 'Prizren', 42.3597, 20.8233, 33),
    ('viti', 'Viti', 'Gjilan', 42.3225, 21.3578, 34),
    ('vushtrri', 'Vushtrri', 'Mitrovicë', 42.8228, 20.9683, 35),
    ('zubin-potok', 'Zubin Potok', 'Mitrovicë', 42.9153, 20.6889, 36),
    ('zvecan', 'Zveçan', 'Mitrovicë', 43.0022, 20.8325, 37),
    ('shterpce', 'Shtërpcë', 'Ferizaj', 42.2383, 21.0303, 38)
ON CONFLICT (id) DO NOTHING;

-- Remove duplicate Shtërpcë
DELETE FROM public.municipalities WHERE id = 'shterpce';

-- ==============================================================================
-- SEED: Common settlements for major municipalities
-- ==============================================================================

INSERT INTO public.settlements (id, name, municipality_id, lat, lng) VALUES
    -- Prishtinë
    ('prishtine-qender', 'Qendër', 'prishtine', 42.6629, 21.1655),
    ('prishtine-dardania', 'Dardania', 'prishtine', 42.6550, 21.1600),
    ('prishtine-pejton', 'Pejton', 'prishtine', 42.6700, 21.1550),
    ('prishtine-ulpiana', 'Ulpiana', 'prishtine', 42.6500, 21.1700),
    ('prishtine-veternik', 'Veternik', 'prishtine', 42.6350, 21.1720),
    ('prishtine-bregu-diellit', 'Bregu i Diellit', 'prishtine', 42.6680, 21.1750),
    ('prishtine-lakrishte', 'Llakresia', 'prishtine', 42.6400, 21.1900),
    ('prishtine-sunny-hill', 'Sunny Hill', 'prishtine', 42.6450, 21.1800),
    ('prishtine-kodra-trimave', 'Kodra e Trimave', 'prishtine', 42.6600, 21.1850),
    ('prishtine-matican', 'Matiqan', 'prishtine', 42.6750, 21.1900),
    ('prishtine-pristina-e-re', 'Prishtina e Re', 'prishtine', 42.6550, 21.1500),
    ('prishtine-gracanice', 'Graçanicë', 'prishtine', 42.6039, 21.1944),
    -- Prizren
    ('prizren-qender', 'Qendër', 'prizren', 42.2139, 20.7406),
    ('prizren-ortakoll', 'Ortakoll', 'prizren', 42.2200, 20.7500),
    ('prizren-tusus', 'Tusus', 'prizren', 42.2100, 20.7350),
    ('prizren-remzi-ademaj', 'Remzi Ademaj', 'prizren', 42.2250, 20.7450),
    -- Gjilan
    ('gjilan-qender', 'Qendër', 'gjilan', 42.4648, 21.4694),
    ('gjilan-zhitia', 'Zhitia', 'gjilan', 42.4700, 21.4800),
    -- Pejë
    ('peje-qender', 'Qendër', 'peje', 42.6592, 20.2900),
    ('peje-kralan', 'Kralan', 'peje', 42.6650, 20.2850),
    ('peje-trg', 'Trg', 'peje', 42.6600, 20.2800),
    -- Ferizaj
    ('ferizaj-qender', 'Qendër', 'ferizaj', 42.3703, 21.1483),
    ('ferizaj-liria', 'Liria', 'ferizaj', 42.3750, 21.1550),
    -- Gjakovë
    ('gjakove-qender', 'Qendër', 'gjakove', 42.3833, 20.4333),
    -- Fushë Kosovë
    ('fushe-kosove-qender', 'Qendër', 'fushe-kosove', 42.6333, 21.1000),
    ('fushe-kosove-zona-industriale', 'Zona Industriale', 'fushe-kosove', 42.6250, 21.1150),
    -- Mitrovicë e Jugut
    ('mitrovice-jugut-qender', 'Qendër', 'mitrovice-jugut', 42.8906, 20.8667),
    ('mitrovice-jugut-bosniak', 'Lagja Boshnjake', 'mitrovice-jugut', 42.8850, 20.8700),
    -- Vushtrri
    ('vushtrri-qender', 'Qendër', 'vushtrri', 42.8228, 20.9683),
    -- Lipjan
    ('lipjan-qender', 'Qendër', 'lipjan', 42.5225, 21.1239),
    -- Podujevë
    ('podujeve-qender', 'Qendër', 'podujeve', 42.9108, 21.1894),
    -- Shtërpcë
    ('shterpc-brezovice', 'Brezovicë', 'shterpc', 42.2150, 21.0100),
    ('shterpc-qender', 'Qendër', 'shterpc', 42.2383, 21.0303),
    -- Rahovec
    ('rahovec-qender', 'Qendër', 'rahovec', 42.3989, 20.6553),
    -- Skenderaj
    ('skenderaj-qender', 'Qendër', 'skenderaj', 42.7458, 20.7900),
    -- Suharekë
    ('suhareke-qender', 'Qendër', 'suhareke', 42.3597, 20.8233),
    -- Viti
    ('viti-qender', 'Qendër', 'viti', 42.3225, 21.3578),
    -- Kamenicë
    ('kamenice-qender', 'Qendër', 'kamenice', 42.5775, 21.5806),
    -- Istog
    ('istog-qender', 'Qendër', 'istog', 42.7822, 20.4886),
    -- Klinë
    ('kline-qender', 'Qendër', 'kline', 42.6214, 20.5750),
    -- Malishevë
    ('malisheve-qender', 'Qendër', 'malisheve', 42.4833, 20.7417),
    -- Dragash
    ('dragash-qender', 'Qendër', 'dragash', 42.0569, 20.6531),
    -- Deçan
    ('decan-qender', 'Qendër', 'decan', 42.5406, 20.2888),
    -- Kaçanik
    ('kacanik-qender', 'Qendër', 'kacanik', 42.2317, 21.2583),
    -- Hani i Elezit
    ('hani-elezit-qender', 'Qendër', 'hani-elezit', 42.1517, 21.2947),
    -- Junik
    ('junik-qender', 'Qendër', 'junik', 42.4769, 20.2742),
    -- Obiliq
    ('obilic-qender', 'Qendër', 'obilic', 42.6872, 21.0697)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED: Default site settings
-- ==============================================================================

INSERT INTO public.site_settings (key, value, description) VALUES
    ('listing_fee_eur', '7', 'Tarifa e publikimit të pronës në EUR'),
    ('listing_duration_days', '30', 'Kohëzgjatja e listimit në ditë'),
    ('moderation_mode', 'manual', 'Mënyra e moderimit: auto | manual'),
    ('max_images_per_listing', '30', 'Numri maksimal i fotove për pronë'),
    ('max_image_size_mb', '10', 'Madhësia maksimale e fotos në MB'),
    ('site_name', 'PronaX', 'Emri i platformës'),
    ('site_tagline', 'Prona që kërkon. Shtëpia që meriton.', 'Tagline i platformës'),
    ('contact_email', 'pronaxestate@gmail.com', 'Email-i i kontaktit'),
    ('admin_email', 'pronaxestate@gmail.com', 'Email-i i administratorit'),
    ('site_domain', 'pronax-ks.com', 'Domain-i i faqes')
ON CONFLICT (key) DO NOTHING;
