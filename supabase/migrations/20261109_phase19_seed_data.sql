-- ==============================================================================
-- PronaX Kosovo Real Estate Marketplace
-- Database Seeding: Comprehensive Demo Data Across Kosovo
-- Execute in Supabase SQL Editor after Phase 1, 7 & 8 migrations
-- ==============================================================================

-- 1. Insert Demo Administrator Profile (if not exists)
INSERT INTO public.profiles (id, email, full_name, phone, role, is_verified)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'pronaxestate@outlook.com',
    'Administrator PronaX',
    '+383 44 100 200',
    'admin',
    true
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', is_verified = true;

-- 2. Insert Demo User Profiles
INSERT INTO public.profiles (id, email, full_name, phone, role, is_verified)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'agim.berisha@pronax.ks', 'Agim Berisha', '+383 44 123 456', 'user', true),
    ('b0000000-0000-0000-0000-000000000002', 'luljeta.berisha@pronax.ks', 'Luljeta Berisha', '+383 49 222 333', 'agency', true),
    ('b0000000-0000-0000-0000-000000000003', 'besim.krasniqi@pronax.ks', 'Besim Krasniqi', '+383 45 777 666', 'user', true),
    ('b0000000-0000-0000-0000-000000000004', 'ramiz.gashi@pronax.ks', 'Ramiz Gashi', '+383 44 999 888', 'agency', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demo Agencies
INSERT INTO public.agencies (id, slug, name, description, logo_url, website, email, phone, whatsapp, address, municipality_id, arbk_license, is_verified, is_active, owner_user_id)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'dardania-real-estate',
        'Dardania Real Estate',
        'Agjencia lider në Prishtinë dhe rrethinë me përvojë mbi 10 vjeçare në tregtimin e pronave të paluajtshme.',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80',
        'https://dardania.ks',
        'info@dardania.ks',
        '+383 44 123 456',
        '+38344123456',
        'Bulevardi Nënë Tereza, Nr. 12',
        'prishtine',
        'ARBK-84729104',
        true,
        true,
        'b0000000-0000-0000-0000-000000000002'
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'kosova-prime-properties',
        'Kosova Prime Properties',
        'Specializuar në vila luksoze, toka ndërtimore dhe objekte komerciale në të gjithë territorin e Kosovës.',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=300&q=80',
        'https://prime-ks.com',
        'ramiz@prime-ks.com',
        '+383 44 999 888',
        '+38344999888',
        'Rruga UÇK, Nr. 45',
        'prizren',
        'ARBK-29481057',
        true,
        true,
        'b0000000-0000-0000-0000-000000000004'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Verified Published Properties (30-day listing rule active)
INSERT INTO public.properties (
    id, owner_id, agency_id, title, slug, description,
    listing_type, property_type, price, currency,
    municipality_id, settlement_id, address, latitude, longitude,
    area_m2, bedrooms, bathrooms, floor, total_floors, year_built,
    furnished, heating_type, has_balcony, has_parking, has_elevator, has_ac,
    cover_image, status, is_featured, published_at, expires_at
)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        NULL,
        'Banesë moderne në lagjen Marigona Hill',
        'banese-moderne-marigona-hill-prishtine-d0000001',
        'Banesë e re luksoze me pamje të mrekullueshme, e vendosur në lagjen prestigjioze Marigona Hill.',
        'shitje',
        'Banesë',
        135000.00,
        'EUR',
        'prishtine',
        'prishtine-veternik',
        'Lagja Marigona Hill, Nr. 24',
        42.6350,
        21.1720,
        96.00,
        3,
        2,
        4,
        8,
        2021,
        'i mobiluar',
        'Ngrohje qendrore',
        true,
        true,
        true,
        true,
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'published',
        true,
        NOW(),
        NOW() + INTERVAL '30 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000001',
        'Shtëpi komode me oborr të rregulluar në Ortakoll',
        'shtepi-komode-ortakoll-prizren-d0000002',
        'Shtëpi private individuale me oborr 350m² të gjelbëruar, garazh dysh dhe pamje nga kalaja e Prizrenit.',
        'shitje',
        'Shtëpi',
        185000.00,
        'EUR',
        'prizren',
        'prizren-ortakoll',
        'Rruga Ortakoll, Nr. 15',
        42.2200,
        20.7500,
        220.00,
        5,
        3,
        NULL,
        2,
        2018,
        'i mobiluar',
        'Ngrohje me gaz',
        true,
        true,
        false,
        true,
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        'published',
        true,
        NOW(),
        NOW() + INTERVAL '30 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000004',
        'b0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000002',
        'Vilë luksoze me pamje malore në Brezovicë',
        'vile-luksoze-brezovice-shterpc-d0000004',
        'Vilë alpine luksoze me pishinë të mbyllur, sauna dhe oxhak guri natyror në zemër të Brezovicës.',
        'shitje',
        'Vilë',
        240000.00,
        'EUR',
        'shterpc',
        'shterpc-brezovice',
        'Kompleksi Alpin, Brezovicë',
        42.2150,
        21.0100,
        260.00,
        6,
        4,
        NULL,
        3,
        2020,
        'i mobiluar',
        'Ngrohje me pelet',
        true,
        true,
        false,
        true,
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'published',
        true,
        NOW(),
        NOW() + INTERVAL '30 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Successful Payment Records (7.00 € verified)
INSERT INTO public.payments (
    id, property_id, user_id, purpose, provider, amount_eur, currency, status,
    provider_order_id, idempotency_key, created_at
)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'new_listing',
        'sandbox',
        7.00,
        'EUR',
        'successful',
        'ORD-DEMO-001',
        'IDEMP-DEMO-001',
        NOW()
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000002',
        'new_listing',
        'sandbox',
        7.00,
        'EUR',
        'successful',
        'ORD-DEMO-002',
        'IDEMP-DEMO-002',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;
