# Repository Guidelines

## Project Structure & Module Organization
- Go app with HTTP server and templates.
- Source: `cmd/server/` (entry), `internal/handlers/` (routes), `internal/templates/` (HTML), `internal/static/{css,js,images}` (assets).
- Dev helpers: `dev-server.go`, `live-server.go`, `.air.toml`, `run-dev.sh`.

## Build, Test, and Development Commands
- Run with reload (Air): `air` (installs via `go install github.com/air-verse/air@latest`).
- Quick dev server: `./run-dev.sh` or `go run dev-server.go`.
- Build binary: `go build -o app/craftai-server ./cmd/server`.
- Docker local: `docker build -t craftai-website .` then `docker compose up --build` (serves on `:3000`).

## Coding Style & Naming Conventions
- Use standard Go formatting: `gofmt -s -w .` and `go vet ./...` before PRs.
- Packages: lowercase, no underscores (e.g., `handlers`).
- Files: describe responsibility (e.g., `contact.go`, `routes.go`).
- Templates: use layout + `{{define "content"}}` blocks; keep page templates under `internal/templates/` mirroring route paths (e.g., `services/apa.html`).
- Assets: group CSS/JS/images under `internal/static/` with clear names.

## Testing Guidelines
- Framework: Go standard testing. Place `_test.go` next to code (e.g., `internal/handlers/contact_test.go`).
- Run all tests: `go test ./... -cover`.
- Aim for coverage on handlers and template rendering helpers; prefer small, focused tests.

## Commit & Pull Request Guidelines
- Commits: concise, present tense; optional scope. Examples:
  - `feat(handlers): add newsletter endpoint`
  - `fix(templates): correct services link path`
- PRs must include: summary, motivation, screenshots for UI changes, steps to reproduce/verify, and linked issues.
- Keep diffs minimal; do not commit built binaries or large assets.

## Security & Configuration Tips
- Configuration via env: `PORT` (defaults to `3000`). Load with `godotenv` in dev.
- Never commit secrets. Mirror any new config in `.env.example` and document usage.
- Static and template paths are served under `/static` and compiled into Docker images; verify cache headers when changing assets.

## Agent-Specific Notes
- Prefer editing Go sources under `cmd/` and `internal/`; avoid modifying compiled artifacts in the repo root.
- Validate with `go build` and `go test` locally before proposing changes.
