import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const projectRoot = process.cwd();
  const envLocalPath = join(projectRoot, '.env.local');
  const envPath = join(projectRoot, '.env');
  
  return NextResponse.json({
    projectRoot,
    envLocalExists: existsSync(envLocalPath),
    envExists: existsSync(envPath),
    envLocalPath,
    envPath,
    nodeEnv: process.env.NODE_ENV,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasMongoDbUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasGoogleAiKey: !!process.env.GOOGLE_AI_API_KEY,
    // Show first few characters of secrets to verify they're loaded
    nextAuthSecretPreview: process.env.NEXTAUTH_SECRET ? 
      process.env.NEXTAUTH_SECRET.substring(0, 10) + '...' : 'NOT_SET',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
  });
} 