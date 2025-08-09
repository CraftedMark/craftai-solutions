#!/bin/bash

# Deploy script for automation website

echo "🚀 Deploying to production..."

# Add all changes
git add -A

# Commit with message (use first argument or default message)
COMMIT_MSG="${1:-"Update from local development"}"
git commit -m "$COMMIT_MSG"

# Push to production
echo "📤 Pushing to production server..."
GIT_SSH_COMMAND="ssh -i ~/.ssh/Proxmox_key" git push production master

echo "✅ Deployment complete!"
echo "🌐 Your changes are now live at http://10.10.1.229/"