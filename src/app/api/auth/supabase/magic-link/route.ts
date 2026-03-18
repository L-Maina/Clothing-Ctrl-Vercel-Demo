import { NextResponse } from 'next/server';

// Magic Link - Passwordless email login
// This endpoint initiates the magic link flow
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // For Supabase, the magic link is handled client-side with signInWithOtp
    // This endpoint just validates the request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey || anonKey === 'YOUR_ANON_KEY_HERE') {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        message: 'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.',
        setupInstructions: [
          '1. Go to Supabase Dashboard > Project Settings > API',
          '2. Copy your Project URL to NEXT_PUBLIC_SUPABASE_URL',
          '3. Copy your anon/public key to NEXT_PUBLIC_SUPABASE_ANON_KEY',
        ]
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Use the Supabase client SDK to send magic link from the browser.',
      // Return config for client-side initiation
      config: {
        url: supabaseUrl,
        hasKey: !!anonKey,
      }
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to process magic link request' }, { status: 500 });
  }
}
