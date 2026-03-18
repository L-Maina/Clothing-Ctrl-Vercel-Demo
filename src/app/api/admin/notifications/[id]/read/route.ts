import { NextResponse } from 'next/server';

// In-memory store for read notifications (in production, use database)
const readNotifications = new Set<string>();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    readNotifications.add(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ readIds: Array.from(readNotifications) });
}
