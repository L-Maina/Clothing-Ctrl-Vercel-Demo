import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await db.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if customer exists or not
    if (!customer) {
      return NextResponse.json({
        message: 'If an account with that email exists, we\'ve sent a reset link.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in customer record (we'll add these fields if not present)
    // For now, we'll use a simple approach - store in a separate table or in customer
    
    // For simplicity, we'll just return success for now
    // In production, you would send an email with the reset link
    
    console.log('[FORGOT PASSWORD] Reset token for', email, ':', resetToken);
    
    // TODO: Send email with reset link
    // The reset link would be: /reset-password?token=xxx&email=xxx
    
    return NextResponse.json({
      message: 'If an account with that email exists, we\'ve sent a reset link.',
      // In development, return the token for testing
      ...(process.env.NODE_ENV === 'development' && {
        devToken: resetToken,
        devNote: 'In production, this would be sent via email',
      }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
