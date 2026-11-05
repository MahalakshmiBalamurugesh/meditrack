# MediTrack — Medication & Health Dashboard

A professional healthcare web application for medication tracking, health monitoring, document storage, and AI-powered medication assistance.

**Live URL:** https://meditrack-medicationdashboard.netlify.app

---

## Problem Statement

Patients managing multiple medications often struggle with:
- Remembering when to take doses
- Tracking whether they've taken or missed medications
- Monitoring vital signs like blood pressure, blood sugar, and weight
- Organizing medical documents (lab reports, prescriptions, consultation notes)
- Getting quick, reliable information about their medications

MediTrack solves these problems with a unified dashboard that combines medication scheduling, health logging, cloud document storage, and an AI medication assistant.

---

## Solution Overview

MediTrack is a full-stack web application with 5 main pages:

1. **Dashboard** — Today's medication schedule with dose status tracking (Taken, Missed, Skip, Undo)
2. **My Medicines** — Add, manage, and delete medications with dose time scheduling
3. **Health Log** — Record blood pressure, blood sugar, and weight readings with history
4. **Weekly Summary** — Medication adherence analytics with filters by medicine, status, and date
5. **Health Trends** — Track health metric averages and trends over time

Plus two AWS-powered features:
6. **Documents** — Upload, view, download, and delete medical documents stored securely in Amazon S3
7. **AI Assistant** — Chat interface powered by Amazon Bedrock Nova Lite for medication information

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Custom CSS design system (no framework) |
| Authentication | Firebase Authentication (email/password) |
| Database | Firebase Firestore (per-user cloud storage) |
| Backend | Node.js + Express |
| File Storage | Amazon S3 (presigned URLs, private bucket) |
| AI | Amazon Bedrock (Nova Lite) |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

---

## AWS Services Used

### Amazon S3
- Stores medical documents (PDFs, images) in a private bucket
- Server-side upload via Express backend (base64 encoding)
- Presigned URLs for secure download access
- Per-user file isolation: `documents/{userId}/{docId}/{filename}`
- IAM policy restricts access to authorized users only

### Amazon Bedrock (Nova Lite)
- Powers the AI Medication Assistant chat interface
- Uses the Converse API with a system prompt that includes the user's medication list
- Model: `apac.amazon.nova-lite-v1:0` (Asia Pacific inference profile)
- Safety guardrails: never recommends dosage changes, always advises consulting healthcare professionals
- Separate IAM credentials for Bedrock (independent from S3 credentials)

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Netlify        │     │   Render         │     │   AWS           │
│   (Frontend)     │────▶│   (Express API) │────▶│   S3 + Bedrock  │
│   React + Vite   │     │   Node.js       │     │                 │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌────────────────┐
         └─────────────▶│   Firebase     │
                        │   Auth + DB    │
                        └────────────────┘
```

- Frontend sends Firebase ID token with every API request
- Backend verifies token using Firebase Admin SDK
- Backend extracts user UID for per-user data isolation
- AWS credentials never exposed to the frontend

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- Firebase project with Authentication and Firestore enabled
- AWS account with S3 and Bedrock access

### Installation

```bash
cd meditrack
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Firebase (frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AWS — S3 (your account)
AWS_REGION=ap-southeast-2
S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your_s3_access_key
AWS_SECRET_ACCESS_KEY=your_s3_secret_key

# AWS — Bedrock (separate credentials if needed)
BEDROCK_MODEL_ID=apac.amazon.nova-lite-v1:0
BEDROCK_REGION=ap-southeast-2
BEDROCK_ACCESS_KEY_ID=your_bedrock_access_key
BEDROCK_SECRET_ACCESS_KEY=your_bedrock_secret_key

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json

# Backend
AWS_PORT=3001
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Email/Password** authentication
3. Create a **Firestore Database** with these security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
4. Download a service account key: Project Settings → Service Accounts → Generate new private key → Save as `firebase-service-account.json`

### AWS Setup

1. Create an S3 bucket:
```bash
aws s3 mb s3://your-unique-bucket-name --region ap-southeast-2
```

2. Create an IAM user with S3 and Bedrock permissions (see `iam-policy.json` in the AWS starter kit)

3. Enable Bedrock model access in the AWS console for your region

4. Configure AWS CLI:
```bash
aws configure
```

### Running Locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
npm run aws-server
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open http://localhost:5173

---

## Production Deployment

### Frontend → Netlify
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add all `VITE_FIREBASE_*` and `VITE_AWS_API_URL` environment variables

### Backend → Render
1. Create a Web Service from the GitHub repo
2. Build command: `npm install`
3. Start command: `node aws-server.js`
4. Add all environment variables (AWS, Firebase, Bedrock)

---

## Kiro Usage

This project was built using **Kiro**, an AI-powered development environment. Kiro was used for:

- **Complete UI redesign** — Replaced the mobile-oriented interface with a professional desktop dashboard with sidebar navigation, stat cards, and a cohesive design system
- **Firebase integration** — Authentication, Firestore, and Admin SDK setup
- **AWS integration** — S3 document storage and Bedrock AI assistant
- **Debugging** — Fixed Firebase Admin SDK ESM import issues, S3 CORS workarounds, and Bedrock inference profile configuration
- **Deployment** — Netlify and Render configuration

---

## Project Structure

```
meditrack/
├── aws-server.js          # Express backend entry point
├── aws/
│   ├── routes.js          # API routes (S3 + Bedrock)
│   ├── s3.js              # S3 helper (upload, download, delete)
│   ├── bedrock.js         # Bedrock Nova Lite helper
│   └── firebaseAuth.js    # Firebase Admin token verification
├── src/
│   ├── pages/             # 7 page components
│   ├── components/layout/ # Sidebar + AppLayout
│   ├── context/           # AuthContext + AppDataContext
│   ├── lib/               # awsApi.ts (frontend API helper)
│   ├── firebase.ts        # Frontend Firebase init
│   └── index.css          # Complete CSS design system
└── .kiro/                 # Kiro configuration and specs
```

---

## License

This project is created for educational purposes as part of the AWS Builder program.
