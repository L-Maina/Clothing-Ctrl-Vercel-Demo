'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const COOKIE_CONSENT_KEY = 'cookie-consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

// Helper to get initial preferences from localStorage (for useState initializer)
function getInitialPreferences(): CookiePreferences {
  // Default preferences
  const defaults: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  };

  if (typeof window === 'undefined') {
    return defaults;
  }
  
  const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (saved) {
    try {
      return { ...defaults, ...JSON.parse(saved), necessary: true };
    } catch {
      return defaults;
    }
  }
  
  return defaults;
}

// Check if consent was already given (for useState initializer)
function getInitialBannerState(): boolean {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem(COOKIE_CONSENT_KEY);
}

export function CookieConsent() {
  // Initialize state directly from localStorage (runs once on mount)
  const [showBanner, setShowBanner] = useState(getInitialBannerState);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(getInitialPreferences);

  // Apply cookie preferences
  const applyPreferences = (prefs: CookiePreferences) => {
    // In a real app, this would enable/disable tracking scripts
    if (prefs.analytics) {
      console.log('Analytics cookies enabled');
    }
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    }
    if (prefs.functional) {
      console.log('Functional cookies enabled');
    }
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    applyPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  // Show banner after delay if no consent exists
  useEffect(() => {
    if (!showBanner) return;
    
    // Small delay for better UX
    const timer = setTimeout(() => {
      // Banner is already visible from initial state
    }, 100);
    return () => clearTimeout(timer);
  }, [showBanner]);

  if (!showBanner && !showSettings) return null;

  return (
    <>
      {/* Banner */}
      {showBanner && !showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <div className="max-w-4xl mx-auto bg-zinc-900 border border-white/10 rounded-lg shadow-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-bold mb-1">We use cookies</h3>
                  <p className="text-white/60 text-sm">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                    <Link href="/privacy" className="text-amber-400 hover:text-amber-300">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                  className="border-white/10 text-white/60 hover:text-white"
                >
                  Necessary Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="border-white/10 text-white/60 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Customize
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Cookie Preferences</DialogTitle>
            <DialogDescription className="text-white/60">
              Choose which cookies you want to accept. Necessary cookies are always enabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Necessary</h4>
                <p className="text-white/40 text-xs">Essential for the website to function properly</p>
              </div>
              <Switch checked disabled />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Analytics</h4>
                <p className="text-white/40 text-xs">Help us understand how visitors interact with our site</p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Marketing</h4>
                <p className="text-white/40 text-xs">Used to deliver relevant ads and track campaign performance</p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Functional</h4>
                <p className="text-white/40 text-xs">Enable enhanced functionality like remember preferences</p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1 border-white/10 text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={savePreferences}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
