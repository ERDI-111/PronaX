# PronaX — Kosovo Real Estate Marketplace
## Platformë Profesionale e Patundshmërive për Kosovën

> **Prona që kërkon. Shtëpia që meriton.**

---

## 📋 Gjendja e Projektit

### ✅ Faza 1–13 — KOMPLETUAR
Shih [PronaX-Progress.md](../brain/PronaX-Progress.md) për detaje të plota.

---

## 🚀 Filloni Projektin

### Kërkesat
- Node.js 20+
- npm 10+
- Llogari Supabase (falas: supabase.com)
- Çelësa API: Google Maps, Resend, Payment Provider

### Instalimi

```bash
# 1. Klono ose shpako projektin
cd C:\Users\erdis\pronax

# 2. Instalo varësitë
npm install

# 3. Konfiguro variablat e mjedisit
cp .env.example .env.local
# Plotëso .env.local me kredencialet tuaja

# 4. Nis serverin e zhvillimit
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Konfigurimi i Variablave të Mjedisit

Kopjo `.env.example` → `.env.local` dhe plotëso:

```env
# Supabase (KËRKOHET për prodhim)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Maps (Opsionale - harta funksionon edhe pa të)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key

# Email - Resend (Opsionale - emailet simulohen pa të)
RESEND_API_KEY=re_your_key
EMAIL_FROM=PronaX <noreply@pronax-ks.com>

# Pagesa (sandbox aktiv automatikisht)
PAYMENT_PROVIDER=sandbox
PAYSERA_PROJECT_ID=
PAYSERA_SIGN_PASSWORD=
SANDBOX_PAYMENT_SECRET=pronax-sandbox-secret

# Siguria
CRON_SECRET=your-32-char-min-secret
```

---

## 🗄️ Konfigurimi i Supabase

### Hapi 1: Krijo Projektin
1. Shko te [supabase.com](https://supabase.com)
2. Krijo llogari → New Project
3. Kopjo URL dhe çelësat API

### Hapi 2: Ekzekuto Migrimet (me radhë!)

```sql
-- Në Supabase SQL Editor:
-- 1. FAZA 1 - Skema kryesore (rrekuisit)
-- Kopjo: supabase/migrations/20261109_phase1_foundation.sql

-- 2. FAZA 7 - Pagesat
-- Kopjo: supabase/migrations/20261109_phase7_payments.sql

-- 3. FAZA 8 - Skadimet
-- Kopjo: supabase/migrations/20261109_phase8_expiration_renewal.sql
```

### Hapi 3: Konfiguro Storage
```
Supabase → Storage → New Bucket:
- Emri: property-images
- Public: Po
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/webp
```

### Hapi 4: Konfiguro Auth
```
Supabase → Auth → Settings:
- Site URL: https://pronax-ks.com
- Redirect URLs: https://pronax-ks.com/**
- Email confirmation: Po
```

### Hapi 5: Krijo Administratorin
```sql
-- Pas regjistrimit të pronaxestate@outlook.com:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'pronaxestate@outlook.com';
```

---

## 💳 Sistemi i Pagesave

### Sandbox (Testim - i aktivizuar automatikisht)
- Nis shërbimin: `PAYMENT_PROVIDER=sandbox`
- Shko te `/pagesa/[propertyId]` → kliko "Paguaj 7 €"
- Do ridrejtohet te `/pagesa/sandbox-checkout`
- Simulon pagesë të suksesshme/dështuar

### Paysera (Prodhim)
1. Regjistrohu te [paysera.com](https://paysera.com) si tregtar
2. Prit aprovimin e llogarisë tregtare
3. Plotëso në `.env.local`:
   ```env
   PAYMENT_PROVIDER=paysera
   PAYSERA_PROJECT_ID=your-project-id
   PAYSERA_SIGN_PASSWORD=your-sign-password
   ```

### Kosovo Bank Virtual POS
1. Kontakto ProCredit Bank ose NLB Kosova
2. Apliko për Virtual POS Merchant
3. Prit aprovimin
4. Plotëso kredencialet e bankës

---

## 📧 Sistemi i Emaileve (Resend)

1. Regjistrohu te [resend.com](https://resend.com)
2. Krijo API Key
3. Verifiko domain: `pronax-ks.com`
4. Konfigurim DNS (SPF, DKIM, DMARC)
5. Plotëso `RESEND_API_KEY` në `.env.local`

**Pa Resend:** emailet simulohen në konsolë (dev mode)

---

## 🗺️ Google Maps

1. Shko te [Google Cloud Console](https://console.cloud.google.com)
2. Krijo projekt → aktivizo APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Krijo API Key me kufizime domain
4. Plotëso `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

**Pa Maps API:** trego placeholder me link Google Maps

---

## 🔒 Siguria

- ✅ Supabase Row Level Security (RLS) aktiv
- ✅ Server-side payment verification
- ✅ Idempotency keys për pagesat
- ✅ Webhook signature validation
- ✅ Rate limiting
- ✅ Input sanitization (SecuritySanitizer)
- ✅ Middleware auth guards
- ✅ Admin role verification

**Asnjëherë mos:**
- Vë çelësa API në kod frontend
- Commit `.env.local` në Git
- Aktivizo pronë nga frontend pa verifikuar pagesën

---

## 📱 Faqet e Aplikacionit

| URL | Përshkrimi |
|-----|-----------|
| `/` | Faqja kryesore |
| `/prona` | Kërkim i pronave me filtra |
| `/prona/[id]` | Detajet e pronës |
| `/harta` | Hartë interaktive |
| `/agjencite` | Lista e agjencive |
| `/agjencite/[slug]` | Profili i agjencisë |
| `/publiko` | Magjistar i publikimit (8 hapa) |
| `/pagesa/[propertyId]` | Pagesa 7 € |
| `/pagesa/sukses` | Konfirmim pagese |
| `/pagesa/deshtuar` | Pagesa dështoi |
| `/dashboard/pronat` | Pronat e mia |
| `/dashboard/favoritet` | Prona të ruajtura |
| `/dashboard/mesazhet` | Mesazhet |
| `/dashboard/pagesat` | Historia e pagesave |
| `/admin/dashboard` | Paneli i Administratorit |
| `/admin/email-preview` | Parapamja e emaileve |
| `/admin/skadimet` | Menaxhimi i skadimeve |
| `/admin/pagesat` | Raporti financiar |
| `/admin/system-health` | Gjendja e sistemit |
| `/kycu` | Kyçja |
| `/regjistrohu` | Regjistrimi |
| `/fjalekalimi-harruar` | Fjalëkalim i harruar |
| `/rreth-nesh` | Rreth nesh |
| `/kontakti` | Kontakti |
| `/faq` | Pyetjet e shpeshta |
| `/kushtet-e-perdorimit` | Kushtet ligjore |
| `/politika-e-privatesise` | Politika e privatësisë |
| `/politika-e-cookies` | Cookies |
| `/politika-e-pagesave` | Politika e pagesave |
| `/politika-e-rimbursimit` | Rimbursimi |
| `/rregullat-e-publikimit` | Rregullat |

---

## 🏗️ Arkitektura

```
pronax/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (server-side)
│   │   ├── payments/      # Pagesa, webhooks, verifikimi
│   │   ├── properties/    # CRUD pronave
│   │   ├── notifications/ # Njoftimet
│   │   ├── cron/          # Skadimet automatike
│   │   └── admin/         # Admin API
│   ├── admin/             # Paneli i Administratorit
│   ├── dashboard/         # Paneli i Përdoruesit
│   ├── prona/             # Kërkim + Detaje
│   ├── pagesa/            # Flow pageses
│   └── ...faqe të tjera
├── components/            # Komponentët e ripërdorshëm
├── lib/
│   ├── email/             # Shabllonet + shërbimi Resend
│   ├── expiration/        # Sistemi i skadimeve 30-ditore
│   ├── locations/         # 38 komunat e Kosovës
│   ├── notifications/     # Njoftimet in-app
│   ├── payments/          # Adapters: Paysera, Kosovo POS, Sandbox
│   ├── security/          # Rate limiter, sanitizer
│   ├── supabase/          # Client + Server clients
│   └── theme/             # Dark/Light mode
├── supabase/migrations/   # SQL migrimet
│   ├── 20261109_phase1_foundation.sql      # Skema kryesore
│   ├── 20261109_phase7_payments.sql        # Pagesat
│   └── 20261109_phase8_expiration_renewal.sql
├── middleware.ts          # Auth guards
├── .env.example           # Template i variablave
└── vercel.json            # Konfigurim Vercel
```

---

## 🚀 Deployment në Vercel

```bash
# 1. Instalo Vercel CLI
npm i -g vercel

# 2. Lidhu me Vercel
vercel login

# 3. Deployo
vercel --prod

# 4. Konfigurime në Vercel Dashboard:
# Settings → Environment Variables
# Shto të gjitha variablat nga .env.example
```

---

## 🌐 Konfigurim DNS (pronax-ks.com)

```
Type  Name    Value
A     @       76.76.21.21 (Vercel IP)
CNAME www     cname.vercel-dns.com
TXT   @       v=spf1 include:amazonses.com ~all
CNAME resend  (nga Resend dashboard)
```

---

## 📊 Sistemi i Pagesave 7 €

### Workflow i plotë:
1. Pronari plotëson magjistarin 8-hapësh
2. Prona ruhet me status `pending_payment`
3. Hap faqen `/pagesa/[propertyId]`
4. Server krijon transaction me `idempotency_key`
5. Ridrejtohet te ofruesi i pagesave
6. Ofruesi dërgon **webhook server-to-server**
7. Server verifikon nënshkrimin e webhook
8. Server kontrollon shumën (700 EUR cents = 7.00 €)
9. Server nuk procceson të njëjtin `idempotency_key` dy herë
10. Prona kalon te status `pending_moderation`
11. Administratori miraton → `published`
12. Publikimet skadojnë pas 30 ditësh automatikisht
13. Rinovimi kërkon pagesë tjetër manuale prej 7 €

### Statuset e pagesës:
- `pending` → `processing` → `successful` → Prona aktive
- `pending` → `failed` → Prona mbetet `pending_payment`
- `successful` → `refunded` → Admin e rimbursoj

---

## 📌 Shënimet e Rëndësishme

> ⚠️ **Pagesa reale** kërkon llogari tregtare të aprovuar tek ofruesi.
> Sandbox mode funksionon gjithmonë pa aprovim.

> ⚠️ **Google Maps** mund të ketë kosto sipas përdorimit.
> Harta funksionon edhe pa API key (placeholder me link Google Maps).

> ⚠️ **Resend** kërkon verifikimin e domain-it për dërgimin real.
> Pa Resend, emailet simulohen në console logs.

> ✅ **Supabase** tier falas mbulon deri 500MB database dhe 2GB storage.
> I mjaftueshëm për fillimin e platformës.

---

## 📞 Kontakti i Administratorit

- Email: pronaxestate@outlook.com
- Domain: pronax-ks.com
- Vend: Republika e Kosovës

---

*PronaX — Ndërtuar me Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase*
