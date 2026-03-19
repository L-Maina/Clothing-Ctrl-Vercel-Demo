import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Supported currencies with their symbols
export const CURRENCIES: Record<string, { symbol: string; name: string; flag: string }> = {
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AED: { symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  ZAR: { symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  UGX: { symbol: 'USh', name: 'Ugandan Shilling', flag: '🇺🇬' },
  TZS: { symbol: 'TSh', name: 'Tanzanian Shilling', flag: '🇹🇿' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
};

export type CurrencyCode = keyof typeof CURRENCIES;

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  loadFromServer: (customerId: string) => Promise<void>;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      
      setItems: (items) => set({ items }),
      
      loadFromServer: async (customerId: string) => {
        try {
          set({ isLoading: true });
          const response = await fetch(`/api/cart?customerId=${customerId}`);
          if (response.ok) {
            const data = await response.json();
            set({ items: data.items || [], isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error);
          set({ isLoading: false });
        }
      },
      
      addItem: async (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
        );
        
        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += item.quantity;
          set({ items: newItems, isOpen: true });
        } else {
          set({ 
            items: [...items, { ...item, id: `${item.productId}-${item.color}-${item.size}-${Date.now()}` }],
            isOpen: true 
          });
        }
        
        // Sync with server if logged in
        const authState = useAuthStore.getState();
        if (authState.isLoggedIn && authState.user?.id) {
          try {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: authState.user.id,
                productId: item.productId,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
              }),
            });
          } catch (error) {
            console.error('Failed to sync cart to server:', error);
          }
        }
      },
      
      removeItem: async (id) => {
        const item = get().items.find(i => i.id === id);
        
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        
        // Sync with server if logged in
        const authState = useAuthStore.getState();
        if (authState.isLoggedIn && authState.user?.id && item) {
          try {
            await fetch(`/api/cart?customerId=${authState.user.id}&productId=${item.productId}&color=${encodeURIComponent(item.color)}&size=${encodeURIComponent(item.size)}`, {
              method: 'DELETE',
            });
          } catch (error) {
            console.error('Failed to remove from server cart:', error);
          }
        }
      },
      
      updateQuantity: async (id, quantity) => {
        const item = get().items.find(i => i.id === id);
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
        
        // Sync with server if logged in
        const authState = useAuthStore.getState();
        if (authState.isLoggedIn && authState.user?.id && item) {
          try {
            await fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: authState.user.id,
                productId: item.productId,
                color: item.color,
                size: item.size,
                quantity,
              }),
            });
          } catch (error) {
            console.error('Failed to update server cart:', error);
          }
        }
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'clothing-ctrl-cart-v3',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

interface UIStore {
  isMenuOpen: boolean;
  isQuickViewOpen: boolean;
  quickViewProductId: string | null;
  isNewsletterOpen: boolean;
  isSearchOpen: boolean;
  activeShopTab: 'clothes' | 'shoes' | 'accessories';
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
  openNewsletter: () => void;
  closeNewsletter: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setActiveShopTab: (tab: 'clothes' | 'shoes' | 'accessories') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMenuOpen: false,
  isQuickViewOpen: false,
  quickViewProductId: null,
  isNewsletterOpen: false,
  isSearchOpen: false,
  activeShopTab: 'clothes',
  
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  
  openQuickView: (productId) => set({ isQuickViewOpen: true, quickViewProductId: productId }),
  closeQuickView: () => set({ isQuickViewOpen: false, quickViewProductId: null }),
  
  openNewsletter: () => set({ isNewsletterOpen: true }),
  closeNewsletter: () => set({ isNewsletterOpen: false }),
  
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  
  setActiveShopTab: (tab) => set({ activeShopTab: tab }),
}));

interface CurrencyStore {
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  setCurrency: (currency: CurrencyCode) => void;
  setRates: (rates: Record<CurrencyCode, number>) => void;
  convertPrice: (priceInKES: number) => number;
  formatPrice: (priceInKES: number) => string;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'KES',
      rates: { KES: 1 } as Record<CurrencyCode, number>,
      
      setCurrency: (currency) => set({ currency }),
      
      setRates: (rates) => set({ rates }),
      
      convertPrice: (priceInKES) => {
        const { currency, rates } = get();
        const rate = rates[currency] || 1;
        return priceInKES * rate;
      },
      
      formatPrice: (priceInKES) => {
        const { currency, rates } = get();
        const rate = rates[currency] || 1;
        const convertedPrice = priceInKES * rate;
        const currencyInfo = CURRENCIES[currency];
        
        // Format number with appropriate decimal places
        const formatted = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: currency === 'KES' || currency === 'JPY' || currency === 'UGX' || currency === 'TZS' ? 0 : 2,
        }).format(convertedPrice);
        
        return `${currencyInfo.symbol} ${formatted}`;
      },
    }),
    {
      name: 'clothing-ctrl-currency',
      partialize: (state) => ({ currency: state.currency }),
    }
  )
);

interface CustomerStore {
  email: string | null;
  name: string | null;
  loyaltyPoints: number;
  loyaltyTier: string;
  setCustomer: (email: string, name?: string) => void;
  addLoyaltyPoints: (points: number) => void;
  deductLoyaltyPoints: (points: number) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      email: null,
      name: null,
      loyaltyPoints: 0,
      loyaltyTier: 'BRONZE',
      
      setCustomer: (email, name) => set({ email, name: name || null }),
      
      addLoyaltyPoints: (points) =>
        set((state) => {
          const newPoints = state.loyaltyPoints + points;
          let tier = 'BRONZE';
          if (newPoints >= 1000) tier = 'PLATINUM';
          else if (newPoints >= 500) tier = 'GOLD';
          else if (newPoints >= 200) tier = 'SILVER';
          return { loyaltyPoints: newPoints, loyaltyTier: tier };
        }),
      
      deductLoyaltyPoints: (points) =>
        set((state) => {
          const newPoints = Math.max(0, state.loyaltyPoints - points);
          let tier = 'BRONZE';
          if (newPoints >= 1000) tier = 'PLATINUM';
          else if (newPoints >= 500) tier = 'GOLD';
          else if (newPoints >= 200) tier = 'SILVER';
          return { loyaltyPoints: newPoints, loyaltyTier: tier };
        }),
      
      logout: () => set({ email: null, name: null, loyaltyPoints: 0, loyaltyTier: 'BRONZE' }),
    }),
    {
      name: 'clothing-ctrl-customer',
    }
  )
);

// Wishlist Item
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  slug?: string;
  category?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isOpen: boolean;
  isLoading: boolean;
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: () => void;
  getTotalItems: () => number;
  loadFromServer: (customerId: string) => Promise<void>;
  syncWithServer: (customerId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      
      loadFromServer: async (customerId: string) => {
        try {
          set({ isLoading: true });
          const response = await fetch(`/api/wishlist?customerId=${customerId}`);
          if (response.ok) {
            const data = await response.json();
            set({ items: data.items || [], isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Failed to load wishlist from server:', error);
          set({ isLoading: false });
        }
      },
      
      syncWithServer: async (customerId: string) => {
        // Sync local items to server
        const items = get().items;
        for (const item of items) {
          try {
            await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customerId, productId: item.productId }),
            });
          } catch (error) {
            console.error('Failed to sync wishlist item:', error);
          }
        }
      },
      
      addToWishlist: async (item) => {
        const items = get().items;
        const exists = items.find(i => i.productId === item.productId);
        if (!exists) {
          const newItem = { ...item, id: `wishlist-${item.productId}-${Date.now()}` };
          set({ items: [...items, newItem] });
          
          // Sync with server if user is logged in (check auth store)
          const authState = useAuthStore.getState();
          if (authState.isLoggedIn && authState.user?.id) {
            try {
              await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  customerId: authState.user.id, 
                  productId: item.productId 
                }),
              });
            } catch (error) {
              console.error('Failed to add to server wishlist:', error);
            }
          }
        }
      },
      
      removeFromWishlist: async (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
        
        // Sync with server if user is logged in
        const authState = useAuthStore.getState();
        if (authState.isLoggedIn && authState.user?.id) {
          try {
            await fetch(`/api/wishlist?customerId=${authState.user.id}&productId=${productId}`, {
              method: 'DELETE',
            });
          } catch (error) {
            console.error('Failed to remove from server wishlist:', error);
          }
        }
      },
      
      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },
      
      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalItems: () => get().items.length,
    }),
    {
      name: 'clothing-ctrl-wishlist-v3',
    }
  )
);

// Auth Store - Extended user interface with loyalty info
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  loyaltyPoints: number;
  loyaltyTier: string;
}

interface AuthStore {
  isLoggedIn: boolean;
  user: AuthUser | null;
  isLoginModalOpen: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      isLoginModalOpen: false,
      
      login: async (email, password) => {
        try {
          const response = await fetch('/api/auth/customer/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            return { success: false, error: data.error || 'Login failed' };
          }
          
          const customer = data.customer;
          const user: AuthUser = {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            loyaltyPoints: customer.loyalty?.points || 0,
            loyaltyTier: customer.loyalty?.tier || 'BRONZE',
          };
          
          set({ 
            isLoggedIn: true, 
            user,
            isLoginModalOpen: false 
          });
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'An error occurred. Please try again.' };
        }
      },
      
      signup: async (name, email, password, phone) => {
        try {
          const response = await fetch('/api/auth/customer/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            return { success: false, error: data.error || 'Registration failed' };
          }
          
          const customer = data.customer;
          const user: AuthUser = {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            loyaltyPoints: customer.loyalty?.points || 0,
            loyaltyTier: customer.loyalty?.tier || 'BRONZE',
          };
          
          set({ 
            isLoggedIn: true, 
            user,
            isLoginModalOpen: false 
          });
          
          return { success: true };
        } catch (error) {
          console.error('Signup error:', error);
          return { success: false, error: 'An error occurred. Please try again.' };
        }
      },
      
      logout: () => set({ isLoggedIn: false, user: null }),
      
      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
      
      fetchCurrentUser: async () => {
        const { user, isLoggedIn } = get();
        if (!isLoggedIn || !user?.email) return;
        
        try {
          const response = await fetch(`/api/auth/customer/me?email=${encodeURIComponent(user.email)}`);
          
          if (!response.ok) {
            if (response.status === 401 || response.status === 404) {
              // Session invalid, log out
              set({ isLoggedIn: false, user: null });
            }
            return;
          }
          
          const data = await response.json();
          const customer = data.customer;
          
          const updatedUser: AuthUser = {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            loyaltyPoints: customer.loyalty?.points || 0,
            loyaltyTier: customer.loyalty?.tier || 'BRONZE',
          };
          
          set({ user: updatedUser });
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'clothing-ctrl-auth',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
);
