// src/lib/awsApi.ts — Helper for authenticated calls to the Express AWS backend.
// Gets the Firebase ID token and sends it in the Authorization header.
import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_AWS_API_URL || 'http://localhost:3001/api/aws';

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated.');
  return user.getIdToken();
}

export async function awsPost(path: string, body: any): Promise<any> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function awsGet(path: string): Promise<any> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function awsDelete(path: string): Promise<any> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

/**
 * Upload a file to S3 via the Express backend (server-side upload, no CORS needed).
 * Reads the file as base64 and sends it to the backend which uploads to S3.
 * Returns the S3 key for metadata storage.
 */
export async function uploadFileToS3(
  file: File,
  docId: string
): Promise<{ s3Key: string }> {
  // Read file as base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the "data:xxx;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });

  const { s3Key } = await awsPost('/documents/upload', {
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    docId,
    data: base64Data,
  });

  if (!s3Key) throw new Error('Upload failed: no S3 key returned.');
  return { s3Key };
}

/**
 * Get a presigned download URL for a file.
 */
export async function getDownloadUrl(s3Key: string): Promise<string> {
  const { downloadUrl } = await awsGet(`/documents/download?key=${encodeURIComponent(s3Key)}`);
  if (!downloadUrl) throw new Error('Failed to get download URL.');
  return downloadUrl;
}

/**
 * Delete a file from S3.
 */
export async function deleteFromS3(s3Key: string): Promise<void> {
  await awsDelete(`/documents?key=${encodeURIComponent(s3Key)}`);
}

/**
 * Ask the AI assistant a medication question.
 */
export async function askMedicationAI(
  question: string,
  medicines: { name: string; dosage: string; form: string; notes?: string }[]
): Promise<string> {
  const { response, error, detail } = await awsPost('/ai/ask', { question, medicines });
  if (error) throw new Error(detail || error);
  return response;
}
