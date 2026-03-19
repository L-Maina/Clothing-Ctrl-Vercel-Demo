import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const drop = await db.nextDrop.findFirst({
      where: { active: true },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(drop);
  } catch (error) {
    console.error('Error fetching drop:', error);
    return NextResponse.json({ error: 'Failed to fetch drop' }, { status: 500 });
  }
}
