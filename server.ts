// server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import claudeProxy from './src/smartsocial/server/agents/claudeProxy';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// 🔁 Mount Claude Proxy
app.use('/api', claudeProxy);

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening at http://localhost:${PORT}`);
});
