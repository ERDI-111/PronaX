# PronaX – Udhëzuesi i Plotë i Vendosjes në Prodhim (Production Deployment Guide)

Ky dokument është udhëzuesi zyrtar i prodhimit për platformën e pasurive të paluajtshme **PronaX** ([pronax-ks.com](https://pronax-ks.com)). Ai përshkruan arkitekturën, konfigurimin e të gjitha shërbimeve të jashtme, sigurinë dhe procedurat e lëshimit live.

---

## 1. Regjistri i Shërbimeve të Jashtme (External Services Matrix)

| Shërbimi | Qëllimi | A kërkon Regjistrim / Miratim? | Niveli i Pagesës |
|---|---|---|---|
| **Vercel** | Hosting i Next.js, Edge Functions & Cron Jobs | Po (Regjistrim llogarie me GitHub/GitLab) | Falas (Hobby) ose Pro (20\$/muaj) |
| **Supabase** | Baza e të dhënave PostgreSQL, Autentikimi & Ruajtja e Fotove (Storage) | Po (Krijim projekti në supabase.com) | Falas (Free Tier) ose Pro (25\$/muaj) |
| **Paysera** | Modern Checkout për kartela Visa/Mastercard dhe llogari Paysera | **Po (Kërkon miratim të Llogarisë Tregtare - Merchant Account)** | Komision për transaksion (~1.2% - 2.5%) |
| **ProCredit / NLB Virtual POS** | Gateway bankar vendor në Kosovë (3D Secure 2.0) | **Po (Kontratë zyrtare tregtare me bankën në Kosovë)** | Tarifë mujore terminali + komision ndërmjetësimi |
| **Google Maps Platform** | Harta interaktive, Places autocomplete & Geocoding | Po (Google Cloud Console + faturim me kartelë) | 200\$ kredi mujore falas nga Google |
| **Resend** | Dërgimi i 12 shablloneve të emaileve transaksionale | Po (resend.com + verifikim i domenit me DNS) | 3,000 emaile/muaj falas |
| **Domeni pronax-ks.com** | Emri zyrtar i domenit në Kosovë | Po (Regjistrim te regjistrues të akredituar) | Vjetor |

> [!IMPORTANT]
> **Rregull e rreptë sigurie:** Asnjë integrim (pagesa, harta, email) nuk duhet të pretendohet se është "live" derisa të jetë testuar me çelësa realë të aprovuar. Deri atëherë, sistemi përdor adapterin vendor **Sandbox** me mbrojtje HMAC për testim të sigurt.

---

## 2. Hapat e Vendosjes në Vercel (Step-by-Step)

### Hapi 1: Lidhja e Repository në Vercel
1. Krijoni një repository në GitHub me kodin nga dosja `C:\Users\erdis\pronax`.
2. Hyni në [vercel.com](https://vercel.com) dhe zgjidhni **"Add New Project"**.
3. Importoni repository-n tuaj të PronaX.

### Hapi 2: Konfigurimi i Variablave të Mjedisit (Environment Variables)
Në panelin e Vercel (Project Settings → Environment Variables), shtoni variablat nga `.env.example`:

```env
# Aplikacioni
NEXT_PUBLIC_APP_URL=https://pronax-ks.com
NODE_ENV=production

# Pagesat (Faza 7)
PAYMENT_PROVIDER=sandbox  # Ndryshojeni në 'paysera' ose 'procredit_pos' pas miratimit tregtar
PAYMENT_PROJECT_ID=numri_i_projektit_tuaj
PAYMENT_API_SECRET=fjalekalimi_i_nenshkrimit
PAYMENT_WEBHOOK_SECRET=sekreti_unik_i_webhook_tuaj
PAYSERA_TEST_MODE=0

# Rregullat e Biznesit (3 Planet e Publikimit)
# Free: 0.00 EUR (3 ditë), Weekly: 2.99 EUR (7 ditë), Monthly: 9.99 EUR (30 ditë)
REQUIRE_ADMIN_MODERATION=true

# Siguria e Cron-it (Faza 8)
CRON_SECRET=gjeneroni_nje_celes_te_sigurt_64_karaktere

# Supabase (Baza e të Dhënave & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://projekti-juaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=celes_publik_anon
SUPABASE_SERVICE_ROLE_KEY=celes_sekret_service_role

# Google Maps / OpenStreetMap Leaflet
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=celes_i_google_maps_opsional

# Emailet (Resend - Faza 9 & 2FA OTP)
RESEND_API_KEY=re_celes_juaj_nga_resend
EMAIL_FROM=PronaX Kosovë <njoftime@pronax-ks.com>
ADMIN_NOTIFICATION_EMAIL=pronaxestate@outlook.com
```

### Hapi 3: Lidhja e Domenit pronax-ks.com
1. Te Vercel → Settings → Domains: Shtoni `pronax-ks.com` dhe `www.pronax-ks.com`.
2. Në panelin e menaxhimit të DNS së domenit tuaj, vendosni:
   * **Për root (`pronax-ks.com`)**: `A Record` që drejton te `76.76.21.21`.
   * **Për sub-domen (`www`)**: `CNAME Record` që drejton te `cname.vercel-dns.com`.
3. Vercel gjeneron automatikisht certifikatën **SSL Let's Encrypt (HTTPS 256-bit)** brenda pak minutash.

---

## 3. Ekzekutimi i Migrimeve në Supabase (PostgreSQL)

Hapni panelin e projektit në Supabase (SQL Editor) dhe ekzekutoni skriptat me radhë:
1. Skripta Bazë e Pagesave: [`supabase/migrations/20261109_phase7_payments.sql`](supabase/migrations/20261109_phase7_payments.sql)
2. Skripta e Skadimeve: [`supabase/migrations/20261109_phase8_expiration_renewal.sql`](supabase/migrations/20261109_phase8_expiration_renewal.sql)
3. Përditësimi i Email-it Admin: [`supabase/migrations/20261111_update_admin_email.sql`](supabase/migrations/20261111_update_admin_email.sql)
4. Sistemi 3-Planësh i Çmimeve: [`supabase/migrations/20261111_payment_plans.sql`](supabase/migrations/20261111_payment_plans.sql)
5. Verifikimi me Kod 6-Shifror (2FA): [`supabase/migrations/20261111_auth_verification.sql`](supabase/migrations/20261111_auth_verification.sql)
6. *(Opsionale në Prodhim)* Pastrimi i të Dhënave Demo: [`supabase/migrations/20261111_remove_demo_data.sql`](supabase/migrations/20261111_remove_demo_data.sql)

Kjo krijon të gjitha tabelat (`properties`, `payments`, `payment_events`, `listing_renewals`, `notifications`, `site_settings`, `auth_verification_codes`), indeksin e shpejtë të skadimit dhe politikat Row Level Security (RLS).

---

## 4. Konfigurimi i Verifikimit të Email-it në Resend (DNS)

Për të garantuar që faturat digjitale, kodet 6-shifrore të verifikimit (2FA) dhe njoftimet e skadimit mbërrijnë në Inbox (dhe jo në Spam):
1. Hyni në [resend.com/domains](https://resend.com/domains) dhe shtoni `pronax-ks.com`.
2. Shtoni rekordet e kërkuara në DNS të domenit tuaj:
   * **SPF**: `TXT` me vlerë `v=spf1 include:resend.com ~all`
   * **DKIM**: `CNAME` me çelësin unik të gjeneruar nga Resend
   * **DMARC**: `TXT` me emër `_dmarc.pronax-ks.com` dhe vlerë `v=DMARC1; p=none;`

---

## 5. Kufizimi i Sigurisë së Google Maps API

Në Google Cloud Console:
1. Zgjidhni çelësin tuaj `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
2. Nën **Application restrictions**, zgjidhni **Websites (HTTP referrers)**.
3. Vendosni vetëm domenet tuaja zyrtare:
   * `https://pronax-ks.com/*`
   * `https://www.pronax-ks.com/*`
   * `http://localhost:3000/*` (vetëm për zhvillim lokal)
4. Nën **API restrictions**, kufizoni qasjen vetëm në:
   * *Maps JavaScript API*
   * *Places API (New)*
   * *Geocoding API*

---

## 6. Verifikimi Automatik i Skadimit 30-Ditor (Cron)

Sistemi vjen me skeduluesin e konfiguruar në [`vercel.json`](vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/cron/check-expirations",
      "schedule": "0 0 * * *"
    }
  ]
}
```
Vercel do të thërrasë çdo mesnatë në orën 00:00 UTC endpoint-in e verifikimit të skadimeve, duke dërguar njoftimet paralajmëruese 3-ditore, 1-ditore dhe duke hequr pronat e skaduara nga harta dhe kërkimi publik.

---

## 7. Strategjia e Rezervimit (Backup Strategy)

1. **Baza e të dhënave Supabase**: Aktivizoni Daily Automated Backups me periudhë ruajtjeje 7-ditore (ose 30-ditore në Pro Tier).
2. **Eksportimi Manual Periodik**: Administratori mund të eksportojë të dhënat e plota financiare dhe të pronave në format CSV nga Paneli Financiar [`/admin/pagesat`](/admin/pagesat).
3. **Repository Git**: Çdo ndryshim kodi versionohet dhe ruhet i paprekshëm me tag-e të lëshimit (`git tag v1.0.0`).
