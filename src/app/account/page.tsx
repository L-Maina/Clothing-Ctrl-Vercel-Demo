'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
  Award,
  Sparkles,
  ArrowLeft,
  Medal,
  ShoppingBag,
  MapPin,
  Bell,
  Shield,
  Save,
  Loader2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Tier colors and info
const tierInfo = {
  BRONZE: {
    color: 'from-amber-700 to-amber-900',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-700/30',
    nextTier: 'SILVER',
    pointsNeeded: 200,
    icon: Medal,
  },
  SILVER: {
    color: 'from-gray-400 to-gray-600',
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    nextTier: 'GOLD',
    pointsNeeded: 500,
    icon: Award,
  },
  GOLD: {
    color: 'from-yellow-500 to-yellow-700',
    textColor: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    nextTier: 'PLATINUM',
    pointsNeeded: 1000,
    icon: Crown,
  },
  PLATINUM: {
    color: 'from-purple-400 to-purple-700',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    nextTier: null,
    pointsNeeded: null,
    icon: Sparkles,
  },
};

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyTier: string;
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { isLoggedIn, user, logout, fetchCurrentUser, updateProfile } = useAuthStore();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    } else {
      fetchCurrentUser();
    }
  }, [isLoggedIn, router, fetchCurrentUser]);

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.email) return;

      try {
        const res = await fetch(`/api/customer/stats?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.email]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  if (!isLoggedIn || !user) {
    return null;
  }

  const currentTier = stats?.loyaltyTier || user.loyaltyTier || 'BRONZE';
  const currentPoints = stats?.loyaltyPoints || user.loyaltyPoints || 0;

  const tier = tierInfo[currentTier as keyof typeof tierInfo] || tierInfo.BRONZE;
  const TierIcon = tier.icon;
  const progressPercent = tier.nextTier
    ? Math.min((currentPoints / tier.pointsNeeded!) * 100, 100)
    : 100;
  const pointsToNext = tier.nextTier
    ? Math.max(tier.pointsNeeded! - currentPoints, 0)
    : 0;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/auth/customer/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
        fetchCurrentUser();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/auth/customer/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully.',
        });
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black text-white">MY ACCOUNT</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/account?tab=${tab.id}`}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-amber-400 text-black"
                  : "bg-zinc-900 border border-white/10 text-white/60 hover:text-white hover:border-amber-400/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-white/10 p-6"
              >
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mb-4">
                    <span className="text-black text-2xl font-black">
                      {(user.name || user.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {user.name || 'Customer'}
                  </h2>
                  <div className={cn("flex items-center gap-1 mt-1", tier.textColor)}>
                    <TierIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentTier} Member</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3 text-white/60">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-white/60">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Logout */}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full mt-6 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Loyalty Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "bg-gradient-to-br border p-6",
                  tier.color,
                  tier.borderColor
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TierIcon className="w-5 h-5 text-white" />
                      <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
                        {currentTier} Tier
                      </span>
                    </div>
                    <p className="text-white text-3xl font-black">
                      {currentPoints.toLocaleString()} Points
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      ≈ KES {(currentPoints * 1).toLocaleString()} value
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-xs">Points Value</p>
                    <p className="text-white font-bold text-lg">KES {(currentPoints * 1).toLocaleString()}</p>
                    <p className="text-white/40 text-xs">1 point = KES 1</p>
                  </div>
                </div>

                {/* Progress to next tier */}
                {tier.nextTier && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">{pointsToNext} points to {tier.nextTier}</span>
                      <span className="text-white/80">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full bg-white/80 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white p-6 border-b border-white/10">
                  Quick Links
                </h3>
                <div className="divide-y divide-white/10">
                  <Link
                    href="/account?tab=orders"
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">My Orders</p>
                      <p className="text-white/50 text-sm">Track and view your order history</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </Link>
                  <Link
                    href="/account?tab=settings"
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Account Settings</p>
                      <p className="text-white/50 text-sm">Update your profile and preferences</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </Link>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-zinc-900 border border-white/10 p-6 text-center">
                  <ShoppingBag className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {loadingStats ? '...' : (stats?.totalOrders || 0)}
                  </p>
                  <p className="text-white/50 text-sm">Total Orders</p>
                </div>
                <div className="bg-zinc-900 border border-white/10 p-6 text-center">
                  <Heart className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-white/50 text-sm">Wishlist Items</p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Settings */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/60">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <Label className="text-white/60">Email Address</Label>
                  <Input
                    value={formData.email}
                    disabled
                    className="mt-1.5 bg-zinc-800 border-white/10 text-white/50"
                  />
                  <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label className="text-white/60">Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254 7XX XXX XXX"
                    className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/60">Current Password</Label>
                  <Input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <Label className="text-white/60">New Password</Label>
                  <Input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <Label className="text-white/60">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={saving || !formData.currentPassword || !formData.newPassword}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-white/40 text-sm">Order updates and promotions</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-amber-400/50 text-amber-400">
                      <Check className="w-4 h-4 mr-1" />
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-white/40 text-sm">Order delivery updates</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/10 text-white/40">
                      Disabled
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab - Redirect to orders page */}
        {activeTab === 'orders' && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-white/40 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">View Your Orders</h2>
            <p className="text-white/60 mb-6">
              Track your orders and view your purchase history
            </p>
            <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black">
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountPageFallback() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-white/60">Loading account...</p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageFallback />}>
      <AccountPageContent />
    </Suspense>
  );
}
