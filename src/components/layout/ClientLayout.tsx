'use client';

import { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { useBannerHeight } from '@/components/layout/AnnouncementBanner';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Lazy load modal/drawer components - only load when needed
const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false }
);

const QuickView = dynamic(
  () => import('@/components/products/QuickView').then((mod) => mod.QuickView),
  { ssr: false }
);

const LoginModal = dynamic(
  () => import('@/components/auth/LoginModal').then((mod) => mod.LoginModal),
  { ssr: false }
);

const WishlistDrawer = dynamic(
  () => import('@/components/wishlist/WishlistDrawer').then((mod) => mod.WishlistDrawer),
  { ssr: false }
);

const StyleAssistant = dynamic(
  () => import('@/components/sections/StyleAssistant').then((mod) => mod.StyleAssistant),
  { ssr: false }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const bannerHeight = useBannerHeight();
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Detect desktop for responsive navbar height
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // Don't wrap admin pages with customer layout
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAdminPage) {
    return <>{children}</>;
  }

  // Navbar height: 64px on mobile (h-16), 80px on desktop (lg:h-20 = 5rem = 80px)
  // Add banner height when visible
  const navbarHeight = isDesktop ? 80 : 64;
  const headerOffset = bannerHeight + navbarHeight;
  
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black flex flex-col">
        {/* Announcement Banner - Live synced from admin settings */}
        <AnnouncementBanner />
        
        <Navbar />
        
        {/* Lazy loaded modals/drawers - only loaded when opened */}
        <Suspense fallback={null}>
          <CartDrawer />
          <QuickView />
          <LoginModal />
          <WishlistDrawer />
        </Suspense>
        
        {/* Page Content - with padding for fixed header */}
        <div className="flex-1" style={{ paddingTop: `${headerOffset}px` }}>
          {children}
        </div>
        
        <Footer />
        
        {/* Style Assistant - Lazy loaded floating component */}
        <Suspense fallback={null}>
          <StyleAssistant />
        </Suspense>
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
      </div>
    </AuthProvider>
  );
}
