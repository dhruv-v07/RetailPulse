# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "RetailPulse" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon to add a web app
4. Enter app nickname: "RetailPulse Web"
5. Click "Register app"
6. Copy the Firebase configuration object

## 5. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI API Key (for sentiment analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Alpha Vantage API Key (for stock data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```

## 6. Firestore Security Rules

Update your Firestore security rules to allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own watchlist
    match /watchlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup` to create a test account
3. Check Firebase Console to see the new user in Authentication
4. Check Firestore to see the user profile document

## Features Included

- ✅ User registration with email/password
- ✅ User login/logout
- ✅ Password reset functionality
- ✅ User profile storage in Firestore
- ✅ Protected routes
- ✅ User session management
- ✅ User preferences storage
- ✅ Watchlist functionality (ready for implementation)

## Next Steps

1. Set up your Firebase project using the steps above
2. Add your environment variables
3. Test the authentication flow
4. Customize user preferences and additional features as needed