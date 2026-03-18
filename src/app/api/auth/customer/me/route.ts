import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get email from header or cookie
    const email = request.headers.get('x-customer-email') ||
      new URL(request.url).searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find customer
    const customer = await db.customer.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        loyalty: true,
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (!customer.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Return customer without password
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      customer: customerWithoutPassword,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to get customer' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get email from header
    const email = request.headers.get('x-customer-email');

    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, currency, emailNotifications, smsNotifications, addresses } = body;

    // Update customer
    const customer = await db.customer.update({
      where: { email: email.toLowerCase() },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(currency !== undefined && { currency }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(smsNotifications !== undefined && { smsNotifications }),
        ...(addresses !== undefined && { addresses: JSON.stringify(addresses) }),
      },
      include: { loyalty: true },
    });

    // Return customer without password
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      customer: customerWithoutPassword,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
