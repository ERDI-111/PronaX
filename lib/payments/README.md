# PronaX – Arkitektura e Pagesave & Sistemi 3-Planësh (Faza 3)

Ky dokument përmban specifikimin e plotë teknik dhe udhëzimet e konfigurimit për sistemin e pagesave të platformës **PronaX** (Republika e Kosovës).

---

## 1. Rregullat Kryesore të Biznesit (Business Rules)

| Plani   | Çmimi  | Cent EUR | Kohëzgjatja |
|---------|--------|----------|-------------|
| **Falas** (`free`)     | 0.00 € | 0 cent  | 3 ditë  |
| **Javor** (`weekly`)   | 2.99 € | 299 cent | 7 ditë  |
| **Mujor** (`monthly`)  | 9.99 € | 999 cent | 30 ditë |

1. **3 Planet e Publikimit**: Çmimi dhe kohëzgjatja llogariten sipas planit të zgjedhur nga përdoruesi dhe imponohen rreptësisht në server.
2. **Kohëzgjatja sipas Planit**: `expires_at = published_at + INTERVAL '<duration_days> days'`.
3. **Pagesë e Njëhershme**: Asnjë abonim automatik (No recurring charge). Kartela e përdoruesit nuk tarifohet kurrë automatikisht.
4. **Rinovimi Manual**: Pas skadimit, prona hiqet nga kërkimi publik por ruhet në panelin e pronarit. Rinovimi kërkon zgjedhje të re të planit dhe pagesë manuale.
5. **Plani Falas**: Nuk kërkon asnjë pagesë. Aktivizohet direkt pas moderimit.
6. **Verifikim Serverik**: Asnjë pronë nuk aktivizohet nga përgjigjet e thjeshta të frontend-it. Publikimi ndodh vetëm pas verifikimit të webhook-ut nga ofruesi.

---

## 2. Arkitektura Modulare e Pagesave (`PaymentAdapter`)

Platforma mbështet ofrues të shumëfishtë përmes modelit Adapter:

| Ofruesi | Klasa | Protokolli | Statusi i Konfigurimit |
|---|---|---|---|
| **Paysera Modern Checkout** | `PayseraModernAdapter` | API 1.4 me nënshkrim MD5/SHA1 dhe kthim `OK` | I gatshëm (pret Project ID & Secret) |
| **Kosovo Bank Virtual POS** | `KosovoBankPosAdapter` | NestPay / Asseco 3D-Secure 2.0 (ProCredit / NLB) me SHA-512 | I gatshëm (pret Client ID & Store Key) |
| **PronaX Sandbox Simulator** | `SandboxPaymentAdapter` | HMAC-SHA256 me simulim të menjëhershëm në mjedisin lokal | **Aktiv si parazgjedhje (Default)** |

---

## 3. Struktura e Bazës së Dhënave (Supabase / PostgreSQL)

Skriptat e migrimit ndodhen në:
- `supabase/migrations/20261109_phase7_payments.sql` — skema bazë
- `supabase/migrations/20261111_payment_plans.sql` — shtimi i 3 planeve

Tabela `payments` përfshin tani edhe:
- **`plan_id`** (`free` | `weekly` | `monthly`) — plani i zgjedhur
- **`duration_days`** (`3` | `7` | `30`) — kohëzgjatja e planit

Kolona të tjera:
- **`properties`**: Statuset (`draft`, `pending_payment`, `pending_moderation`, `published`, `expired`, `rejected`, `archived`), `published_at`, `expires_at`, `renewal_count`.
- **`payments`**: `id`, `property_id`, `user_id`, `amount_cents` (0/299/999), `currency` (EUR), `plan_id`, `duration_days`, `purpose` (`new_listing` / `renewal`), `provider`, `provider_transaction_id`, `provider_fee_cents`, `status`, `idempotency_key`.
- **`payment_events`**: Regjistri i plotë i auditimit dhe logimi i papërpunuar i të gjitha thirrjeve webhook.
- **`listing_renewals`**: Historiku i plotë i rinovimeve me datat e mëparshme dhe të reja të skadimit.
- **`site_settings`**: Konfigurimi i 3 planeve (çmimi dhe kohëzgjatja per plan), dhe kërkesës së aprovimit nga administratori.
- **Funksioni `check_expired_properties()`**: Ekzekutohet në mënyrë periodike (cron) për të kaluar pronat e skaduara në statusin `expired`.

---

## 4. Rrugët e Implementuara (Routes & Pages)

- **Faqja e Zgjedhjes së Planit**: `/pagesa/[propertyId]` — Zgjedhja e planit (Falas / Javor / Mujor), ofruesit të pagesës, 3D Secure.
- **Simulatori i Testimit**: `/pagesa/sandbox-checkout` — Testim me 1 klikim (sukses / dështim / anulim). Shuma lexohet nga URL (`?amountCents=299|999`).
- **Faqja e Suksesit**: `/pagesa/sukses?paymentId=...` — Verifikim serverik, faturë digjitale, data e skadimit sipas planit.
- **Faqja e Dështimit**: `/pagesa/deshtuar?propertyId=...` — Këshilla për përdoruesin, ruajtja e draftit, mundësi ripërpjekjeje.
- **Paneli i Përdoruesit**: `/dashboard/pagesat` — Lista e transaksioneve, faturat, buton rinovimi.
- **Paneli Financiar Admin**: `/admin/pagesat` — Të ardhurat, tarifat, neto, kërkimi, rimbursimi.

### API Endpoints:
- `POST /api/payments/checkout` — Krijon sesionin e ri të pagesës. Kërkon `planId` (`free`/`weekly`/`monthly`). Plani falas aktivizohet direkt.
- `POST /api/payments/webhook/[provider]` — Verifikon nënshkrimin digjital, zbaton idempotencën, aktivizon pronën.
- `GET /api/payments/verify` — Verifikon statusin e pagesës për klientin.
- `GET /api/payments/history` — Kthen historikun e transaksioneve të përdoruesit.
- `GET /api/admin/payments` — Raporti financiar dhe transaksionet për administratorin.
- `POST /api/admin/payments/refund` — Ekzekuton rimbursimin nga paneli i administratorit.

---

## 5. Si Aktivizohen Pagesat Reale Bankare

Kur të miratohet llogaria tregtare (Merchant Account) me Paysera ose bankat e Kosovës:

1. **Për Paysera**:
   Vendosni në `.env.local`:
   ```env
   PAYMENT_PROVIDER=paysera
   PAYMENT_PROJECT_ID=numri_i_projektit_tuaj
   PAYMENT_API_SECRET=fjalekalimi_i_projektit_tuaj
   PAYSERA_TEST_MODE=0
   ```
2. **Për ProCredit Bank Kosovë**:
   ```env
   PAYMENT_PROVIDER=procredit_pos
   PROCREDIT_POS_CLIENT_ID=client_id_i_leshuar_nga_banka
   PROCREDIT_POS_STORE_KEY=store_key_nga_paneli_pos
   PROCREDIT_POS_GATEWAY_URL=https://vpos.procreditbank-kos.com/fim/est3Dgate
   ```
3. **Për NLB Banka Kosovë**:
   ```env
   PAYMENT_PROVIDER=nlb_pos
   NLB_POS_CLIENT_ID=client_id_nga_nlb
   NLB_POS_STORE_KEY=store_key_nga_nlb
   NLB_POS_GATEWAY_URL=https://pgw.nlbkosovo.com/fim/est3Dgate
   ```
