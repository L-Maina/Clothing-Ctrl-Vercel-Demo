'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useSettingsStore, useRealtime } from '@/hooks/useRealtime';

export function AnnouncementBanner() {
  // Initialize real-time sync and fetch settings
  useRealtime();
  
  const settings = useSettingsStore((state) => state.settings);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const dismissedBannerText = useSettingsStore((state) => state.dismissedBannerText);
  const setDismissedBannerText = useSettingsStore((state) => state.setDismissedBannerText);

  const handleDismiss = () => {
    // Store the current banner text when dismissing
    setDismissedBannerText(settings.bannerText);
  };

  // Banner is visible if:
  // - Not loading
  // - Banner is enabled and has text
  // - Current banner text is different from the dismissed banner text
  //   (this means a new banner will show even if the old one was dismissed)
  const isDismissed = dismissedBannerText === settings.bannerText;
  const isVisible = !isLoading && settings.bannerEnabled && !!settings.bannerText && !isDismissed;

  // Don't render while loading or if banner is disabled/not configured
  if (isLoading || !settings.bannerEnabled || !settings.bannerText) return null;

  const content = (
    <div className="bg-amber-400 text-black relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.1) 75%)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-2.5 relative">
        <div className="flex items-center justify-center gap-1 sm:gap-2 pr-6 sm:pr-8">
          {/* Animated icon */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="text-sm sm:text-lg flex-shrink-0"
          >
            🔥
          </motion.span>

          {/* Banner text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-center truncate"
          >
            {settings.bannerText}
          </motion.p>

          {/* Link indicator */}
          {settings.bannerLink && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:flex items-center gap-1 ml-2 flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="text-xs font-semibold underline underline-offset-2">
                Shop Now
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Dismiss button - positioned outside the content flow */}
      <button
        onClick={handleDismiss}
        className="absolute top-1/2 -translate-y-1/2 right-1 sm:right-3 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="announcement-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {settings.bannerLink ? (
            <Link href={settings.bannerLink} className="block hover:brightness-105 transition-all">
              {content}
            </Link>
          ) : (
            content
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to get banner height for adjusting navbar position
export function useBannerHeight() {
  const settings = useSettingsStore((state) => state.settings);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const dismissedBannerText = useSettingsStore((state) => state.dismissedBannerText);

  // Banner is dismissed if the current text matches the dismissed text
  const isDismissed = dismissedBannerText === settings.bannerText;

  // Banner height when visible (approx 44px for the banner content)
  if (isLoading || !settings.bannerEnabled || !settings.bannerText || isDismissed) {
    return 0;
  }
  return 44; // Approximate banner height in pixels
}
