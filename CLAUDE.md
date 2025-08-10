# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**## NOTES FROM MARK **

- When making changes to the site .. or even creating new sites , you need to use puppeteeer to "See" what the changes look like
- The changes should be there at the following:
1. Local
2. Pushed to Git
3. Pre-lived at 10.10.1.229
4. Verified by User Live to Production Via Dokploy

##Design

1. The Designs should be mordern clean and Elegent , using all of the latest and great technologies, WEbGl , 3d Design , Blender rednering , Animations , etc. But we also need to make sure that it doesnt look childish . the pages , and templates shoudl be full width responsive and expertly seo optimized.

2. the project pages , when developing a page for apps that we have built it would be required to build interactive UI screens of the app , so we can show the potential users functionality and styling. What tecnologies to use will be upt o the developer ( Claude Code)

3. Deployment and Changes - you need to visually inspect the pages before turning over to the user. its not complete till the changes are approved and inspected by you and the user. via puppeteer.

4. Keep the codebase clean and orginized , there shouldnt be code in the filesystem that isnt being useed . if ther is rempve it . we dont want to have things runing all over the place . 

## Project Overview

CraftAI.Solutions - Go-based business website for AI automation services showcasing AI capabilities, projects, and services. 

**Production**: https://craftai.solutions (via Cloudflare tunnel → Dokploy at 72.60.28.31)  
**GitHub**: https://github.com/CraftedMark/craftai-solutions

## Essential Commands

### Development
```bash
# Run locally (default port 3000)
go run cmd/server/main.go

# Run with hot reload (requires air)
go install github.com/cosmtrek/air@latest
air

# Build executable
go build -o craftai-server cmd/server/main.go
```

### Deployment
```bash
# Deploy to production via GitHub push (triggers Dokploy)
./deploy.sh "commit message"

# Or manually:
git add -A
git commit -m "your message"
git push dokploy master  # or: git push github master

# Build for Linux server
GOOS=linux GOARCH=amd64 go build -o craftai-website-linux cmd/server/main.go
```

### Docker Operations
```bash
# Build and run locally
docker build -t craftai-solutions .
docker run -p 3000:3000 -e PORT=3000 craftai-solutions

# Docker Compose
docker-compose up -d
docker-compose logs -f
```

### Health Checks
```bash
# Local
curl http://localhost:3000/health

# Production (via Cloudflare)
curl https://craftai.solutions/health
```

## Architecture

### Request Flow
1. **Entry**: `cmd/server/main.go` - Gorilla Mux router setup
2. **Routing**: All routes defined in main.go (no separate router package)
3. **Handlers**: `internal/handlers/` - Each handler renders templates directly
4. **Templates**: `internal/templates/` - Go html/template with layout inheritance
5. **Static**: `internal/static/` - CSS, JS, images served with cache headers

### Key Implementation Details

**Static File Serving Fix** (main.go:33-34):
```go
// Strip query parameters for file serving (fixes production CSS loading)
r.URL.RawQuery = ""
```
This prevents 404s when CSS files are requested with version query strings.

**Template Rendering Pattern**:
```go
tmpl := template.Must(template.ParseFiles(
    "internal/templates/layout.html",
    "internal/templates/home.html",
))
tmpl.ExecuteTemplate(w, "layout", data)
```

**No centralized PageData struct** - Each handler defines its own data structure.

## Production Infrastructure

### Dokploy Deployment
- **Platform**: Dokploy (Docker Swarm orchestrator)
- **Server**: 72.60.28.31:3000
- **Auto-deploy**: On push to GitHub master branch
- **Container**: Runs as non-root user (appuser:1001)

### Cloudflare Tunnel Configuration
- **Domain**: craftai.solutions
- **Tunnel**: dokploy-craftai (ID: c2dcd83c-bd5a-4a25-b39d-ee88e0f36196)
- **Backend**: http://localhost:80 (Traefik proxy)
- **Important**: Traefik's redirect-to-https middleware must be disabled to prevent redirect loops

### Traefik Configuration
The application uses Traefik as reverse proxy. Key configuration:
- No HTTPS redirect middleware (causes loops with Cloudflare)
- Routes: Host(`craftai.solutions`)
- Service: http://craftaisolutions-website-t6484t:3000

## CSS Architecture

### Main Stylesheet
`internal/static/css/main.css` (~5400 lines) contains all styles:
- Dark glassmorphic theme
- Responsive grid layouts
- Animation keyframes
- Component-specific styles

### CSS Organization Issues
- Multiple backup/variant CSS files exist but aren't used
- All styles in single main.css file (no modularization)
- Cache-busting via query parameters handled by stripping in Go

## Common Development Tasks

### Adding New Pages
1. Create handler in `internal/handlers/`
2. Add route in `cmd/server/main.go`:
   ```go
   r.HandleFunc("/new-page", handlers.NewPageHandler).Methods("GET")
   ```
3. Create template in `internal/templates/`
4. Ensure template includes layout: `{{template "layout" .}}`

### Modifying Styles
1. Edit `internal/static/css/main.css`
2. Test locally first (changes apply immediately with air)
3. Note: Production caches for 24 hours (currently set to no-cache)

### Updating Navigation
Edit `internal/templates/layout.html` - navigation is hardcoded there.

## Project-Specific Features

### GPU Gravity Animation
- Path: `/gravity`
- File: `internal/static/js/gpu-gravity.js`
- WebGL-based particle animation with gravitational physics

### Industry Expertise Section Fix
Recently updated to responsive grid layout:
- Changed from single-line text to grid
- Added SVG icons for each industry
- Removed background box to match other sections

### Service Icons
Custom SVG icons embedded directly in templates (not as separate files).

## Environment Variables
- `PORT`: Server port (default: 3000)
- Loaded from `.env` file via godotenv (optional)

## Logs
- Application: `logs/application-YYYY-MM-DD.log`
- Errors: `logs/error-YYYY-MM-DD.log`
- Docker: `docker logs craftai-website`

## Known Issues & Fixes

### Static Files 404 in Production
**Fixed**: Query parameters stripped in main.go before serving files

### Cloudflare Redirect Loop
**Fixed**: Removed redirect-to-https middleware from Traefik config

### CSS Not Loading
Ensure path starts with `/static/` and file exists in `internal/static/`