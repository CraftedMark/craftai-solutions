# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CraftAI.Solutions - Go-based business website for AI automation services. Production deployment at 10.10.1.229:3000.

## Essential Commands

### Development
```bash
# Run with hot reload (requires air installed)
air

# Run directly
go run cmd/server/main.go

# Build executable
go build -o craftai-server cmd/server/main.go
```

### Production Deployment
```bash
# Deploy to production server (10.10.1.229)
./deploy.sh "commit message"

# Manual Docker deployment
docker build -t craftai-solutions .
docker-compose up -d

# Build Linux binary for server
GOOS=linux GOARCH=amd64 go build -o craftai-website-linux cmd/server/main.go
```

### Testing & Verification
```bash
# Test locally
curl http://localhost:3000/health

# Test production
curl http://10.10.1.229:3000/health
```

## Architecture & Code Structure

### Request Flow
1. **Entry Point**: `cmd/server/main.go` - Sets up router, middleware, and starts server
2. **Routing**: Uses Gorilla Mux, routes defined in main.go
3. **Handlers**: `internal/handlers/` - Business logic for each endpoint
   - `home.go` - Homepage and main sections
   - `contact.go` - Contact form processing
   - `services.go` - Service-specific pages
4. **Templates**: Go templates in `internal/templates/` with base layout
5. **Static Assets**: Served from `internal/static/` with cache headers

### Key Architectural Patterns

**Handler Pattern**: All handlers follow consistent structure:
```go
func HandlerName(w http.ResponseWriter, r *http.Request) {
    // 1. Parse request/parameters
    // 2. Prepare template data
    // 3. Execute template with error handling
}
```

**Template Data Structure**: Common `PageData` struct passed to all templates:
```go
type PageData struct {
    Title       string
    Description string
    // Additional page-specific fields
}
```

**Static File Serving**: Optimized with 24-hour cache control headers for production.

### Important Files & Their Roles

- **`internal/handlers/home.go`**: Main business logic, handles homepage and service sections
- **`internal/templates/layout.html`**: Base template with navigation, footer, analytics
- **`internal/static/css/styles.css`**: Main styling, responsive design
- **`internal/static/js/script.js`**: Animations, interactions, contact form handling

## Production Environment

- **Server**: 10.10.1.229 (accessible via Tailscale)
- **Service**: `craftai-website.service` (systemd)
- **Port**: 3000 (containerized)
- **Git Remote**: `root@10.10.1.229:/opt/git-repos/craftai-website.git`
- **Docker Container**: Runs as non-root user (appuser:1001)

## Development Considerations

### When Modifying Templates
- All templates extend `layout.html` using `{{template "layout" .}}`
- Pass data using `PageData` struct or extend it for specific needs
- Templates use Go's html/template syntax with automatic HTML escaping

### When Adding New Routes
1. Add handler function in `internal/handlers/`
2. Register route in `cmd/server/main.go` using `router.HandleFunc()`
3. Create corresponding template in `internal/templates/`

### When Updating Styles/JavaScript
- Static files are cached for 24 hours in production
- Test changes locally first with `air` for hot reload
- Consider mobile responsiveness (separate mobile CSS exists)

### Environment Variables
- `PORT`: Server port (default: 3000)
- Loaded from `.env` file via godotenv

## Deployment Process

The `deploy.sh` script automates deployment:
1. Commits changes to git
2. Pushes to production server
3. Server automatically pulls and rebuilds via git hooks
4. Restarts Docker container with new build

## Common Tasks

### Adding a New Service Page
1. Create handler in `internal/handlers/services.go`
2. Add template in `internal/templates/services/`
3. Register route in `cmd/server/main.go`
4. Update navigation in `layout.html` if needed

### Updating Contact Form
- Handler: `internal/handlers/contact.go`
- Frontend: `internal/static/js/script.js` (form submission logic)
- Validation and processing in `SubmitContactHandler`

### Monitoring & Debugging
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Health endpoint: `/health`
- Check Docker logs: `docker logs craftai-website`