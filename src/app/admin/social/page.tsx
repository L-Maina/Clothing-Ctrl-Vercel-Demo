'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music2,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Save,
  Globe,
} from 'lucide-react';

interface SocialHandle {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  isActive: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  tiktok: <Music2 className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  website: <Globe className="w-5 h-5" />,
};

const platformColors: Record<string, string> = {
  instagram: 'from-purple-500 via-pink-500 to-orange-500',
  tiktok: 'from-black to-zinc-800',
  twitter: 'from-blue-400 to-blue-500',
  facebook: 'from-blue-600 to-blue-700',
  youtube: 'from-red-500 to-red-600',
  website: 'from-zinc-500 to-zinc-600',
};

const availablePlatforms = ['instagram', 'tiktok', 'twitter', 'facebook', 'youtube', 'website'];

export default function AdminSocial() {
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlatform, setEditingPlatform] = useState<SocialHandle | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    handle: '',
    url: '',
  });

  useEffect(() => {
    const fetchSocialHandles = async () => {
      try {
        const response = await fetch('/api/admin/social');
        const data = await response.json();
        setSocialHandles(data.handles || []);
      } catch (error) {
        console.error('Failed to fetch social handles:', error);
        // Demo data
        setSocialHandles([
          {
            id: '1',
            platform: 'instagram',
            handle: '@clothingctrl',
            url: 'https://instagram.com/clothingctrl',
            isActive: true,
          },
          {
            id: '2',
            platform: 'tiktok',
            handle: '@clothingctrl',
            url: 'https://tiktok.com/@clothingctrl',
            isActive: true,
          },
          {
            id: '3',
            platform: 'twitter',
            handle: '@clothingctrl',
            url: 'https://twitter.com/clothingctrl',
            isActive: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSocialHandles();
  }, []);

  const handleSave = async () => {
    if (!formData.platform || !formData.handle) return;

    try {
      const url = formData.url || getPlatformUrl(formData.platform, formData.handle);
      
      if (editingPlatform) {
        // Update existing
        const response = await fetch(`/api/admin/social/${editingPlatform.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handle: formData.handle,
            url,
          }),
        });
        
        if (response.ok) {
          setSocialHandles(socialHandles.map(h => 
            h.id === editingPlatform.id 
              ? { ...h, handle: formData.handle, url }
              : h
          ));
        }
      } else {
        // Create new
        const response = await fetch('/api/admin/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: formData.platform,
            handle: formData.handle,
            url,
          }),
        });
        
        if (response.ok) {
          const newHandle = await response.json();
          setSocialHandles([...socialHandles, newHandle]);
        }
      }
      
      setEditingPlatform(null);
      setIsAddDialogOpen(false);
      setFormData({ platform: '', handle: '', url: '' });
    } catch (error) {
      console.error('Failed to save social handle:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/social/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      
      setSocialHandles(socialHandles.map(h => 
        h.id === id ? { ...h, isActive: !isActive } : h
      ));
    } catch (error) {
      console.error('Failed to toggle social handle:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social handle?')) return;
    
    try {
      await fetch(`/api/admin/social/${id}`, { method: 'DELETE' });
      setSocialHandles(socialHandles.filter(h => h.id !== id));
    } catch (error) {
      console.error('Failed to delete social handle:', error);
    }
  };

  const getPlatformUrl = (platform: string, handle: string) => {
    const cleanHandle = handle.replace('@', '');
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${cleanHandle}`;
      case 'tiktok':
        return `https://tiktok.com/@${cleanHandle}`;
      case 'twitter':
        return `https://twitter.com/${cleanHandle}`;
      case 'facebook':
        return `https://facebook.com/${cleanHandle}`;
      case 'youtube':
        return `https://youtube.com/@${cleanHandle}`;
      default:
        return '';
    }
  };

  const openEditDialog = (handle: SocialHandle) => {
    setEditingPlatform(handle);
    setFormData({
      platform: handle.platform,
      handle: handle.handle,
      url: handle.url || '',
    });
    setIsAddDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingPlatform(null);
    setFormData({ platform: '', handle: '', url: '' });
    setIsAddDialogOpen(true);
  };

  const usedPlatforms = socialHandles.map(h => h.platform);
  const availableToAdd = availablePlatforms.filter(p => !usedPlatforms.includes(p));

  return (
    <AdminLayout title="Social Handles">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Social Media Handles</h2>
          <p className="text-white/40">Manage your store&apos;s social media links</p>
        </div>
        <Button 
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
          onClick={openAddDialog}
          disabled={availableToAdd.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {/* Social Handles Grid */}
      {loading ? (
        <div className="p-8 text-center text-white/40">Loading social handles...</div>
      ) : socialHandles.length === 0 ? (
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-8 text-center">
            <p className="text-white/40 mb-4">No social handles added yet</p>
            <Button 
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
              onClick={openAddDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Platform
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialHandles.map((handle) => (
            <Card key={handle.id} className="bg-zinc-900 border-white/10 overflow-hidden">
              {/* Platform Header */}
              <div className={`bg-gradient-to-r ${platformColors[handle.platform] || 'from-zinc-600 to-zinc-700'} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      {platformIcons[handle.platform]}
                    </div>
                    <div>
                      <p className="text-white font-bold capitalize">{handle.platform}</p>
                      <p className="text-white/80 text-sm">{handle.handle}</p>
                    </div>
                  </div>
                  {!handle.isActive && (
                    <Badge className="bg-white/20 text-white">Inactive</Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                {handle.url && (
                  <a 
                    href={handle.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/60 hover:text-amber-400 text-sm mb-4 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {handle.url}
                  </a>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                    onClick={() => openEditDialog(handle)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 border-white/10 ${handle.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-white/40 hover:bg-white/5'}`}
                    onClick={() => handleToggleActive(handle.id, handle.isActive)}
                  >
                    {handle.isActive ? 'Active' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(handle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlatform ? 'Edit' : 'Add'} Social Handle</DialogTitle>
            <DialogDescription className="text-white/40">
              {editingPlatform ? 'Update your social media link' : 'Add a new social media platform'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Platform</label>
              {editingPlatform ? (
                <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                  {platformIcons[editingPlatform.platform]}
                  <span className="text-white capitalize">{editingPlatform.platform}</span>
                </div>
              ) : (
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="">Select a platform</option>
                  {availableToAdd.map((platform) => (
                    <option key={platform} value={platform} className="capitalize">
                      {platform}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Handle / Username</label>
              <Input
                placeholder="@username"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">URL (optional)</label>
              <Input
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
              />
              <p className="text-white/40 text-xs mt-1">
                Auto-generated from handle if left empty
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold"
                onClick={handleSave}
                disabled={!formData.handle}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
