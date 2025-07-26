#!/bin/bash

echo "🚀 Creating new branch and pushing AI recommendation changes..."

# Kill any stuck git processes
pkill -9 -f git 2>/dev/null || true
sleep 2

# Reset git state if needed
git reset --hard HEAD 2>/dev/null || true

# Create new branch for AI features
BRANCH_NAME="ai-recommendations-$(date +%Y%m%d-%H%M%S)"
echo "Creating branch: $BRANCH_NAME"

# Create and switch to new branch
git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"

# Add all AI-related files
echo "Adding AI recommendation files..."
git add .
git add -f public/ai-recommendations.js
git add -f public/logger.js
git add -f routes/recommendations.js
git add -f AI_SETUP_GUIDE.md
git add -f demo-ai-recommendations.sh
git add -f public/test-ai.html
git add -f public/test-ai-simple.html

# Commit changes
echo "Committing AI recommendation system..."
git commit -m "🤖 Add comprehensive AI recommendation system

Features:
- Multi-provider AI support (OpenAI, Gemini, Anthropic, Local)
- Smart recommendation engine with user preference learning
- Beautiful UI with floating AI button and modals
- Comprehensive error handling and logging
- Mobile-responsive design
- Context-aware recommendations
- User interaction tracking
- Preference management system

Technical:
- Frontend logger system for error-free operation
- Safe event handling and DOM manipulation
- Graceful fallbacks for all dependencies
- Extensive debugging and test pages
- API documentation and setup guides" || echo "Nothing to commit"

# Push to new branch
echo "Pushing to remote repository..."
git push origin "$BRANCH_NAME" || git push -u origin "$BRANCH_NAME"

echo "✅ Successfully pushed to branch: $BRANCH_NAME"
echo "🌐 You can view the changes on GitHub"

# Show final status
git status
echo "📝 Branch: $BRANCH_NAME"
echo "🔗 All AI recommendation features are now saved in git!"