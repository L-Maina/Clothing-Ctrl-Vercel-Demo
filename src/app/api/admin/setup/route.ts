import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateTemporaryPassword } from '@/lib/admin-auth-server';
import { sendAdminOnboardingEmail } from '@/lib/email';

/**
 * Setup Initial Admin
 * 
 * This endpoint creates the first admin user with a temporary password.
 * It can only be called once and requires a setup key for security.
 * 
 * Environment variables needed:
 * - ADMIN_SETUP_KEY: A secret key to authorize the setup
 * - ADMIN_EMAIL: The email for the initial admin
 * - ADMIN_NAME: The name for the initial admin
 * - NEXT_PUBLIC_APP_URL: The base URL of the application
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { setupKey, email, name, sendEmail } = body;
    
    // Validate setup key
    const validSetupKey = process.env.ADMIN_SETUP_KEY || 'clothing-ctrl-setup-2024';
    
    if (setupKey !== validSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      );
    }
    
    // Check if any admin already exists
    const existingAdmins = await db.adminUser.findMany({
      take: 1,
    });
    
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admin users already exist. Use the create admin endpoint instead.' },
        { status: 400 }
      );
    }
    
    // Get admin details from request or environment
    const adminEmail = email || process.env.ADMIN_EMAIL;
    const adminName = name || process.env.ADMIN_NAME || 'Admin';
    
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required. Provide it in the request or set ADMIN_EMAIL environment variable.' },
        { status: 400 }
      );
    }
    
    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword(16);
    const hashedPassword = await hashPassword(temporaryPassword);
    
    // Create admin user
    const admin = await db.adminUser.create({
      data: {
        email: adminEmail.toLowerCase(),
        name: adminName,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isTemporaryPassword: true,
        onboardingComplete: false,
        emailVerified: false,
      },
    });
    
    // Send onboarding email if requested
    let emailSent = false;
    if (sendEmail !== false) {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/login`;
      
      try {
        await sendAdminOnboardingEmail({
          adminUserId: admin.id,
          adminName: admin.name,
          email: admin.email,
          temporaryPassword,
          loginUrl,
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send onboarding email:', emailError);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Initial admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      temporaryPassword: sendEmail === false ? temporaryPassword : undefined,
      emailSent,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/login`,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create initial admin' },
      { status: 500 }
    );
  }
}

/**
 * Check Setup Status
 */
export async function GET() {
  try {
    const adminCount = await db.adminUser.count();
    
    return NextResponse.json({
      isSetupComplete: adminCount > 0,
      adminCount,
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
