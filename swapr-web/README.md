# Swapr web

React marketplace connected to the NestJS API and Supabase PostgreSQL.
The Expo app is separate and is not part of this integration.

## Run locally

Start the backend first:

```sh
cd swapr-backend
npm install
# Set DATABASE_URL in .env using .env.example
npm run db:migrate
npm run dev
```

In another terminal, from the repository root:

```sh
cd swapr-web
npm install
npm run dev
```

Open http://localhost:3000. Browser API requests use `/api` on the web origin. The development web server
forwards these requests to NestJS at http://127.0.0.1:4000.
Override it with `REACT_APP_API_URL` in `.env` (see `.env.example`), then restart
the web server. Use `localhost` consistently rather than mixing it with `127.0.0.1`.

## Try the marketplace

1. Register with an email and a password of at least 8 characters, then log in.
2. Dismiss the welcome message and complete your profile. Middle name is optional.
3. Save your shop settings and add a listing from **My Shop**. Photos accept PNG,
   JPEG or WebP up to 2 MB. Drafts are only visible to their owner.
4. Open a second browser profile or private window and create a buyer account.
5. Browse categories, save a listing, or choose **Chat seller**.
6. Send messages and propose a public meetup with an agreed price.
7. The other participant confirms the meetup. After the in-person exchange, the
   seller chooses **Complete sale**. This reduces stock and updates sales analytics.
8. View private notifications or export the sales summary as CSV.

Listings and sales start empty. Sample product, chat and sales records are not
used. Public listing cards prompt guests to log in before saving or messaging.
Sessions are verified with the backend on refresh; local storage is not an
authentication credential. Logging out revokes the server session.
Chat refreshes every 3 seconds. Subscription emails are stored, but sending
newsletters, password resets, and email verification are not configured.

## Checks

```sh
npm test -- --watchAll=false --runInBand
npm run build
```

Production hosting must serve `index.html` for `/user/*` routes. Configure
`REACT_APP_API_URL` at build time and the backend's `WEB_ORIGIN` to the actual web
origin. Use HTTPS and the same site for web/API so the HttpOnly session cookie works.

Product and profile photos are uploaded to ImgBB through NestJS. The product form
also includes a picker for the existing hosted product photo library. Public URLs
are listed in `src/product-images.json`; the ImgBB key exists only in the backend.

For a production build, route `/api/*` to NestJS and strip the `/api` prefix, or
set `REACT_APP_API_URL` to the deployed API origin before building. The local
`src/setupProxy.js` proxy runs only with `npm run dev`.
