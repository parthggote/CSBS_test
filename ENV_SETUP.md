# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration (REQUIRED - Fixes the NO_SECRET error)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret (for existing auth system)
JWT_SECRET=your_jwt_secret_here

# Google AI (for quiz generation)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

## How to Get These Values

### 1. Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 2. NextAuth Secret
Generate a random secret:
```bash
# On Windows PowerShell:
openssl rand -base64 32

# Or use any random string (at least 32 characters)
```

### 3. NextAuth URL
For development: `http://localhost:3000`
For production: Your actual domain

## Example .env.local
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/CSBS
JWT_SECRET=another-secret-key-for-jwt
GOOGLE_AI_API_KEY=your-gemini-api-key
```

## After Setting Up
1. Save the `.env.local` file
2. Restart your development server: `npm run dev`
3. The NextAuth errors should be resolved

## Troubleshooting
- Make sure `.env.local` is in the project root (same level as `package.json`)
- Don't commit `.env.local` to version control
- Restart the server after changing environment variables
- Check that all variables are properly set without extra spaces 