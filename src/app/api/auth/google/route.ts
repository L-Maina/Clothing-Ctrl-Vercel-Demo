import { NextResponse } from 'next/server';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

export async function GET() {
  // If Google OAuth is not configured, return error
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({
      error: 'Google OAuth not configured',
      message: 'To enable Google Sign In, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.',
      setupInstructions: [
        '1. Go to Google Cloud Console (https://console.cloud.google.com)',
        '2. Create a new project or select existing one',
        '3. Go to "APIs & Services" > "Credentials"',
        '4. Click "Create Credentials" > "OAuth client ID"',
        '5. Select "Web application"',
        '6. Add authorized redirect URI: ' + (GOOGLE_REDIRECT_URI || 'https://your-domain.com/api/auth/google/callback'),
        '7. Copy Client ID and Client Secret to your .env file',
      ],
    }, { status: 400 });
  }

  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in a cookie for verification
  const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  redirectUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  redirectUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
  redirectUrl.searchParams.set('response_type', 'code');
  redirectUrl.searchParams.set('scope', 'email profile');
  redirectUrl.searchParams.set('state', state);
  
  const response = NextResponse.redirect(redirectUrl.toString());
  response.cookies.set('oauth_state', state, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
  });
  
  return response;
}
