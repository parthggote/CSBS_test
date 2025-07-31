import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
    // Test if we can create a Google OAuth URL
    canCreateOAuthUrl: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
} 