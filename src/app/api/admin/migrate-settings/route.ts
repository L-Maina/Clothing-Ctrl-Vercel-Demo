import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Add missing columns to StoreSettings table using raw SQL
    const alterStatements = [
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingNairobi" DOUBLE PRECISION DEFAULT 200`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingKenya" DOUBLE PRECISION DEFAULT 500`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingInternational" DOUBLE PRECISION DEFAULT 2000`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "shippingFreeThreshold" DOUBLE PRECISION`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyPointsPerShilling" DOUBLE PRECISION DEFAULT 0.01`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyBronzeThreshold" INTEGER DEFAULT 0`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltySilverThreshold" INTEGER DEFAULT 200`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyGoldThreshold" INTEGER DEFAULT 500`,
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "loyaltyPlatinumThreshold" INTEGER DEFAULT 1000`,
    ];

    const results = [];
    
    for (const sql of alterStatements) {
      try {
        await db.$executeRawUnsafe(sql);
        results.push({ sql, status: 'success' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Column might already exist, which is fine
        if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
          results.push({ sql, status: 'already_exists' });
        } else {
          results.push({ sql, status: 'error', error: errorMessage });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed',
      results 
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
