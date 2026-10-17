# Bloom & Beyond — Custom Bouquet Landing Page & Online Ordering System

A complete, production-oriented ordering platform for a small flower & book bouquet business that
receives customers from a Facebook page.

- **Storefront** — premium, mobile-first, romantic design with a live bouquet preview.
- **7-step customizer** — flowers, books & gifts, wrapping, note, delivery, special requests, review.
- **Server-validated pricing** — the price shown is recalculated on the server from the trusted
  catalog before an order is accepted.
- **Orders stored on Netlify** — Netlify Blobs (inside your Netlify account). No external database,
  no connection strings, no manual table setup: the data store is created and seeded automatically.
- **Notifications** — business + customer e-mails (Resend) and WhatsApp alerts (Meta Cloud API),
  with honest status reporting and one-click retry.
- **Protected admin dashboard** at `/admin` — orders, search/filters, CSV export, catalog & price
  editing, delivery rules, notification retry, password change.
- **Facebook-ready** — Open Graph preview image, optional Facebook Pixel, campaign parameters
  (fbclid/utm) stored with each order, works inside the Facebook in-app browser.

---

## 1. Quick start (local)

```bash
npm install
npm run dev          # = netlify dev  →  http://localhost:8888
```

`netlify dev` runs the Vite frontend **and** the Netlify Functions together, so the function API
(`/.netlify/functions/*`) works locally and the data is stored in a local `.netlify/blobs` folder. On the first request the catalog
(flowers, packages, wrapping, delivery options and business settings) is seeded automatically.

> **Important:** the Netlify CLI resolves the functions folder from the git root. If
> `/.netlify/functions/catalog` returns **404** in `netlify dev`, run `git init` in this folder
> once (the repository is needed for Option A below anyway), then restart `netlify dev`.

Other commands:

```bash
npm run build        # production build into dist/
npm run typecheck    # TypeScript check (frontend + functions + shared code)
node scripts/generate-og.mjs   # regenerate public/og-image.png (Facebook share image)
```

## 2. Deploy to Netlify (5 minutes)

**Option A — from GitHub (recommended, fully automated)**

1. Push this folder to a GitHub repository.
2. In [app.netlify.com](https://app.netlify.com) → *Add new site* → *Import an existing project*.
3. Netlify reads `netlify.toml` automatically — build command `npm run build`, publish `dist`,
   functions `netlify/functions`. Nothing else to configure.
4. Open your site URL — the shop works immediately (the catalog seeds itself on first visit).

**Option B — Netlify CLI**

```bash
netlify init          # link/create the site
netlify deploy --prod # build + upload
```

**Option C — drag & drop:** build locally (`npm run build`) and drop the `dist` folder on Netlify,
then add the site's functions via Option A/B (functions cannot be uploaded by drag & drop alone).

After the first deploy, set the site URL in the admin dashboard (*Settings → Site URL*) so links in
e-mails point at the right domain.

## 3. Where the data lives (and why it is automated)

| Data | Store | Notes |
| --- | --- | --- |
| Catalog (flowers, prices, packages, wrapping, delivery, settings) | Netlify Blobs → `bloom-data` (`catalog:v1`) | Seeded from `shared/catalog.ts` on the first request, then edited in the dashboard. |
| Orders + price breakdown + customer details | Netlify Blobs → `bloom-data` (`order:<id>`) | Plus a fast index (`index:orders`) and duplicate-protection keys. |
| Admin sessions & password | Netlify Blobs → `bloom-data` | Never exposed to the browser. |
| Inspiration photos | Netlify Blobs → `bloom-photos` (private) | Only readable through the authenticated admin route. |

Nothing needs to be created by hand, there is no SQL migration step and no third-party database to
sign up for. All reads/writes happen inside Netlify Functions — the service-role credentials never
reach the browser, and the storefront only ever reads the public catalog.

> Want a relational database instead? The data layer is isolated in `netlify/functions/_lib/store.ts`
> — swap that one file for a Supabase/Postgres implementation and nothing else changes.

## 4. Environment variables

Copy `.env.example` → `.env` for local work, and set the real values in **Netlify → Site
configuration → Environment variables** for production.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | recommended | Dashboard password. If unset, the default `q` is seeded — change it in *Settings* (stored privately in Blobs). |
| `RESEND_API_KEY` | optional | Transactional e-mails (get a key at resend.com). |
| `RESEND_FROM` | optional | Sender, e.g. `Bloom & Beyond <orders@yourdomain.com>` (the domain must be verified in Resend). |
| `BUSINESS_EMAIL` | optional | Where order notifications go (falls back to the dashboard setting). |
| `WHATSAPP_ACCESS_TOKEN` | optional | Meta permanent token (Business Suite → WhatsApp → API setup). |
| `WHATSAPP_PHONE_NUMBER_ID` | optional | The WhatsApp Business phone number id. |
| `WHATSAPP_MODE` | optional | `template` (production) or `text` (testing inside a 24h window). |
| `WHATSAPP_TEMPLATE_NAME` | optional | Approved utility template, default `new_bouquet_order`. |
| `VITE_FACEBOOK_PIXEL_ID` | optional | Enables the Facebook Pixel + Purchase conversion. |
| `VITE_SITE_URL` | optional | Canonical site URL used in links. |

**If a service is not configured, the shop still works**: the order is saved first, the missing
channel is reported as `skipped` (with the exact reason), and the dashboard offers a *Retry*
button once you add the credentials. Nothing is ever claimed as "sent" unless the provider
accepted it.

## 5. WhatsApp setup (official Cloud API)

1. Create a Meta app → add the **WhatsApp** product → copy the *Phone number ID* and generate a
   *permanent access token*.
2. Set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_MODE=template`.
3. In WhatsApp Manager create an **utility** template named `new_bouquet_order` whose body starts
   with `{{1}}` (order id) and continues with up to four more variables (customer, phone, bouquet,
   total) — that matches what the function sends. Submit it for review.
4. Set the shop's own number in the dashboard (*Settings → WhatsApp number*): the alert is sent
   there.

Meta only allows a business to *start* a conversation with an approved template, which is why the
default mode is `template`. Use `text` mode only for testing with your own number inside an open
24-hour window.

## 6. E-mail setup (Resend)

1. Create an API key at resend.com → set `RESEND_API_KEY`.
2. Verify your sending domain → set `RESEND_FROM="Bloom & Beyond <orders@yourdomain.com>"`.
3. Set `BUSINESS_EMAIL` (or the notification e-mail in the dashboard).

Both the shop notification (with an "open in dashboard" link) and the customer confirmation are
sent; failures are stored on the order and can be retried.

## 7. Facebook integration

- The share preview uses `public/og-image.png` (1200×630) — regenerate or replace it any time.
- Point your Facebook page **Order Now** button at: `https://<your-site>.netlify.app/#customize`
- Optional Pixel: set `VITE_FACEBOOK_PIXEL_ID`. The `Purchase` event fires **only** after the order
  was actually saved and only if the customer ticked the analytics consent box.
- `fbclid` / `utm_*` parameters are captured and stored with each order, so you can see which ad
  produced which sale in the dashboard export.

## 8. Running the business (admin)

Open `https://<your-site>.netlify.app/admin`.

- **Orders** — search by ID/name/phone, filter by status/date, open an order to see the full
  bouquet, the customer's words, the inspiration photo, payment status and notifications; change
  status (Pending → … → Delivered / Cancelled), add private notes, retry notifications, export CSV.
- **Shop & products** — edit flower names, colours, prices and availability; edit the four
  ready-made packages; manage wrapping papers/styles, gifts and accessories, and delivery options.
- **Settings** — business name, contact details, currency, base price, book rules, note fees,
  discount rules, timezone + same-day cutoff, policies, site URL and the dashboard password.

Every save is live immediately for all customers.

## 9. Project structure

```
├── netlify.toml                 # build, functions, headers, scoped SPA redirects
├── index.html                   # meta, Open Graph, fonts
├── public/                      # favicon, og-image.png (generated)
├── scripts/generate-og.mjs      # builds the Facebook share image (no deps)
├── shared/                      # code used by BOTH the browser and the functions
│   ├── types.ts                 # domain model
│   ├── catalog.ts               # default (seed) catalog & settings
│   ├── pricing.ts               # pricing engine, dates, summaries
│   └── validation.ts            # server-side order validation
├── netlify/functions/
│   ├── _lib/                    # store (Netlify Blobs), auth, notify, whatsapp, http
│   ├── catalog.ts               # GET  /.netlify/functions/catalog
│   ├── orders.ts                # POST /.netlify/functions/orders
│   ├── order.ts                 # GET  /.netlify/functions/order?id=
│   ├── upload.ts                # POST /.netlify/functions/upload (inspiration photo)
│   ├── admin-login.ts           # GET/POST sign in + session check
│   ├── admin-logout.ts          # POST sign out
│   ├── admin-orders.ts          # GET  /.netlify/functions/admin-orders
│   ├── admin-order.ts           # GET/PATCH/POST admin-order?id=
│   ├── admin-orders-csv.ts      # GET  /.netlify/functions/admin-orders-csv
│   ├── admin-catalog.ts         # GET/PUT /.netlify/functions/admin-catalog
│   └── admin-photo.ts           # GET  /.netlify/functions/admin-photo?key=
└── src/
    ├── state/BouquetContext.tsx # customizer state + submit flow
    ├── components/              # header, hero, signature bouquet, packages,
    │   ├── customizer/          #   policies, footer, sticky bar, WhatsApp FAB
    │   └── preview/             # layered SVG bouquet renderer + flower art
    └── pages/                   # home, order confirmation, admin (3 tabs)
```

## 10. How an order flows

1. Customer designs the bouquet → the browser calls the shared pricing engine for a live estimate.
2. *Place My Order* → `POST /.netlify/functions/orders` with the **configuration only**.
3. The function validates every field against the live catalog (availability, colours, delivery
   cutoff, consent, photo size) and **recalculates the price itself**.
4. The order is **saved first** (Netlify Blobs) with a unique id like `BB-26-10-15-4537`; duplicate
   submissions are blocked by an idempotency key.
5. E-mail/WhatsApp notifications run and their real results are stored on the order.
6. The customer lands on `/order-success/<id>` with the id, the total and honest notification
   status; the order appears instantly in the dashboard.

## 11. Test checklist (customer journey)

- [ ] Land from Facebook → hero + signature bouquet (5 flowers, 2 books) with a price.
- [ ] Change flower varieties and quantities → total, price and preview update live.
- [ ] Choose wrapping colour/style → preview changes.
- [ ] Add a note (handwritten vs printed) → card preview + fee update.
- [ ] Select delivery (express disabled after the cutoff) → fee and dates update.
- [ ] Upload an inspiration photo (try >3 MB → clear error).
- [ ] Review → place order → order ID shown, order appears in `/admin`.
- [ ] E-mail/WhatsApp status is reported honestly; *Retry notifications* works after adding keys.
- [ ] Edit a flower price in the dashboard → the storefront price changes immediately.

## 12. Troubleshooting

- **`MissingBlobsEnvironmentError` in local dev** — run the site with `netlify dev` (not `vite dev`)
  so the Blobs runtime is available.
- **Functions return 404 in local dev** — `netlify dev` resolves `netlify/functions` from the git
  root, so the folder must be a git repository (`git init`) or a linked project (`netlify link`).
  The storefront itself still loads (Vite serves it), which makes this easy to miss.
- **Orders save but no e-mail** — `RESEND_API_KEY`/`RESEND_FROM` are missing or the domain is not
  verified. The order keeps a `skipped` status with the exact reason in the dashboard.
- **WhatsApp says `failed`** — the template name is not approved, the token is invalid, or you are
  in `text` mode outside a 24-hour window. The API response is stored on the order.
- **Pixel does nothing** — `VITE_FACEBOOK_PIXEL_ID` must be set at build time and the customer must
  tick the analytics consent box (conversion tracking requires it).
- **An unknown URL shows the home page with a 404 status** — intentional: real deep links
  (`/admin`, `/order-success/<id>`) are proper `200` rewrites, while any other unknown URL is
  served as `dist/404.html`, which boots the React app but keeps a real 404 status for search
  engines. The redirects are deliberately not a greedy `/*` rule so `netlify dev` can still proxy
  Vite's module URLs.

## 13. Privacy & security notes

- Only the public catalog reaches the browser — passwords, sessions, tokens and customer orders
  stay server-side.
- Inspiration photos are stored in a private Blobs store and served only through an authenticated
  admin route.
- The dashboard session uses an HttpOnly cookie (7 days) stored in Netlify Blobs.
- Order creation is rate-friendly by design (single function, one write) and never trusts
  client-side prices.
