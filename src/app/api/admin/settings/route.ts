import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get the first (and should be only) store settings
    let settings = await db.storeSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await db.storeSettings.create({
        data: {
          storeName: 'Clothing Ctrl',
          storeDescription: 'Your one-stop fashion destination in Nairobi.',
          storeEmail: 'info@clothingctrl.com',
          addressLine1: 'Cargen House, Harambee Ave',
          addressLine2: '3rd Floor, Room 310',
          city: 'Nairobi',
          country: 'Kenya',
          openHour: '12:00',
          closeHour: '18:00',
          openDays: 'Mon - Sat',
          bannerEnabled: false,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to fetch store settings:', error);
    return NextResponse.json({ settings: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if settings exist
    const existing = await db.storeSettings.findFirst();

    const settingsData = {
      storeName: body.storeName,
      storeDescription: body.storeDescription,
      storeEmail: body.storeEmail,
      storePhone: body.storePhone,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      country: body.country,
      openHour: body.openHour,
      closeHour: body.closeHour,
      openDays: body.openDays,
      bannerEnabled: body.bannerEnabled,
      bannerText: body.bannerText,
      bannerLink: body.bannerLink,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      // Shipping settings
      shippingNairobi: body.shippingNairobi ?? 200,
      shippingKenya: body.shippingKenya ?? 500,
      shippingInternational: body.shippingInternational ?? 2000,
      shippingFreeThreshold: body.shippingFreeThreshold ?? null,
      // Loyalty settings
      loyaltyPointsPerShilling: body.loyaltyPointsPerShilling ?? 0.01,
      loyaltyBronzeThreshold: body.loyaltyBronzeThreshold ?? 0,
      loyaltySilverThreshold: body.loyaltySilverThreshold ?? 200,
      loyaltyGoldThreshold: body.loyaltyGoldThreshold ?? 500,
      loyaltyPlatinumThreshold: body.loyaltyPlatinumThreshold ?? 1000,
    };

    let settings;
    if (existing) {
      // Update existing settings
      settings = await db.storeSettings.update({
        where: { id: existing.id },
        data: settingsData,
      });
    } else {
      // Create new settings
      settings = await db.storeSettings.create({
        data: settingsData,
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to save store settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
