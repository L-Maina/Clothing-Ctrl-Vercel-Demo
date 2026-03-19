'use client';

import { useEffect } from 'react';
import { useAuthStore, useCustomerStore, useCartStore, useWishlistStore } from '@/lib/store';

/**
 * AuthProvider handles OAuth callbacks and session persistence.
 * This component should be mounted at the root level to ensure
 * auth state is properly updated after OAuth redirects.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, logout: authLogout } = useAuthStore();
  const { setCustomer, addLoyaltyPoints, logout: customerLogout } = useCustomerStore();
  const { loadFromServer: loadCartFromServer, clearCart } = useCartStore();
  const { loadFromServer: loadWishlistFromServer } = useWishlistStore();

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

          // Load cart from server
          if (user.id) {
            loadCartFromServer(user.id);
            loadWishlistFromServer(user.id);
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
  }, [setCustomer, addLoyaltyPoints, loadCartFromServer, loadWishlistFromServer]);

  // Load cart from server when user logs in (for regular login, not OAuth)
  useEffect(() => {
    const loadUserData = async () => {
      if (!isLoggedIn) return;
      
      const authState = useAuthStore.getState();
      if (!authState.user?.id) return;

      // Load cart and wishlist from server
      await Promise.all([
        loadCartFromServer(authState.user.id),
        loadWishlistFromServer(authState.user.id),
      ]);
    };

    loadUserData();
  }, [isLoggedIn, loadCartFromServer, loadWishlistFromServer]);

  // Handle logout - clear cart and customer data
  useEffect(() => {
    if (!isLoggedIn) {
      // Clear cart when logged out
      clearCart();
      customerLogout();
    }
  }, [isLoggedIn, clearCart, customerLogout]);

  return <>{children}</>;
}
