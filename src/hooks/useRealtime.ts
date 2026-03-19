'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCallback, useEffect } from 'react';

// Store Settings Interface
export interface StoreSettings {
  storeName: string;
  storeDescription: string | null;
  storeEmail: string | null;
  storePhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  openHour: string | null;
  closeHour: string | null;
  openDays: string | null;
  bannerEnabled: boolean;
  bannerText: string | null;
  bannerLink: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

// Social Handle Interface
export interface SocialHandle {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  isActive: boolean;
}

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'Clothing Ctrl',
  storeDescription: null,
  storeEmail: null,
  storePhone: null,
  addressLine1: null,
  addressLine2: null,
  city: 'Nairobi',
  country: 'Kenya',
  openHour: '12:00',
  closeHour: '18:00',
  openDays: 'Mon-Sat',
  bannerEnabled: false,
  bannerText: null,
  bannerLink: null,
  metaTitle: null,
  metaDescription: null,
};

// Settings Store
interface SettingsStore {
  settings: StoreSettings;
  socials: SocialHandle[];
  isLoading: boolean;
  lastUpdated: number | null;
  dismissedBannerText: string | null; // Store the text of dismissed banner
  setSettings: (settings: Partial<StoreSettings>) => void;
  setSocials: (socials: SocialHandle[]) => void;
  setLoading: (loading: boolean) => void;
  setDismissedBannerText: (text: string | null) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      socials: [],
      isLoading: true,
      lastUpdated: null,
      dismissedBannerText: null,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastUpdated: Date.now(),
        })),
      setSocials: (socials) =>
        set({
          socials,
          lastUpdated: Date.now(),
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setDismissedBannerText: (text) => set({ dismissedBannerText: text }),
    }),
    {
      name: 'clothing-ctrl-settings',
      partialize: (state) => ({
        // Only persist dismissedBannerText, not the settings themselves
        // This ensures fresh settings are always fetched from the server
        dismissedBannerText: state.dismissedBannerText,
      }),
    }
  )
);

// Sync Event Types
export type SyncEventType = 'SETTINGS_UPDATE' | 'SOCIALS_UPDATE' | 'ORDER_UPDATE';

export interface SyncEvent {
  type: SyncEventType;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  timestamp: string;
}



// Hook for components that need live settings with SSE
export function useLiveSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const socials = useSettingsStore((state) => state.socials);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const setSocials = useSettingsStore((state) => state.setSocials);
  const setLoading = useSettingsStore((state) => state.setLoading);

  // Fetch settings on mount - memoized to prevent infinite loops
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }, [setSettings, setLoading]);

  // Fetch socials - memoized to prevent infinite loops
  const fetchSocials = useCallback(async () => {
    try {
      const response = await fetch('/api/social');
      const data = await response.json();
      if (data.handles) {
        setSocials(data.handles);
      }
    } catch (error) {
      console.error('Failed to fetch socials:', error);
    }
  }, [setSocials]);

  // Get banner settings
  const getBanner = () => {
    const { bannerEnabled, bannerText, bannerLink } = settings;
    if (!bannerEnabled || !bannerText) return null;
    return { enabled: bannerEnabled, text: bannerText, link: bannerLink };
  };

  // Get active socials
  const getActiveSocials = () => {
    return socials.filter((s) => s.isActive);
  };

  return {
    settings,
    socials,
    isLoading,
    getBanner,
    getActiveSocials,
    fetchSettings,
    fetchSocials,
    setSettings,
    setSocials,
  };
}

// Global initialization state (singleton pattern)
let globalEventSource: EventSource | null = null;
let globalReconnectTimeout: NodeJS.Timeout | null = null;
let globalReconnectAttempts = 0;
const maxReconnectAttempts = 5;
const baseReconnectDelay = 1000;

// BroadcastChannel for cross-tab communication (works on Vercel too!)
let settingsChannel: BroadcastChannel | null = null;

// SSE Hook for real-time updates
export function useRealtimeSync() {
  const setSettings = useSettingsStore((state) => state.setSettings);
  const setSocials = useSettingsStore((state) => state.setSocials);
  const { fetchSettings, fetchSocials } = useLiveSettings();

  // Connect function - uses global state
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (globalEventSource) {
      globalEventSource.close();
    }

    try {
      globalEventSource = new EventSource('/api/sync/events');

      globalEventSource.onopen = () => {
        globalReconnectAttempts = 0;
      };

      globalEventSource.onmessage = (event) => {
        try {
          const data: SyncEvent = JSON.parse(event.data);

          // Handle different event types
          switch (data.type) {
            case 'CONNECTED':
              // Connection confirmed
              break;

            case 'KEEPALIVE':
              // Just a heartbeat, no action needed
              break;

            case 'SETTINGS_UPDATE':
              if (data.data) {
                setSettings(data.data as Partial<StoreSettings>);
              } else {
                fetchSettings();
              }
              break;

            case 'SOCIALS_UPDATE':
              fetchSocials();
              break;

            case 'ORDER_UPDATE':
              // Emit custom event for order pages to handle
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data.data }));
              }
              break;
          }
        } catch {
          // Failed to parse event, ignore
        }
      };

      globalEventSource.onerror = () => {
        // Silently close and attempt reconnect
        globalEventSource?.close();
        globalEventSource = null;

        // Attempt reconnect with exponential backoff
        if (globalReconnectAttempts < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, globalReconnectAttempts);
          
          globalReconnectTimeout = setTimeout(() => {
            globalReconnectAttempts++;
            connect();
          }, delay);
        }
      };
    } catch {
      // Failed to create EventSource, app will work without real-time updates
    }
  }, [setSettings, fetchSettings, fetchSocials]);

  const disconnect = useCallback(() => {
    if (globalEventSource) {
      globalEventSource.close();
      globalEventSource = null;
    }
    if (globalReconnectTimeout) {
      clearTimeout(globalReconnectTimeout);
      globalReconnectTimeout = null;
    }
  }, []);

  const isConnected = useCallback(() => 
    globalEventSource?.readyState === EventSource.OPEN, []);

  return {
    connect,
    disconnect,
    isConnected,
  };
}

// Custom hook for pages that need real-time sync
export function useRealtime() {
  const { connect } = useRealtimeSync();
  const { fetchSettings, fetchSocials } = useLiveSettings();
  const setSettings = useSettingsStore((state) => state.setSettings);

  // Initialize on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Always fetch fresh settings on mount (bypass cache)
    fetchSettings();
    fetchSocials();
    
    // Connect to SSE for real-time updates (works locally)
    connect();
    
    // Set up BroadcastChannel for cross-tab communication (works on Vercel!)
    if (!settingsChannel) {
      settingsChannel = new BroadcastChannel('clothing-ctrl-settings-sync');
    }
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SETTINGS_UPDATED') {
        // Immediately update settings from the broadcast
        if (event.data.settings) {
          setSettings(event.data.settings);
        } else {
          // Fallback: fetch from API
          fetchSettings();
        }
      }
      if (event.data.type === 'SOCIALS_UPDATED') {
        fetchSocials();
      }
    };
    
    settingsChannel.addEventListener('message', handleMessage);
    
    // Re-fetch settings when window gains focus (tab switch, etc.)
    const handleFocus = () => {
      fetchSettings();
      fetchSocials();
    };
    
    // Also re-fetch when page becomes visible (for same-tab navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSettings();
        fetchSocials();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      settingsChannel?.removeEventListener('message', handleMessage);
      // Don't disconnect SSE - keep it alive for other components
    };
  }, [connect, fetchSettings, fetchSocials, setSettings]);

  return {
    isConnected: () => globalEventSource?.readyState === EventSource.OPEN,
    refetch: () => {
      fetchSettings();
      fetchSocials();
    },
  };
}

// Function to broadcast settings updates (call this from admin after saving)
export function broadcastSettingsUpdate(settings: Partial<StoreSettings>) {
  if (typeof window === 'undefined') return;
  
  if (!settingsChannel) {
    settingsChannel = new BroadcastChannel('clothing-ctrl-settings-sync');
  }
  
  settingsChannel.postMessage({
    type: 'SETTINGS_UPDATED',
    settings,
    timestamp: Date.now(),
  });
}

// Function to broadcast socials updates
export function broadcastSocialsUpdate() {
  if (typeof window === 'undefined') return;
  
  if (!settingsChannel) {
    settingsChannel = new BroadcastChannel('clothing-ctrl-settings-sync');
  }
  
  settingsChannel.postMessage({
    type: 'SOCIALS_UPDATED',
    timestamp: Date.now(),
  });
}
