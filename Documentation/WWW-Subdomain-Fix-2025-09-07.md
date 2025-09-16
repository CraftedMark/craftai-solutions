# CraftAI Website WWW Subdomain Fix Documentation

**Date**: September 7, 2025
**Issue**: www.craftai.solutions returning Cloudflare Error 1033 and later redirect loops
**Resolution**: Successfully configured Cloudflare tunnel to handle both domains

## Problem Summary

The www.craftai.solutions subdomain was not working properly, initially showing:
1. Cloudflare Error 1033 (Argo Tunnel error)
2. After initial DNS fix, experiencing redirect loops (ERR_TOO_MANY_REDIRECTS)

## Root Cause Analysis

### Issue 1: Cloudflare Error 1033
- **Cause**: The www.craftai.solutions CNAME was pointing to an inactive/old Cloudflare tunnel: `cdd4997c-38be-40e4-992e-86f574159035.cfargotunnel.com`
- **Discovery**: DNS records showed the main domain using a different, active tunnel

### Issue 2: Redirect Loop
- **Cause**: After updating DNS to point to the correct tunnel, the application was configured to redirect www to non-www, but both domains were routing through the same tunnel to the same application, creating an infinite loop
- **Discovery**: The tunnel ingress rules didn't include www.craftai.solutions, and when added without proper configuration, caused redirect loops

## Solution Implementation

### Step 1: DNS Configuration Update
Updated the www.craftai.solutions CNAME record to point to the active tunnel:
```bash
curl -X PUT "https://api.cloudflare.com/client/v4/zones/0f89e71a8c1b08ac57f0741f2acff142/dns_records/cd828944deba4bad7ab98261c1c060f9" \
  -H "Authorization: Bearer [API_TOKEN]" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "www",
    "content": "c2dcd83c-bd5a-4a25-b39d-ee88e0f36196.cfargotunnel.com",
    "ttl": 1,
    "proxied": true
  }'
```

### Step 2: Cloudflare Tunnel Configuration
Updated tunnel ingress rules to handle both domains with Host header rewriting:
```json
{
  "config": {
    "ingress": [
      {
        "service": "http://localhost:80",
        "hostname": "craftai.solutions",
        "originRequest": {}
      },
      {
        "service": "http://localhost:80",
        "hostname": "www.craftai.solutions",
        "originRequest": {
          "httpHostHeader": "craftai.solutions"
        }
      },
      {
        "service": "http_status:404",
        "originRequest": {}
      }
    ],
    "warp-routing": {
      "enabled": false
    }
  }
}
```

## Key Configuration Details

### Infrastructure
- **VPS Server**: 72.60.28.31 (Dokploy platform)
- **Cloudflare Tunnel ID**: c2dcd83c-bd5a-4a25-b39d-ee88e0f36196
- **Tunnel Name**: dokploy-craftai
- **Zone ID**: 0f89e71a8c1b08ac57f0741f2acff142
- **Account ID**: 8c3c0de96c5067dbf8bf6b032542166b

### DNS Records
- **craftai.solutions**: CNAME → c2dcd83c-bd5a-4a25-b39d-ee88e0f36196.cfargotunnel.com (proxied)
- **www.craftai.solutions**: CNAME → c2dcd83c-bd5a-4a25-b39d-ee88e0f36196.cfargotunnel.com (proxied)

### Dokploy Configuration
Both domains configured in Dokploy with:
- Path: /
- Port: 3000
- HTTPS enabled with Let's Encrypt certificates

## API Keys Used
- **Cloudflare API Token**: sKjbfJYXXjhvByyeq9AahN9Pi6nKJyi6jUlVunlX
  - Permissions: DNS edit, Tunnel configuration

## Testing Methodology

### Important Note
**Always use Playwright for testing website functionality, not curl**
- Playwright provides real browser experience including JavaScript execution, redirects, and actual page rendering
- Curl only shows raw HTTP responses and doesn't reflect what users actually see

### Test Commands
```javascript
// Using Playwright MCP
await page.goto('https://craftai.solutions');     // Main domain test
await page.goto('https://www.craftai.solutions'); // WWW subdomain test
```

## Final Status
✅ Both domains fully functional:
- https://craftai.solutions - loads correctly
- https://www.craftai.solutions - loads correctly (stays on www, no redirect)

## Lessons Learned

1. **VPS vs Cloud Hosting**: When hosting on VPS with Cloudflare tunnels, both DNS and tunnel ingress rules must be configured
2. **Redirect Loop Prevention**: Use `httpHostHeader` in tunnel configuration to prevent application-level redirect loops
3. **Testing Best Practice**: Always test with real browser (Playwright) rather than curl for accurate results
4. **API Permissions**: Ensure Cloudflare API tokens have sufficient permissions for tunnel management, not just DNS

## Related Documentation
- SEO improvements were also deployed during this session
- See: SEO-Improvements-2025-09-07.md