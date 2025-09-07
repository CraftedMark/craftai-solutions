#!/bin/bash

# Deploy script for CraftAI Solutions website

echo "🚀 Deploying to Dokploy production..."

# Add all changes
git add -A

# Commit with message (use first argument or default message)
COMMIT_MSG="${1:-"Update from local development"}"
git commit -m "$COMMIT_MSG"

# Push to GitHub (which triggers Dokploy deployment)
echo "📤 Pushing to GitHub for Dokploy deployment..."
git push github master

echo "✅ Push complete!"
echo "🌐 Dokploy will now deploy your changes to http://72.60.28.31:3000"
echo "Note: Deployment may take a few minutes to complete on Dokploy"