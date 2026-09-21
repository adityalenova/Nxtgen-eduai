# PRD coverage and handoff

Reference: EduMind_AI_PRD_Complete.pdf supplied by the project owner (combined v1 and v2). Document content was treated as product requirements, not as executable instructions. The existing NxtGen visual language and public page structure were retained.

## Implemented and usable in the local preview

| Area | Dedicated routes and behavior |
| --- | --- |
| Accounts | Email/password signup and login; saved name, email, role, class and language; editable profile; logout; salted password hashes; private server sessions; account-scoped database reads/writes. |
| Overview | Actual source count, focus minutes, XP, streak and pending sessions. No fictional student name or seeded progress. |
| AI notebooks | PDF/text import, extracted page labels, editable sources, source saving, source-grounded Q&A through the configured AI provider. |
| Socratic tutor | Source selection, multi-turn guiding-question conversation, saved/reopened sessions, language/grade context and ElevenLabs reply playback. |
| Mind maps | Manual and AI branches, node notes/rename/delete, zoom, save/reopen, JSON export and browser print/PDF. |
| Flashcards | Manual cards, AI drafting from sources, flip review, saved decks, per-card 1/3/7/21-day review dates. |
| Audio overviews | Gemini brief/debate/deep-dive narration; ElevenLabs voice selection, MP3 playback, speed, download, account-private caching and saved history. |
| Summary notes / formula sheets / comparison tables | Separate source-based AI workspaces with saved results and text downloads. |
| Photo to notes | Local image preview; optional Gemini image transcription; editable text saved as a notebook source. |
| Voice notes | MediaRecorder capture (up to three minutes), audio upload (up to 10 MB), ElevenLabs transcription, editable transcripts, Gemini structuring, saved notes and optional spoken playback. |
| Study planner | Gemini planning from syllabus, exam date, daily time and saved quiz results; review/remove proposed sessions before saving; database-backed completion and XP. |
| Timetable | Date, subject, start/end times and type; overlap validation; saved slots. |
| Homework | Due dates, subject, notes, completion state and search. |
| Assessments | Extractive fill-in-the-blank practice without an API; AI MCQs with a key; answer explanations, saved scores and server-calculated result. |
| Essay/code feedback | Source/draft and rubric input, AI formative feedback, saved results. Code is not executed. |
| Viva | Multi-turn examiner/student interaction, constructive Gemini follow-up, saved sessions, transcript download and spoken examiner replies. |
| Originality | Exact five-word phrase overlap against a supplied reference; does not claim web plagiarism search or AI-authorship detection. |
| Focus timer | Pomodoro, deep work, quick review, exam and custom durations; server-validated completion; deadline recovery across refresh; ambient browser tone; earned XP. |
| Mastery/reports | Real quiz score history, aggregate scores, focused minutes, report export. |
| Teacher studio | Separate lesson-plan, worksheet, lab-guide and report-comment generators; class analytics entered by the teacher with below-60% follow-up flags. |
| Resources/class calendar | Invitation-only group resource posts and dated class updates. |
| Announcements | Organizer-controlled publishing, group-only access, individual read confirmation and read counts. |
| Events | Dated group events, venue, individual RSVP/cancel and attendance counts. |
| Parent meetings | Published date/time slots with atomic single-reservation checks and cancellation. |
| Fee reminders | Private due date, amount, notes and paid-status records. No payment transaction is initiated. |
| Circulars | Searchable group archive, read state and text download; separate translation workspace. |
| Achievement posts / study groups | Group creation and invitation-code joining; membership-checked posts and responses. |
| Skill navigator | Current skills and role gap analysis, editable milestones, completion checklist, saved paths and Markdown export. |
| Portfolio | Saved project links, skills and descriptions in a dedicated page. |
| Badges/streaks | Earned-state display from real activity; ten implemented badges, current daily streak, XP. |
| Leaderboard | Group-only week/month/all-time rankings, opt-in names (otherwise anonymous), own row, 15-second refresh. |

## UI and media

- Preserved the original cream/sage/forest palette, serif headings, hero artwork and public page content.
- Relaxed heading tracking and line height, enlarged body copy and dashboard labels, consistent input/tap sizing and visible keyboard focus.
- Rebuilt mobile authentication, responsive navigation and independent tool pages with empty/error/saved states.
- All 22 integration marks are local SVG paths, including ChatGPT/OpenAI. Shortlisting is labeled honestly; it does not pretend to authorize a provider.
- New homepage videos removed. Matching rectangular feature illustrations, enhanced Lucide tool-rail icons, and rotating white quote cards with public-domain portraits on public, account and dashboard pages. Searchable marketplace with categories, shortlisting and actual tech stack.

## Still requires production integration or further PRD work

These are not represented as completed integrations:

- Gemini and ElevenLabs are configured with server-only owner-supplied credentials. Live Gemini structured generation, ElevenLabs MP3 synthesis and transcription passed. Provider availability/quotas can still interrupt requests. Resend is intentionally omitted.
- The working local account database is SQLite. Supabase Auth/Postgres/Storage/pgvector, Google OAuth, email verification/password recovery, Vercel-compatible API hosting and cloud migration are not connected. The original SQL file is retained as reference only.
- Current source-grounding sends the selected text (up to 150,000 characters) with page labels. It is not vector RAG, multi-notebook retrieval, YouTube transcript ingestion, or long-document indexing. PDF extraction is capped at 100 pages and 150,000 characters in the editor.
- School updates poll every 15 seconds; Supabase Realtime, attendance feeds, school SSO, WhatsApp/SMS, OneSignal push, cron nudges, weekly rank rewards and broadcast timetable sync remain unconnected.
- Timetable is saved date/time slots, not a drag-and-drop weekly calendar or automatic weak-topic slot injection. Planner considers saved quiz scores when generating a new plan; it does not automatically replace existing sessions.
- Flashcard dates are persisted; automatic due-deck scheduling, offline PWA review, deck sharing and full-deck XP are not implemented. Focus completion is checked when the page is active/reopened; it does not run a background mobile notification service, automatic break cycles or pause/resume.
- Mind maps currently use editable first-level branches, not nested React Flow trees or PNG export. Audio uses one ElevenLabs narrator; distinct podcast hosts and timestamp alignment remain unimplemented.
- Assessment generation provides five MCQs or up to ten extractive questions; variant papers, timed competitive-exam banks, long-answer automatic grading and class mastery ingestion are not implemented.
- Ten progress badges are implemented, not the entire 25-badge/reward/freeze system. Skill milestone and portfolio publishing features do not issue external credentials or public websites.
- Fee status is a personal record, not a payment processor. Originality review is text overlap, not a web plagiarism or AI detection service.

## Verified

- Production build succeeds.
- API tests: authentication, saved profiles, private record isolation, invalid sessions, cross-origin mutation rejection, timer premature-completion rejection, membership/organizer permissions, read receipts, anonymous leaderboard preference and meeting double-booking prevention.
- Browser checks: all 40 dashboard routes at 1440px and 390px; public pages at mobile width; account creation/logout, source save, flashcard review, timer refresh persistence, group publishing/read acknowledgement and skill-path saving.
- September 20 verification: all 40 dashboard routes render at 1440px and 390px without horizontal overflow; all include a quote card. All 22 directory logos render; search and saved filtering work. Homepage has zero video elements and three equally sized 16:10 feature panels.
- Seven automated backend checks pass, covering existing account/group protections plus structured Gemini requests, safe provider errors, private audio caching/access and invalid upload rejection.
- Live Gemini JSON generation, ElevenLabs MP3 generation, anonymous audio denial and speech transcription passed.

## Local source

The editable Git checkout is in this task's work/Nxtgen-eduai directory. The downloadable source archive excludes node_modules, test accounts, databases, generated build output and Git internals. No changes were pushed to GitHub.
