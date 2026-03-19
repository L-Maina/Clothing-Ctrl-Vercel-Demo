import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This endpoint runs database migrations for new columns
// Call it to add missing columns to the StoreSettings table
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret } = body;
    
    // Simple auth - use a secret to prevent unauthorized access
    if (secret !== 'migrate-clothingctrl-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run raw SQL to add missing columns
    const migrations = [
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingNairobi" DOUBLE PRECISION NOT NULL DEFAULT 200`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingKenya" DOUBLE PRECISION NOT NULL DEFAULT 500`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingInternational" DOUBLE PRECISION NOT NULL DEFAULT 2000`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingFreeThreshold" DOUBLE PRECISION`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyPointsPerShilling" DOUBLE PRECISION NOT NULL DEFAULT 0.01`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyBronzeThreshold" INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltySilverThreshold" INTEGER NOT NULL DEFAULT 200`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyGoldThreshold" INTEGER NOT NULL DEFAULT 500`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyPlatinumThreshold" INTEGER NOT NULL DEFAULT 1000`,
    ];

    const results = [];
    
    for (const sql of migrations) {
      try {
        await db.$executeRawUnsafe(sql);
        results.push({ sql, status: 'success' });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        // Column might already exist
        if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
          results.push({ sql, status: 'already_exists' });
        } else {
          results.push({ sql, status: 'error', error: errorMsg });
        }
      }
    }

    return NextResponse.json({ 
      message: 'Migration completed',
      results 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  // Check migration status
  try {
    const settings = await db.storeSettings.findFirst();
    
    // Try to access new fields
    const testSettings = settings as Record<string, unknown>;
    
    return NextResponse.json({
      hasShippingFields: 'shippingNairobi' in testSettings && testSettings.shippingNairobi !== undefined,
      hasLoyaltyFields: 'loyaltyPointsPerShilling' in testSettings && testSettings.loyaltyPointsPerShilling !== undefined,
      currentSettings: settings ? {
        storeName: settings.storeName,
        // These will be undefined if columns don't exist
        shippingNairobi: testSettings.shippingNairobi,
        shippingKenya: testSettings.shippingKenya,
        loyaltyPointsPerShilling: testSettings.loyaltyPointsPerShilling,
      } : null
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      needsMigration: true 
    });
  }
}
