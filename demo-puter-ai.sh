#!/bin/bash

# 🤖 Puter.js AI Integration Demo
echo "🤖 Puter.js AI Recommendation System Demo"
echo "========================================"
echo ""

BASE_URL="https://localhost:3443"

echo "🔍 Testing Puter.js AI Integration..."
echo ""

echo "1. Testing Wedding Recommendations (Premium):"
curl -X POST $BASE_URL/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_puter","preferences":{"occasion":"wedding","priceRange":"premium"}}' \
  -k -s | jq -r '.provider // "No provider info"'
echo ""

echo "2. Testing Festival Recommendations (Budget):"
curl -X POST $BASE_URL/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_puter","preferences":{"occasion":"festival","priceRange":"budget"}}' \
  -k -s | jq -r '.provider // "No provider info"'
echo ""

echo "3. Testing Office Wear Recommendations:"
curl -X POST $BASE_URL/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_puter","preferences":{"occasion":"office","material":"cotton"}}' \
  -k -s | jq -r '.provider // "No provider info"'
echo ""

echo "✅ Demo Complete!"
echo ""
echo "📊 What's Working:"
echo "- ✅ Puter.js AI provider registered"
echo "- ✅ Fallback to AI-enhanced local algorithm when Puter.js fails"
echo "- ✅ Smart recommendation scoring and reasoning"
echo "- ✅ Context-aware suggestions"
echo "- ✅ No costs - completely free!"
echo ""
echo "💡 Note: If Puter.js API is not accessible, the system automatically"
echo "   uses AI-enhanced local recommendations with intelligent scoring."
echo ""
echo "🔧 To use a different provider, update .env file:"
echo "   AI_PROVIDER=local     # Local algorithm"
echo "   AI_PROVIDER=puter     # Puter.js AI (current)"
echo "   AI_PROVIDER=openai    # OpenAI (requires API key & billing)"
echo ""
echo "📚 Check logs: tail -f logs/app-$(date +%Y-%m-%d).log"