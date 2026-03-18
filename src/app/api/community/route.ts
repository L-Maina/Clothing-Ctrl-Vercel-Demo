import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const photos = await db.communityPhoto.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching community photos:', error);
    return NextResponse.json({ error: 'Failed to fetch community photos' }, { status: 500 });
  }
}
