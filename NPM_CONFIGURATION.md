# Nginx Proxy Manager Configuration for CraftAI.Solutions

## Current Issue
The domain craftai.solutions is showing the old blue version of the site because NPM is still pointing to the old server instead of the new one at 10.10.1.229.

## Required NPM Configuration

### 1. Access NPM
- URL: http://10.10.1.48:81
- Login with your NPM credentials

### 2. Find the Proxy Host Entry
Look for the proxy host entry for `craftai.solutions`

### 3. Update the Configuration

**Domain Names:**
- `craftai.solutions`
- `www.craftai.solutions` (if applicable)

**Scheme:** 
- `http`

**Forward Hostname / IP:**
- Change FROM: [old server IP/hostname]
- Change TO: `10.10.1.229`

**Forward Port:**
- `80`

**Other Settings:**
- ✅ Cache Assets (optional)
- ✅ Block Common Exploits
- ✅ Websockets Support (if needed)

### 4. SSL Configuration
If SSL is enabled:
- Keep existing SSL certificate settings
- Force SSL: ✅ (recommended)
- HTTP/2 Support: ✅ (recommended)
- HSTS Enabled: ✅ (optional)

### 5. Custom Nginx Configuration (if needed)
```nginx
# Add any custom headers if required
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

### 6. Save and Test
1. Click "Save" to update the proxy host
2. The changes should take effect immediately
3. Test by visiting https://craftai.solutions

## Verification Steps
1. Clear browser cache or use incognito mode
2. Visit https://craftai.solutions
3. You should see the new gradient-based design
4. Check for the Crisp chat widget in bottom right

## Troubleshooting
If the old site still shows:
1. Check Cloudflare DNS settings (if using Cloudflare)
2. Verify the proxy host is enabled in NPM
3. Check if there are multiple proxy entries for the same domain
4. Restart NPM container if needed: `docker restart nginx-proxy-manager`

## Alternative Direct Access
While DNS/NPM is being updated, the new site is always accessible at:
- http://10.10.1.229/