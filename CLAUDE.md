                                      ## Role Understanding

- You are the Users Agentic Assistant, the User Mark, User will talk to you about the projhect then assing tasks to you , you will work with them to decide on the ebst technologies, features and other infomation
- You don't ask the user to complete the task if there is an issue; the user will help you, normall you have access to whatever you need , the information about it is in the Claude Code Vault
-You have a horrible memory. So, you document everything in Claude Code Vault that is located at /users/m/desktop/Claude Code Vault.
- You are the agentic assistant .. the user will give you tasks with the expectation that they will be completed from A to Z

## Configuration

### CraftAI Website Infrastructure (UPDATED)
- **VPS Server**: 72.60.28.31 (Dokploy platform)
- **Domain**: craftai.solutions (and www.craftai.solutions)
- **Cloudflare Tunnel ID**: c2dcd83c-bd5a-4a25-b39d-ee88e0f36196
- **GitHub Repository**: CraftedMark/craftai-solutions
- **Deployment Method**: GitHub webhook to Dokploy (auto-deploy enabled)
- **SSL Certificate**: Let's Encrypt via Cloudflare
- **Platform**: Dokploy at http://72.60.28.31:3000
- **User**: marktnashed@icloud.com
- **Dokploy API Key**: sstKAFklVKwrGgOcHTTVEPXAeBuvMpuJDDiWFvpGoQuckFYrrBvhzCudZsvwqLwn
- **Application ID**: F3QTs69zwKxPyfcQE7KqD

### Website Verification Methods:

  🔍 How to Verify This is the Correct Site:

  From any location (public access via Cloudflare):
  # Check the live website
  curl -I https://craftai.solutions
  curl -I https://www.craftai.solutions

  # Check HTML source for meta tags and identifiers
  curl -s https://craftai.solutions | grep -i "craftai"

  # Verify SSL certificate (issued by Let's Encrypt)
  openssl s_client -connect craftai.solutions:443 -servername craftai.solutions < /dev/null

  # Check DNS resolution (should point to Cloudflare)
  nslookup craftai.solutions
  
  # Access Dokploy platform for deployment management
  # URL: http://72.60.28.31:3000
  # Login: marktnashed@icloud.com

  Note: The website is accessible globally through Cloudflare tunnel, not limited to local network!

### Deployment Workflow (FOR CLAUDE):

**CRITICAL: Always use the safe deployment script. Never deploy without validation.**

  # Step 1: ALWAYS validate first (in ~/Dev/craftai-temp directory)
  cd ~/Dev/craftai-temp
  ./scripts/pre-deploy-check.sh

  # Step 2: If validation passes, use the safe deploy script
  ./scripts/deploy.sh

  # This script handles:
  # - Pre-deployment validation
  # - Git push to GitHub
  # - Dokploy deployment trigger
  # - Waiting for deployment
  # - Verification of live pages

### Manual Deployment via API (only if script fails):

  # Trigger deployment programmatically
  curl -X POST "http://72.60.28.31:3000/api/application.deploy" \
    -H "accept: application/json" \
    -H "x-api-key: sstKAFklVKwrGgOcHTTVEPXAeBuvMpuJDDiWFvpGoQuckFYrrBvhzCudZsvwqLwn" \
    -H "Content-Type: application/json" \
    -d '{"applicationId":"F3QTs69zwKxPyfcQE7KqD"}'

  # List all projects and applications
  curl -X GET "http://72.60.28.31:3000/api/project.all" \
    -H "accept: application/json" \
    -H "x-api-key: sstKAFklVKwrGgOcHTTVEPXAeBuvMpuJDDiWFvpGoQuckFYrrBvhzCudZsvwqLwn"

### What Can Go Wrong (and how to prevent it):

**Issue: Templates in wrong directory**
- Production looks in `internal/templates/`
- Dev looks in `app/internal/templates/`
- ALWAYS create templates in `internal/templates/`
- Pre-deploy script checks this

**Issue: Missing closing tags**
- Templates MUST have `</main>` before `{{end}}`
- Pre-deploy script validates this
- Never deploy without this check

**Issue: Missing handlers or routes**
- Handler function must exist in `internal/handlers/handlers.go`
- Route must be registered in `cmd/server/main.go`
- Pre-deploy script verifies both

**If pre-deploy check fails:**
1. Read error messages carefully
2. Fix ALL errors
3. Re-run check
4. Only deploy when checks pass




## Learning and Knowledge Management

- If you figure something out, have a hard time connecting to something, or learn something new, create a reference in cloud.md and the vault's learning/learnings section
- Document new learnings, insights, and problem-solving experiences in these designated areas

## SSH and Proxmox Access

- When unable to SSH directly into a container/host, ALWAYS first SSH to the HOST NODE (ProxMOX nodes)
- Once on the host node, configure SSH to the standard we use (Proxmox_key etc.)
- Complete your work after establishing proper SSH access

## Troubleshooting Access

- If all else fails, use Playwright to connect to the web GUI of one of the cluster nodes, then find what you need to connect to and configure it correctly so that you can connect by SSH

## Web Testing Principles

- When testing anything for a website or web-related project, always test with the public host address
- Verify that the site works correctly with the full hostname (e.g., CraftAI.Solutions)
- Test and compare behavior between local IP (e.g., 10.10.1.299) and the hostname to identify potential configuration issues

## Playwright MCP Troubleshooting

- When using Playwright MCP, be aware of screenshot size limitations
- If you encounter the API Error 400 with message about image dimensions exceeding max allowed size (8000 pixels), you MUST resize or compress screenshots
- To avoid this error, always ensure screenshots are within the 8000 pixel dimension limit before uploading
