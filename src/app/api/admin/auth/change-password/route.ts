import { NextResponse } from 'next/server';
import { changeAdminPassword, getAdminById } from '@/lib/admin-auth-server';
import { sendPasswordChangedEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, newPassword, confirmPassword } = body;
    
    if (!adminId || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }
    
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      );
    }
    
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }
    
    // Change password
    const result = await changeAdminPassword(adminId, newPassword);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Get admin info for email notification
    const admin = await getAdminById(adminId);
    
    // Send confirmation email (non-blocking)
    if (admin) {
      sendPasswordChangedEmail({
        adminUserId: admin.id,
        adminName: admin.name,
        email: admin.email,
      }).catch(err => console.error('Failed to send password change email:', err));
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
