// aws/routes.js — API routes for S3 documents and Bedrock AI
import { Router } from 'express';
import { verifyToken } from './firebaseAuth.js';
import { getUploadUrl, getDownloadUrl, deleteFile, uploadFile } from './s3.js';
import { askAI } from './bedrock.js';

const router = Router();

// ── S3: Document Storage ───────────────────────────────────────

// Direct upload (server-side, avoids S3 CORS issues)
// Body: { fileName, contentType, docId, data }  (data is base64-encoded)
router.post('/documents/upload', verifyToken, async (req, res) => {
  try {
    const { fileName, contentType, docId, data } = req.body;
    if (!fileName || !docId || !data) {
      return res.status(400).json({ error: 'fileName, docId, and data are required.' });
    }
    // Validate content type
    const allowed = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'image/heic', 'image/heif',
    ];
    if (contentType && !allowed.includes(contentType) && !contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'File type not allowed. Use PDF or image files.' });
    }
    // Decode base64 and upload to S3
    const buffer = Buffer.from(data, 'base64');
    const { key } = await uploadFile(req.uid, docId, fileName, contentType || 'application/octet-stream', buffer);
    res.json({ s3Key: key });
  } catch (e) {
    console.error('[s3] Upload error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Generate a presigned download URL
// Query: ?key={s3Key}
router.get('/documents/download', verifyToken, async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'key is required.' });
    // Security: ensure the key belongs to this user
    if (!key.startsWith(`documents/${req.uid}/`)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const url = await getDownloadUrl(key);
    res.json({ downloadUrl: url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a file from S3
// Query: ?key={s3Key}
router.delete('/documents', verifyToken, async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'key is required.' });
    if (!key.startsWith(`documents/${req.uid}/`)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    await deleteFile(key);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Bedrock: Medication Q&A ────────────────────────────────────

// Ask Nova Lite a medication-related question
// Body: { question, medicines: [{name, dosage, form, notes}] }
router.post('/ai/ask', verifyToken, async (req, res) => {
  try {
    const { question, medicines } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required.' });

    // Build the system prompt with medication context
    const medList = (medicines || [])
      .map(m => `- ${m.name} (${m.dosage}, ${m.form})${m.notes ? `. Notes: ${m.notes}` : ''}`)
      .join('\n');

    const systemPrompt = `You are MediTrack AI Assistant, a helpful medication information assistant integrated into a medication tracking app called MediTrack.

The user's current medications are:
${medList || '(No medications added yet)'}

IMPORTANT GUIDELINES:
- You provide GENERAL INFORMATION ONLY about medications, their common uses, typical side effects, and how they are generally taken.
- You must NEVER recommend changing dosages, stopping any medication, or starting new medications.
- You must NEVER provide a medical diagnosis or personalized medical advice.
- Always encourage the user to consult their healthcare professional or pharmacist for personal medical decisions.
- Keep responses concise, clear, and easy to understand.
- If asked about drug interactions, mention that they should consult their pharmacist for a complete interaction check.
- Always remind that this information is educational, not medical advice.
- If the question is not related to medications or health, politely redirect to medication-related topics.`;

    const text = await askAI(question, systemPrompt);
    res.json({ response: text });
  } catch (e) {
    // Return detailed error info so the frontend can show actionable guidance
    const errorName = e.name || 'UnknownError';
    const errorMsg = e.message || 'An unknown error occurred.';
    const httpStatus = e.$metadata?.httpStatusCode || 0;
    const region = process.env.AWS_REGION || 'us-east-1';
    const model = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

    let userMessage = errorMsg;
    let hint = '';

    if (errorName === 'ValidationException' && /not allowed/i.test(errorMsg)) {
      hint = `Amazon Nova Lite model access is not enabled in region ${region}. ` +
            `Go to the AWS Bedrock console, switch to ${region}, then ` +
            `Model access → Request model access for Amazon Nova Lite. ` +
            `After access is granted, restart this server.`;
      userMessage = 'Model access not enabled. See server logs for instructions.';
    } else if (errorName === 'AccessDeniedException') {
      hint = `Your IAM user is not authorized to invoke this model. ` +
            `Update the IAM policy to include bedrock:InvokeModel for ` +
            `arn:aws:bedrock:${region}::foundation-model/${model}`;
      userMessage = 'IAM permission denied. See server logs for instructions.';
    } else if (/credential|security token/i.test(errorMsg)) {
      hint = 'Run "aws configure" to set your AWS credentials.';
      userMessage = 'AWS credentials not configured. See server logs.';
    }

    if (hint) console.error('[bedrock] Error:', errorName, '-', errorMsg, '\n  HINT:', hint);

    res.status(500).json({
      error: userMessage,
      detail: hint || `${errorName}: ${errorMsg}`,
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET_NAME || '(not set)',
    model: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0',
  });
});

export default router;
