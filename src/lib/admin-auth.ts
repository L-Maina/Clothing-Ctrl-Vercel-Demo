import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Admin user type
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isTemporaryPassword: boolean;
  onboardingComplete: boolean;
  notificationEmail: string | null;
  emailVerified: boolean;
}

// Onboarding step type
export type OnboardingStep = 'password' | 'email' | 'verify' | 'complete';

// Admin auth store
interface AdminAuthStore {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  onboardingStep: OnboardingStep | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
  setOnboardingStep: (step: OnboardingStep | null) => void;
  updateAdminUser: (updates: Partial<AdminUser>) => void;
}

export const useAdminAuth = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      adminUser: null,
      onboardingStep: null,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/admin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (!response.ok || !data.success) {
            return { success: false, error: data.error || 'Invalid credentials' };
          }
          
          const admin = data.admin as AdminUser;
          
          // ONBOARDING PAUSED - Skip onboarding steps
          // Directly set authenticated without onboarding
          set({ 
            isAdminAuthenticated: true, 
            adminUser: admin,
            onboardingStep: null, // Always null - no onboarding
          });
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'An error occurred. Please try again.' };
        }
      },

      logout: () => {
        set({ 
          isAdminAuthenticated: false, 
          adminUser: null,
          onboardingStep: null,
        });
      },

      checkAuth: () => {
        const state = get();
        if (!state.isAdminAuthenticated) {
          set({ adminUser: null, onboardingStep: null });
        }
      },
      
      setOnboardingStep: (step) => {
        set({ onboardingStep: step });
      },
      
      updateAdminUser: (updates) => {
        const current = get().adminUser;
        if (current) {
          set({ adminUser: { ...current, ...updates } });
        }
      },
    }),
    {
      name: 'clothing-ctrl-admin-auth',
      // Persist auth state so user stays logged in
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminUser: state.adminUser,
      }),
    }
  )
);
