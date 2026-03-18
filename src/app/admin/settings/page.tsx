'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  Megaphone,
  Save,
  Loader2,
  CheckCircle,
  Truck,
  Award,
  Medal,
  Crown,
  Download,
  Upload,
  Database,
  AlertTriangle,
  FileJson,
} from 'lucide-react';
import { broadcastSettingsUpdate } from '@/hooks/useRealtime';

interface StoreSettings {
  id: string;
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
  shippingNairobi: number;
  shippingKenya: number;
  shippingInternational: number;
  shippingFreeThreshold: number | null;
  loyaltyPointsPerShilling: number;
  loyaltyBronzeThreshold: number;
  loyaltySilverThreshold: number;
  loyaltyGoldThreshold: number;
  loyaltyPlatinumThreshold: number;
}

const defaultSettings: StoreSettings = {
  id: '',
  storeName: 'Clothing Ctrl',
  storeDescription: 'Your one-stop fashion destination in Nairobi.',
  storeEmail: 'info@clothingctrl.com',
  storePhone: '+254 700 000 000',
  addressLine1: 'Cargen House, Harambee Ave',
  addressLine2: '3rd Floor, Room 310',
  city: 'Nairobi',
  country: 'Kenya',
  openHour: '12:00',
  closeHour: '18:00',
  openDays: 'Mon - Sat',
  bannerEnabled: false,
  bannerText: '',
  bannerLink: '',
  metaTitle: 'Clothing Ctrl | Nairobi Fashion Store',
  metaDescription: 'Your one-stop fashion destination in Nairobi, Kenya.',
  shippingNairobi: 200,
  shippingKenya: 500,
  shippingInternational: 2000,
  shippingFreeThreshold: 5000,
  loyaltyPointsPerShilling: 0.01,
  loyaltyBronzeThreshold: 0,
  loyaltySilverThreshold: 200,
  loyaltyGoldThreshold: 500,
  loyaltyPlatinumThreshold: 1000,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.settings) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save settings (${response.status})`);
      }
      
      const data = await response.json();
      setSettings({ ...defaultSettings, ...data.settings });
      
      // Broadcast the update to all open tabs (customer site, etc.)
      try {
        broadcastSettingsUpdate({
          storeName: data.settings.storeName,
          storeDescription: data.settings.storeDescription,
          storeEmail: data.settings.storeEmail,
          storePhone: data.settings.storePhone,
          addressLine1: data.settings.addressLine1,
          addressLine2: data.settings.addressLine2,
          city: data.settings.city,
          country: data.settings.country,
          openHour: data.settings.openHour,
          closeHour: data.settings.closeHour,
          openDays: data.settings.openDays,
          bannerEnabled: data.settings.bannerEnabled,
          bannerText: data.settings.bannerText,
          bannerLink: data.settings.bannerLink,
        });
      } catch {
        // BroadcastChannel might not be supported, ignore
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof StoreSettings, value: string | boolean | number | null) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await fetch('/api/admin/backup');
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      // Get the blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clothingctrl-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      // Confirm before restoring
      if (!confirm('This will overwrite your current data. Are you sure you want to restore from this backup?')) {
        setRestoring(false);
        return;
      }

      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: backup.data, overwrite: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore backup');
      }

      const result = await response.json();
      alert(`Backup restored successfully!\n\nCategories: ${result.results?.categories || 0}\nProducts: ${result.results?.products || 0}`);
      window.location.reload();
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore backup. Make sure the file is a valid ClothingCtrl backup.');
    } finally {
      setRestoring(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="p-8 text-center text-white/40">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Store Settings</h2>
          <p className="text-white/40">Manage your store information and preferences</p>
        </div>
        <Button 
          className={saved ? "bg-green-500 hover:bg-green-500 text-black font-bold" : "bg-amber-400 hover:bg-amber-300 text-black font-bold"}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-white">Store Information</CardTitle>
                <CardDescription className="text-white/40">
                  Basic information about your store
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Store Name</Label>
              <Input
                value={settings.storeName}
                onChange={(e) => updateSetting('storeName', e.target.value)}
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <Label className="text-white/60">Store Description</Label>
              <Textarea
                value={settings.storeDescription || ''}
                onChange={(e) => updateSetting('storeDescription', e.target.value)}
                rows={3}
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Contact Information</CardTitle>
                <CardDescription className="text-white/40">
                  How customers can reach you
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Email Address</Label>
              <Input
                type="email"
                value={settings.storeEmail || ''}
                onChange={(e) => updateSetting('storeEmail', e.target.value)}
                placeholder="info@clothingctrl.com"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <Label className="text-white/60">Phone Number</Label>
              <Input
                type="tel"
                value={settings.storePhone || ''}
                onChange={(e) => updateSetting('storePhone', e.target.value)}
                placeholder="+254 700 000 000"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Location */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-400/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">Store Location</CardTitle>
                <CardDescription className="text-white/40">
                  Physical store address
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Address Line 1</Label>
              <Input
                value={settings.addressLine1 || ''}
                onChange={(e) => updateSetting('addressLine1', e.target.value)}
                placeholder="Building name, Street"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <Label className="text-white/60">Address Line 2</Label>
              <Input
                value={settings.addressLine2 || ''}
                onChange={(e) => updateSetting('addressLine2', e.target.value)}
                placeholder="Floor, Room number"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">City</Label>
                <Input
                  value={settings.city || ''}
                  onChange={(e) => updateSetting('city', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
              <div>
                <Label className="text-white/60">Country</Label>
                <Input
                  value={settings.country || ''}
                  onChange={(e) => updateSetting('country', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Hours */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-400/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white">Store Hours</CardTitle>
                <CardDescription className="text-white/40">
                  When your store is open
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Open Days</Label>
              <Input
                value={settings.openDays || ''}
                onChange={(e) => updateSetting('openDays', e.target.value)}
                placeholder="Mon - Sat"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Opening Time</Label>
                <Input
                  type="time"
                  value={settings.openHour || '12:00'}
                  onChange={(e) => updateSetting('openHour', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
              <div>
                <Label className="text-white/60">Closing Time</Label>
                <Input
                  type="time"
                  value={settings.closeHour || '18:00'}
                  onChange={(e) => updateSetting('closeHour', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcement Banner */}
        <Card className="bg-zinc-900 border-white/10 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-400/10 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Announcement Banner</CardTitle>
                  <CardDescription className="text-white/40">
                    Show a promotional banner at the top of your website
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-white/60 text-sm">Enable</Label>
                <Switch
                  checked={settings.bannerEnabled}
                  onCheckedChange={(checked) => updateSetting('bannerEnabled', checked)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Banner Text</Label>
                <Input
                  value={settings.bannerText || ''}
                  onChange={(e) => updateSetting('bannerText', e.target.value)}
                  placeholder="🔥 Free shipping on orders over KES 5,000!"
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  disabled={!settings.bannerEnabled}
                />
              </div>
              <div>
                <Label className="text-white/60">Banner Link (optional)</Label>
                <Input
                  value={settings.bannerLink || ''}
                  onChange={(e) => updateSetting('bannerLink', e.target.value)}
                  placeholder="/shop or https://..."
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  disabled={!settings.bannerEnabled}
                />
              </div>
            </div>
            
            {/* Preview */}
            {settings.bannerEnabled && settings.bannerText && (
              <div className="mt-4">
                <Label className="text-white/60 text-sm mb-2 block">Preview</Label>
                <div className="bg-amber-400 text-black text-center py-2 px-4 text-sm font-medium rounded">
                  {settings.bannerText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-white">Shipping Zones</CardTitle>
                <CardDescription className="text-white/40">
                  Set shipping costs for different delivery areas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <Label className="text-white font-medium">Within Nairobi</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">KES</span>
                  <Input
                    type="number"
                    value={settings.shippingNairobi}
                    onChange={(e) => updateSetting('shippingNairobi', parseFloat(e.target.value) || 0)}
                    placeholder="200"
                    className="bg-zinc-700 border-white/10 text-white focus:border-amber-400 w-32"
                  />
                </div>
                <p className="text-white/30 text-xs mt-2">Deliveries within Nairobi County</p>
              </div>

              <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  <Label className="text-white font-medium">Other Areas in Kenya</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">KES</span>
                  <Input
                    type="number"
                    value={settings.shippingKenya}
                    onChange={(e) => updateSetting('shippingKenya', parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    className="bg-zinc-700 border-white/10 text-white focus:border-amber-400 w-32"
                  />
                </div>
                <p className="text-white/30 text-xs mt-2">Mombasa, Kisumu, Nakuru, and other Kenyan towns</p>
              </div>

              <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <Label className="text-white font-medium">International</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">KES</span>
                  <Input
                    type="number"
                    value={settings.shippingInternational}
                    onChange={(e) => updateSetting('shippingInternational', parseFloat(e.target.value) || 0)}
                    placeholder="2000"
                    className="bg-zinc-700 border-white/10 text-white focus:border-amber-400 w-32"
                  />
                </div>
                <p className="text-white/30 text-xs mt-2">Deliveries outside Kenya (Uganda, Tanzania, etc.)</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <Label className="text-white/60">Free Shipping Threshold (KES)</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-white/40 text-sm">KES</span>
                <Input
                  type="number"
                  value={settings.shippingFreeThreshold || ''}
                  onChange={(e) => updateSetting('shippingFreeThreshold', parseFloat(e.target.value) || null)}
                  placeholder="5000"
                  className="bg-zinc-800 border-white/10 text-white focus:border-amber-400 flex-1"
                />
              </div>
              <p className="text-white/40 text-xs mt-1">Orders above this amount get free shipping. Leave empty to disable.</p>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Points Settings */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-white">Loyalty Points</CardTitle>
                <CardDescription className="text-white/40">
                  Configure how customers earn and tier up
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Points per KES 100 spent</Label>
              <Input
                type="number"
                step="0.01"
                value={settings.loyaltyPointsPerShilling * 100}
                onChange={(e) => updateSetting('loyaltyPointsPerShilling', (parseFloat(e.target.value) || 1) / 100)}
                placeholder="1"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
              <p className="text-white/40 text-xs mt-1">E.g., 1 point per KES 100 = 0.01 points per shilling</p>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <Label className="text-white/60 mb-3 block">Tier Thresholds (Points Required)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Medal className="w-4 h-4 text-amber-700" />
                    <span className="text-white/60 text-sm">Bronze</span>
                  </div>
                  <Input
                    type="number"
                    value={settings.loyaltyBronzeThreshold}
                    onChange={(e) => updateSetting('loyaltyBronzeThreshold', parseInt(e.target.value) || 0)}
                    className="bg-zinc-800 border-white/10 text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-white/60 text-sm">Silver</span>
                  </div>
                  <Input
                    type="number"
                    value={settings.loyaltySilverThreshold}
                    onChange={(e) => updateSetting('loyaltySilverThreshold', parseInt(e.target.value) || 0)}
                    className="bg-zinc-800 border-white/10 text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-white/60 text-sm">Gold</span>
                  </div>
                  <Input
                    type="number"
                    value={settings.loyaltyGoldThreshold}
                    onChange={(e) => updateSetting('loyaltyGoldThreshold', parseInt(e.target.value) || 0)}
                    className="bg-zinc-800 border-white/10 text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-white/60 text-sm">Platinum</span>
                  </div>
                  <Input
                    type="number"
                    value={settings.loyaltyPlatinumThreshold}
                    onChange={(e) => updateSetting('loyaltyPlatinumThreshold', parseInt(e.target.value) || 0)}
                    className="bg-zinc-800 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup & Export Section */}
      <div className="mt-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400/10 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-white">Backup & Export</CardTitle>
                <CardDescription className="text-white/40">
                  Export your store data or restore from a backup
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export/Backup */}
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="w-5 h-5 text-amber-400" />
                  <h3 className="text-white font-medium">Create Backup</h3>
                </div>
                <p className="text-white/40 text-sm mb-4">
                  Download a complete backup of your store data including products, orders, customers, and settings.
                </p>
                <Button
                  onClick={handleBackup}
                  disabled={backingUp}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {backingUp ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileJson className="w-4 h-4 mr-2" />
                  )}
                  {backingUp ? 'Creating Backup...' : 'Download Backup'}
                </Button>
              </div>

              {/* Restore */}
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <Upload className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-medium">Restore from Backup</h3>
                </div>
                <p className="text-white/40 text-sm mb-4">
                  Restore your store from a previously created backup file. This will overwrite current data.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                    id="backup-restore"
                    disabled={restoring}
                  />
                  <Button
                    variant="outline"
                    className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
                    disabled={restoring}
                    onClick={() => document.getElementById('backup-restore')?.click()}
                  >
                    {restoring ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {restoring ? 'Restoring...' : 'Select Backup File'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Important</p>
                  <p className="text-white/40 text-xs mt-1">
                    Backups contain sensitive data. Store them securely. Restoring a backup will overwrite current data and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
