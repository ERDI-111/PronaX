-- =============================================================================
-- PronaX – Migration: Remove Demo/Test Data from Production
-- Ekzekutojeni VETËM NË PRODHIM kur doni të fshini të dhënat demo.
-- =============================================================================
--
-- ⚠️  KUJDES — FSHIRJE E PËRHERSHME
-- -----------------------------------
-- Ky skript fshin në mënyrë të PAKTHYESHME të dhënat demo të insertuara
-- nga skripti 20261109_phase19_seed_data.sql.
--
-- Mos e ekzekutoni nëse keni krijuar prona reale me këta ID demo,
-- pasi ato do të fshihen gjithashtu.
-- =============================================================================

-- UUID-et demo të krijuara nga seed_data.sql:
-- Admin:    a0000000-0000-0000-0000-000000000001
-- Users:    b0000000-0000-0000-0000-000000000001 .. 000000000004
-- Agencies: c0000000-0000-0000-0000-000000000001 .. 000000000002

-- Step 1: Fshi prona demo (nga pronarët demo)
DELETE FROM public.properties
WHERE owner_id IN (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004'
);

-- Step 2: Fshi pagesat demo të lidhura me pronat demo
DELETE FROM public.payments
WHERE user_id IN (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004'
);

-- Step 3: Fshi agjencitë demo
DELETE FROM public.agencies
WHERE owner_user_id IN (
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000004'
);

-- Step 4: Fshi profilet demo (por JO admin-in!)
DELETE FROM public.profiles
WHERE id IN (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004'
);

-- Step 5: (Opsionale) Fshi eventet demo nga payment_events
DELETE FROM public.payment_events
WHERE user_id IN (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004'
);

-- Step 6: Konfirmo se ç'mbeti
SELECT COUNT(*) AS prona_mbetur FROM public.properties;
SELECT COUNT(*) AS perdorues_mbetur FROM public.profiles;
SELECT COUNT(*) AS agjenci_mbetur FROM public.agencies;
