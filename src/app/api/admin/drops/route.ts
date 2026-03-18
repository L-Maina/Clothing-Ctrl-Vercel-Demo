import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all drops
export async function GET() {
  try {
    const drops = await db.nextDrop.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ drops });
  } catch (error) {
    console.error('Error fetching drops:', error);
    return NextResponse.json({ error: 'Failed to fetch drops' }, { status: 500 });
  }
}

// POST create new drop
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, date, image, active } = body;

    // If this drop is set to active, deactivate all other drops
    if (active) {
      await db.nextDrop.updateMany({
        where: { active: true },
        data: { active: false },
      });
    }

    const drop = await db.nextDrop.create({
      data: {
        name,
        description: description || null,
        date: new Date(date),
        image: image || null,
        active: active ?? true,
      },
    });

    return NextResponse.json({ drop });
  } catch (error) {
    console.error('Error creating drop:', error);
    return NextResponse.json({ error: 'Failed to create drop' }, { status: 500 });
  }
}
