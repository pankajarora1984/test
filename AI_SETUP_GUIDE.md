# 🤖 AI Recommendation System Setup Guide

## Overview

Your Chandan Sarees website now includes an advanced AI-powered recommendation system that provides personalized product suggestions based on customer preferences, browsing behavior, and purchasing patterns.

## 🎯 Features

### ✅ **Multiple AI Providers**
- **OpenAI GPT-3.5/4** - Premium AI recommendations
- **Google Gemini** - Google's latest AI model
- **Anthropic Claude** - Advanced reasoning capabilities
- **Local Algorithm** - Fallback rule-based system (no API required)

### ✅ **Smart Recommendations**
- **Context-Aware**: Different recommendations for product viewing, cart, checkout
- **Preference-Based**: Filter by occasion, price range, material, style
- **Learning System**: Tracks user interactions to improve suggestions
- **Multi-Context**: Homepage, product details, cart recommendations

### ✅ **User Experience**
- **Beautiful UI**: Professional modal with loading animations
- **Mobile-Friendly**: Responsive design for all devices
- **Easy Access**: Floating AI button + navigation menu
- **Preference Management**: Save and update user preferences

## 🛠️ Setup Instructions

### 1. **Choose Your AI Provider**

#### Option A: Use Local Algorithm (No Setup Required)
```bash
# Already configured by default
AI_PROVIDER=local
```
✅ **Ready to use immediately!**

#### Option B: OpenAI Integration
```bash
# Get API key from: https://platform.openai.com/api-keys
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Option C: Google Gemini Integration
```bash
# Get API key from: https://aistudio.google.com/app/apikey
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Option D: Anthropic Claude Integration
```bash
# Get API key from: https://console.anthropic.com/
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 2. **Environment Configuration**

Edit your `.env` file:
```env
# AI Recommendation Configuration
AI_PROVIDER=local  # Change to: openai, gemini, anthropic, or local

# API Keys (uncomment the one you're using)
# OPENAI_API_KEY=your_openai_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. **Restart Your Server**
```bash
npm run start:https
```

## 🎨 User Interface

### **Navigation Button**
- Located in the main navigation menu
- Shows: "🤖 AI Recommendations"

### **Floating AI Button**
- Fixed position button (bottom-right corner)
- Always accessible on any page
- Robot emoji icon

### **Recommendation Modal**
- Beautiful card-based layout
- AI confidence scores
- Preference refinement form
- Add to cart functionality

## 📊 API Endpoints

### **Get Recommendations**
```javascript
POST /api/recommendations/suggest
{
  "userId": "user123",
  "preferences": {
    "occasion": "wedding",
    "priceRange": "premium",
    "material": "silk"
  },
  "currentProduct": { /* product object */ },
  "context": "product-view"
}
```

### **Track User Interactions**
```javascript
POST /api/recommendations/track
{
  "userId": "user123",
  "action": "view",
  "productId": "product1"
}
```

### **Manage User Preferences**
```javascript
// Get preferences
GET /api/recommendations/preferences/:userId

// Update preferences
PUT /api/recommendations/preferences/:userId
{
  "preferences": {
    "occasion": "festival",
    "priceRange": "moderate"
  }
}
```

### **Get Statistics**
```javascript
GET /api/recommendations/stats/:userId
```

## 🔧 Customization

### **Adding New Product Categories**
Edit `routes/recommendations.js`:
```javascript
const PRODUCT_CATEGORIES = {
    'your-new-category': {
        occasions: ['occasion1', 'occasion2'],
        priceRange: 'budget-friendly',
        demographics: ['young-adult'],
        seasons: ['summer']
    }
};
```

### **Customizing AI Prompts**
Modify the `buildRecommendationPrompt` function in `routes/recommendations.js` to adjust how AI models receive context.

### **UI Customization**
Edit `public/ai-recommendations.js` to modify:
- Modal appearance
- Button styles
- Loading animations
- Recommendation cards

## 💡 Usage Examples

### **1. Homepage Recommendations**
```javascript
// Get general recommendations
aiRecommendations.showRecommendationModal({}, 'general');
```

### **2. Product Page Recommendations**
```javascript
// Get similar product recommendations
const currentProduct = { id: '1', name: 'Silk Saree', category: 'silk-sarees' };
aiRecommendations.getRecommendations({}, currentProduct, 'product-view');
```

### **3. Cart Recommendations**
```javascript
// Get cart completion recommendations
aiRecommendations.showRecommendationModal({}, 'cart');
```

### **4. Custom Preferences**
```javascript
// Wedding sarees under ₹15,000
aiRecommendations.showRecommendationModal({
    occasion: 'wedding',
    priceRange: 'moderate',
    material: 'silk'
}, 'custom');
```

## 🎯 How It Works

### **Local Algorithm (Default)**
1. **Category Matching**: Finds products in similar categories
2. **Preference Filtering**: Applies occasion, price, material filters
3. **Popularity Scoring**: Uses ratings and reviews
4. **Context Awareness**: Adjusts based on current context

### **AI Providers**
1. **Context Analysis**: AI analyzes user preferences and behavior
2. **Product Matching**: AI selects best products from catalog
3. **Reasoning**: AI provides explanations for recommendations
4. **Learning**: AI improves suggestions based on interactions

## 📈 Analytics & Tracking

### **User Interactions Tracked**
- Product views
- Add to cart actions
- Recommendation clicks
- Preference updates
- Modal displays

### **Available Metrics**
- Total interactions per user
- Top product categories
- Recommendation success rate
- User preference patterns

### **Access Analytics**
```javascript
// Get user statistics
fetch('/api/recommendations/stats/user123')
  .then(res => res.json())
  .then(stats => console.log(stats));
```

## 🔒 Security & Privacy

### **Data Protection**
- User preferences stored in memory (not persistent)
- No personal data sent to AI providers
- Only product preferences and interactions tracked
- Guest users supported with temporary IDs

### **API Security**
- API keys stored in environment variables
- Rate limiting on recommendation endpoints
- Input validation on all requests
- Error handling with fallbacks

## 🚨 Troubleshooting

### **AI Provider Not Working**
1. Check API key is correct
2. Verify internet connection
3. Check API quotas/billing
4. System falls back to local algorithm

### **No Recommendations Shown**
1. Check product data exists
2. Verify preferences match available products
3. Check browser console for errors
4. Test with different preference combinations

### **Performance Issues**
1. Monitor API response times
2. Check server logs
3. Consider caching recommendations
4. Use local provider for better performance

## 🎉 Testing Your Setup

### **1. Basic Test**
```bash
# Test recommendation endpoint
curl -X POST https://your-domain.com/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","preferences":{"occasion":"wedding"}}'
```

### **2. Frontend Test**
1. Open your website
2. Click the floating 🤖 button
3. Try different preference combinations
4. Add recommended products to cart

### **3. AI Provider Test**
```bash
# Test with your AI provider
curl -X POST https://your-domain.com/api/recommendations/suggest \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","preferences":{"occasion":"festival","priceRange":"premium"}}'
```

## 📋 Success Checklist

- [ ] ✅ AI provider configured in `.env`
- [ ] ✅ Server restarted
- [ ] ✅ Floating AI button visible
- [ ] ✅ Navigation button added
- [ ] ✅ Recommendation modal opens
- [ ] ✅ Preferences form works
- [ ] ✅ Products display correctly
- [ ] ✅ Add to cart functions
- [ ] ✅ Mobile responsiveness verified
- [ ] ✅ API endpoints responding

## 🎊 Congratulations!

Your AI recommendation system is now live! Customers can discover products tailored to their preferences, improving engagement and sales.

## 📞 Support

For issues or customization requests:
1. Check the server logs: `npm run logs:view`
2. Test API endpoints manually
3. Verify environment variables
4. Check browser console for frontend errors

---

**Happy Recommending! 🤖✨**