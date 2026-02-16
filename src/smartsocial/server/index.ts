// src/smartsocial/server/index.ts

import cors from 'cors';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import captionRouter from './api/extension/v1/linkedin/caption';
import quotaRouter from './api/extension/v1/quota';
import trackRouter from './api/extension/v1/track';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Server starting from:', __dirname);
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 .env path would be:', join(process.cwd(), '.env'));

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'chrome-extension://*'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/extension/v1/linkedin', captionRouter);
app.use('/api/extension/v1', quotaRouter);
app.use('/api/extension/v1', trackRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Fallback for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Extension API Server running on port ${PORT}`);
  console.log(`📝 Local: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 LinkedIn API: http://localhost:${PORT}/api/extension/v1/linkedin/caption`);
});

export default app;