# PronaX – Arkitektura e Pagesave & Cikli 30-Ditor (Faza 7)

Ky dokument përmban specifikimin e plotë teknik dhe udhëzimet e konfigurimit për sistemin e pagesave dhe menaxhimin financiar të platformës **PronaX** (Republika e Kosovës).

---

## 1. Rregullat Kryesore të Biznesit (Business Rules)

1. **Tarifa Fikse e Publikimit**: **7.00 €** (700 cent EUR). Çmimi llogaritet dhe imponohet rreptësisht në server, duke injoruar çdo modifikim nga klienti.
2. **Kohëzgjatja e Publikimit**: Saktësisht **30 ditë kalendarike** (`expires_at = published_at + INTERVAL '30 days'`).
3. **Pagesë e Njëhershme**: Asnjë abonim automatik (No recurring charge). Kartela e përdoruesit nuk tarifohet kurrë automatikisht.
4. **Rinovimi Manual (7.00 €)**: Pas skadimit të 30 ditëve, prona hiqet nga kërkimi publik por ruhet në panelin e pronarit. Rinovimi kërkon pagesë të re manuale prej 7.00 € dhe regjistrohet si transaksion i pavarur në tabelën `listing_renewals`.
5. **Verifikim Serverik**: Asnjë pronë nuk aktivizohet nga përgjigjet e thjeshta të frontend-it. Publikimi ndodh vetëm pas verifikimit të nënshkrimit kriptografik të webhook-ut nga ofruesi bankar.

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

Skripta e migrimit ndodhet në:
`supabase/migrations/20261109_phase7_payments.sql`

Ajo përfshin:
- **`properties`**: Statuset (`draft`, `pending_payment`, `pending_moderation`, `published`, `expired`, `rejected`, `archived`), `published_at`, `expires_at`, `renewal_count`.
- **`payments`**: `id`, `property_id`, `user_id`, `amount_cents` (700), `currency` (EUR), `purpose` (`new_listing` / `renewal`), `provider`, `provider_transaction_id`, `provider_fee_cents`, `status`, `idempotency_key`.
- **`payment_events`**: Regjistri i plotë i auditimit dhe logimi i papërpunuar i të gjitha thirrjeve webhook dhe IP të dërguesit.
- **`listing_renewals`**: Historiku i plotë i rinovimeve 30-ditore me datat e mëparshme dhe të reja të skadimit.
- **`site_settings`**: Konfigurimi i çmimit (7.00 €), kohëzgjatjes (30 ditë), dhe kërkesës së aprovimit nga administratori.
- **Funksioni `check_expired_properties()`**: Ekzekutohet në mënyrë periodike (cron) për të kaluar pronat e skaduara në statusin `expired`.

---

## 4. Rrugët e Implementuara (Routes & Pages)

- **Faqja e Checkout-it**: `/pagesa/[propertyId]` (Zgjedhja e ofruesit, përmbledhja €7.00, siguria 3D Secure).
- **Simulatori i Testimit**: `/pagesa/sandbox-checkout` (Testim me 1 klikim i suksesit, dështimit dhe anulimit).
- **Faqja e Suksesit**: `/pagesa/sukses?paymentId=...` (Verifikim serverik, faturë digjitale, data e skadimit 30 ditë).
- **Faqja e Dështimit**: `/pagesa/deshtuar?propertyId=...` (Këshilla për përdoruesin, ruajtja e draftit, mundësi ripërpjekjeje).
- **Paneli i Përdoruesit**: `/dashboard/pagesat` (Lista e transaksioneve të përdoruesit, faturat, buton rinovimi për pronat e skaduara).
- **Paneli Financiar Admin**: `/admin/pagesat` (Të ardhurat bruto, tarifat e vlerësuara të ofruesit, neto, kërkimi, dhe rimbursimi i autorizuar).

### API Endpoints:
- `POST /api/payments/checkout`: Krijon sesionin e ri të pagesës për 7.00 €.
- `POST /api/payments/webhook/[provider]`: Verifikon nënshkrimin digjital, zbaton idempotencën dhe aktivizon pronën.
- `GET /api/payments/verify`: Verifikon statusin e pagesës për klientin.
- `GET /api/payments/history`: Kthen historikun e përdoruesit.
- `GET /api/admin/payments`: Raporti financiar dhe transaksionet për administratorin.
- `POST /api/admin/payments/refund`: Ekzekuton rimbursimin nga paneli i administratorit.

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
