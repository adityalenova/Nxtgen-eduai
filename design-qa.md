# Design QA — NxtGen extension

## Comparison target

- Source visual truth: `/Users/sduggirala/Desktop/Screenshot 2026-09-11 at 19.09.03.png` and `/Users/sduggirala/Desktop/Screenshot 2026-09-11 at 19.09.12.png` for the integrations composition; `/Users/sduggirala/Desktop/Screenshot 2026-09-11 at 19.07.18.png` for the feature demonstration; `/Users/sduggirala/Downloads/How to Design a High Conversion Landing Page (1).jpeg` and the supplied exams reference for the dashboard sidebar treatment.
- Implementation: browser-rendered `http://127.0.0.1:5173/integrations`, `/features`, `/use-cases`, and `/dashboard`.
- Viewport: desktop in-app browser, 1280 × 720 CSS px (browser screenshot output).
- State: integrations initial state and AI-study filtered state; features initial animation state; dashboard overview state.

## Full-view comparison evidence

The implementation was reviewed against the supplied desktop references in the same in-app browser session. The new integrations route keeps the requested centred editorial hero, moving tool strip, searchable/filterable directory and card panel hierarchy, while using NxtGen-specific learning copy and labels. The Features route uses an original animated dashboard composition rather than reproducing third-party product content. The personal dashboard keeps the supplied calm, high-density scheduling-app character but uses NxtGen tokens, content, and controls.

## Focused region comparison

- Header and page hero: verified at desktop size; six public routes remain spaced without collision.
- Integrations directory: verified that the “AI study” filter reduces the directory from 13 cards to 4 cards.
- Dashboard: verified the glass sidebar, top controls, focus panel, and four metrics render with non-overlapping type and controls.

## Required fidelity surfaces

- Fonts and typography: display serif remains reserved for editorial headings; UI copy is compact but has increased line-height and spacing in the dashboard cards and action rows.
- Spacing and layout rhythm: integration directory uses a 200px filter rail and three-column cards at desktop; dashboard sections use 16–20px component gaps and 40px hero padding.
- Colors and visual tokens: retained NxtGen’s paper, deep green, soft lime, lavender, and sand palette; glass finish is limited to the dashboard rail and supporting controls.
- Image and asset quality: integration marks are loaded from Simple Icons CDN with descriptive text alongside them; no supplied third-party screenshots or branded page graphics are copied into the implementation.
- Copy and content: every added panel uses NxtGen learning workflows, including source-grounded study, recall, planning, integrations, badges, and streaks.

## Findings

No actionable P0, P1, or P2 visual issues remain in the checked desktop routes. The remote integration marks require network access in the browser; the directory remains understandable through its adjacent tool names if a mark is unavailable.

## Primary interactions tested

- Public header routes render for Features, Use cases, Integrations, and Blog.
- Integrations category filter changes the visible result set.
- Integration cards expose a local connect/disconnect state.
- Feature dashboard cycles automatically and allows panel selection.
- Dashboard navigation and existing study tool buttons remain client-side interactive.

## Comparison history

1. Initial extension review: local preview was unavailable because no process was listening on port 5173.
2. Fix: changed the dev script to bind `vite --host 127.0.0.1`, restarted the server, and verified the integrations, features, use-cases, and dashboard routes in the in-app browser.

final result: passed
