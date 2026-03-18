import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Sync with our database - create customer if doesn't exist
        const { db } = await import('@/lib/db');
        
        const existingCustomer = await db.customer.findUnique({
          where: { email: user.email! },
        });
        
        if (!existingCustomer) {
          // Create new customer from Supabase auth
          await db.customer.create({
            data: {
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              phone: user.phone || null,
              isVerified: true, // Supabase handles verification
              password: '', // No password for social auth users
            },
          });
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
