// src/smartsocial/server/api/extension/v1/track.ts

import express from 'express';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../../utils/mockFirebase';
import { verifyExtensionAuth } from '../../../middleware/extensionAuth';

const router = express.Router();

router.use(verifyExtensionAuth);

// POST /api/extension/v1/track
router.post('/track', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    const { action, metadata } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_ACTION',
        message: 'Action is required for tracking.'
      });
    }
    
    // Log to Firestore
    await addDoc(collection(db, 'extension_analytics'), {
      userId,
      extensionKey: req.extensionKey?.substring(0, 8) + '...',
      action,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
    
  } catch (error) {
    console.error('Track API error:', error);
    res.json({ // Don't fail tracking, just return success
      success: true,
      message: 'Event logged (error ignored)'
    });
  }
});

export default router;