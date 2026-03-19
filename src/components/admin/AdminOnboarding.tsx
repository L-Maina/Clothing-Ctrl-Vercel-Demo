'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Shield, Check, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdminAuth, OnboardingStep } from '@/lib/admin-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OnboardingModalProps {
  onComplete?: () => void;
}

export function AdminOnboarding({ onComplete }: OnboardingModalProps) {
  const { adminUser, onboardingStep, setOnboardingStep, updateAdminUser, logout } = useAdminAuth();
  
  // Password step state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Email step state
  const [notificationEmail, setNotificationEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSettingEmail, setIsSettingEmail] = useState(false);
  
  // Verify step state
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [displayedCode, setDisplayedCode] = useState<string | null>(null);
  
  // If no onboarding needed, don't render
  // ONBOARDING PAUSED - Always return null
  return null;
  
  /* Original logic - paused
  if (!onboardingStep || onboardingStep === 'complete' || !adminUser) {
    return null;
  }
  */
  
  const handlePasswordChange = async () => {
    setPasswordError('');
    
    // Validation
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain an uppercase letter');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Password must contain a lowercase letter');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain a number');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser.id,
          newPassword,
          confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setPasswordError(data.error || 'Failed to change password');
        return;
      }
      
      // Update local state
      updateAdminUser({ isTemporaryPassword: false });
      
      // Move to next step
      if (!adminUser.notificationEmail) {
        setOnboardingStep('email');
      } else if (!adminUser.emailVerified) {
        setOnboardingStep('verify');
      } else {
        setOnboardingStep('complete');
        onComplete?.();
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleEmailSubmit = async () => {
    setEmailError('');
    
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsSettingEmail(true);
    
    try {
      const response = await fetch('/api/admin/auth/set-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser.id,
          notificationEmail,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setEmailError(data.error || 'Failed to set email');
        return;
      }
      
      // Update local state
      updateAdminUser({ notificationEmail });
      
      // Store the verification code to display (for development/testing)
      if (data.verificationCode) {
        setDisplayedCode(data.verificationCode);
      }
      
      // Move to verification step
      setOnboardingStep('verify');
    } catch (error) {
      setEmailError('An error occurred. Please try again.');
    } finally {
      setIsSettingEmail(false);
    }
  };
  
  const handleVerifyCode = async () => {
    setVerifyError('');
    
    if (!/^\d{6}$/.test(verificationCode)) {
      setVerifyError('Please enter a 6-digit code');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/admin/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser.id,
          code: verificationCode,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setVerifyError(data.error || 'Verification failed');
        return;
      }
      
      // Update local state
      updateAdminUser({ emailVerified: true, onboardingComplete: true });
      
      // Complete onboarding
      setOnboardingStep('complete');
      onComplete?.();
    } catch (error) {
      setVerifyError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleSkipEmail = () => {
    // Allow skipping email setup for now
    setOnboardingStep('complete');
    onComplete?.();
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-amber-400 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-black font-bold">Admin Setup</h2>
                <p className="text-black/60 text-sm">Complete your account setup</p>
              </div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex border-b border-white/10">
            <div className={cn(
              "flex-1 py-3 text-center text-xs font-medium transition-colors",
              onboardingStep === 'password' ? "text-amber-400 border-b-2 border-amber-400" : 
              ['email', 'verify', 'complete'].includes(onboardingStep) ? "text-green-400" : "text-white/40"
            )}>
              {onboardingStep !== 'password' ? <Check className="w-4 h-4 inline mr-1" /> : null}
              Password
            </div>
            <div className={cn(
              "flex-1 py-3 text-center text-xs font-medium transition-colors",
              onboardingStep === 'email' ? "text-amber-400 border-b-2 border-amber-400" : 
              ['verify', 'complete'].includes(onboardingStep) ? "text-green-400" : "text-white/40"
            )}>
              {['verify', 'complete'].includes(onboardingStep) ? <Check className="w-4 h-4 inline mr-1" /> : null}
              Email
            </div>
            <div className={cn(
              "flex-1 py-3 text-center text-xs font-medium transition-colors",
              onboardingStep === 'verify' ? "text-amber-400 border-b-2 border-amber-400" : 
              onboardingStep === 'complete' ? "text-green-400" : "text-white/40"
            )}>
              {onboardingStep === 'complete' ? <Check className="w-4 h-4 inline mr-1" /> : null}
              Verify
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Password Step */}
            {onboardingStep === 'password' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">
                    You're using a temporary password. Please create a new secure password.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="bg-zinc-800 border-white/10 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-zinc-800 border-white/10 text-white"
                  />
                </div>
                
                {passwordError && (
                  <p className="text-red-400 text-sm">{passwordError}</p>
                )}
                
                <div className="text-xs text-white/40 space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li className={newPassword.length >= 8 ? 'text-green-400' : ''}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-400' : ''}>One uppercase letter</li>
                    <li className={/[a-z]/.test(newPassword) ? 'text-green-400' : ''}>One lowercase letter</li>
                    <li className={/[0-9]/.test(newPassword) ? 'text-green-400' : ''}>One number</li>
                  </ul>
                </div>
                
                <Button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
            
            {/* Email Step */}
            {onboardingStep === 'email' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Mail className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white">Notification Email</h3>
                  <p className="text-white/60 text-sm">
                    Where should we send order notifications and alerts?
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-zinc-800 border-white/10 text-white"
                  />
                </div>
                
                {emailError && (
                  <p className="text-red-400 text-sm">{emailError}</p>
                )}
                
                <Button
                  onClick={handleEmailSubmit}
                  disabled={isSettingEmail || !notificationEmail}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {isSettingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <button
                  onClick={handleSkipEmail}
                  className="w-full text-white/40 text-sm hover:text-white/60 transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            )}
            
            {/* Verify Step */}
            {onboardingStep === 'verify' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white">Verify Your Email</h3>
                  <p className="text-white/60 text-sm">
                    Enter the 6-digit code sent to<br />
                    <span className="text-amber-400">{adminUser.notificationEmail}</span>
                  </p>
                </div>
                
                {/* Show verification code in development/testing environment */}
                {displayedCode && (
                  <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-3 text-center">
                    <p className="text-amber-400 text-xs mb-1">Your verification code:</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-wider">{displayedCode}</p>
                  </div>
                )}
                
                <div>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="bg-zinc-800 border-white/10 text-white text-center text-2xl tracking-[1em] font-mono"
                    maxLength={6}
                  />
                </div>
                
                {verifyError && (
                  <p className="text-red-400 text-sm text-center">{verifyError}</p>
                )}
                
                <Button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <button
                  onClick={handleSkipEmail}
                  className="w-full text-white/40 text-sm hover:text-white/60 transition-colors"
                >
                  Skip verification
                </button>
              </motion.div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-zinc-950">
            <button
              onClick={logout}
              className="w-full text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              Cancel and logout
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
