# Contributing

## Development Environment

### Prerequisites

- Node.js >= 22.12.0 (enforced via `engines` in `package.json`)
- npm

### Setup

```bash
git clone <repo-url>
cd craftai-solutions
npm install
npm run dev        # http://localhost:4321
```

## Available Scripts

<!-- AUTO-GENERATED: from package.json scripts — do not edit by hand -->
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Astro dev server with hot reload |
| `npm run build` | Production build (static output to `dist/`) |
| `npm run preview` | Serve the built `dist/` locally to verify before deploying |
| `npm run astro ...` | Astro CLI passthrough (e.g. `npm run astro -- check`) |
<!-- END AUTO-GENERATED -->

## Environment Variables

None. The site is fully static with no runtime configuration. If a variable is ever introduced, add a `.env.example` and document it here.

## Testing & Verification

There is no test suite yet. Minimum verification before merging:

1. `npm run build` completes without errors.
2. `npm run preview` and visually check the page at key breakpoints (320 / 768 / 1024 / 1440).
3. Verify both light and dark themes render correctly (dark mode is first-class — see `CLAUDE.md`).

## Code Style

- Astro components in `src/pages/` (routes) and `src/layouts/` (shared shells).
- Follow the design principles and palette in the project `CLAUDE.md` (deep slate `#0F172A`, electric blue `#3B82F6`, amber `#F59E0B`; Inter typography).
- No linter or formatter is configured yet; match existing file conventions.

## PR Checklist

- [ ] `npm run build` passes
- [ ] Visual check in light and dark mode
- [ ] No hardcoded secrets or credentials
- [ ] README/docs updated if scripts, deps, or deployment changed
