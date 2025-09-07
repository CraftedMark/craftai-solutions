# Git Workflow for Automation Website

## Setup Complete! 🎉

Your git workflow is now configured with:
- **Local Development**: `/Users/m/automation-website-go` (your current directory)
- **Production Server**: `10.10.1.229`
- **Automatic Deployment**: Changes pushed to production are automatically deployed

## How to Use

### 1. Make Changes Locally
Edit files on your local machine. The hot reload development server will show changes instantly:
```bash
~/go/bin/air
```

### 2. Deploy to Production

#### Option A: Use the deploy script
```bash
./deploy.sh "Your commit message"
```

#### Option B: Manual git commands
```bash
git add -A
git commit -m "Your commit message"
git push production master
```

### 3. What Happens on Deploy
When you push to production, the post-receive hook automatically:
1. Updates the code in `/opt/automation-website-go`
2. Stops the current Docker containers
3. Rebuilds the Docker images
4. Starts the new containers
5. Your site is live at `http://10.10.1.229/`

## Important Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

### View Remote Configuration
```bash
git remote -v
```

### Pull Changes (if needed)
```bash
git pull production master
```

## Production Server Details

- **Git Repository**: `/opt/git/automation-website.git` (bare repo)
- **Application Directory**: `/opt/automation-website-go`
- **Docker Compose**: Runs on port 3000
- **Nginx**: Proxies from port 80 to port 3000

## Troubleshooting

### If deployment fails:
1. SSH to the server: `ssh -i ~/.ssh/Proxmox_key root@10.10.1.229`
2. Check Docker logs: `cd /opt/automation-website-go && docker-compose logs`
3. Manually restart: `docker-compose down && docker-compose up -d`

### If git push is rejected:
```bash
git pull production master --allow-unrelated-histories
git push production master
```