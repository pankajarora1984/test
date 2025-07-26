const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { products } = require('../data/products');

// Simple in-memory storage for user preferences and interaction history
let userPreferences = new Map(); // userId -> preferences object
let userInteractions = new Map(); // userId -> interactions array

// AI Recommendation Engine Configuration
const AI_PROVIDERS = {
    OPENAI: 'openai',
    GEMINI: 'gemini',
    ANTHROPIC: 'anthropic',
    LOCAL: 'local' // Fallback rule-based system
};

const CURRENT_PROVIDER = process.env.AI_PROVIDER || AI_PROVIDERS.LOCAL;

// Product categories and their characteristics for better recommendations
const PRODUCT_CATEGORIES = {
    'silk-sarees': {
        occasions: ['wedding', 'festival', 'formal'],
        priceRange: 'premium',
        demographics: ['adult', 'elderly'],
        seasons: ['all']
    },
    'cotton-sarees': {
        occasions: ['daily', 'casual', 'office'],
        priceRange: 'budget-friendly',
        demographics: ['all'],
        seasons: ['summer', 'monsoon']
    },
    'lehengas': {
        occasions: ['wedding', 'festival', 'party'],
        priceRange: 'premium',
        demographics: ['young-adult', 'adult'],
        seasons: ['winter', 'festival-season']
    },
    'salwar-suits': {
        occasions: ['office', 'casual', 'festival'],
        priceRange: 'moderate',
        demographics: ['all'],
        seasons: ['all']
    }
};

// Get AI-powered recommendations
router.post('/suggest', async (req, res) => {
    try {
        const { 
            userId, 
            preferences = {}, 
            currentProduct = null,
            context = 'general' // 'product-view', 'cart', 'checkout', 'general'
        } = req.body;

        logger.info('🤖 AI recommendation request received', {
            userId,
            context,
            preferences,
            currentProduct: currentProduct?.id
        });

        // Update user preferences
        if (userId && Object.keys(preferences).length > 0) {
            updateUserPreferences(userId, preferences);
        }

        // Track user interaction
        if (userId && currentProduct) {
            trackUserInteraction(userId, 'view', currentProduct.id);
        }

        let recommendations;

        switch (CURRENT_PROVIDER) {
            case AI_PROVIDERS.OPENAI:
                recommendations = await getOpenAIRecommendations(userId, preferences, currentProduct, context);
                break;
            case AI_PROVIDERS.GEMINI:
                recommendations = await getGeminiRecommendations(userId, preferences, currentProduct, context);
                break;
            case AI_PROVIDERS.ANTHROPIC:
                recommendations = await getAnthropicRecommendations(userId, preferences, currentProduct, context);
                break;
            default:
                recommendations = await getLocalRecommendations(userId, preferences, currentProduct, context);
        }

        logger.info('🎯 AI recommendations generated', {
            userId,
            provider: CURRENT_PROVIDER,
            recommendationCount: recommendations.length
        });

        res.json({
            success: true,
            provider: CURRENT_PROVIDER,
            recommendations,
            explanation: recommendations.length > 0 ? recommendations[0].explanation : 'No specific recommendations available',
            context
        });

    } catch (error) {
        logger.error('❌ AI recommendation error', {
            error: error.message,
            stack: error.stack
        });

        // Fallback to rule-based recommendations
        try {
            const fallbackRecommendations = await getLocalRecommendations(
                req.body.userId, 
                req.body.preferences || {}, 
                req.body.currentProduct, 
                req.body.context || 'general'
            );

            res.json({
                success: true,
                provider: 'fallback',
                recommendations: fallbackRecommendations,
                explanation: 'Recommendations based on popular products and user preferences',
                context: req.body.context || 'general'
            });
        } catch (fallbackError) {
            res.status(500).json({
                success: false,
                error: 'Failed to generate recommendations',
                message: 'Both AI and fallback systems are currently unavailable'
            });
        }
    }
});

// OpenAI Integration
async function getOpenAIRecommendations(userId, preferences, currentProduct, context) {
    // Enhanced logging for debugging
    logger.info('🤖 Starting OpenAI recommendations request', {
        userId,
        preferences,
        currentProduct: currentProduct?.id,
        context,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        apiKeyLength: process.env.OPENAI_API_KEY?.length,
        apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...'
    });

    if (!process.env.OPENAI_API_KEY) {
        logger.error('❌ OpenAI API key not configured');
        throw new Error('OpenAI API key not configured');
    }

    // Validate API key format
    const apiKey = process.env.OPENAI_API_KEY.trim();
    if (!apiKey.startsWith('sk-')) {
        logger.error('❌ Invalid OpenAI API key format', {
            keyStart: apiKey.substring(0, 10),
            keyLength: apiKey.length
        });
        throw new Error('Invalid OpenAI API key format');
    }

    const userHistory = getUserInteractions(userId);
    const userPrefs = getUserPreferences(userId);
    const prompt = buildRecommendationPrompt(userPrefs, preferences, currentProduct, context, userHistory);

    logger.debug('📝 OpenAI request details', {
        promptLength: prompt.length,
        userHistoryCount: userHistory.length,
        userPrefsKeys: Object.keys(userPrefs)
    });

    try {
        const requestBody = {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert fashion consultant specializing in Indian ethnic wear. Provide personalized product recommendations based on user preferences, occasions, and style preferences.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };

        logger.debug('🚀 Making OpenAI API request', {
            url: 'https://api.openai.com/v1/chat/completions',
            model: requestBody.model,
            messagesCount: requestBody.messages.length,
            maxTokens: requestBody.max_tokens
        });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        logger.info('📡 OpenAI API response received', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: {
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length')
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('❌ OpenAI API HTTP error', {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText
            });
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        logger.debug('📦 OpenAI API response data', {
            hasChoices: !!data.choices,
            choicesLength: data.choices?.length,
            hasUsage: !!data.usage,
            usage: data.usage,
            firstChoiceKeys: data.choices?.[0] ? Object.keys(data.choices[0]) : null,
            hasMessage: !!data.choices?.[0]?.message,
            messageRole: data.choices?.[0]?.message?.role,
            contentLength: data.choices?.[0]?.message?.content?.length
        });

        if (data.error) {
            logger.error('❌ OpenAI API returned error', {
                error: data.error
            });
            throw new Error(`OpenAI API error: ${data.error.message || JSON.stringify(data.error)}`);
        }
        
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            logger.info('✅ OpenAI response successful', {
                responseLength: data.choices[0].message.content.length,
                tokensUsed: data.usage?.total_tokens
            });
            return parseAIResponse(data.choices[0].message.content);
        }
        
        logger.error('❌ Invalid OpenAI response structure', {
            dataKeys: Object.keys(data),
            data: JSON.stringify(data, null, 2)
        });
        throw new Error('Invalid OpenAI response structure');
    } catch (error) {
        logger.error('❌ OpenAI API call failed', { 
            error: error.message,
            stack: error.stack,
            name: error.name
        });
        throw error;
    }
}

// Google Gemini Integration
async function getGeminiRecommendations(userId, preferences, currentProduct, context) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const userHistory = getUserInteractions(userId);
    const userPrefs = getUserPreferences(userId);
    const prompt = buildRecommendationPrompt(userPrefs, preferences, currentProduct, context, userHistory);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an expert fashion consultant for Indian ethnic wear. ${prompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return parseAIResponse(data.candidates[0].content.parts[0].text);
        }
        
        throw new Error('Invalid Gemini response');
    } catch (error) {
        logger.error('Gemini API error', { error: error.message });
        throw error;
    }
}

// Anthropic Claude Integration
async function getAnthropicRecommendations(userId, preferences, currentProduct, context) {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
    }

    const userHistory = getUserInteractions(userId);
    const userPrefs = getUserPreferences(userId);
    const prompt = buildRecommendationPrompt(userPrefs, preferences, currentProduct, context, userHistory);

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `You are an expert fashion consultant specializing in Indian ethnic wear. ${prompt}`
                }]
            })
        });

        const data = await response.json();
        
        if (data.content && data.content[0]) {
            return parseAIResponse(data.content[0].text);
        }
        
        throw new Error('Invalid Anthropic response');
    } catch (error) {
        logger.error('Anthropic API error', { error: error.message });
        throw error;
    }
}

// Local rule-based recommendation system (fallback)
async function getLocalRecommendations(userId, preferences, currentProduct, context) {
    logger.info('🔧 Using local recommendation engine');
    
    const userHistory = getUserInteractions(userId);
    const userPrefs = getUserPreferences(userId);
    
    // Combine user preferences
    const combinedPrefs = { ...userPrefs, ...preferences };
    
    let candidates = [...products];
    let explanation = "Based on your preferences and popular choices";
    
    // Filter based on context
    if (context === 'product-view' && currentProduct) {
        // Find similar products
        candidates = products.filter(p => 
            p.id !== currentProduct.id && 
            (p.category === currentProduct.category || p.material === currentProduct.material)
        );
        explanation = `Similar to ${currentProduct.name}`;
    }
    
    // Apply preference filters
    if (combinedPrefs.occasion) {
        candidates = candidates.filter(product => {
            const category = PRODUCT_CATEGORIES[product.category] || {};
            return category.occasions && category.occasions.includes(combinedPrefs.occasion);
        });
    }
    
    if (combinedPrefs.priceRange) {
        candidates = candidates.filter(product => {
            switch (combinedPrefs.priceRange) {
                case 'budget': return product.price < 5000;
                case 'moderate': return product.price >= 5000 && product.price < 15000;
                case 'premium': return product.price >= 15000;
                default: return true;
            }
        });
    }
    
    if (combinedPrefs.material) {
        candidates = candidates.filter(product => 
            product.material.toLowerCase().includes(combinedPrefs.material.toLowerCase())
        );
    }
    
    // Sort by rating and popularity
    candidates.sort((a, b) => {
        const scoreA = (a.rating || 3) * 0.7 + (a.reviews || 0) * 0.3;
        const scoreB = (b.rating || 3) * 0.7 + (b.reviews || 0) * 0.3;
        return scoreB - scoreA;
    });
    
    // Take top recommendations
    const recommendations = candidates.slice(0, 6).map((product, index) => ({
        product,
        score: Math.max(0.6, 1 - (index * 0.1)),
        reason: generateRecommendationReason(product, combinedPrefs, context),
        explanation: explanation
    }));
    
    return recommendations;
}

// Build prompt for AI models
function buildRecommendationPrompt(userPrefs, currentPrefs, currentProduct, context, userHistory) {
    const allPrefs = { ...userPrefs, ...currentPrefs };
    const productList = products.map(p => 
        `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Material: ${p.material}, Price: ₹${p.price}, Rating: ${p.rating || 'N/A'}`
    ).join('\n');
    
    let contextInfo = '';
    if (currentProduct) {
        contextInfo = `Currently viewing: ${currentProduct.name} (${currentProduct.category}, ₹${currentProduct.price})`;
    }
    
    return `
Context: ${context}
${contextInfo}

User Preferences:
- Occasion: ${allPrefs.occasion || 'Not specified'}
- Price Range: ${allPrefs.priceRange || 'Not specified'}
- Material Preference: ${allPrefs.material || 'Not specified'}
- Style: ${allPrefs.style || 'Not specified'}
- Size: ${allPrefs.size || 'Not specified'}

Recent Activity: ${userHistory.slice(-5).map(h => h.action + ':' + h.productId).join(', ') || 'None'}

Available Products:
${productList}

Please recommend 3-6 products that best match the user's preferences and context. For each recommendation, provide:
1. Product ID
2. Score (0-1)
3. Brief reason for recommendation

Format your response as JSON:
{
  "recommendations": [
    {
      "productId": "1",
      "score": 0.95,
      "reason": "Perfect match for wedding occasion with premium silk material"
    }
  ]
}
`;
}

// Parse AI response and map to products
function parseAIResponse(response) {
    try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.recommendations) {
                return parsed.recommendations.map(rec => {
                    const product = products.find(p => p.id === rec.productId);
                    return product ? {
                        product,
                        score: rec.score || 0.8,
                        reason: rec.reason || 'AI recommended',
                        explanation: 'AI-powered recommendation based on your preferences'
                    } : null;
                }).filter(Boolean);
            }
        }
        
        // Fallback parsing
        throw new Error('Could not parse AI response');
    } catch (error) {
        logger.warn('Failed to parse AI response, using fallback', { error: error.message });
        // Return top rated products as fallback
        return products
            .sort((a, b) => (b.rating || 3) - (a.rating || 3))
            .slice(0, 4)
            .map(product => ({
                product,
                score: 0.7,
                reason: 'Highly rated product',
                explanation: 'Popular choice among customers'
            }));
    }
}

// Helper functions
function updateUserPreferences(userId, preferences) {
    const existing = userPreferences.get(userId) || {};
    userPreferences.set(userId, { ...existing, ...preferences, lastUpdated: new Date() });
}

function getUserPreferences(userId) {
    return userPreferences.get(userId) || {};
}

function trackUserInteraction(userId, action, productId) {
    const interactions = userInteractions.get(userId) || [];
    interactions.push({
        action,
        productId,
        timestamp: new Date()
    });
    
    // Keep only last 50 interactions
    if (interactions.length > 50) {
        interactions.splice(0, interactions.length - 50);
    }
    
    userInteractions.set(userId, interactions);
}

function getUserInteractions(userId) {
    return userInteractions.get(userId) || [];
}

function generateRecommendationReason(product, preferences, context) {
    const reasons = [];
    
    if (preferences.occasion) {
        const category = PRODUCT_CATEGORIES[product.category];
        if (category && category.occasions.includes(preferences.occasion)) {
            reasons.push(`perfect for ${preferences.occasion}`);
        }
    }
    
    if (preferences.material && product.material.toLowerCase().includes(preferences.material.toLowerCase())) {
        reasons.push(`matches your ${preferences.material} preference`);
    }
    
    if (product.rating >= 4) {
        reasons.push('highly rated by customers');
    }
    
    if (context === 'product-view') {
        reasons.push('similar style and quality');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'great quality and design';
}

// Get user preferences
router.get('/preferences/:userId', (req, res) => {
    const { userId } = req.params;
    const preferences = getUserPreferences(userId);
    
    res.json({
        success: true,
        preferences
    });
});

// Update user preferences
router.put('/preferences/:userId', (req, res) => {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    updateUserPreferences(userId, preferences);
    
    res.json({
        success: true,
        message: 'Preferences updated successfully'
    });
});

// Track user interaction
router.post('/track', (req, res) => {
    const { userId, action, productId } = req.body;
    
    if (userId && action && productId) {
        trackUserInteraction(userId, action, productId);
        
        res.json({
            success: true,
            message: 'Interaction tracked successfully'
        });
    } else {
        res.status(400).json({
            success: false,
            error: 'Missing required fields: userId, action, productId'
        });
    }
});

// Get recommendation stats
router.get('/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const interactions = getUserInteractions(userId);
    const preferences = getUserPreferences(userId);
    
    const stats = {
        totalInteractions: interactions.length,
        recentInteractions: interactions.slice(-10),
        preferences,
        topCategories: getTopCategories(interactions),
        recommendationHistory: interactions.filter(i => i.action === 'recommendation_shown').length
    };
    
    res.json({
        success: true,
        stats
    });
});

function getTopCategories(interactions) {
    const categoryCount = {};
    interactions.forEach(interaction => {
        const product = products.find(p => p.id === interaction.productId);
        if (product) {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        }
    });
    
    return Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }));
}

module.exports = router;