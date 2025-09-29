# 🚀 Quick Setup Guide

## Step 1: Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download and install the LTS version
3. Restart your terminal

## Step 2: Run the Setup Script
```bash
cd /Users/dhruv/code/RetailPulse
./setup-firebase.sh
```

## Step 3: Enable Firebase Services
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `retailpulse-4154a`
3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
4. **Create Firestore Database:**
   - Go to Firestore Database → Create database
   - Start in test mode
   - Choose a location

## Step 4: Start the Server
```bash
npm run dev
```

## Step 5: Test the App
1. Open http://localhost:3000
2. Click "Sign Up" to create an account
3. Test login/logout functionality

## 🎉 You're Done!
Your RetailPulse app with Firebase authentication is now running!
