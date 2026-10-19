# SSLC Reader 📚

A modern, full-stack educational PDF reader and management platform built with **Next.js 16**, **Tailwind CSS v4**, and **Firebase**.

---

## Features

### 👩‍🎓 Student Interface
- Beautiful category grid with gradient cards
- Search-filtered document list per subject
- Full-screen PDF reader (Firebase PDFs + Google Drive)
- Dark-mode reader interface
- Mobile-responsive design

### 🔐 Admin Dashboard
- Email/password authentication via Firebase Auth
- Create, view, delete subject categories
- Upload PDFs directly to Firebase Storage with progress bar
- Add Google Drive links (auto-converts to embed URLs)
- Searchable document table with delete support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Auth | Firebase Authentication |

---

## Getting Started

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and open your project.
2. **Firestore**: Create a Firestore database in **production mode**. Add these security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for categories and documents
    match /categories/{catId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /documents/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. **Storage**: Enable Firebase Storage. Set these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pdfs/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. **Authentication**: Enable **Email/Password** sign-in. Create your admin user manually in the Firebase Console under Authentication → Users.

5. **CORS for Storage** (required for PDF rendering): Create a `cors.json` file:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

Then run: `gsutil cors set cors.json gs://pdfreader-f74ea.firebasestorage.app`

### 2. Run Locally

```bash
cd sslc-reader
npm install
npm run dev
```

App runs at: **http://localhost:3000**

Admin panel: **http://localhost:3000/admin**

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home: category grid
│   ├── layout.tsx                  # Root layout + AuthProvider
│   ├── not-found.tsx               # 404 page
│   ├── category/[id]/
│   │   ├── page.tsx                # Category: document list
│   │   └── SearchBar.tsx           # Client search component
│   ├── read/[id]/
│   │   ├── page.tsx                # PDF reader page
│   │   └── PDFViewer.tsx           # iframe viewer component
│   └── admin/
│       ├── layout.tsx              # Auth guard layout
│       ├── page.tsx                # Dashboard overview
│       ├── login/page.tsx          # Login page
│       ├── categories/page.tsx     # Category management
│       ├── upload/page.tsx         # PDF upload
│       └── documents/page.tsx      # Document table
├── components/
│   ├── Navbar.tsx
│   ├── CategoryCard.tsx
│   ├── DocumentCard.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── UploadProgress.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── CategoryManager.tsx
│       ├── DocumentUploader.tsx
│       └── DocumentList.tsx
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── firebase.ts                 # Firebase init
│   ├── firestore.ts                # CRUD helpers
│   └── storage.ts                  # Upload helper
└── types/
    └── index.ts                    # TypeScript types
```

---

## Deploy to Vercel

```bash
npx vercel
```

Or push to GitHub and connect to Vercel for automatic deployments.

> **Note:** The Firebase config is embedded in the source. For production, consider moving secrets to environment variables.
