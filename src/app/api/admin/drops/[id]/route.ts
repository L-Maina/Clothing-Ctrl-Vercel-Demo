import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single drop
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const drop = await db.nextDrop.findUnique({
      where: { id },
    });

    if (!drop) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 });
    }

    return NextResponse.json({ drop });
  } catch (error) {
    console.error('Error fetching drop:', error);
    return NextResponse.json({ error: 'Failed to fetch drop' }, { status: 500 });
  }
}

// PUT update drop
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, date, image, active } = body;

    // If this drop is set to active, deactivate all other drops
    if (active) {
      await db.nextDrop.updateMany({
        where: { 
          active: true,
          NOT: { id },
        },
        data: { active: false },
      });
    }

    const drop = await db.nextDrop.update({
      where: { id },
      data: {
        name,
        description: description || null,
        date: date ? new Date(date) : undefined,
        image: image || null,
        active,
      },
    });

    return NextResponse.json({ drop });
  } catch (error) {
    console.error('Error updating drop:', error);
    return NextResponse.json({ error: 'Failed to update drop' }, { status: 500 });
  }
}

// DELETE drop
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.nextDrop.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting drop:', error);
    return NextResponse.json({ error: 'Failed to delete drop' }, { status: 500 });
  }
}
