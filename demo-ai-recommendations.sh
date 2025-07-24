#!/bin/bash

# 🤖 AI Recommendation System Demo Script
# This script demonstrates all the AI recommendation features

echo "🤖 AI Recommendation System Demo"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="https://localhost:3443"

echo -e "${BLUE}1. Testing Basic AI Recommendations${NC}"
echo "Getting wedding recommendations..."
curl -X POST $BASE_URL/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_user","preferences":{"occasion":"wedding","priceRange":"premium"}}' \
  -k -s | jq -r '.recommendations[0].product.name // "No recommendations"'
echo ""

echo -e "${BLUE}2. Testing Festival Recommendations${NC}"
echo "Getting festival recommendations..."
curl -X POST $BASE_URL/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_user","preferences":{"occasion":"festival","material":"silk"}}' \
  -k -s | jq -r '.recommendations[0].product.name // "No recommendations"'
echo ""

echo -e "${BLUE}3. Testing Budget-Friendly Recommendations${NC}"
echo "Getting budget-friendly recommendations..."
curl -X POST $BASE_URL/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_user","preferences":{"priceRange":"budget","occasion":"casual"}}' \
  -k -s | jq -r '.recommendations[0].product.name // "No recommendations"'
echo ""

echo -e "${BLUE}4. Tracking User Interaction${NC}"
echo "Tracking product view..."
curl -X POST $BASE_URL/api/recommendations/track \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_user","action":"view","productId":"1"}' \
  -k -s | jq -r '.message // "Tracking failed"'
echo ""

echo -e "${BLUE}5. Saving User Preferences${NC}"
echo "Saving user preferences..."
curl -X PUT $BASE_URL/api/recommendations/preferences/demo_user \
  -H "Content-Type: application/json" \
  -d '{"preferences":{"occasion":"wedding","priceRange":"premium","material":"silk","style":"traditional"}}' \
  -k -s | jq -r '.message // "Preferences not saved"'
echo ""

echo -e "${BLUE}6. Getting User Statistics${NC}"
echo "Getting user recommendation stats..."
curl -X GET $BASE_URL/api/recommendations/stats/demo_user \
  -k -s | jq -r '.stats.totalInteractions // "No stats available"'
echo ""

echo -e "${GREEN}✅ Demo Complete!${NC}"
echo ""
echo -e "${YELLOW}🌐 Visit your website to test the UI:${NC}"
echo "https://13.51.196.99:3443/"
echo ""
echo -e "${YELLOW}🤖 Look for:${NC}"
echo "- Floating AI button (bottom-right)"
echo "- Navigation menu AI button"
echo "- Product detail recommendations"
echo "- Preference forms"
echo ""
echo -e "${YELLOW}📚 API Documentation:${NC}"
echo "https://13.51.196.99:3443/api"
echo ""
echo -e "${YELLOW}📖 Setup Guide:${NC}"
echo "See AI_SETUP_GUIDE.md for full configuration options"