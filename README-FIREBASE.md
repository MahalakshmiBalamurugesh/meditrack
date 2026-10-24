# Firebase Setup Guide for MediTrack

Follow these steps once to connect MediTrack to Firebase so each user gets their own private cloud data.

---

## Step 1 — Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Give it a name (e.g. `meditrack-app`)
4. Disable Google Analytics (not needed) → **Create project**

---

## Step 2 — Enable Email/Password Authentication

1. In the Firebase Console, open your project
2. Left sidebar → **Build** → **Authentication**
3. Click **Get started**
4. Under **Sign-in providers**, click **Email/Password**
5. Enable it → **Save**

---

## Step 3 — Create a Firestore Database

1. Left sidebar → **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** → **Next**
4. Pick any location (e.g. `asia-south1` for India) → **Enable**

### Set Firestore security rules

After the database is created:

1. Click the **Rules** tab
2. Replace the default rules with:

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

3. Click **Publish**

This ensures each user can only read and write their own data.

---

## Step 4 — Register a Web App and get config keys

1. Left sidebar → **Project Overview** (home icon) → click the **< / >** (Web) icon
2. Enter a nickname (e.g. `meditrack-web`) → **Register app**
3. You'll see a `firebaseConfig` object. Copy the values.

---

## Step 5 — Create your .env file

In the `meditrack/` folder, create a file called `.env` (copy from `.env.example`):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Fill in your actual values from Step 4.

---

## Step 6 — Test locally

```bash
cd meditrack
npm run dev
```

Open http://localhost:5173 — you should see the MediTrack login page.
Create an account, add a medicine, reload — your data persists in Firestore.

---

## Step 7 — Deploy to Netlify / Vercel

When deploying, add the same environment variables to your hosting provider:

**Netlify:** Site settings → Environment variables → Add each `VITE_FIREBASE_*` key

**Vercel:** Project settings → Environment Variables → Add each key

The `.env` file is for local development only and must never be committed to Git.

---

## How it works

- Every user who creates an account gets a unique User ID (UID) from Firebase Auth
- All their medicines, doses, health readings are stored at `users/{uid}/...` in Firestore
- The Firestore security rules prevent any user from reading another user's data
- When they log in on any device, their data is loaded from the cloud
