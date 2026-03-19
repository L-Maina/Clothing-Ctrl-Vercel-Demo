import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get current settings
    const settings = await db.storeSettings.findFirst();
    
    return NextResponse.json({ 
      currentSettings: settings,
      bannerEnabled: settings?.bannerEnabled,
      bannerText: settings?.bannerText,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bannerEnabled, bannerText } = body;
    
    // Get existing settings
    const existing = await db.storeSettings.findFirst();
    
    if (existing) {
      // Update existing settings
      const updated = await db.storeSettings.update({
        where: { id: existing.id },
        data: { 
          bannerEnabled: bannerEnabled ?? false,
          bannerText: bannerText ?? null,
        },
      });
      return NextResponse.json({ success: true, settings: updated });
    } else {
      // Create new settings with banner disabled
      const created = await db.storeSettings.create({
        data: {
          storeName: 'Clothing Ctrl',
          bannerEnabled: false,
          bannerText: null,
        },
      });
      return NextResponse.json({ success: true, settings: created });
    }
  } catch (error) {
    console.error('Failed to update banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}
