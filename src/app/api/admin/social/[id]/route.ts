import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitSyncEvent } from '@/lib/sync-events';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const socialHandle = await db.socialHandle.update({
      where: { id },
      data: body,
    });

    // Emit sync event for real-time updates
    await emitSyncEvent('SOCIALS_UPDATE', 'UPDATE', {
      id: socialHandle.id,
      platform: socialHandle.platform,
      handle: socialHandle.handle,
      url: socialHandle.url,
      isActive: socialHandle.isActive,
    });

    return NextResponse.json(socialHandle);
  } catch (error) {
    console.error('Failed to update social handle:', error);
    return NextResponse.json({ error: 'Failed to update social handle' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the handle before deleting to emit the event
    const socialHandle = await db.socialHandle.findUnique({
      where: { id },
    });
    
    await db.socialHandle.delete({
      where: { id },
    });

    // Emit sync event for real-time updates
    if (socialHandle) {
      await emitSyncEvent('SOCIALS_UPDATE', 'DELETE', {
        id: socialHandle.id,
        platform: socialHandle.platform,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete social handle:', error);
    return NextResponse.json({ error: 'Failed to delete social handle' }, { status: 500 });
  }
}
