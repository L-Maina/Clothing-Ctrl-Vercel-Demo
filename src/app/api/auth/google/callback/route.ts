import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for errors
  if (error) {
    return NextResponse.redirect(new URL('/?auth_error=' + encodeURIComponent(error), request.url));
  }

  // Verify state
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/?auth_error=invalid_state', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=no_code', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();
    const { email, name, picture, id: googleId } = userData;

    // Find or create customer
    let customer = await db.customer.findUnique({
      where: { email: email.toLowerCase() },
      include: { loyalty: true },
    });

    if (!customer) {
      // Create new customer
      customer = await db.customer.create({
        data: {
          email: email.toLowerCase(),
          name: name || null,
          isVerified: true, // Google verified the email
          isActive: true,
        },
        include: { loyalty: true },
      });

      // Create loyalty record
      await db.loyalty.create({
        data: {
          customerId: customer.id,
          points: 0,
          tier: 'BRONZE',
        },
      });

      // Fetch customer with loyalty
      customer = await db.customer.findUnique({
        where: { id: customer.id },
        include: { loyalty: true },
      });
    } else if (!customer.isVerified) {
      // Verify email if not already
      await db.customer.update({
        where: { id: customer.id },
        data: { isVerified: true },
      });
    }

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/?auth_success=google', request.url));
    
    // Set customer data in cookie (client will read this)
    const customerData = {
      id: customer!.id,
      email: customer!.email,
      name: customer!.name,
      phone: customer!.phone,
      loyaltyPoints: customer!.loyalty?.points || 0,
      loyaltyTier: customer!.loyalty?.tier || 'BRONZE',
    };
    
    response.cookies.set('auth_user', JSON.stringify(customerData), {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/?auth_error=oauth_failed', request.url));
  }
}
