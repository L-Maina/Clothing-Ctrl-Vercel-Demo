import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validateEmail } from '@/lib/email-validation-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format and verify domain exists (server-side with MX check)
    const emailValidation = await validateEmail(email);
    
    if (!emailValidation.valid) {
      return NextResponse.json(
        { 
          error: emailValidation.error,
          suggestion: emailValidation.suggestion,
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if customer already exists
    const existingCustomer = await db.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingCustomer) {
      // If existing customer has no password (guest), allow them to upgrade to registered account
      if (!existingCustomer.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const updatedCustomer = await db.customer.update({
          where: { id: existingCustomer.id },
          data: {
            password: hashedPassword,
            name: name || existingCustomer.name,
            phone: phone || existingCustomer.phone,
          },
          include: { loyalty: true },
        });

        const { password: _, ...customerWithoutPassword } = updatedCustomer;

        return NextResponse.json({
          customer: customerWithoutPassword,
          message: 'Account upgraded successfully',
        });
      }

      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer with loyalty record
    const customer = await db.customer.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        isVerified: false,
        isActive: true,
        emailNotifications: true,
        smsNotifications: true,
      },
    });

    // Create loyalty record
    await db.loyalty.create({
      data: {
        customerId: customer.id,
        points: 0,
        tier: 'BRONZE',
      },
    });

    // Get customer with loyalty
    const customerWithLoyalty = await db.customer.findUnique({
      where: { id: customer.id },
      include: { loyalty: true },
    });

    // Return customer without password
    const { password: _, ...customerWithoutPassword } = customerWithLoyalty!;

    return NextResponse.json({
      customer: customerWithoutPassword,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
