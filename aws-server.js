// aws-server.js — Express backend for MediTrack AWS integrations.
// Handles S3 document storage and Bedrock AI calls.
// AWS credentials stay on the server, never exposed to the frontend.
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import awsRoutes from './aws/routes.js';

const app = express();

// Parse allowed origins from env (comma-separated) or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:4174',
      'http://localhost:4175',
      'http://127.0.0.1:5173',
    ];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '20mb' }));

app.use('/api/aws', awsRoutes);

// Render uses PORT env var — fall back to 3001 for local dev
const PORT = process.env.PORT || process.env.AWS_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✅ MediTrack AWS backend running on port ${PORT}`);
  console.log(`   Region: ${process.env.AWS_REGION || '(not set)'}`);
  console.log(`   S3 Bucket: ${process.env.S3_BUCKET_NAME || '(not set)'}`);
  console.log(`   Bedrock Model: ${process.env.BEDROCK_MODEL_ID || '(not set)'}`);
  console.log(`   Allowed Origins: ${allowedOrigins.join(', ')}\n`);
});
