// aws-server.js — Express backend for MediTrack AWS integrations.
// Handles S3 document storage and Bedrock AI calls.
// AWS credentials stay on the server, never exposed to the frontend.
//
// Start: npm run aws-server
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import awsRoutes from './aws/routes.js';

const app = express();

// Allow requests from the Vite dev server and Netlify
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:4174',
    'http://localhost:4175',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '20mb' })); // Allow base64 file uploads (10MB file → ~15MB base64)

// Mount AWS API routes
app.use('/api/aws', awsRoutes);

const PORT = process.env.AWS_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✅ MediTrack AWS backend running on http://localhost:${PORT}`);
  console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   S3 Bucket: ${process.env.S3_BUCKET_NAME || '(not set)'}`);
  console.log(`   Bedrock Model: ${process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0'}\n`);
});
