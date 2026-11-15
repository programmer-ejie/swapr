# Swapr

A hyperlocal item-for-item barter app built with Expo and React Native.

## Run locally

```sh
cd swapr-app
npm install
npm start
```

Press `a` for Android or `w` for web.

The current app is a UI prototype with sample data, local item photos, light/dark themes, discovery filters, trade proposals, chat, and meetup screens. Authentication and backend services are not connected.

See `COLOR-PALETTE.txt` for brand colors and `swapr-app/UI-PREVIEW.md` for the preview flow.

## Web marketplace and backend

The web marketplace now uses NestJS and Supabase PostgreSQL for accounts, profiles,
shops, listings, saved items, chat, meetups, notifications and sales analytics.

Start `swapr-backend` with `npm run db:migrate` and `npm run dev` (port 4000), then
start `swapr-web` with `npm run dev` (port 3000). See their README files for setup.
The Expo app remains a separate prototype.
