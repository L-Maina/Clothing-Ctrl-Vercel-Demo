import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const handles = await db.socialHandle.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ handles });
  } catch (error) {
    console.error('Failed to fetch social handles:', error);
    return NextResponse.json({ handles: [] });
  }
}
