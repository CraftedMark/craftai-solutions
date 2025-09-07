# SEO Updates Deployment Guide

## Files to Update on Production Server (10.10.1.229)

### 1. Update Go Server Code
**File:** `/opt/craftai-website/live-server.go`
- Added PageData struct for SEO metadata
- Created pageMetadata map with SEO content for each page
- Modified handlers to pass PageData to templates
- Added routes for serving robots.txt, sitemap.xml, and llms.txt

### 2. Update HTML Template
**File:** `/opt/craftai-website/app/internal/templates/layout.html`
- Fixed title tag (removed pipe character, line 9)
- Changed Twitter meta tags from `property` to `name` (lines 28-32)
- All meta tags now use dynamic {{.Title}}, {{.Description}}, {{.OGImage}}, {{.PageURL}}

### 3. Add/Update SEO Files
**Files to copy to:** `/opt/craftai-website/app/internal/static/`
- `robots.txt` - Enhanced with AI bot permissions
- `sitemap.xml` - Updated with correct project URLs and dates
- `llms.txt` - New file for AI agents (5.2KB comprehensive guide)

## Deployment Steps

1. SSH to production server:
```bash
ssh root@10.10.1.229
# or via Tailscale if available
```

2. Backup current files:
```bash
cd /opt/craftai-website
cp live-server.go live-server.go.backup
cp app/internal/templates/layout.html app/internal/templates/layout.html.backup
```

3. Extract and apply updates:
```bash
# If using the tar archive:
tar xzf craftai-seo-updates.tar.gz
# This will extract the updated files to their correct locations
```

4. Rebuild and restart the service:
```bash
# Rebuild the Go application
go build -o craftai-server live-server.go

# Restart the service
systemctl restart craftai-website.service

# Check status
systemctl status craftai-website.service
```

5. Verify the changes:
- Visit https://craftai.solutions and check page source for:
  - Title without pipe character
  - Meta description populated
  - Open Graph tags with content
  - Twitter Card tags with content
- Test SEO files:
  - https://craftai.solutions/robots.txt
  - https://craftai.solutions/sitemap.xml
  - https://craftai.solutions/llms.txt

## Key Changes Summary

✅ **Title Tag Fixed**
- Before: `| CraftAI Solutions - AI Development & Automation Services | Newport Beach`
- After: `CraftAI Solutions - AI Development Newport Beach`

✅ **Meta Description Added**
- 203 characters of compelling content about the company

✅ **Open Graph & Twitter Cards**
- All tags now properly populated with dynamic content

✅ **SEO Files**
- robots.txt: AI bot permissions added
- sitemap.xml: Updated URLs and dates
- llms.txt: Comprehensive guide for AI agents

## Verification Checklist

- [ ] Title appears correctly without pipe character
- [ ] Meta description shows in page source
- [ ] Open Graph tags have content (not empty)
- [ ] Twitter Card tags use `name` attribute (not `property`)
- [ ] robots.txt is accessible and shows AI bot permissions
- [ ] sitemap.xml is accessible and has correct URLs
- [ ] llms.txt is accessible and shows full content
- [ ] Service is running without errors

## Archive Contents

The `craftai-seo-updates.tar.gz` file contains:
- app/internal/templates/layout.html
- app/internal/static/robots.txt
- app/internal/static/sitemap.xml
- app/internal/static/llms.txt
- live-server.go

All files are ready for deployment to production.