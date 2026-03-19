import { NextResponse } from 'next/server';

export async function GET() {
  const debugInfo = {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Show more of the URL to debug
    databaseUrlFull: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
    directUrlFull: process.env.DIRECT_URL?.replace(/:[^:@]+@/, ':****@'),
    timestamp: new Date().toISOString(),
  };

  try {
    // Try to import Prisma client
    const { db } = await import('@/lib/db');
    
    // Try a simple query
    const customerCount = await db.customer.count();
    
    return NextResponse.json({
      ...debugInfo,
      status: 'connected',
      customerCount,
      prismaModels: Object.keys(db).filter(key => !key.startsWith('_') && !key.startsWith('$')),
    });
  } catch (error) {
    return NextResponse.json({
      ...debugInfo,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
    }, { status: 500 });
  }
}
