# CraftAI Solutions - Deployment Guide

## Quick Start

**Always use the safe deployment script:**

```bash
./scripts/deploy.sh
```

This script automatically:
1. Runs pre-deployment validation
2. Checks for uncommitted changes
3. Pushes to GitHub
4. Triggers Dokploy deployment
5. Waits for deployment to complete
6. Verifies all critical pages are working

## Manual Deployment

If you need to deploy manually:

### 1. Run Pre-Deployment Checks

```bash
./scripts/pre-deploy-check.sh
```

This validates:
- ✓ All template files exist in `internal/templates/`
- ✓ All templates have proper closing tags (`</main>`)
- ✓ All handler functions exist
- ✓ All routes are registered
- ✓ Go build succeeds

### 2. Commit and Push

```bash
git add .
git commit -m "Your commit message"
git push origin master
```

### 3. Trigger Deployment

```bash
curl -X POST "http://72.60.28.31:3000/api/application.deploy" \
  -H "accept: application/json" \
  -H "x-api-key: sstKAFklVKwrGgOcHTTVEPXAeBuvMpuJDDiWFvpGoQuckFYrrBvhzCudZsvwqLwn" \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"F3QTs69zwKxPyfcQE7KqD"}'
```

### 4. Verify Deployment

Wait 1-2 minutes, then check:

```bash
curl -I https://craftai.solutions/privacy
curl -I https://craftai.solutions/terms
curl -I https://craftai.solutions/about
```

All should return `HTTP/2 200`.

## Common Issues and Prevention

### Issue 1: Missing Template Files

**Problem:** Templates created in `app/internal/templates/` but production looks in `internal/templates/`

**Prevention:**
- ✅ Pre-deployment script checks both locations
- ✅ GitHub Actions validates template locations
- ✅ Always create templates in `internal/templates/`

**Fix:**
```bash
cp app/internal/templates/*.html internal/templates/
```

### Issue 2: Missing Closing Tags

**Problem:** Templates missing `</main>` tag causing 500 errors

**Prevention:**
- ✅ Pre-deployment script validates closing tags
- ✅ Template must have `</main>` before `{{end}}`

**Fix:**
Add `</main>` before `{{end}}` in the template:
```html
    </div>
</main>
{{end}}
```

### Issue 3: Missing Handler Functions

**Problem:** Route exists but handler function doesn't

**Prevention:**
- ✅ Pre-deployment script checks for handler functions
- ✅ Always create handler before adding route

**Template for new handler:**
```go
func YourPageHandler(w http.ResponseWriter, r *http.Request) {
    data := TemplateData{
        Title:       "Your Page - CraftAI Solutions",
        Description: "Your description",
        Keywords:    "your, keywords",
        OGImage:     "https://craftai.solutions/static/images/og-image.jpg",
        PageURL:     "https://craftai.solutions/your-page",
        PageName:    "your-page",
    }
    renderTemplate(w, "your-page", data)
}
```

### Issue 4: Missing Routes

**Problem:** Handler exists but route not registered in `cmd/server/main.go`

**Prevention:**
- ✅ Pre-deployment script checks route registration
- ✅ Always register route after creating handler

**Add route:**
```go
r.HandleFunc("/your-page", handlers.YourPageHandler).Methods("GET")
```

## GitHub Actions

Every push to `master` automatically runs:
1. Go build test
2. Template validation
3. Handler verification
4. Route verification

If any check fails, the GitHub Action will fail and alert you.

## Rollback Procedure

If deployment fails:

1. Check Dokploy logs: http://72.60.28.31:3000
2. Find the last working commit:
   ```bash
   git log --oneline -10
   ```
3. Revert to working commit:
   ```bash
   git revert <bad-commit-hash>
   git push origin master
   ```
4. Trigger deployment again

## Testing Locally Before Deploy

Always test locally first:

```bash
# Start local production server
cd ~/Dev/craftai-temp
go run cmd/server/main.go

# In another terminal, test pages
curl http://localhost:3000/privacy
curl http://localhost:3000/terms
curl http://localhost:3000/about
```

All should return HTTP 200 with full HTML content.

## Checklist for New Pages

When adding a new page, follow this checklist:

- [ ] Create template in `internal/templates/yourpage.html`
- [ ] Template starts with `{{define "content"}}`
- [ ] Template ends with `</main>` then `{{end}}`
- [ ] Create handler function in `internal/handlers/handlers.go`
- [ ] Register route in `cmd/server/main.go`
- [ ] Run `./scripts/pre-deploy-check.sh`
- [ ] Test locally: `go run cmd/server/main.go`
- [ ] Commit changes
- [ ] Run `./scripts/deploy.sh`

## Emergency Contacts

- Dokploy Dashboard: http://72.60.28.31:3000
- Login: marktnashed@icloud.com
- GitHub Repo: https://github.com/CraftedMark/craftai-solutions
- Live Site: https://craftai.solutions
