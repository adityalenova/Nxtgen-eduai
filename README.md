# NxtGen Learning

A refinement of the existing React/Vite NxtGen site, with a working local account and learning workspace.

## Start the complete local preview

Requires Node 22.13 or newer (Node 24 recommended).

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:5173. This starts Vite and the API on port 3001. Create an account to open your private dashboard. No demo identity or shared browser-storage profile is used.

## Data and authentication

The local preview uses SQLite at `data/nxtgen.sqlite`. Account passwords are salted and hashed with scrypt; sessions use random tokens in HttpOnly, SameSite cookies, with hashed tokens stored in the database. Every private record query is scoped to the authenticated user. Do not commit the data directory. The API enforces group membership and organizer permissions for shared school records.

This local backend requires a persistent Node server and disk. It is not a Vercel serverless database. The original Supabase migration is retained for reference; it is not the runtime adapter. A production Supabase deployment requires a separate migration/adapter, configured project credentials, email verification/recovery, and OAuth configuration.

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
