#!/bin/bash

# Cloudflare DNS Record Addition Script for www subdomain
# This will add a CNAME record for www.craftai.solutions pointing to craftai.solutions

ZONE_ID="0f89e71a8c1b08ac57f0741f2acff142"
ACCOUNT_ID="8c3c0de96c5067dbf8bf6b032542166b"

# You need to set these environment variables or replace them here:
# export CF_API_TOKEN="your-api-token-here"
# export CF_API_EMAIL="your-email@example.com"  # Only needed if using Global API Key
# export CF_API_KEY="your-global-api-key"       # Only needed if using Global API Key

if [ -z "$CF_API_TOKEN" ] && [ -z "$CF_API_KEY" ]; then
    echo "Error: Please set either CF_API_TOKEN or CF_API_KEY environment variable"
    echo ""
    echo "Option 1 - Using API Token (recommended):"
    echo "  export CF_API_TOKEN='your-api-token-here'"
    echo ""
    echo "Option 2 - Using Global API Key:"
    echo "  export CF_API_EMAIL='your-email@example.com'"
    echo "  export CF_API_KEY='your-global-api-key'"
    exit 1
fi

echo "Checking existing DNS records..."

# Build headers based on authentication method
if [ -n "$CF_API_TOKEN" ]; then
    AUTH_HEADERS="-H \"Authorization: Bearer $CF_API_TOKEN\""
else
    AUTH_HEADERS="-H \"X-Auth-Email: $CF_API_EMAIL\" -H \"X-Auth-Key: $CF_API_KEY\""
fi

# Check if www record already exists
echo "Checking for existing www record..."
EXISTING_RECORD=$(eval curl -s -X GET \"https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=www.craftai.solutions\" \
    $AUTH_HEADERS \
    -H \"Content-Type: application/json\")

RECORD_COUNT=$(echo "$EXISTING_RECORD" | python3 -c "import json, sys; data = json.load(sys.stdin); print(len(data.get('result', [])))" 2>/dev/null || echo "0")

if [ "$RECORD_COUNT" -gt "0" ]; then
    echo "WWW record already exists:"
    echo "$EXISTING_RECORD" | python3 -m json.tool | grep -A 5 '"name"'
    echo ""
    echo "Would you like to update it? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Exiting without changes."
        exit 0
    fi
    
    # Get the record ID to update
    RECORD_ID=$(echo "$EXISTING_RECORD" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data['result'][0]['id'])" 2>/dev/null)
    
    echo "Updating existing record..."
    UPDATE_RESULT=$(eval curl -s -X PUT \"https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID\" \
        $AUTH_HEADERS \
        -H \"Content-Type: application/json\" \
        --data '{
            "type": "CNAME",
            "name": "www",
            "content": "craftai.solutions",
            "ttl": 1,
            "proxied": true
        }')
    
    echo "$UPDATE_RESULT" | python3 -m json.tool
else
    echo "No www record found. Creating new CNAME record..."
    
    # Create new CNAME record
    CREATE_RESULT=$(eval curl -s -X POST \"https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records\" \
        $AUTH_HEADERS \
        -H \"Content-Type: application/json\" \
        --data '{
            "type": "CNAME",
            "name": "www",
            "content": "craftai.solutions",
            "ttl": 1,
            "proxied": true,
            "comment": "WWW subdomain redirect to main domain"
        }')
    
    echo "$CREATE_RESULT" | python3 -m json.tool
fi

echo ""
echo "DNS record operation complete!"
echo ""
echo "Testing DNS resolution (may take a few minutes to propagate):"
echo "----------------------------------------"
nslookup www.craftai.solutions 1.1.1.1
echo "----------------------------------------"
echo ""
echo "The www subdomain should now redirect to craftai.solutions"
echo "Note: DNS changes may take up to 5 minutes to fully propagate."