import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('auth_error', errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Exchange error:', exchangeError);
        const redirectUrl = new URL('/', origin);
        redirectUrl.searchParams.set('auth_error', exchangeError.message);
        return NextResponse.redirect(redirectUrl.toString());
      }
      
      // Get the user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User fetch error:', userError);
        const redirectUrl = new URL('/', origin);
        redirectUrl.searchParams.set('auth_error', 'Failed to get user info');
        return NextResponse.redirect(redirectUrl.toString());
      }
      
      // Sync with our database - create customer if doesn't exist
      const { db } = await import('@/lib/db');
      
      const existingCustomer = await db.customer.findUnique({
        where: { email: user.email! },
        include: { loyalty: true },
      });
      
      let customer = existingCustomer;
      
      if (!existingCustomer) {
        // Create new customer from Supabase auth
        customer = await db.customer.create({
          data: {
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
            phone: user.phone || null,
            isVerified: true, // Supabase handles verification
            password: '', // No password for social auth users
            isActive: true,
          },
          include: { loyalty: true },
        });
        
        // Create loyalty record for new customer
        await db.loyalty.create({
          data: {
            customerId: customer.id,
            points: 0,
            tier: 'BRONZE',
          },
        });
      }

      // Get loyalty info
      const loyalty = await db.loyalty.findUnique({
        where: { customerId: customer?.id },
      });

      // Build redirect URL with auth success
      const redirectUrl = new URL(next, origin);
      redirectUrl.searchParams.set('auth_success', 'true');
      
      // Store user info in a short-lived cookie for the frontend to read
      const authUser = {
        id: customer?.id,
        email: customer?.email,
        name: customer?.name,
        phone: customer?.phone,
        loyaltyPoints: loyalty?.points || 0,
        loyaltyTier: loyalty?.tier || 'BRONZE',
      };
      
      const response = NextResponse.redirect(redirectUrl.toString());
      response.cookies.set('auth_user', encodeURIComponent(JSON.stringify(authUser)), {
        path: '/',
        maxAge: 60, // 1 minute
        httpOnly: false, // Allow JS to read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      return response;
    } catch (err) {
      console.error('Auth callback error:', err);
      const redirectUrl = new URL('/', origin);
      redirectUrl.searchParams.set('auth_error', 'Authentication failed');
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // No code parameter - redirect to home with error
  const redirectUrl = new URL('/', origin);
  redirectUrl.searchParams.set('auth_error', 'No authorization code received');
  return NextResponse.redirect(redirectUrl.toString());
}
