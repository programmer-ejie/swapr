# Swapr backend

NestJS API for `swapr-web`, backed by the connected Supabase PostgreSQL database.

## Local setup

1. Run `npm install` in this directory.
2. Copy `.env.example` to `.env` if `.env` does not already exist.
3. Set `DATABASE_URL` to the Supabase **Connect > Direct > Session pooler** URI,
   replacing its password placeholder. URL-encode special password characters.
4. Run `npm run db:migrate`, then `npm run dev`.

The API runs at `http://localhost:4000`; the web runs at `http://localhost:3000`.
`WEB_ORIGIN` is a comma-separated allowlist of web origins. `.env` is ignored by Git.
The browser receives no database credentials.

Supabase connections use TLS with certificate and hostname verification. The public
CA certificate in `certs/supabase-ca.crt` was obtained from
https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt.
Replace it with the certificate from Supabase Database Settings when Supabase rotates
its CA. The same verified connection settings are used by migrations and the API.
Do not disable certificate verification to fix a connection failure.

## Database

Tables live in the **swapr** schema. In Supabase Table Editor, select that schema;
in SQL Editor, query qualified names such as `select * from swapr.categories`.

| Table                    | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| users                    | Accounts, password hashes, profile and profile photo |
| sessions                 | Hashed session tokens with seven-day expiration      |
| shops                    | Seller shop settings                                 |
| categories               | Marketplace categories                               |
| listings                 | Seller-owned listings, price, stock and photo        |
| favorites                | Saved listings per user                              |
| conversations            | One conversation per buyer and listing               |
| messages                 | Messages restricted to conversation participants     |
| meetups                  | Proposed, confirmed, cancelled and completed meetups |
| notifications            | Private account, message and meetup updates          |
| newsletter_subscriptions | Emails subscribed to future updates                  |
| schema_migrations        | Applied migration versions                           |

`migrations/001_marketplace.sql` creates the schema and seeds categories only.
`npm run db:migrate` applies pending migrations in a transaction with a database lock.
Add a new numbered migration for future changes; do not edit an applied migration.
RLS is enabled, and browser roles have no access. Keep `swapr` out of the Supabase
Data API's exposed schemas: data access goes through NestJS ownership checks.
The database owner connection is privileged, so it must remain server-only.

Authentication is managed by NestJS with scrypt password hashing and revocable,
HttpOnly, SameSite cookies. These accounts appear in `swapr.users`, **not** in the
Supabase Authentication dashboard. Registration uses a user-chosen password; there
is no password email, email verification, or password-reset service configured.

## API

Public endpoints:

- `GET /` ? API response
- `GET /categories` ? categories and live listing counts
- `GET /listings?q=&category=` ? live listings, up to 200 newest matches
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `POST /newsletter` ? persist a subscription (no email delivery configured)

Authenticated endpoints (browser requests must include cookie credentials):

- `GET /auth/me`, `PATCH /profile/:id`
- `GET /shop`, `PUT /shop`, `GET /shop/listings`
- `POST /listings`, `PATCH /listings/:id`, `DELETE /listings/:id` (archive)
- `GET /favorites`, `PUT /favorites/:id`, `DELETE /favorites/:id`
- `GET /conversations`, `POST /conversations`
- `GET /conversations/:id/messages`, `POST /conversations/:id/messages`
- `POST /conversations/:id/meetups`, `PATCH /meetups/:id`
- `GET /notifications`, `PATCH /notifications/read`, `GET /analytics`

Only the other participant can confirm a proposed meetup. Only the seller can
complete a confirmed meetup. Completion records its agreed price and atomically
reduces stock by one; duplicate completion cannot count a sale twice. Payments
happen in person; the API does not process money.

Images are validated PNG/JPEG/WebP uploads, limited to 2 MB each. NestJS uploads
them to ImgBB and stores their hosted URLs in profiles/listings. Set IMGBB_API_KEY
in .env. Private upload receipts and deletion links are held in swapr.images and
never returned to the web. `npm run images:upload` uploads/reuses the web product
photo library and writes public URLs to swapr-web/src/product-images.json. Chat polls every 3 seconds, conversation
summaries every 5 seconds, and notifications every 10 seconds. It is not a WebSocket
or Supabase Realtime implementation.

## Verification

```sh
npm run build
npm run lint
npm test
npm run test:e2e
```

The e2e tests use `.env` and the migrated database. They create unique temporary
accounts, exercise private chat, listing ownership, meetup sales and CORS, then
remove their own test records. They do not send email or create demo users.

## Hosting

Run `npm run build` then `npm run start:prod`. Include `scripts/` and `certs/` when
packaging the backend because the runtime loads database connection options and
Supabase's CA from them. Set `DATABASE_URL`, `PORT`, `WEB_ORIGIN` and
`NODE_ENV=production` on the host. Run migrations as a release step.
Use HTTPS and host the web and API on the same site (for example,
`www.example.com` and `api.example.com`) for the SameSite cookie configuration.
The current rate limiter uses process memory; multiple API replicas require a
shared throttler store. Configure proxy trust to match the actual hosting proxy
before relying on per-client IP limits behind a proxy.
