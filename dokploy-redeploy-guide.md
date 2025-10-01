# Dokploy Redeploy Guide for craftai-solutions

## Current Situation
- **GitHub Repo**: https://github.com/CraftedMark/craftai-solutions
- **Latest Commit**: 5a7df18 "Add legal pages, testimonials, FAQ, and contact form database integration"
- **Live Site**: https://craftai.solutions
- **Issue**: Changes not reflected on live site (privacy page returns 404)
- **Dokploy Dashboard**: http://72.60.28.31:3000

## Method 1: Manual Redeploy via Dashboard (Quickest)

1. **Access Dashboard**
   ```
   URL: http://72.60.28.31:3000
   Email: marktnashed@icloud.com
   Password: [Your password]
   ```

2. **Navigate to Application**
   - Find "craftai-solutions" in the projects list
   - Click to open application details

3. **Trigger Deployment**
   - Look for "Deploy", "Redeploy", or "Rebuild" button
   - Click to trigger manual deployment
   - Monitor deployment logs for completion

4. **Verify Deployment**
   ```bash
   # Check if privacy page is now accessible
   curl -I https://craftai.solutions/privacy
   # Should return: HTTP/2 200
   ```

## Method 2: API-Based Deployment (Requires Setup)

### Step 1: Generate API Token
1. Log into Dokploy dashboard
2. Go to Profile Settings
3. Generate new API token
4. Save the token securely

### Step 2: Get Application ID
```bash
# List all projects and applications
curl -X 'GET' \
  'http://72.60.28.31:3000/api/project.all' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR_API_TOKEN'

# Find the applicationId for "craftai-solutions"
```

### Step 3: Trigger Deployment via API
```bash
# Replace YOUR_API_TOKEN and YOUR_APPLICATION_ID
curl -X 'POST' \
  'http://72.60.28.31:3000/api/application.deploy' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR_API_TOKEN' \
  -d '{
    "applicationId": "YOUR_APPLICATION_ID"
  }'
```

### Step 4: Create Deployment Script
Once you have the API token and application ID, create a script:

```bash
#!/bin/bash
# redeploy.sh

API_TOKEN="your_api_token_here"
APP_ID="your_application_id_here"
DOKPLOY_URL="http://72.60.28.31:3000"

echo "Triggering deployment for craftai-solutions..."

response=$(curl -s -X 'POST' \
  "${DOKPLOY_URL}/api/application.deploy" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "x-api-key: ${API_TOKEN}" \
  -d "{\"applicationId\": \"${APP_ID}\"}")

echo "Response: $response"

echo "Waiting for deployment to complete..."
sleep 30

echo "Checking if privacy page is accessible..."
status_code=$(curl -o /dev/null -s -w "%{http_code}" https://craftai.solutions/privacy)

if [ "$status_code" == "200" ]; then
  echo "✓ Deployment successful! Privacy page is now accessible."
else
  echo "✗ Privacy page returned status code: $status_code"
  echo "  Please check Dokploy logs for details."
fi
```

Make it executable:
```bash
chmod +x redeploy.sh
./redeploy.sh
```

## Method 3: GitHub Actions Auto-Deploy (Future Automation)

For automatic deployments on every push to main, you can set up a GitHub Action:

1. Create `.github/workflows/dokploy-deploy.yml`:

```yaml
name: Deploy to Dokploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Dokploy Deployment
        run: |
          curl -X 'POST' \
            '${{ secrets.DOKPLOY_URL }}/api/application.deploy' \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H 'x-api-key: ${{ secrets.DOKPLOY_API_TOKEN }}' \
            -d '{"applicationId": "${{ secrets.DOKPLOY_APP_ID }}"}'

      - name: Wait for deployment
        run: sleep 30

      - name: Verify deployment
        run: |
          STATUS=$(curl -o /dev/null -s -w "%{http_code}" https://craftai.solutions)
          if [ "$STATUS" != "200" ]; then
            echo "Deployment verification failed"
            exit 1
          fi
```

2. Add GitHub Secrets:
   - `DOKPLOY_URL`: http://72.60.28.31:3000
   - `DOKPLOY_API_TOKEN`: Your API token
   - `DOKPLOY_APP_ID`: Your application ID

## Verification Checklist

After redeployment, verify:

- [ ] https://craftai.solutions returns 200
- [ ] https://craftai.solutions/privacy returns 200 (not 404)
- [ ] https://craftai.solutions/terms returns 200
- [ ] https://craftai.solutions/contact returns 200
- [ ] Latest commit (5a7df18) changes are visible

## Troubleshooting

### If privacy page still returns 404:
1. Check Dokploy deployment logs for errors
2. Verify Docker image was rebuilt successfully
3. Check if the application restarted properly
4. Verify the routes are correctly configured in your Go application

### If deployment fails:
1. Check application logs in Dokploy
2. Verify Docker configuration
3. Check for any environment variable issues
4. Ensure GitHub repository access is configured correctly

## Support Resources

- Dokploy Documentation: https://docs.dokploy.com
- API Documentation: https://docs.dokploy.com/docs/core/auto-deploy
- GitHub Repo: https://github.com/CraftedMark/craftai-solutions
