-- ==============================================================================
-- PronaX Kosovo Real Estate Marketplace
-- Migration: Update Administrator Email to pronaxestate@outlook.com
-- ==============================================================================

-- 1. Përditëso trigger-in e regjistrimit të përdoruesve të rinj
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
            WHEN LOWER(NEW.email) = 'pronaxestate@outlook.com' THEN 'admin'::user_role
            ELSE 'user'::user_role
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = CASE
            WHEN LOWER(EXCLUDED.email) = 'pronaxestate@outlook.com' THEN 'admin'::user_role
            ELSE public.profiles.role
        END;
    RETURN NEW;
END;
$$;

-- 2. Përditëso profilin ekzistues të administratorit nëse ekziston
UPDATE public.profiles
SET email = 'pronaxestate@outlook.com', role = 'admin'
WHERE email = 'pronaxestate@gmail.com';

-- 3. Përditëso konfigurimet e platformës (site_settings)
UPDATE public.site_settings
SET value = 'pronaxestate@outlook.com'
WHERE key IN ('contact_email', 'admin_email');
