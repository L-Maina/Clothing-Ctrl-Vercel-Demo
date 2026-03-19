import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/admin-auth-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const result = await verifyAdminCredentials(email, password);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
    
    // Return admin info with onboarding status
    return NextResponse.json({
      success: true,
      admin: {
        id: result.admin!.id,
        email: result.admin!.email,
        name: result.admin!.name,
        role: result.admin!.role,
        isTemporaryPassword: result.admin!.isTemporaryPassword,
        onboardingComplete: result.admin!.onboardingComplete,
        notificationEmail: result.admin!.notificationEmail,
        emailVerified: result.admin!.emailVerified,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
