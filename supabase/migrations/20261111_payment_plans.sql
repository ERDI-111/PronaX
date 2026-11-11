-- =============================================================================
-- PronaX – Migration: Payment Plans (3-Plan Pricing System)
-- Replaces old single-fee (7.00 EUR / 30 days) with 3 flexible plans
-- =============================================================================

-- Step 1: Remove old single-fee settings keys (if they exist)
DELETE FROM public.site_settings
WHERE key IN ('listing_fee_eur', 'listing_duration_days', 'listing_fee_cents');

-- Step 2: Insert new 3-plan pricing settings
INSERT INTO public.site_settings (key, value, description)
VALUES
  ('plan_free_price_eur',       '0.00', 'Tarifa e Planit Falas (EUR)'),
  ('plan_free_duration_days',   '3',    'Kohëzgjatja e Planit Falas (ditë)'),
  ('plan_weekly_price_eur',     '2.99', 'Tarifa e Planit Javor (EUR)'),
  ('plan_weekly_duration_days', '7',    'Kohëzgjatja e Planit Javor (ditë)'),
  ('plan_monthly_price_eur',    '9.99', 'Tarifa e Planit Mujor (EUR)'),
  ('plan_monthly_duration_days','30',   'Kohëzgjatja e Planit Mujor (ditë)')
ON CONFLICT (key) DO UPDATE
  SET value       = EXCLUDED.value,
      description = EXCLUDED.description;

-- Step 3: Add plan_id and duration_days columns to payments table
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS plan_id       TEXT    DEFAULT 'monthly'
                                                 CHECK (plan_id IN ('free', 'weekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30
                                                 CHECK (duration_days IN (3, 7, 30));

-- Step 4: Backfill existing successful payments as 'monthly' (old 700-cent entries → plan 'monthly')
UPDATE public.payments
SET
  plan_id       = 'monthly',
  duration_days = 30
WHERE plan_id IS NULL
   OR plan_id = '';

-- Step 5: Add plan_id + duration_days to listing_renewals if the table exists
ALTER TABLE IF EXISTS public.listing_renewals
  ADD COLUMN IF NOT EXISTS plan_id       TEXT    DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;

-- Step 6: Update listing_renewals backfill
UPDATE public.listing_renewals
SET
  plan_id       = 'monthly',
  duration_days = 30
WHERE plan_id IS NULL
   OR plan_id = '';

-- Step 7: Helpful comment
COMMENT ON COLUMN public.payments.plan_id IS
  'Plan zgjedhur nga përdoruesi: free (3 ditë), weekly (7 ditë), monthly (30 ditë)';

COMMENT ON COLUMN public.payments.duration_days IS
  'Kohëzgjatja e publikimit në ditë, bazuar në planin e zgjedhur';
