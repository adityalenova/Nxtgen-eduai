# NxtGen Learning

A React/Vite learning workspace with public Supabase accounts, private per-user records, and a local SQLite development fallback.

## Start the complete local preview

Requires Node 22.13 or newer (Node 24 recommended).

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:5173. This starts Vite and the API on port 3001. Without Supabase environment values, the app uses its local SQLite account system for development.

## Public accounts with Supabase

Create a Supabase project, open its SQL editor, and run `supabase/migrations/0002_cloud_accounts.sql`. Then copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`. The two key values use the project's public anon/publishable key; never put a service-role key in a `VITE_` variable.

In Supabase Authentication → URL Configuration, set the Site URL to the public HTTPS origin and add `<public-origin>/auth` to Redirect URLs. Add `http://127.0.0.1:5173/auth` while developing. These URLs are required for email confirmation and password recovery.

Supabase Auth stores password credentials and issues persistent sessions. Public profile and learning tables reference `auth.users`; row-level security limits every read and write to the signed-in user. The browser cannot award arbitrary progress points, and no service-role credential is used. The Node service independently verifies Supabase bearer tokens before serving AI, voice, and school routes.

When the four Supabase variables are absent, the local preview uses SQLite at `data/nxtgen.sqlite`. Local passwords are salted and hashed with scrypt, sessions use random HttpOnly cookies, and private queries remain scoped to the authenticated user. This fallback is intended for development on one computer.

## Public deployment

`render.yaml` defines a Render web service that builds the Vite app and serves both the site and API from one HTTPS origin. Connect this repository as a Render Blueprint, add the Supabase values and provider keys when prompted, then add the resulting Render URL to the Supabase URL Configuration described above. Set `APP_ORIGINS` only if the browser UI and Node API use different origins.

The core account, profile, workspace record, progress, and timer data persist in Supabase. Current study-group and generated-audio storage uses the Node service's local disk; attach a persistent disk or move those features to managed storage before relying on them across server replacements.

## Installable app

NxtGen includes a web app manifest, NxtGen-branded 192px and 512px icons, mobile theme metadata, and an offline application shell. On a production HTTPS deployment, supported browsers can install it from their browser menu and open it in a standalone window. API requests are never cached by the service worker.

## Connected AI and voice

Set GEMINI_API_KEY and ELEVENLABS_API_KEY in the server-only `.env.local` using `.env.example` as a template. Restart the API after changes. Gemini powers educational generation and image transcription; ElevenLabs powers MP3 speech and uploaded/recorded audio transcription. Resend is not used. Credentials never enter the client bundle.

The current configured Gemini model is gemini-3.6-flash; it passed a live structured-generation check. Temporary 502/503/504 responses retry twice. Voice output uses eleven_multilingual_v2 and transcription uses scribe_v1. Generated MP3s are cached per user under `data/audio` and served through an authenticated owner-checked endpoint. Account/provider quotas still apply.

Manual sources, flashcards, recall quizzes, maps, timetable, group communications, focus sessions and progress work without AI. AI planning, generation, transcription and neural speech require their respective service. No fake AI responses are substituted.

## Dashboard

40 individually addressable routes cover study, planning, teacher, communications and growth tools. See `PRD-coverage.md` for exact implemented behavior and remaining production services.

- Private sources, PDF/text import, grounded AI Q&A, Socratic tutoring, editable maps, spaced review cards, audio, summaries, formulas, comparison tables, photo transcription, voice capture.
- Study plans, timetable slots, homework, recall and AI MCQ practice, feedback, viva, reference-overlap review, focus timer, actual mastery reports.
- Lesson plans, worksheets, lab guides, resource library, class calendar, manually entered class analytics, report comments.
- Invitation-only study groups, shared announcements with read confirmation, event RSVP, meeting-slot reservation, circulars, achievements and privacy-aware class leaderboards. Updates poll every 15 seconds. No external messages are sent.
- Private fee reminders, skill planning, portfolio records, earned progress badges and editable profiles.

## Verification

```sh
pnpm test
pnpm build
node tests/browser-check.mjs
```

Browser checks use the installed Windows Edge executable; adjust the executable path for another OS. Test accounts are created only in the local preview. API tests use a separate in-memory database.

## Media and directory

The newly added homepage videos have been removed. Three homepage feature illustrations use matching rectangular proportions. Rotating white quote cards use locally bundled public-domain portraits; source links and credits appear on each card. See `public/portraits/credits.json` and `MEDIA-CREDITS.md`.

The searchable integrations directory contains 22 tools with bundled Simple Icons marks, category filters and a local shortlist. Gemini and ElevenLabs are connected services; other tools link to their official sites. The directory lists the real runtime stack.
