import { NextResponse } from 'next/server';
import { setAdminNotificationEmail, getAdminById } from '@/lib/admin-auth-server';
import { sendEmailVerification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, notificationEmail } = body;
    
    if (!adminId || !notificationEmail) {
      return NextResponse.json(
        { error: 'Admin ID and notification email are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Set notification email
    const result = await setAdminNotificationEmail(adminId, notificationEmail);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Get admin info
    const admin = await getAdminById(adminId);
    
    if (admin) {
      // Send verification email
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/verify-email?code=${result.verificationCode}&adminId=${adminId}`;
      
      await sendEmailVerification({
        adminUserId: admin.id,
        adminName: admin.name,
        email: notificationEmail,
        verificationCode: result.verificationCode!,
        verificationUrl,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      verificationCode: result.verificationCode, // In production, don't return this
    });
  } catch (error) {
    console.error('Set notification email error:', error);
    return NextResponse.json(
      { error: 'Failed to set notification email' },
      { status: 500 }
    );
  }
}
