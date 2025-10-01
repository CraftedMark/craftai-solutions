#!/bin/bash
# Pre-deployment validation script
# Run this before every deployment to catch issues early

set -e

echo "🔍 CraftAI Solutions - Pre-Deployment Validation"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to report error
error() {
    echo -e "${RED}✗ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to report warning
warning() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# Function to report success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo "1. Checking template files..."
# Check that all templates exist in the correct location
REQUIRED_TEMPLATES=(
    "internal/templates/layout.html"
    "internal/templates/home.html"
    "internal/templates/about.html"
    "internal/templates/privacy.html"
    "internal/templates/terms.html"
    "internal/templates/contact.html"
)

for template in "${REQUIRED_TEMPLATES[@]}"; do
    if [ -f "$template" ]; then
        success "Template exists: $template"
    else
        error "Missing template: $template"
    fi
done

echo ""
echo "2. Checking for closing tags in templates..."
# Check that all templates have closing </main> tags
for template in internal/templates/*.html; do
    if [ -f "$template" ] && [ "$(basename "$template")" != "layout.html" ]; then
        if grep -q "{{define \"content\"}}" "$template"; then
            if ! grep -q "</main>" "$template"; then
                error "Missing </main> tag in: $template"
            else
                success "Has </main> tag: $(basename "$template")"
            fi
        fi
    fi
done

echo ""
echo "3. Checking handler functions..."
# Check that handlers exist for all pages
HANDLERS_FILE="internal/handlers/handlers.go"
REQUIRED_HANDLERS=(
    "HomeHandler"
    "AboutHandler"
    "PrivacyHandler"
    "TermsHandler"
    "ContactHandler"
)

if [ -f "$HANDLERS_FILE" ]; then
    for handler in "${REQUIRED_HANDLERS[@]}"; do
        if grep -q "func ${handler}" "$HANDLERS_FILE"; then
            success "Handler exists: $handler"
        else
            error "Missing handler: $handler"
        fi
    done
else
    error "Handlers file not found: $HANDLERS_FILE"
fi

echo ""
echo "4. Checking routes in main.go..."
# Check that routes are registered
MAIN_FILE="cmd/server/main.go"
REQUIRED_ROUTES=(
    '"/about"'
    '"/privacy"'
    '"/terms"'
    '"/contact"'
)

if [ -f "$MAIN_FILE" ]; then
    for route in "${REQUIRED_ROUTES[@]}"; do
        if grep -q "$route" "$MAIN_FILE"; then
            success "Route registered: $route"
        else
            error "Missing route: $route"
        fi
    done
else
    error "Main file not found: $MAIN_FILE"
fi

echo ""
echo "5. Running Go build test..."
# Try to build the project
if go build -o /tmp/craftai-test ./cmd/server/main.go 2>&1; then
    success "Go build successful"
    rm -f /tmp/craftai-test
else
    error "Go build failed"
fi

echo ""
echo "6. Checking for syntax errors in templates..."
# Basic HTML validation
for template in internal/templates/*.html; do
    if [ -f "$template" ]; then
        # Check for common issues
        if grep -q "{{end}}" "$template"; then
            # Check if {{define}} has matching {{end}}
            defines=$(grep -c "{{define" "$template" || echo 0)
            ends=$(grep -c "{{end}}" "$template" || echo 0)
            if [ "$defines" -ne "$ends" ]; then
                warning "Mismatched {{define}}/{{end}} in $(basename "$template")"
            fi
        fi
    fi
done

echo ""
echo "================================================"
echo "Pre-Deployment Check Complete"
echo "================================================"
echo -e "${RED}Errors: $ERRORS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ DEPLOYMENT BLOCKED - Fix errors before deploying${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All checks passed - Safe to deploy${NC}"
    exit 0
fi
