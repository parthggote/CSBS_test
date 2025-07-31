import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if we can access NextAuth configuration
    const authUrl = `${process.env.NEXTAUTH_URL}/api/auth/signin/google`;
    
    return NextResponse.json({
      success: true,
      authUrl,
      message: 'NextAuth configuration looks good',
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 