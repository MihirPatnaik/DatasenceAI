// src/smartsocial/server/api/extension/v1/quota.ts

import express from 'express';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../../../utils/mockFirebase';
import { verifyExtensionAuth } from '../../../middleware/extensionAuth';

const router = express.Router();

router.use(verifyExtensionAuth);

// GET /api/extension/v1/quota
router.get('/quota', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User information not found.'
      });
    }
    
    console.log(`📊 Quota request from user: ${userId}`);
    
    // Get user's plan from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found in database.'
      });
    }
    
    const userData = userDoc.data();
    const plan = userData?.planId || userData?.onboarding?.plan || 'free';
    
    // Get quota usage
    const quotaRef = collection(db, 'users', userId, 'quota');
    const quotaQuery = query(quotaRef);
    const quotaDocs = await getDocs(quotaQuery);
    
    let used = 0;
    quotaDocs.forEach(doc => {
      const data = doc.data();
      if (data.action === 'extension') {
        used += data.count || 0;
      }
    });
    
    // Define limits based on plan
    const planLimits = {
      'free': 20,
      'pro': 100,
      'pro_699': 300,
      'pro_999': 500,
      'enterprise': 1000
    };
    
    const limit = planLimits[plan as keyof typeof planLimits] || 20;
    const remaining = Math.max(limit - used, 0);
    
    // Calculate reset date (end of month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    res.json({
      success: true,
      quota: {
        used,
        limit,
        remaining,
        resetDate: resetDate.toISOString(),
        plan
      },
      user: {
        uid: userId,
        email: userData.email,
        displayName: userData.name || userData.displayName,
        plan: plan
      }
    });
    
  } catch (error: any) {
    console.error('Quota API error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch quota information.'
    });
  }
});

// Quick mock endpoint for testing
router.get('/quota/mock', (req, res) => {
  res.json({
    success: true,
    quota: {
      used: 5,
      limit: 100,
      remaining: 95,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'pro'
    },
    mock: true
  });
});

export default router;