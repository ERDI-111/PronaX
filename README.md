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

# Kyçja me Google (pa këto, butoni "Vazhdo me Google" tregon se kyçja nuk është aktivizuar)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

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
- Shko te `/pagesa/[propertyId]` → zgjidh njërin nga 3 planet (Falas 0 €, Javor 2.99 €, Mujor 9.99 €)
- Për planet me pagesë, ridrejtohet te `/pagesa/sandbox-checkout`
- Simulon pagesë të suksesshme/dështuar me kartë Visa/Mastercard

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

## Kyçja dhe Regjistrimi me Google

Butonat **"Vazhdo me Google"** (`/kycu`) dhe **"Regjistrohu me Google"** (`/regjistrohu`) përdorin OAuth 2.0 të Google nga serveri (authorization code + PKCE). Herën e parë që dikush kyçet me Google i krijohet llogaria në PronaX; herët e tjera hyn në të njëjtën llogari. Fjalëkalimi i Google nuk kalon kurrë nëpër PronaX.

### Hapi 1: Krijo kredencialet te Google
1. Hap [Google Cloud Console](https://console.cloud.google.com), zgjidh ose krijo një projekt dhe shko te **Google Auth Platform** (në menynë e vjetër: *APIs & Services → OAuth consent screen / Credentials*).
2. **Branding**: emri i aplikacionit `PronaX` dhe email-i i mbështetjes. **Audience**: lloji **External**.
3. **Data Access**: shto vetëm `openid`, `.../auth/userinfo.email` dhe `.../auth/userinfo.profile`.
4. **Audience → Publish app**, që statusi të jetë *In production* dhe kyçja të jetë e hapur për çdo llogari Google. Statusi *Testing* është menduar vetëm për përdoruesit testues të listuar (deri në 100).
5. **Clients → Create Client → Web application**.
6. Te **Authorized JavaScript origins** (opsionale për këtë rrjedhë) shto:
   - `https://pronax.onrender.com`
   - `http://localhost:3000`
7. Te **Authorized redirect URIs** shto (duhet të përputhen shkronjë për shkronjë: `http`/`https`, shkronjat e mëdha e të vogla, pa `/` në fund):
   - `https://pronax.onrender.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
8. Kopjo **Client ID** dhe **Client secret**.

Nëse faqja hapet edhe nga një domen tjetër (p.sh. `https://pronax-ks.com` ose `https://www.pronax-ks.com`), shto edhe atë domen te origins dhe `https://<domeni>/api/auth/callback/google` te redirect URIs.

### Hapi 2: Vendos variablat
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```
- **Lokal:** shkruaji në `.env.local` dhe rinis `npm run dev`.
- **Render:** shërbimi → **Environment** → shto të dy variablat → ruaj dhe bëj deploy.
- `AUTH_SECRET` (opsionale): çelës i veçantë për nënshkrimin e sesionit. Pa të, çelësi nxirret nga `GOOGLE_CLIENT_SECRET`.

### Hapi 3: Kontrollo
Hap `/api/auth/google/status` (p.sh. `https://pronax.onrender.com/api/auth/google/status`). Duhet të tregojë `"configured": true` dhe te `authorizedRedirectUri` adresën e saktë që duhet të jetë regjistruar te Google. Faqja nuk shfaq asnjë sekret. Pastaj kliko "Vazhdo me Google" te `/kycu`.

### Nëse diçka nuk shkon

| Çfarë shihni | Shkaku | Zgjidhja |
|---|---|---|
| Te `/kycu`: "Kyçja me Google nuk është aktivizuar ende..." | Mungon `GOOGLE_CLIENT_ID` ose `GOOGLE_CLIENT_SECRET` | Shto variablat dhe rinis serverin / bëj deploy |
| Te Google: `Error 400: redirect_uri_mismatch` | Adresa e kthimit nuk është regjistruar saktë | Kopjo `authorizedRedirectUri` nga `/api/auth/google/status` te *Authorized redirect URIs* |
| Te Google: `Error 401: invalid_client` | Client ID i gabuar ose i fshirë | Kontrollo `GOOGLE_CLIENT_ID` |
| Te `/kycu`: "Google refuzoi kredencialet e aplikacionit..." | `GOOGLE_CLIENT_SECRET` i gabuar | Kopjo sërish Client secret |
| Te Google: "Access blocked" (`Error 403`) | Zakonisht aplikacioni është ende në *Testing* ose lloji i përdoruesve është *Internal* | Te **Audience** zgjidh *External* dhe kliko **Publish app** (ose shto llogarinë te *Test users*) |
| Te `/kycu`: "Seanca e kyçjes me Google skadoi ose nuk u njoh..." | Kyçja zgjati mbi 10 minuta, ose faqja u hap nga një domen dhe Google ktheu te një tjetër | Kliko përsëri butonin; përdor të njëjtin domen që është regjistruar te Google |

### Testi automatik
```bash
npm run build
node scripts/test-google-oauth.cjs
```
Testi nis serverin e prodhimit dhe kalon gjithë rrjedhën (kyçje, regjistrim, anulim, gabime, mbrojtje) me një zëvendësues lokal të Google, pa llogari Google dhe pa kredenciale. Mos e nis ndërkohë që po përdor faqen lokalisht.

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
| `/pagesa/[propertyId]` | Zgjedhja e Planit & Pagesa |
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

## 📊 Sistemi i 3 Planeve të Publikimit

| Plani | Çmimi | Kohëzgjatja | Pagesa |
|---|---|---|---|
| **Falas** (`free`) | **0.00 €** | **3 ditë** | Pa pagesë (one-time) |
| **Javor** (`weekly`) | **2.99 €** | **7 ditë** | Visa / Mastercard |
| **Mujor** (`monthly`) | **9.99 €** | **30 ditë** | Visa / Mastercard |

### Workflow i plotë:
1. Pronari plotëson magjistarin 8-hapësh
2. Në hapin e fundit zgjedh planin (Falas / Javor / Mujor)
3. Për planin Falas, prona aktivizohet direkt pas moderimit
4. Për planet me pagesë, hapet faqja `/pagesa/[propertyId]`
5. Server krijon transaksionin me `idempotency_key`
6. Ridrejtohet te ofruesi i pagesave (Visa/Mastercard)
7. Ofruesi dërgon **webhook server-to-server**
8. Server verifikon nënshkrimin kriptografik të webhook
9. Server kontrollon shumën sipas planit (299 cent ose 999 cent)
10. Server nuk proceson të njëjtin `idempotency_key` dy herë
11. Prona kalon te status `pending_moderation` (ose `published` në varësi të settings)
12. Administratori miraton → `published`
13. Publikimet skadojnë sipas planit (3 ditë, 7 ditë ose 30 ditë)
14. Rinovimi kërkon zgjedhje të re manuale të planit — **pa debitim automatik**

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
