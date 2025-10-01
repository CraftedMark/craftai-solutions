#!/bin/bash
# Safe deployment script with validation
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 CraftAI Solutions - Safe Deployment Script"
echo "=============================================="
echo ""

# Load API key from CLAUDE.md
API_KEY="sstKAFklVKwrGgOcHTTVEPXAeBuvMpuJDDiWFvpGoQuckFYrrBvhzCudZsvwqLwn"
APP_ID="F3QTs69zwKxPyfcQE7KqD"
DOKPLOY_URL="http://72.60.28.31:3000"

# Step 1: Run pre-deployment checks
echo "Step 1: Running pre-deployment validation..."
if ! ./scripts/pre-deploy-check.sh; then
    echo "❌ Pre-deployment checks failed. Aborting."
    exit 1
fi

echo ""
echo "Step 2: Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo ""
echo "Step 3: Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  You're on branch '$CURRENT_BRANCH', not master/main"
    read -p "Deploy from this branch? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo ""
echo "Step 4: Pushing to GitHub..."
git push origin "$CURRENT_BRANCH"

echo ""
echo "Step 5: Triggering Dokploy deployment..."
RESPONSE=$(curl -s -X POST "$DOKPLOY_URL/api/application.deploy" \
  -H "accept: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"applicationId\":\"$APP_ID\"}")

if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ Deployment trigger failed: $RESPONSE"
    exit 1
fi

echo "✅ Deployment triggered successfully!"
echo ""
echo "Step 6: Waiting for deployment (90 seconds)..."
for i in {90..1}; do
    printf "\rTime remaining: %2d seconds" $i
    sleep 1
done
echo ""

echo ""
echo "Step 7: Verifying deployment..."
echo "Checking critical pages..."

check_page() {
    local url=$1
    local name=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status" = "200" ]; then
        echo "✓ $name: OK (HTTP $status)"
        return 0
    else
        echo "✗ $name: FAILED (HTTP $status)"
        return 1
    fi
}

FAILED=0
check_page "https://craftai.solutions/" "Homepage" || FAILED=1
check_page "https://craftai.solutions/about" "About" || FAILED=1
check_page "https://craftai.solutions/privacy" "Privacy" || FAILED=1
check_page "https://craftai.solutions/terms" "Terms" || FAILED=1
check_page "https://craftai.solutions/contact" "Contact" || FAILED=1

echo ""
if [ $FAILED -eq 0 ]; then
    echo "=============================================="
    echo "✅ Deployment successful and verified!"
    echo "=============================================="
    echo ""
    echo "Live site: https://craftai.solutions"
    exit 0
else
    echo "=============================================="
    echo "⚠️  Deployment completed but some pages failed verification"
    echo "=============================================="
    echo ""
    echo "Check Dokploy logs: $DOKPLOY_URL"
    exit 1
fi
