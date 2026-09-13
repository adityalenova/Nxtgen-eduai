# NxtGen Learning

An interactive, responsive React + Vite product site for NxtGen Learning.

## Run locally

```bash
npm install
npm run dev
```

Open the local address printed by Vite (normally `http://127.0.0.1:5173`).

## Production check

```bash
npm run build
```

The integration directory uses the Simple Icons CDN for clear native-colour service marks. The app remains usable if a logo cannot load, and no third-party account credentials are embedded in this project.

## What works without an account

- Responsive public pages, Framer Motion interactions, moving tool and integration rails, and dashboard navigation.
- Local browser persistence for notebook questions, planner completions, quiz results, and selected skill target.
- A browser-native audio overview button for notebook answers when the browser supports speech synthesis.
- An OAuth-ready Google sign-in button that only redirects once a Google client ID has been configured.

## Configure production services

Copy `.env.example` to `.env.local` and fill only the values owned by your project. Apply `supabase/migrations/0001_learning_space.sql` in your Supabase project before wiring the client. The schema enables row-level security and restricts each learner to their own profile, notebook, task, and event rows.

`VITE_GOOGLE_CLIENT_ID` enables the Google OAuth redirect. Add the deployed `/auth` URL as an authorized redirect URI in your Google Cloud OAuth client, then exchange the returned code on a trusted backend or through Supabase Auth. Do not put a Google client secret, an ElevenLabs API key, or a Supabase service-role key in this Vite app.

## Account-backed features

Google sign-in, Supabase persistence, ElevenLabs voice generation, GitHub publishing, and Vercel deployment require a project owner to supply and authorize their own credentials. Keep those values in environment variables; do not commit them to the repository.
