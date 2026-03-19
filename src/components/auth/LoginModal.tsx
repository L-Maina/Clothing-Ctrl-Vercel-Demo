'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Chrome, Loader2, Phone, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useCustomerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { validateEmailSimple } from '@/lib/email-validation';

// Apple Icon Component
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, signup } = useAuthStore();
  const { setCustomer, addLoyaltyPoints } = useCustomerStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'valid' | 'invalid' | 'checking' | null>(null);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | 'magic' | null>(null);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [appleSignIn, setAppleSignIn] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // Check for OAuth callback on mount
  useEffect(() => {
    // Check for auth success/error from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('auth_success');
    const authError = params.get('auth_error');
    
    if (authSuccess) {
      // Read auth user from cookie
      const authUser = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_user='))
        ?.split('=')[1];
      
      if (authUser) {
        try {
          const user = JSON.parse(decodeURIComponent(authUser));
          useAuthStore.setState({
            isLoggedIn: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              phone: user.phone,
              loyaltyPoints: user.loyaltyPoints,
              loyaltyTier: user.loyaltyTier,
            },
          });
          setCustomer(user.email, user.name || undefined);
          addLoyaltyPoints(user.loyaltyPoints);
          
          // Clear the cookie and URL params
          document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          console.error('Failed to parse auth user');
        }
      }
    }
    
    if (authError) {
      setError(`Authentication failed: ${authError}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setCustomer, addLoyaltyPoints]);

  // Check email validity on change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    setEmailSuggestion(null);
    
    if (email && email.includes('@')) {
      const validation = validateEmailSimple(email);
      if (validation.suggestion) {
        setEmailSuggestion(validation.suggestion);
      }
      setEmailStatus(validation.valid ? 'valid' : 'invalid');
    } else {
      setEmailStatus(null);
    }
  };

  const applyEmailSuggestion = () => {
    if (emailSuggestion) {
      setFormData({ ...formData, email: emailSuggestion });
      setEmailSuggestion(null);
      setEmailStatus('valid');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.name, formData.email, formData.password, formData.phone || undefined);
      }

      if (!result.success) {
        setError(result.error || 'Something went wrong. Please try again.');
      } else {
        // Sync with customer store
        const auth = useAuthStore.getState();
        if (auth.user) {
          setCustomer(auth.user.email, auth.user.name || undefined);
          addLoyaltyPoints(auth.user.loyaltyPoints);
        }
        // Reset form
        setFormData({ name: '', email: '', password: '', phone: '' });
        setError('');
        setEmailSuggestion(null);
        setEmailStatus(null);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'email') {
      handleEmailChange(e);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setEmailSuggestion(null);
    setEmailStatus(null);
  };

  // Handle Google Sign In via server-side OAuth (fixes PKCE cookie issue)
  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseKey === 'YOUR_ANON_KEY_HERE') {
        setError('Google Sign In requires Supabase configuration. Please use email/password.');
        return;
      }
      
      // Call server-side OAuth endpoint - this properly stores PKCE verifier in cookies
      const response = await fetch('/api/auth/google', { method: 'POST' });
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else if (data.url) {
        // Redirect to Google OAuth
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to initiate Google Sign In. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  // Handle Apple Sign In via server-side OAuth (fixes PKCE cookie issue)
  const handleAppleSignIn = async () => {
    setSocialLoading('apple');
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseKey === 'YOUR_ANON_KEY_HERE') {
        setError('Apple Sign In requires Supabase configuration. Please use email/password.');
        return;
      }
      
      // Call server-side OAuth endpoint - this properly stores PKCE verifier in cookies
      const response = await fetch('/api/auth/apple', { method: 'POST' });
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else if (data.url) {
        // Redirect to Apple OAuth
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Apple sign in error:', err);
      setError('Failed to initiate Apple Sign In. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  // Handle Magic Link (Passwordless Login)
  const handleMagicLink = async () => {
    if (!formData.email) {
      setError('Please enter your email to receive a magic link');
      return;
    }
    
    setSocialLoading('magic');
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseKey === 'YOUR_ANON_KEY_HERE') {
        setError('Magic Link requires Supabase configuration. Please use email/password.');
        return;
      }
      
      const { getSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = getSupabaseClient();
      
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        setError(error.message || 'Failed to send magic link');
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={closeLoginModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-white/50 text-sm mt-1">
                  {mode === 'login' 
                    ? 'Sign in to access your account' 
                    : 'Join Clothing Ctrl today'}
                </p>
              </div>
              <button
                onClick={closeLoginModal}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    className={cn(
                      "w-full bg-zinc-900 border rounded-lg py-3 pl-10 pr-10 text-white placeholder:text-white/40 focus:outline-none",
                      emailStatus === 'valid' ? "border-green-500/50 focus:border-green-500" :
                      emailStatus === 'invalid' ? "border-red-500/50 focus:border-red-500" :
                      "border-white/10 focus:border-amber-400"
                    )}
                  />
                  {emailStatus === 'valid' && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {emailStatus === 'invalid' && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                {/* Email suggestion */}
                {emailSuggestion && (
                  <button
                    type="button"
                    onClick={applyEmailSuggestion}
                    className="mt-2 text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    Did you mean <span className="underline">{emailSuggestion}</span>?
                  </button>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-3 pl-10 pr-10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-white/40 text-xs mt-1">Must be at least 6 characters</p>
                )}
              </div>

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input type="checkbox" className="rounded border-white/20 bg-zinc-900" />
                    Remember me
                  </label>
                  <button type="button" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !!socialLoading}
                className="w-full bg-amber-400 hover:!bg-amber-300 text-black font-bold py-3 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'login' ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
                  </span>
                ) : (
                  mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-zinc-950 text-white/40">or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || !!socialLoading}
                  className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-lg py-3 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Chrome className="w-5 h-5" />
                  )}
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={isLoading || !!socialLoading}
                  className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-lg py-3 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {socialLoading === 'apple' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <AppleIcon className="w-5 h-5" />
                  )}
                  Continue with Apple
                </button>

                {/* Magic Link */}
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={isLoading || !!socialLoading || !formData.email}
                    className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-lg py-3 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    {socialLoading === 'magic' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 text-amber-400" />
                    )}
                    {magicLinkSent ? '✓ Check Your Inbox!' : 'Instant Sign-In'}
                  </button>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 pb-6 text-center">
              <p className="text-white/50 text-sm">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Benefits */}
            {mode === 'signup' && (
              <div className="bg-zinc-900/50 border-t border-white/10 p-4">
                <p className="text-white/60 text-xs text-center">
                  ✨ Get 15% off your first order • 🚚 Free shipping on orders over KSh 10,000 • ⭐ Earn loyalty points
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
