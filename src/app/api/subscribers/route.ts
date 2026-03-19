import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Get customer email from header (for logged-in check)
    const customerEmail = request.headers.get('x-customer-email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await db.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      );
    }

    // Create subscriber
    const subscriber = await db.subscriber.create({
      data: {
        email: email.toLowerCase(),
        discountUsed: false,
      },
    });

    return NextResponse.json({
      subscriber,
      message: customerEmail
        ? 'Successfully subscribed to newsletter!'
        : 'Successfully subscribed to newsletter!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// GET - List all subscribers (admin only - simplified for now)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const total = await db.subscriber.count();

    return NextResponse.json({
      subscribers,
      total,
    });
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json({ subscribers: [], total: 0 }, { status: 500 });
  }
}
