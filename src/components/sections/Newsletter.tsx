'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Gift, ArrowRight, Sparkles, Loader2, LogIn, Zap, Clock, Tag } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export function Newsletter() {
  const { isLoggedIn, user, openLoginModal } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('already subscribed')) {
          setSubmitted(true); // Already subscribed, show success
        } else {
          setError(data.error || 'Failed to subscribe');
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If not logged in, show login prompt
  const showLoginPrompt = !isLoggedIn;

  return (
    <section id="newsletter" className="py-20 lg:py-28 bg-zinc-950 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400/10 rounded-full mb-6 border border-amber-400/20">
            <Mail className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">
            JOIN THE LIST
          </h2>

          <p className="text-white/60 text-lg mb-8">
            Get early access to new arrivals, exclusive sales, and <span className="text-amber-400 font-medium">15% off</span> your first order.
          </p>

          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-6 max-w-md mx-auto">
              <Gift className="w-8 h-8 mx-auto mb-3" />
              <p className="font-medium text-lg">You&apos;re on the list!</p>
              <p className="text-sm text-green-400/60 mt-2">Check your inbox for your 15% off code.</p>
            </div>
          ) : showLoginPrompt ? (
            <div className="space-y-4">
              <p className="text-white/50 text-sm mb-4">
                Sign in to subscribe to our newsletter and get exclusive offers.
              </p>
              <Button
                onClick={openLoginModal}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 transition-colors flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-4 h-4" />
                SIGN IN TO SUBSCRIBE
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
              {error && (
                <div className="mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-0 bg-zinc-900 border border-white/10 overflow-hidden">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={user?.email || "Enter your email address"}
                  className="flex-1 bg-transparent px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:bg-zinc-800 transition-colors text-base min-w-0 border-b sm:border-b-0 sm:border-r border-white/10"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-4 transition-colors flex items-center justify-center gap-2 text-base whitespace-nowrap disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      SUBSCRIBE
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="text-white/40 text-xs mt-6">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Exclusive drops</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Early access</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Member-only sales</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
