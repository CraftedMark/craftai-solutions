# Runbook — craftai.solutions

## Architecture

<!-- AUTO-GENERATED: from Dockerfile — do not edit by hand -->
Static Astro build served by `nginx:alpine`:

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

Container listens on port **80**. Host port mapping on the VPS: **TBD** (verify with Mark; see project `CLAUDE.md`).
<!-- END AUTO-GENERATED -->

## Deployment

The Dockerfile copies a pre-built `dist/`, so the build must run **before** `docker build`:

```bash
# 1. Build the static site
npm ci
npm run build

# 2. Build and tag the image
docker build -t craftai-solutions:$(git rev-parse --short HEAD) .
docker tag craftai-solutions:$(git rev-parse --short HEAD) craftai-solutions:latest

# 3. On the VPS: stop old container, start new one
docker stop craftai-web && docker rm craftai-web
docker run -d --name craftai-web --restart unless-stopped -p <HOST_PORT>:80 craftai-solutions:latest
```

> `<HOST_PORT>` is TBD. Reverse proxy / TLS termination for craftai.solutions is expected in front of this container — document the proxy config here once established.

## Health Check

No dedicated health endpoint — it's a static site. Probe the root:

```bash
curl -fsS -o /dev/null -w "%{http_code}" http://localhost:<HOST_PORT>/   # expect 200
curl -fsS -o /dev/null -w "%{http_code}" https://craftai.solutions/      # expect 200 end-to-end
```

## Rollback

Images are tagged by git SHA, so rollback = rerun with the previous tag:

```bash
docker images craftai-solutions            # find prior tag
docker stop craftai-web && docker rm craftai-web
docker run -d --name craftai-web --restart unless-stopped -p <HOST_PORT>:80 craftai-solutions:<PREVIOUS_SHA>
```

## Common Issues

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| 404 on all pages | `dist/` was empty or missing at image build | Run `npm run build` before `docker build`; confirm `dist/index.html` exists |
| Stale content after deploy | Old container still running / browser cache | Confirm new container ID with `docker ps`; hard-refresh |
| Build fails | Node version mismatch | Requires Node >= 22.12.0 (`engines` in package.json) |
| Container up but site unreachable | Host port mapping or proxy misconfig | Check `docker port craftai-web` and the reverse proxy upstream |

## Monitoring & Escalation

- No monitoring is configured yet — TBD (uptime check against https://craftai.solutions recommended).
- Owner/escalation: Mark (mark@erthwellness.com).
