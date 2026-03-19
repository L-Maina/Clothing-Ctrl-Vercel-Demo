'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Search, User, Globe, Heart, LogOut, Package, Instagram, Twitter, Facebook, Youtube, Sparkles, Crown, Award, Settings } from 'lucide-react';
import { useCartStore, useCurrencyStore, useAuthStore, useWishlistStore, CURRENCIES, CurrencyCode } from '@/lib/store';
import { useSettingsStore, useRealtime } from '@/hooks/useRealtime';
import { cn } from '@/lib/utils';

// Lazy load SearchModal - only load when needed
const SearchModal = dynamic(
  () => import('@/components/search/SearchModal').then((mod) => mod.SearchModal),
  { ssr: false }
);

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/drops', label: 'Drops' },
  { href: '/community', label: 'Community' },
];

interface SocialHandle {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
}

// Custom hook to safely access client-only values
function useMounted() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Use requestAnimationFrame to defer state update
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  
  return mounted;
}

// Tier colors
const tierColors: Record<string, string> = {
  BRONZE: 'text-amber-700',
  SILVER: 'text-gray-400',
  GOLD: 'text-yellow-500',
  PLATINUM: 'text-purple-400',
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialHandle[]>([]);
  const mounted = useMounted();
  
  // Initialize real-time sync for settings
  useRealtime();
  
  // Get banner settings and dismissed text from shared store
  const settings = useSettingsStore((state) => state.settings);
  const dismissedBannerText = useSettingsStore((state) => state.dismissedBannerText);
  // Banner is visible if enabled, has text, and text differs from dismissed text
  const bannerVisible = settings.bannerEnabled && settings.bannerText && settings.bannerText !== dismissedBannerText;
  
  const { openCart, getTotalItems } = useCartStore();
  const { currency, setCurrency, setRates } = useCurrencyStore();
  const auth = useAuthStore();
  const { openWishlist, getTotalItems: getWishlistItems } = useWishlistStore();
  
  // Only show badge counts and auth state after mount to avoid hydration mismatch
  const totalItems = mounted ? getTotalItems() : 0;
  const wishlistItems = mounted ? getWishlistItems() : 0;
  const isLoggedIn = mounted ? auth.isLoggedIn : false;
  const user = mounted ? auth.user : null;

  // Defer non-critical API calls until after initial render
  useEffect(() => {
    // Use requestIdleCallback for non-critical operations
    const deferredFetch = () => {
      // Fetch exchange rates (non-critical, can be deferred)
      const fetchRates = async () => {
        try {
          const response = await fetch('/api/currency');
          const data = await response.json();
          if (data.success && data.rates) {
            setRates(data.rates);
          }
        } catch (error) {
          console.error('Failed to fetch exchange rates:', error);
        }
      };

      // Detect user location on first visit (non-critical)
      const detectLocation = async () => {
        const stored = localStorage.getItem('clothing-ctrl-currency-detected');
        if (!stored) {
          try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const countryCode = data.country_code;
            
            // Map country to currency
            const countryToCurrency: Record<string, CurrencyCode> = {
              'KE': 'KES', 'US': 'USD', 'GB': 'GBP', 'EU': 'EUR',
              'AE': 'AED', 'ZA': 'ZAR', 'UG': 'UGX', 'TZ': 'TZS',
              'NG': 'NGN', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY',
            };
            
            const detectedCurrency = countryToCurrency[countryCode] || 'KES';
            setCurrency(detectedCurrency);
            localStorage.setItem('clothing-ctrl-currency-detected', 'true');
          } catch {
            // Default to KES if detection fails
            setCurrency('KES');
          }
        }
      };

      fetchRates();
      detectLocation();
    };

    // Defer using requestIdleCallback or setTimeout fallback
    if ('requestIdleCallback' in window) {
      const idleCallbackId = requestIdleCallback(deferredFetch, { timeout: 2000 });
      return () => cancelIdleCallback(idleCallbackId);
    } else {
      const timeoutId = setTimeout(deferredFetch, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [setRates, setCurrency]);

  useEffect(() => {
    const handleScroll = () => {
      // When banner is visible, header should move to top-0 after scrolling past banner height (44px)
      // Otherwise, just check if scrolled past 50px for background change
      const scrollThreshold = bannerVisible ? 44 : 50;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bannerVisible]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Fetch social links
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch('/api/social');
        const data = await response.json();
        setSocialLinks(data.handles || []);
      } catch (error) {
        console.error('Failed to fetch social links:', error);
      }
    };
    fetchSocialLinks();
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 z-50 transition-all duration-300',
          // When banner is visible AND not scrolled past it, header is below banner
          // When scrolled past banner OR no banner, header is at top
          (bannerVisible && !isScrolled) ? 'top-[44px]' : 'top-0',
          isScrolled 
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10' 
            : 'bg-transparent'
        )}
      >
        <nav className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:text-amber-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-white group-hover:text-amber-400 transition-colors duration-300">
                  {settings.storeName?.replace('Ctrl', '').trim().toUpperCase() || 'CLOTHING'}
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-amber-400 ml-1">
                  {settings.storeName?.includes('Ctrl') ? 'CTRL' : ''}
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/80 hover:text-amber-400 font-medium text-sm tracking-wide transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-3">
              {/* Currency Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1.5 text-white/80 hover:text-amber-400 transition-colors text-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{CURRENCIES[currency].symbol}</span>
                </button>
                
                <AnimatePresence>
                  {isCurrencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {Object.entries(CURRENCIES).map(([code, info]) => (
                          <button
                            key={code}
                            onClick={() => {
                              setCurrency(code as CurrencyCode);
                              setIsCurrencyOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors",
                              currency === code 
                                ? "bg-amber-400/10 text-amber-400" 
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <span>{info.flag}</span>
                            <span>{info.symbol}</span>
                            <span className="text-white/50">{code}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:p-2 text-white/80 hover:text-amber-400 transition-colors"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              <button
                onClick={openWishlist}
                className="relative p-1.5 sm:p-2 text-white/80 hover:text-amber-400 transition-colors"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </button>

              {/* User / Account */}
              <div className="relative">
                <button
                  onClick={() => isLoggedIn ? setIsUserMenuOpen(!isUserMenuOpen) : auth.openLoginModal()}
                  className="relative p-1.5 sm:p-2 text-white/80 hover:text-amber-400 transition-colors"
                >
                  {isLoggedIn && user ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-[8px] sm:text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  
                  {/* Loyalty Points Badge */}
                  {isLoggedIn && user && user.loyaltyPoints > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[8px] font-bold px-1 rounded-full flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {user.loyaltyPoints > 999 ? `${Math.floor(user.loyaltyPoints / 1000)}k` : user.loyaltyPoints}
                    </span>
                  )}
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && isLoggedIn && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold">
                              {user.name?.charAt(0).toUpperCase() || user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user.name || 'Customer'}</p>
                            <p className="text-white/50 text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                        
                        {/* Loyalty Points Display */}
                        {user.loyaltyPoints > 0 && (
                          <div className="mt-3 flex items-center justify-between bg-purple-500/10 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Award className={cn("w-4 h-4", tierColors[user.loyaltyTier] || 'text-purple-400')} />
                              <span className="text-white/70 text-xs">{user.loyaltyTier} Member</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-400 font-bold text-sm">{user.loyaltyPoints}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link
                          href="/account#settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            auth.logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-1.5 sm:p-2 text-white/80 hover:text-amber-400 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 text-black text-[9px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 left-0 w-[85%] max-w-sm h-full bg-zinc-950 border-r border-white/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-xl font-bold text-white">
                  {settings.storeName?.replace('Ctrl', '').trim().toUpperCase() || 'CLOTHING'}<span className="text-amber-400">{settings.storeName?.includes('Ctrl') ? 'CTRL' : ''}</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white hover:text-amber-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="p-6">
                <ul className="space-y-6">
                  {navLinks.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-2xl font-bold text-white hover:text-amber-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* Mobile Auth */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold">
                            {user?.name?.charAt(0).toUpperCase() || user?.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user?.name || 'Customer'}</p>
                          <p className="text-white/50 text-sm">{user?.email}</p>
                        </div>
                      </div>
                      
                      {/* Mobile Loyalty Points */}
                      {user && user.loyaltyPoints > 0 && (
                        <div className="flex items-center justify-between bg-purple-500/10 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Award className={cn("w-4 h-4", tierColors[user.loyaltyTier] || 'text-purple-400')} />
                            <span className="text-white/70 text-sm">{user.loyaltyTier} Member</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-400 font-bold">{user.loyaltyPoints} pts</span>
                          </div>
                        </div>
                      )}
                      
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-white/70 hover:text-amber-400 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-white/70 hover:text-amber-400 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          auth.logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        auth.openLoginModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold transition-colors"
                    >
                      SIGN IN / SIGN UP
                    </button>
                  )}
                </div>

                {/* Mobile Currency Selector */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Currency</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CURRENCIES).slice(0, 6).map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => setCurrency(code as CurrencyCode)}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-full border transition-colors",
                          currency === code 
                            ? "bg-amber-400 text-black border-amber-400" 
                            : "border-white/20 text-white/70 hover:border-amber-400/50"
                        )}
                      >
                        {info.flag} {code}
                      </button>
                    ))}
                  </div>
                </div>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
                <p className="text-white/60 text-sm mb-4">Follow us</p>
                <div className="flex gap-4">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((link) => (
                      <a 
                        key={link.id}
                        href={link.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-amber-400 transition-colors text-sm capitalize"
                      >
                        {link.platform}
                      </a>
                    ))
                  ) : (
                    <>
                      <a 
                        href="https://www.instagram.com/clothing.ctrl" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-amber-400 transition-colors text-sm"
                      >
                        Instagram
                      </a>
                      <a 
                        href="https://www.tiktok.com/@clothing.ctrl" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-amber-400 transition-colors text-sm"
                      >
                        TikTok
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {isCurrencyOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsCurrencyOpen(false)}
        />
      )}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
