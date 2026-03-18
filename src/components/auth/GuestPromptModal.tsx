'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Loader2, User, Mail, Lock, Phone, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface GuestPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  loyaltyPointsEarned: number;
}

export function GuestPromptModal({ 
  isOpen, 
  onClose, 
  guestInfo, 
  loyaltyPointsEarned 
}: GuestPromptModalProps) {
  const { signup, openLoginModal } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: `${guestInfo.firstName} ${guestInfo.lastName}`,
    email: guestInfo.email,
    phone: guestInfo.phone || '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signup(
          formData.name,
          formData.email,
          formData.password,
          formData.phone || undefined
        );

        if (!result.success) {
          setError(result.error || 'Failed to create account');
        } else {
          setSuccess(true);
          setTimeout(() => onClose(), 2000);
        }
      } else {
        // Switch to login mode
        openLoginModal();
        onClose();
      }
    } catch (err) {
      console.error('Account creation error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-lg overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
                <p className="text-white/60">Welcome to Clothing Ctrl. Your loyalty points have been saved.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {isSignUp ? 'Create an Account?' : 'Sign In'}
                      </h2>
                      <p className="text-white/50 text-sm">
                        Save your points and track orders
                      </p>
                    </div>
                  </div>

                  {/* Points earned highlight */}
                  {loyaltyPointsEarned > 0 && (
                    <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-purple-400 font-bold">
                          {loyaltyPointsEarned} loyalty points earned!
                        </p>
                        <p className="text-white/50 text-xs">
                          Create an account to save them
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded">
                      {error}
                    </div>
                  )}

                  {isSignUp && (
                    <>
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
                    </>
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
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

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
                    {isSignUp && (
                      <p className="text-white/40 text-xs mt-1">Must be at least 6 characters</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-400 hover:!bg-amber-300 text-black font-bold py-3 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isSignUp ? 'CREATING ACCOUNT...' : 'SIGNING IN...'}
                      </span>
                    ) : (
                      isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'
                    )}
                  </Button>

                  {/* Toggle between sign up and sign in */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                    >
                      {isSignUp 
                        ? 'Already have an account? Sign in' 
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>

                {/* Skip option */}
                <div className="px-6 pb-6">
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-white/50 hover:text-white transition-colors text-sm"
                  >
                    No thanks, continue as guest
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
