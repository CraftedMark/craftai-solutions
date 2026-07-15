# CraftAI Solutions

Marketing site for [craftai.solutions](https://craftai.solutions) — UniFi network integrations and AI workflow automation for small businesses and enterprise teams.

Static site built with **Astro 6**, served from an **nginx (Docker)** container on a VPS.

## Prerequisites

- Node.js >= 22.12.0
- npm

## Commands

<!-- AUTO-GENERATED: from package.json scripts — do not edit by hand -->
| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server at `localhost:4321` with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro ...` | Run Astro CLI commands (e.g. `astro add`, `astro check`) |
<!-- END AUTO-GENERATED -->

## Project Structure

```text
/
├── public/               # Static assets served as-is
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       └── index.astro   # File-based routing: each file = a route
├── astro.config.mjs
├── Dockerfile            # nginx:alpine serving dist/
└── package.json
```

## Dependencies

- `astro` ^6 — static site generation
- `three` — 3D visuals

## Deployment

Built `dist/` output is baked into an `nginx:alpine` image and run on the VPS. See [docs/RUNBOOK.md](docs/RUNBOOK.md) for deployment and rollback procedures.

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup, workflow, and design guidelines. Brand and design direction live in [CLAUDE.md](CLAUDE.md).
