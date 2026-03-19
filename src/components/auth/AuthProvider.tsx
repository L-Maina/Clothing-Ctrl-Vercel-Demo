'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore, useCustomerStore, useCartStore, useWishlistStore } from '@/lib/store';
import { toast } from 'sonner';

/**
 * AuthProvider handles OAuth callbacks and session persistence.
 * This component should be mounted at the root level to ensure
 * auth state is properly updated after OAuth redirects.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, logout: authLogout, user } = useAuthStore();
  const { setCustomer, addLoyaltyPoints, logout: customerLogout } = useCustomerStore();
  const { loadFromServer: loadCartFromServer, clearCart } = useCartStore();
  const { loadFromServer: loadWishlistFromServer } = useWishlistStore();
  const hasShownDeletedToast = useRef(false);

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
      hasShownDeletedToast.current = false;
    }
  }, [isLoggedIn, clearCart, customerLogout]);

  // Check if user account still exists (for deleted account detection)
  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;

    const checkAccountExists = async () => {
      try {
        const response = await fetch(`/api/auth/customer/me?email=${encodeURIComponent(user.email)}`);
        
        if (response.status === 404) {
          // Account has been deleted
          if (!hasShownDeletedToast.current) {
            hasShownDeletedToast.current = true;
            toast.error('Your account has been deleted', {
              description: 'You will be logged out. Please create a new account to continue.',
              duration: 5000,
            });
            
            // Log out after showing toast
            setTimeout(() => {
              authLogout();
              // Clear all local storage data
              localStorage.removeItem('clothing-ctrl-auth');
              localStorage.removeItem('clothing-ctrl-customer');
              localStorage.removeItem('clothing-ctrl-cart-v3');
              localStorage.removeItem('clothing-ctrl-wishlist-v3');
              // Reload page to reset state
              window.location.href = '/';
            }, 2000);
          }
        } else if (response.status === 403) {
          // Account has been deactivated
          if (!hasShownDeletedToast.current) {
            hasShownDeletedToast.current = true;
            toast.error('Your account has been deactivated', {
              description: 'Please contact support for assistance.',
              duration: 5000,
            });
            
            setTimeout(() => {
              authLogout();
              localStorage.removeItem('clothing-ctrl-auth');
              localStorage.removeItem('clothing-ctrl-customer');
              localStorage.removeItem('clothing-ctrl-cart-v3');
              localStorage.removeItem('clothing-ctrl-wishlist-v3');
              window.location.href = '/';
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Failed to check account status:', error);
      }
    };

    // Check immediately
    checkAccountExists();
    
    // Then check every 30 seconds
    const interval = setInterval(checkAccountExists, 30000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, user?.email, authLogout]);

  return <>{children}</>;
}
