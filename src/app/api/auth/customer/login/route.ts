import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.error('========== LOGIN DEBUG ==========');
    console.error('[LOGIN] Attempt for:', email);

    // Validate required fields
    if (!email || !password) {
      console.error('[LOGIN] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await db.customer.findUnique({
      where: { email: email.toLowerCase() },
      include: { loyalty: true },
    });

    console.error('[LOGIN] Customer found:', !!customer);
    console.error('[LOGIN] Customer ID:', customer?.id);
    console.error('[LOGIN] Has password field:', !!customer?.password);
    console.error('[LOGIN] Password length:', customer?.password?.length);

    // Check if customer exists and has a password
    if (!customer || !customer.password) {
      console.error('[LOGIN] No customer or no password - rejecting');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!customer.isActive) {
      console.error('[LOGIN] Account not active');
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    console.error('[LOGIN] Comparing passwords...');
    console.error('[LOGIN] Input password:', password);
    console.error('[LOGIN] Stored hash:', customer.password.substring(0, 20) + '...');
    
    const passwordMatch = await bcrypt.compare(password, customer.password);
    console.error('[LOGIN] Password match result:', passwordMatch);

    if (!passwordMatch) {
      console.error('[LOGIN] Password does not match');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return customer without password
    const { password: _, ...customerWithoutPassword } = customer;

    console.error('[LOGIN] SUCCESS for:', email);
    console.error('========== END LOGIN DEBUG ==========');
    return NextResponse.json({
      customer: customerWithoutPassword,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
