-- ==============================================================================
-- PronaX Kosovo Real Estate Marketplace
-- Database Migration: AI Agent Ecosystem (Phase 2)
-- Run AFTER: 20261109_phase1_foundation.sql
-- ==============================================================================

-- ==============================================================================
-- ENUMS për Sistemin AI
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE ai_agent_id AS ENUM (
        'customer_support',
        'listing_assistant',
        'fraud_detection',
        'smart_search',
        'admin_assistant',
        'notification_retention',
        'market_insights',
        'recommendation'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ai_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ai_conversation_status AS ENUM ('active', 'resolved', 'escalated', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- TABELA 1: ai_agent_settings
-- Konfigurimet e çdo agjenti AI — mund të aktivizohen/çaktivizohen nga admini
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_agent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id ai_agent_id UNIQUE NOT NULL,
    name TEXT NOT NULL,                        -- Emri shqip i agjentit
    description TEXT,                          -- Përshkrimi i shkurtër
    is_enabled BOOLEAN DEFAULT true NOT NULL,  -- Çelësi individual i ndezjes/fikjes
    model TEXT DEFAULT 'claude-sonnet-4-5' NOT NULL, -- Modeli AI i përdorur
    max_tokens INTEGER DEFAULT 1024,           -- Kufi i tokenëve për përgjigje
    temperature NUMERIC(3,2) DEFAULT 0.7,      -- Kreativiteti i modelit (0.0 - 1.0)
    system_prompt TEXT,                        -- Instruksionet kryesore të agjentit
    rate_limit_per_minute INTEGER DEFAULT 20,  -- Kërkesa maksimale/minutë
    rate_limit_per_day INTEGER DEFAULT 500,    -- Kërkesa maksimale/ditë
    timeout_ms INTEGER DEFAULT 30000,          -- Koha maksimale e pritjes (ms)
    requires_auth BOOLEAN DEFAULT false,       -- Kërkon sesion të vërtetuar?
    requires_admin BOOLEAN DEFAULT false,      -- Vetëm për administrues?
    access_level TEXT DEFAULT 'public',        -- 'public' | 'authenticated' | 'admin'
    allowed_operations JSONB DEFAULT '[]',     -- Operacionet e lejuara (JSON array)
    metadata JSONB DEFAULT '{}',               -- Të dhëna shtesë të konfigurimit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABELA 2: ai_conversations
-- Sesionet e bisedave me agjentët (mbështetja, kërkimi me gjuhë natyrore, etj.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id ai_agent_id NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL = vizitor anonim
    session_id TEXT NOT NULL,                  -- ID e sesionit nga cookie/localStorage
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    status ai_conversation_status DEFAULT 'active',
    language TEXT DEFAULT 'sq',               -- 'sq' (shqip) | 'en' (anglisht)
    escalated_to_admin BOOLEAN DEFAULT false,
    escalation_reason TEXT,
    summary TEXT,                              -- Përmbledhja e shkurtër e bisedës
    total_messages INTEGER DEFAULT 0,
    input_tokens_used INTEGER DEFAULT 0,
    output_tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- ==============================================================================
-- TABELA 3: ai_messages
-- Mesazhet individuale brenda bisedave AI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role ai_message_role NOT NULL,             -- 'user' | 'assistant' | 'system'
    content TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false,          -- Flamur nga sistemi i sigurisë
    flag_reason TEXT,                          -- Arsyeja e flamurit
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    response_time_ms INTEGER,                  -- Koha e përgjigjes në ms
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABELA 4: ai_action_logs
-- Regjistri i plotë i auditimit për të gjitha veprimet e agjentëve AI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id ai_agent_id NOT NULL,
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,                 -- p.sh. 'generate_description', 'flag_property', 'search_query'
    action_input JSONB DEFAULT '{}',           -- Parametrat hyrës të veprimit
    action_output JSONB DEFAULT '{}',          -- Rezultati i veprimit
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms INTEGER,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABELA 5: ai_moderation_flags
-- Flamurët e mashtrimit dhe moderimit nga Agjenti 3 (Fraud Detection)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_moderation_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    flagged_by_agent ai_agent_id NOT NULL DEFAULT 'fraud_detection',
    risk_level ai_risk_level NOT NULL DEFAULT 'low',
    risk_score NUMERIC(5,2) DEFAULT 0,         -- Pikët e rrezikut 0.00 - 100.00
    reasons JSONB DEFAULT '[]',                -- Lista e arsyeve (JSON array me tekste)
    detected_issues JSONB DEFAULT '{}',        -- Detajet e problemeve të zbuluara
    admin_reviewed BOOLEAN DEFAULT false,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_decision TEXT,                       -- 'approved' | 'rejected' | 'suspended'
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    auto_action_taken TEXT,                    -- Veprimi automatik (nëse ka)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABELA 6: ai_recommendation_events
-- Ngjarjet e rekomandimeve nga Agjenti 8 (Personalized Recommendations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_recommendation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id TEXT,                           -- Për vizitorët anonimë
    source_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    recommended_property_ids UUID[],           -- Array i ID-ve të rekomanduara
    recommendation_context TEXT,               -- 'similar', 'location', 'price_range', 'favorites'
    clicked_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    was_clicked BOOLEAN DEFAULT false,
    algorithm_version TEXT DEFAULT '1.0',
    score_data JSONB DEFAULT '{}',             -- Të dhënat e pikëzimit të algoritmit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABELA 7: ai_usage_logs
-- Monitorimi i konsumit të tokenëve dhe kostove të API-t AI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id ai_agent_id NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    hour SMALLINT DEFAULT EXTRACT(HOUR FROM NOW()),
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    total_input_tokens BIGINT DEFAULT 0,
    total_output_tokens BIGINT DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    max_response_time_ms INTEGER DEFAULT 0,
    escalations INTEGER DEFAULT 0,
    flags_raised INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (agent_id, date, hour)
);

-- ==============================================================================
-- TABELA 8: ai_market_insights_cache
-- Të dhënat e analizës së tregut të pronave nga Agjenti 7
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_market_insights_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id TEXT REFERENCES public.municipalities(id) ON DELETE CASCADE,
    property_type TEXT NOT NULL,               -- 'banesë', 'shtëpi', 'tokë', 'lokal', etj.
    listing_type TEXT NOT NULL,                -- 'shitje' | 'qira'
    avg_price_eur NUMERIC(14,2),
    avg_price_per_m2 NUMERIC(10,2),
    min_price_eur NUMERIC(14,2),
    max_price_eur NUMERIC(14,2),
    total_listings INTEGER DEFAULT 0,
    price_trend TEXT,                          -- 'rritje' | 'rënie' | 'stabil'
    trend_percentage NUMERIC(5,2),             -- % e ndryshimit ndaj periudhës së mëparshme
    analysis_period TEXT DEFAULT '30_days',    -- '7_days' | '30_days' | '90_days'
    sample_size INTEGER DEFAULT 0,
    ai_analysis_text TEXT,                     -- Analizë narrative nga AI (shqip)
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    UNIQUE (municipality_id, property_type, listing_type, analysis_period)
);

-- ==============================================================================
-- TABELA 9: ai_emergency_switch (Çelësi Global i Emergjencës)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_emergency_switch (
    id INTEGER PRIMARY KEY DEFAULT 1,          -- Vetëm një rresht
    all_agents_disabled BOOLEAN DEFAULT false, -- TRUE = të gjithë agjentët çaktivizohen
    disabled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    disabled_at TIMESTAMPTZ,
    disable_reason TEXT,
    CHECK (id = 1)                             -- Sigurohet vetëm një rresht
);

-- Seed: Çelësi global i ndezur nga fillimi
INSERT INTO public.ai_emergency_switch (id, all_agents_disabled) 
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- INDEKSE PËR PERFORMANCËN
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent ON public.ai_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON public.ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON public.ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON public.ai_conversations(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON public.ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_flagged ON public.ai_messages(is_flagged) WHERE is_flagged = true;

CREATE INDEX IF NOT EXISTS idx_ai_action_logs_agent ON public.ai_action_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_action_logs_user ON public.ai_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_action_logs_created ON public.ai_action_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_moderation_flags_property ON public.ai_moderation_flags(property_id);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_flags_risk ON public.ai_moderation_flags(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_flags_unreviewed ON public.ai_moderation_flags(admin_reviewed) WHERE admin_reviewed = false;

CREATE INDEX IF NOT EXISTS idx_ai_recommendation_user ON public.ai_recommendation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_session ON public.ai_recommendation_events(session_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_agent_date ON public.ai_usage_logs(agent_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_ai_market_cache_municipality ON public.ai_market_insights_cache(municipality_id);
CREATE INDEX IF NOT EXISTS idx_ai_market_cache_expires ON public.ai_market_insights_cache(expires_at);

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_market_insights_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_emergency_switch ENABLE ROW LEVEL SECURITY;

-- ai_agent_settings: Lexim publik (për të shfaqur statusin), shkrim vetëm admin
CREATE POLICY "Anyone can read agent settings" ON public.ai_agent_settings
    FOR SELECT USING (true);
CREATE POLICY "Only admins can modify agent settings" ON public.ai_agent_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ai_conversations: Përdoruesi sheh vetëm bisedat e tij
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Authenticated users can create conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own conversations" ON public.ai_conversations
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all conversations" ON public.ai_conversations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ai_messages: Lidhur me bisedën e lejuar
CREATE POLICY "Users can view messages in own conversations" ON public.ai_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id = conversation_id
            AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    );
CREATE POLICY "Anyone can insert messages" ON public.ai_messages
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all messages" ON public.ai_messages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ai_action_logs: Vetëm admin
CREATE POLICY "Only admins can view action logs" ON public.ai_action_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
CREATE POLICY "System can insert action logs" ON public.ai_action_logs
    FOR INSERT WITH CHECK (true);

-- ai_moderation_flags: Vetëm admin
CREATE POLICY "Only admins can manage moderation flags" ON public.ai_moderation_flags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
CREATE POLICY "System can insert moderation flags" ON public.ai_moderation_flags
    FOR INSERT WITH CHECK (true);

-- ai_recommendation_events: Vetëm vetja + admin
CREATE POLICY "Users can view own recommendation events" ON public.ai_recommendation_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "System can insert recommendation events" ON public.ai_recommendation_events
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all recommendation events" ON public.ai_recommendation_events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ai_usage_logs: Vetëm admin
CREATE POLICY "Only admins can view usage logs" ON public.ai_usage_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
CREATE POLICY "System can insert usage logs" ON public.ai_usage_logs
    FOR INSERT WITH CHECK (true);

-- ai_market_insights_cache: Lexim publik (keni nevojë për të shfaqur tregun)
CREATE POLICY "Anyone can read market insights" ON public.ai_market_insights_cache
    FOR SELECT USING (expires_at > NOW());
CREATE POLICY "System can manage market insights" ON public.ai_market_insights_cache
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
CREATE POLICY "System can insert market insights" ON public.ai_market_insights_cache
    FOR INSERT WITH CHECK (true);

-- ai_emergency_switch: Lexim publik (serverside), shkrim vetëm admin
CREATE POLICY "Anyone can read emergency switch" ON public.ai_emergency_switch
    FOR SELECT USING (true);
CREATE POLICY "Only admins can toggle emergency switch" ON public.ai_emergency_switch
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- ==============================================================================
-- TRIGGERS PËR UPDATED_AT
-- ==============================================================================

DROP TRIGGER IF EXISTS ai_agent_settings_updated_at ON public.ai_agent_settings;
CREATE TRIGGER ai_agent_settings_updated_at BEFORE UPDATE ON public.ai_agent_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS ai_moderation_flags_updated_at ON public.ai_moderation_flags;
CREATE TRIGGER ai_moderation_flags_updated_at BEFORE UPDATE ON public.ai_moderation_flags
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ==============================================================================
-- SEED: Konfigurimet fillestare të 8 Agjentëve AI
-- ==============================================================================

INSERT INTO public.ai_agent_settings (
    agent_id, name, description, is_enabled, model, max_tokens, temperature,
    rate_limit_per_minute, rate_limit_per_day, requires_auth, requires_admin, access_level
) VALUES
(
    'customer_support',
    'Agjenti i Mbështetjes',
    'Jep mbështetje automatike për përdoruesit e PronaX në shqip dhe anglisht.',
    true, 'claude-sonnet-4-5', 1024, 0.7,
    30, 1000, false, false, 'public'
),
(
    'listing_assistant',
    'Asistenti i Listimit',
    'Ndihmon përdoruesit të krijojnë tituj dhe përshkrime profesionale të pronave.',
    true, 'claude-sonnet-4-5', 2048, 0.8,
    10, 200, true, false, 'authenticated'
),
(
    'fraud_detection',
    'Zbulimi i Mashtrimit',
    'Analizon listimet e reja për aktivitet të dyshimtë dhe jep nivel rreziku.',
    true, 'claude-sonnet-4-5', 512, 0.1,
    50, 2000, false, false, 'public'
),
(
    'smart_search',
    'Kërkimi Inteligjent',
    'Transformon kërkesat me gjuhë natyrore në filtra të strukturuar të bazës së të dhënave.',
    true, 'claude-sonnet-4-5', 512, 0.3,
    60, 3000, false, false, 'public'
),
(
    'admin_assistant',
    'Asistenti i Administratorit',
    'Asistenti privat i administratorit PronaX për analitikë dhe raporte.',
    true, 'claude-sonnet-4-5', 2048, 0.6,
    20, 500, true, true, 'admin'
),
(
    'notification_retention',
    'Agjenti i Njoftimeve',
    'Personalizon mesazhet e rikujtimit dhe njoftimet e skadimit.',
    true, 'claude-sonnet-4-5', 512, 0.7,
    20, 500, false, false, 'public'
),
(
    'market_insights',
    'Analiza e Tregut',
    'Analizon çmimet e pronave dhe trendet e tregut të pasurive të paluajtshme në Kosovë.',
    true, 'claude-sonnet-4-5', 1024, 0.4,
    10, 200, false, false, 'public'
),
(
    'recommendation',
    'Rekomandimet',
    'Sugjeron prona të personalizuara bazuar në preferencat dhe historikun e vizitorit.',
    true, 'claude-sonnet-4-5', 512, 0.5,
    30, 1000, false, false, 'public'
)
ON CONFLICT (agent_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ==============================================================================
-- FUNKSION: Përditëso statistikat e ai_usage_logs
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_ai_usage_stats(
    p_agent_id ai_agent_id,
    p_success BOOLEAN,
    p_input_tokens INTEGER,
    p_output_tokens INTEGER,
    p_response_ms INTEGER
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.ai_usage_logs (
        agent_id, date, hour,
        total_requests, successful_requests, failed_requests,
        total_input_tokens, total_output_tokens,
        avg_response_time_ms, max_response_time_ms
    ) VALUES (
        p_agent_id, CURRENT_DATE, EXTRACT(HOUR FROM NOW()),
        1,
        CASE WHEN p_success THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        p_input_tokens, p_output_tokens,
        p_response_ms, p_response_ms
    )
    ON CONFLICT (agent_id, date, hour) DO UPDATE SET
        total_requests = ai_usage_logs.total_requests + 1,
        successful_requests = ai_usage_logs.successful_requests + CASE WHEN p_success THEN 1 ELSE 0 END,
        failed_requests = ai_usage_logs.failed_requests + CASE WHEN p_success THEN 0 ELSE 1 END,
        total_input_tokens = ai_usage_logs.total_input_tokens + p_input_tokens,
        total_output_tokens = ai_usage_logs.total_output_tokens + p_output_tokens,
        avg_response_time_ms = (ai_usage_logs.avg_response_time_ms + p_response_ms) / 2,
        max_response_time_ms = GREATEST(ai_usage_logs.max_response_time_ms, p_response_ms),
        updated_at = NOW();
END;
$$;
