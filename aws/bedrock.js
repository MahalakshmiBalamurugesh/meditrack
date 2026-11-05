// aws/bedrock.js — Amazon Bedrock (Nova Lite) helper
// Uses separate credentials for Bedrock if BEDROCK_ACCESS_KEY_ID is set.
// This allows S3 (your account) and Bedrock (friend's account) to use
// different AWS credentials independently.
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const region  = process.env.BEDROCK_REGION  || process.env.AWS_REGION || 'ap-southeast-2';
const modelId = process.env.BEDROCK_MODEL_ID || 'apac.amazon.nova-lite-v1:0';

// Use dedicated Bedrock credentials if provided, otherwise fall back to default
const clientConfig = process.env.BEDROCK_ACCESS_KEY_ID
  ? {
      region,
      credentials: {
        accessKeyId:     process.env.BEDROCK_ACCESS_KEY_ID,
        secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY,
      },
    }
  : { region };

const bedrock = new BedrockRuntimeClient(clientConfig);

console.log(`[bedrock] Region: ${region} | Model: ${modelId} | Separate credentials: ${!!process.env.BEDROCK_ACCESS_KEY_ID}`);

export async function askAI(userMessage, systemPrompt) {
  if (!userMessage) throw new Error('A message is required.');

  const res = await bedrock.send(new ConverseCommand({
    modelId,
    system: systemPrompt ? [{ text: systemPrompt }] : undefined,
    messages: [{ role: 'user', content: [{ text: userMessage }] }],
    inferenceConfig: { maxTokens: 800, temperature: 0.5, topP: 0.9 },
  }));

  const text = res.output?.message?.content
    ?.map(c => c.text)
    .filter(Boolean)
    .join('\n') || '(no response)';

  return text;
}
