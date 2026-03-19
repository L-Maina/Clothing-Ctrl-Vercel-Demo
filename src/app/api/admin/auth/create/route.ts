import { NextResponse } from 'next/server';
import { createInitialAdmin } from '@/lib/admin-auth-server';
import { sendAdminOnboardingEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, setupKey } = body;
    
    // Verify setup key (prevents unauthorized admin creation)
    const validSetupKey = process.env.ADMIN_SETUP_KEY || 'clothing-ctrl-setup-2024';
    
    if (setupKey !== validSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      );
    }
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }
    
    // Create admin
    const result = await createInitialAdmin({
      email,
      name,
      role: role || 'SUPER_ADMIN',
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Send onboarding email
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/login`;
    
    await sendAdminOnboardingEmail({
      adminUserId: result.admin!.id,
      adminName: result.admin!.name,
      email: result.admin!.email,
      temporaryPassword: result.admin!.temporaryPassword,
      loginUrl,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin created and onboarding email sent',
      admin: {
        id: result.admin!.id,
        email: result.admin!.email,
        name: result.admin!.name,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
