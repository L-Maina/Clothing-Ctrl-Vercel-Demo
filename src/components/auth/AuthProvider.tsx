'use client';

import { useEffect } from 'react';
import { useAuthStore, useCustomerStore } from '@/lib/store';

/**
 * AuthProvider handles OAuth callbacks and session persistence.
 * This component should be mounted at the root level to ensure
 * auth state is properly updated after OAuth redirects.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  const { setCustomer, addLoyaltyPoints } = useCustomerStore();

  useEffect(() => {
    // Check for auth success/error from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('auth_success');
    const authError = params.get('auth_error');

    if (authSuccess) {
      // Read auth user from cookie
      const authUserCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_user='))
        ?.split('=')[1];

      if (authUserCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(authUserCookie));
          
          // Update auth store
          useAuthStore.setState({
            isLoggedIn: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              phone: user.phone,
              loyaltyPoints: user.loyaltyPoints || 0,
              loyaltyTier: user.loyaltyTier || 'BRONZE',
            },
          });
          
          // Update customer store
          setCustomer(user.email, user.name || undefined);
          if (user.loyaltyPoints) {
            addLoyaltyPoints(user.loyaltyPoints);
          }

          // Clear the cookie
          document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch {
          console.error('Failed to parse auth user cookie');
        }
      }

      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (authError) {
      console.error('Auth error:', authError);
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setCustomer, addLoyaltyPoints]);

  // Fetch fresh user data on mount if logged in
  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoggedIn) return;
      
      const authState = useAuthStore.getState();
      if (!authState.user?.email) return;

      try {
        const response = await fetch(`/api/auth/customer/me?email=${encodeURIComponent(authState.user.email)}`);
        
        if (response.ok) {
          const data = await response.json();
          const customer = data.customer;
          
          useAuthStore.setState({
            user: {
              id: customer.id,
              email: customer.email,
              name: customer.name,
              phone: customer.phone,
              loyaltyPoints: customer.loyalty?.points || 0,
              loyaltyTier: customer.loyalty?.tier || 'BRONZE',
            },
          });
          
          setCustomer(customer.email, customer.name || undefined);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, [isLoggedIn, setCustomer]);

  return <>{children}</>;
}
