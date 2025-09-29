#!/bin/bash

# Firebase Setup Script for RetailPulse
echo "🔥 Setting up Firebase configuration..."

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBhCJU0cdqY7vGyS6ApNHOQpZ5hwjPum6s
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=retailpulse-4154a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=retailpulse-4154a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=retailpulse-4154a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=311465089065
NEXT_PUBLIC_FIREBASE_APP_ID=1:311465089065:web:ee9741a59393b76f50a438
OPENAI_API_KEY=your_openai_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
EOF

echo "✅ .env.local file created successfully!"
echo "📁 File location: $(pwd)/.env.local"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🚀 Setup complete! You can now run: npm run dev"
echo ""
echo "Next steps:"
echo "1. Enable Authentication in Firebase Console"
echo "2. Create Firestore Database"
echo "3. Run: npm run dev"
