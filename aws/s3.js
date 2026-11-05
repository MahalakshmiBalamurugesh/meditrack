// aws/s3.js — Amazon S3 helper with presigned URLs
// Files are stored under documents/{uid}/{docId}/{filename}
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.S3_BUCKET_NAME;

if (!bucket) {
  console.warn('[s3] S3_BUCKET_NAME is not set in .env');
}

const s3 = new S3Client({ region });

/**
 * Upload a file buffer directly to S3 (server-side, no CORS needed).
 */
export async function uploadFile(uid, docId, fileName, contentType, buffer) {
  const key = `documents/${uid}/${docId}/${fileName}`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: buffer, ContentType: contentType,
  }));
  return { key };
}

/**
 * Generate a presigned PUT URL so the frontend can upload directly to S3.
 * The URL expires in 5 minutes.
 */
export async function getUploadUrl(uid, docId, fileName, contentType) {
  const key = `documents/${uid}/${docId}/${fileName}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return { url, key };
}

/**
 * Generate a presigned GET URL so the frontend can download/view a file.
 * The URL expires in 1 hour.
 */
export async function getDownloadUrl(key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}

/**
 * Delete a file from S3.
 */
export async function deleteFile(key) {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3.send(command);
}
