# CraftAI Solutions — Project Config

## Stack
- **Framework:** Astro 6 (static site generation)
- **Deployment:** Docker (nginx:alpine) on VPS, port TBD
- **Domain:** craftai.solutions

## Build & Deploy
```bash
npm run build        # Build to dist/
npm run dev          # Local dev server
npm run preview      # Preview production build
```

## Design Context

### Users
Small business owners and enterprise decision-makers (IT directors, CTOs, ops managers) seeking UniFi network integrations and AI workflow automation.

### Brand Personality
**Professional. Innovative. Approachable.**

### Aesthetic Direction
- **Palette:** Deep slate (#0F172A), electric blue (#3B82F6), amber (#F59E0B), light surface (#F8FAFC), dark surface (#1E293B)
- **Typography:** Inter (display + body)
- **Theme:** Light + dark mode (system preference with toggle)
- **Tone:** Modern tech meets human warmth — Linear/Vercel inspired

### Design Principles
1. Clarity over cleverness
2. Show, don't tell
3. Trust through craft
4. Dark mode is first-class
5. Speed to contact

<!-- ERTH-WIKI:START -->
## Erth platform wiki — write to it AS YOU WORK

When the work touches anything Erth (the 360 console web/API/iPad app, the PG18 warehouse, syncs/ingest, deploys, or Erth VPS infra), maintain `~/Workspace/erth-platform-wiki` **in the same session** — not after: update the affected entity/concept pages, link new pages from the domain README, add a dated `LOG.md` entry, and fix any claim the change falsifies. The full ingest contract and page format (distilled, hard-to-vary, `[[linked]]`) live in that repo's `AGENTS.md` — follow it. Secrets never; Keychain refs only.
<!-- ERTH-WIKI:END -->
