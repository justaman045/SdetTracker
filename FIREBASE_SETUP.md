# Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `sdet-tracker` → Continue
3. Disable Google Analytics (not needed) → **Create project**

## 2. Enable Google Sign-In

1. In the Firebase console: **Authentication** → **Sign-in method**
2. Click **Google** → toggle **Enable** → add your support email → **Save**

## 3. Create Firestore Database

1. In Firebase console: **Firestore Database** → **Create database**
2. Choose **Start in production mode** → pick a region close to you → **Enable**
3. After creation, go to **Rules** tab, paste the contents of `firestore.rules`, click **Publish**

## 4. Register a Web App

1. In Firebase console: Project overview → click the **</>** (Web) icon
2. App nickname: `sdet-tracker-web` → **Register app**
3. Copy the config object shown (you need the values below)

## 5. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values from step 4:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sdet-tracker-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sdet-tracker-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=sdet-tracker-xxxxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 6. Add Authorized Domains

1. Firebase console → **Authentication** → **Settings** → **Authorized domains**
2. `localhost` should already be there (for dev)
3. Add your production domain if deploying (e.g., `my-app.vercel.app`)

## 7. Run the App

```bash
npm run dev
```

Open http://localhost:5173 — you'll see the login page.

---

## Deploying to Vercel / Netlify

Add all `VITE_FIREBASE_*` environment variables in your hosting provider's dashboard (not in the `.env` file — that's for local only).

### Vercel
```bash
npx vercel --env VITE_FIREBASE_API_KEY=... # or add via Vercel dashboard
```

### Netlify
Site settings → Environment variables → add each `VITE_FIREBASE_*` key.

---

## Firestore Data Structure

```
users/
  {uid}/
    data/
      settings  → {startDate, targetDate, dailyGoalHours}
      topics    → {topicId: {status, notes, interviewReviewed, lastUpdated}}
      questions → {questionId: {practiced, myNotes}}
      logs      → {entries: [{date, topics[], hours, confidence, blockers}]}
      notes     → {scratchpad: "..."}
```
