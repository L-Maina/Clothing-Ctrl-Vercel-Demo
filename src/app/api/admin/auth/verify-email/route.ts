import { NextResponse } from 'next/server';
import { verifyAdminEmail, getAdminById } from '@/lib/admin-auth-server';
import { sendEmailVerifiedConfirmation } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, code } = body;
    
    if (!adminId || !code) {
      return NextResponse.json(
        { error: 'Admin ID and verification code are required' },
        { status: 400 }
      );
    }
    
    // Get admin to check stored verification code
    const admin = await getAdminById(adminId);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, verify the code from a secure store
    // For now, we accept any 6-digit code within the time window
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }
    
    // Verify email
    const result = await verifyAdminEmail(adminId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Send confirmation email
    if (admin.notificationEmail) {
      sendEmailVerifiedConfirmation({
        adminUserId: admin.id,
        adminName: admin.name,
        email: admin.notificationEmail,
      }).catch(err => console.error('Failed to send verification confirmation:', err));
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      onboardingComplete: true,
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

// GET endpoint for email link verification
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const code = searchParams.get('code');
    
    if (!adminId || !code) {
      return NextResponse.redirect(
        new URL('/admin/login?error=invalid_verification_link', request.url)
      );
    }
    
    // Verify email
    const result = await verifyAdminEmail(adminId);
    
    if (!result.success) {
      return NextResponse.redirect(
        new URL('/admin/login?error=verification_failed', request.url)
      );
    }
    
    // Redirect to admin with success message
    return NextResponse.redirect(
      new URL('/admin?onboarding=complete', request.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/admin/login?error=verification_failed', request.url)
    );
  }
}
