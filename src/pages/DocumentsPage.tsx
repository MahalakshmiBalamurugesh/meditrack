import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc as firestoreDoc, query, orderBy,
} from 'firebase/firestore';
import { uploadFileToS3, getDownloadUrl, deleteFromS3 } from '../lib/awsApi';

interface HealthDoc {
  id: string;
  fileName: string;
  documentType: string;
  s3Key: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

const DOC_TYPES = [
  { value: 'lab_report',        label: 'Lab Report' },
  { value: 'prescription',      label: 'Prescription' },
  { value: 'consultation',      label: 'Consultation Notes' },
  { value: 'medical_image',      label: 'Medical Image' },
  { value: 'other',             label: 'Other Document' },
];

const TYPE_ICONS: Record<string, string> = {
  lab_report: '🔬', prescription: '💊', consultation: '📋',
  medical_image: '🩻', other: '📄',
};

const TYPE_LABELS: Record<string, string> = {
  lab_report: 'Lab Report', prescription: 'Prescription',
  consultation: 'Consultation Notes', medical_image: 'Medical Image',
  other: 'Other Document',
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
];

export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<HealthDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('lab_report');
  const [confirmDelete, setConfirmDelete] = useState<HealthDoc | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'documents'),
        orderBy('uploadedAt', 'desc')
      );
      const snap = await getDocs(q);
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() } as HealthDoc)));
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      setError('Unsupported file type. Use PDF or image files.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);
    setError('');
    try {
      const docId = crypto.randomUUID();
      // 1. Get presigned URL and upload to S3
      const { s3Key } = await uploadFileToS3(selectedFile, docId);
      // 2. Store metadata in Firestore
      await addDoc(collection(db, 'users', user.uid, 'documents'), {
        fileName: selectedFile.name,
        documentType: docType,
        s3Key,
        contentType: selectedFile.type || 'application/octet-stream',
        fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
      });
      // 3. Refresh list
      setSelectedFile(null);
      await loadDocuments();
    } catch (e: any) {
      setError(e.message || 'Upload failed. Make sure the AWS backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: HealthDoc) => {
    try {
      const url = await getDownloadUrl(doc.s3Key);
      window.open(url, '_blank');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (doc: HealthDoc) => {
    if (!user) return;
    try {
      // 1. Delete from S3
      await deleteFromS3(doc.s3Key);
      // 2. Delete metadata from Firestore
      await deleteDoc(firestoreDoc(db, 'users', user.uid, 'documents', doc.id));
      setConfirmDelete(null);
      await loadDocuments();
    } catch (e: any) {
      setError(e.message);
      setConfirmDelete(null);
    }
  };

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="row-between mb-6">
        <div>
          <div className="page-title">Health Documents</div>
          <div className="page-sub">Securely store and manage your medical documents</div>
        </div>
        <span className="badge badge-info">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>
      )}

      {/* Upload card */}
      <div className="card mb-6">
        <div className="card-head">
          <div>
            <div className="card-head-title">Upload Document</div>
            <div className="card-head-sub">PDF or image files, up to 10 MB</div>
          </div>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label">Document Type</label>
            <select
              className="field-select"
              value={docType}
              onChange={e => setDocType(e.target.value)}
            >
              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Select File</label>
            <div className="doc-upload-area" onClick={() => document.getElementById('doc-file-input')?.click()}>
              <input
                id="doc-file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.heic"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {selectedFile ? (
                <div className="doc-file-selected">
                  <span className="doc-file-icon">{selectedFile.type.includes('pdf') ? '📄' : '🖼️'}</span>
                  <div>
                    <div className="doc-file-name">{selectedFile.name}</div>
                    <div className="doc-file-size">{fmtSize(selectedFile.size)}</div>
                  </div>
                  <button
                    className="btn-icon-only"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    title="Remove"
                    style={{ marginLeft: 'auto' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="doc-upload-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div>Click to select a file</div>
                  <div className="doc-upload-hint">PDF, JPEG, PNG, WebP, GIF — max 10 MB</div>
                </div>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading…' : 'Upload Document'}
          </button>
        </div>
      </div>

      {/* Documents list */}
      <div className="divider-title mb-4">
        <div className="divider-title-bar" />
        <h3>Your Documents</h3>
        <span className="count-pill">{documents.length}</span>
      </div>

      {loading ? (
        <div className="data-loading"><div className="spinner" /> Loading documents…</div>
      ) : documents.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="empty-title">No documents uploaded yet</div>
            <div className="empty-desc">Upload lab reports, prescriptions, or other medical documents to keep them organized and accessible.</div>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {documents.map(doc => (
            <div key={doc.id} className="doc-card">
              <div className="doc-card-icon">{TYPE_ICONS[doc.documentType] || '📄'}</div>
              <div className="doc-card-info">
                <div className="doc-card-name">{doc.fileName}</div>
                <div className="doc-card-meta">
                  <span className="doc-type-badge">{TYPE_LABELS[doc.documentType] || doc.documentType}</span>
                  <span>·</span>
                  <span>{fmtSize(doc.fileSize)}</span>
                  <span>·</span>
                  <span>{fmtDate(doc.uploadedAt)}</span>
                </div>
              </div>
              <div className="doc-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(doc)} title="View / Download">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button className="btn-icon-only" onClick={() => setConfirmDelete(doc)} title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="modal-bg" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><div className="modal-title">Delete Document</div></div>
            <div className="modal-body">
              Are you sure you want to delete <strong style={{ color: 'var(--c-text-1)' }}>{confirmDelete.fileName}</strong>?
              This will permanently remove the file from cloud storage.
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
