// src/smartsocial/server/api/extension/v1/linkedin/caption.ts

import express from 'express';
import rateLimit from 'express-rate-limit';
import { addDoc, collection } from 'firebase/firestore';
import { callCaptionAgent } from '../../../../../agents/captionAgent';
import { consumeQuota, getRemaining } from '../../../../../services/quotaService'; // ✅ ADD getRemaining
import { db } from '../../../../../utils/mockFirebase';
import { getUserContext } from '../../../../../utils/userContext';
import { verifyExtensionAuth } from '../../../../middleware/extensionAuth';

const router = express.Router();

// Rate limiting: 100 requests per hour per extension
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { 
    success: false, 
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this extension. Please try again later.'
  },
  keyGenerator: (req: express.Request) => {
    return (req.headers['x-extension-key'] as string) || req.ip || 'unknown';
  }
});

router.use(limiter);
router.use(verifyExtensionAuth);

// Type declaration for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
      extensionKey?: string;
    }
  }
}

// POST /api/extension/v1/linkedin/caption
router.post('/caption', async (req: express.Request, res: express.Response) => {
  try {
    // Request validation
    const { prompt, context, options } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_INPUT',
        message: 'Prompt is required and must be a non-empty string.'
      });
    }
    
    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        code: 'PROMPT_TOO_LONG',
        message: 'Prompt must be less than 1000 characters.'
      });
    }
    
    // Get user info from auth middleware
    const userId = req.user?.uid;
    const extensionKey = req.extensionKey;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User information not found in request.'
      });
    }
    
    console.log(`📦 Extension request from ${userId} via ${extensionKey?.substring(0, 12)}...`);
    
    // Step 1: Get user context (plan, features)
    const userContext = await getUserContext(userId);
    const planKey = userContext.onboarding?.plan || 'free';
    
    // Step 2: Consume quota for extension usage
    const quotaResult = await consumeQuota(
      db,
      userId,
      planKey,
      'usedExtensionQuota',
      1,
      { 
        idempotencyKey: `ext-caption:${userId}:${extensionKey}:${Date.now()}`,
        docPath: `users/${userId}/quota/meta` // ✅ CHANGED: Fixed path
      }
    );
    
    if (!quotaResult.success) {
      // Log quota failure for analytics
      await addDoc(collection(db, 'extension_logs'), {
        userId,
        extensionKey: extensionKey?.substring(0, 8) + '...',
        action: 'caption',
        success: false,
        reason: quotaResult.code,
        timestamp: new Date().toISOString(),
        plan: planKey
      });
      
      if (quotaResult.code === 'INSUFFICIENT') {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXHAUSTED',
          message: 'You have reached your extension usage limit for this billing period.',
          upgradeRequired: true,
          quota: {
            used: quotaResult.used || 0,
            limit: quotaResult.limit || 20,
            remaining: 0
          },
          upgradeUrl: 'https://datasenceai.com/upgrade'
        });
      }
      
      return res.status(403).json({
        success: false,
        code: quotaResult.code || 'QUOTA_ERROR',
        message: quotaResult.message || 'Quota check failed.'
      });
    }
    
    // Step 3: Get current quota info for response
    const quotaInfo = await getRemaining(db, userId, planKey, 'usedExtensionQuota');
    
    // Step 4: Call your existing caption agent
    const startTime = Date.now();
    const captionResult = await callCaptionAgent(prompt.trim(), {
      userId,
      source: 'extension',
      platform: 'linkedin'
    });
    
    const processingTime = Date.now() - startTime;
    
    // Step 5: Log successful request for analytics
    await addDoc(collection(db, 'extension_logs'), {
      userId,
      extensionKey: extensionKey?.substring(0, 8) + '...',
      action: 'caption',
      success: captionResult.success,
      processingTime,
      promptLength: prompt.length,
      timestamp: new Date().toISOString(),
      plan: planKey,
      modelUsed: captionResult.modelUsed || 'gpt-3.5-turbo'
    });
    
    // Step 6: Calculate reset date (end of current month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    
    // Step 7: Return response
    if (captionResult.success) {
      res.json({
        success: true,
        caption: captionResult.caption,
        suggestions: generateSuggestions(captionResult.caption || ''),
        metadata: {
          processingTime: `${processingTime}ms`,
          model: captionResult.modelUsed || 'gpt-3.5-turbo',
          characters: captionResult.caption?.length || 0,
          version: '1.0.0'
        },
        quota: {
          used: quotaInfo.used || 0,
          limit: quotaInfo.limit || 20,
          remaining: quotaInfo.limit ? quotaInfo.limit - (quotaInfo.used || 0) : 0,
          resetDate
        }
      });
    } else {
      res.status(500).json({
        success: false,
        code: captionResult.code || 'CAPTION_GENERATION_FAILED',
        message: captionResult.message || 'Failed to generate caption.',
        fallback: `Here's a simple version: "${prompt}"`
      });
    }
    
  } catch (error: any) {
    console.error('Extension API error:', error);
    
    // Log error
    if (req.user?.uid) {
      await addDoc(collection(db, 'extension_errors'), {
        userId: req.user.uid,
        extensionKey: req.extensionKey?.substring(0, 8) + '...',
        endpoint: '/linkedin/caption',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }
});

// Helper functions
function generateSuggestions(caption: string): string[] {
  const suggestions: string[] = [];
  
  if (!caption) return suggestions;
  
  // Analyze caption and generate intelligent suggestions
  if (!caption.includes('#')) {
    suggestions.push('Add 2-3 relevant hashtags to increase reach');
  }
  
  if (!/[!?]/.test(caption)) {
    suggestions.push('Consider adding a question or exclamation to boost engagement');
  }
  
  if (caption.length < 50) {
    suggestions.push('This post is quite short. Consider adding more context or value');
  } else if (caption.length > 250) {
    suggestions.push('This post is quite long. Consider breaking it into multiple posts');
  }
  
  // Add AI-powered suggestions
  suggestions.push('Try adding an emoji that matches the tone');
  suggestions.push('Consider tagging relevant people or companies');
  
  return suggestions.slice(0, 3);
}

export default router;