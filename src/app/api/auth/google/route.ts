import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Handle error in middleware
            }
          },
        },
      }
    );

    // Get the origin from the request headers
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    console.log('Initiating Google OAuth with redirect:', `${origin}/auth/callback`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('OAuth URL generated:', data.url);
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({ error: 'Failed to initiate Google sign in' }, { status: 500 });
  }
}
