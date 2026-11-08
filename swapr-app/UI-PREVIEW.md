# Swapr UI preview

Run `npm.cmd start` from this folder, then press `a` for Android or `w` for web.

The preview starts at Discover. Five tabs connect Discover, My Items, Matches, Chats, and Profile.

Try this flow: Interested in swapping -> Say hello -> Build a swap proposal -> Review proposal -> Accept proposal -> Choose a SwapPoint -> Confirm meetup -> Complete swap -> Leave a review.

Use Profile -> Welcome & account sign-in to inspect onboarding. Profile also links to notifications, settings, and safety pages. My Items lets you add and edit sample listings.

All content is local sample data and resets when the app reloads. Maps, authentication, location, reports, and notifications are UI placeholders. No backend or real account actions are connected. The S mark is a temporary placeholder for Leon.

Brand colors are saved in ../COLOR-PALETTE.txt and src/constants/palette.ts. Downloaded sample photos are bundled in assets/items; see SOURCES.txt for origins.

Navigation uses slide transitions for detail screens and fades for tabs, respecting reduced motion. A branded startup screen probes internet reachability (gstatic generate_204), with a 7-second timeout, retry, and offline continuation. Checks repeat on foreground and every 30 seconds while active. This verifies reachability only, not a Swapr backend; sample pages remain local. Replace the probe with a first-party health endpoint when the backend is connected.

Account entry uses a single email-account sign-in flow, without registration or passwords. The current sample account picker is UI only; real provider authentication and first-sign-in profile creation are not connected.
