import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json({ subscribers: [] });
  }
}
