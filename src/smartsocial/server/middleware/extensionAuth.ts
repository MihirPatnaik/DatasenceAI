// src/smartsocial/server/middleware/extensionAuth.ts - USING ADMIN SDK

import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
// TEMPORARY: Use mock
import { db } from '../../utils/mockFirebase';

import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  where
} from 'firebase/firestore';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Initialize Firebase Admin with your service account
if (!admin.apps.length) {
  try {
    // OPTION 1: Using project root (recommended)
    const projectRoot = process.cwd();
    const serviceAccountPath = join(projectRoot, 'functions', 'serviceAccountKey.json');
    
    console.log('🔍 Project root:', projectRoot);
    console.log('🔍 Service account path:', serviceAccountPath);
    
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf-8')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    console.error('Stack:', error.stack);
    
    // Try fallback path
    try {
      console.log('🔄 Trying fallback path...');
      const fallbackPath = join(__dirname, '../../../../../functions/serviceAccountKey.json');
      console.log('Fallback path:', fallbackPath);
      
      const fallbackAccount = JSON.parse(
        readFileSync(fallbackPath, 'utf-8')
      );
      
      admin.initializeApp({
        credential: admin.credential.cert(fallbackAccount)
      });
      console.log('✅ Firebase Admin initialized with fallback path');
    } catch (fallbackError: any) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      
      // Last resort: Mock for development
      console.log('⚠️ Using mock auth for development');
      // Continue with mock verification
    }
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      extensionKey?: string;
      extensionData?: any;
    }
  }
}

export const verifyExtensionAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get tokens from headers
    const authHeader = req.headers.authorization;
    const extensionKey = req.headers['x-extension-key'] as string;
    
    // Validate headers
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'MISSING_AUTH_TOKEN',
        message: 'Authorization token is required.'
      });
    }
    
    if (!extensionKey) {
      return res.status(401).json({
        success: false,
        code: 'MISSING_EXTENSION_KEY',
        message: 'Extension API key is required.'
      });
    }
    
    // Extract token
    const token = authHeader.split('Bearer ')[1];
    
    // Step 1: Verify Firebase token using Admin SDK
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_AUTH_TOKEN',
        message: 'Invalid or expired authentication token.'
      });
    }
    
    // Step 2: Verify extension key
    const extensionKeysRef = collection(db, 'extension_keys');
    const q = query(
      extensionKeysRef,
      where('key', '==', extensionKey),
      limit(1)
    );
    
    const keyDoc = await getDocs(q);
    
    if (keyDoc.empty) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_EXTENSION_KEY',
        message: 'Invalid extension API key.'
      });
    }
    
    const keyData = keyDoc.docs[0].data();
    
    // Check if key is active
    if (!keyData.isActive) {
      return res.status(403).json({
        success: false,
        code: 'EXTENSION_DISABLED',
        message: 'This extension key has been disabled.'
      });
    }
    
    // Check if key belongs to this user
    if (keyData.userId !== decodedToken.uid) {
      // Log suspicious activity
      const securityLogsRef = collection(db, 'security_logs');
      await addDoc(securityLogsRef, {
        type: 'EXTENSION_KEY_MISMATCH',
        expectedUser: keyData.userId,
        actualUser: decodedToken.uid,
        extensionKey: extensionKey.substring(0, 8) + '...',
        timestamp: new Date().toISOString(),
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        code: 'UNAUTHORIZED_ACCESS',
        message: 'Extension key does not match user.'
      });
    }
    
    // Step 3: Attach user and extension info to request
    req.user = decodedToken;
    req.extensionKey = extensionKey;
    req.extensionData = keyData;
    
    next();
    
  } catch (error: any) {
    console.error('Extension auth middleware error:', error);
    res.status(500).json({
      success: false,
      code: 'AUTH_SERVER_ERROR',
      message: 'Authentication server error.'
    });
  }
};