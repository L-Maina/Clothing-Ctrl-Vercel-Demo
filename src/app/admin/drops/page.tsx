'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface Drop {
  id: string;
  name: string;
  description: string | null;
  date: string;
  image: string | null;
  active: boolean;
  createdAt: string;
}

interface DropFormData {
  name: string;
  description: string;
  date: string;
  time: string;
  image: string;
  active: boolean;
}

const defaultFormData: DropFormData = {
  name: '',
  description: '',
  date: '',
  time: '12:00',
  image: '',
  active: true,
};

export default function AdminDropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);
  const [deletingDrop, setDeletingDrop] = useState<Drop | null>(null);
  const [formData, setFormData] = useState<DropFormData>(defaultFormData);

  useEffect(() => {
    fetchDrops();
  }, []);

  const fetchDrops = async () => {
    try {
      const response = await fetch('/api/admin/drops');
      const data = await response.json();
      setDrops(data.drops || []);
    } catch (error) {
      console.error('Failed to fetch drops:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingDrop(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (drop: Drop) => {
    setEditingDrop(drop);
    const dropDate = new Date(drop.date);
    setFormData({
      name: drop.name,
      description: drop.description || '',
      date: dropDate.toISOString().split('T')[0],
      time: dropDate.toTimeString().slice(0, 5),
      image: drop.image || '',
      active: drop.active,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (drop: Drop) => {
    setDeletingDrop(drop);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.date) return;

    setSaving(true);
    try {
      const dropDateTime = new Date(`${formData.date}T${formData.time}`);

      if (editingDrop) {
        // Update existing drop
        const response = await fetch(`/api/admin/drops/${editingDrop.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            date: dropDateTime.toISOString(),
            image: formData.image,
            active: formData.active,
          }),
        });

        if (response.ok) {
          fetchDrops();
          setDialogOpen(false);
        }
      } else {
        // Create new drop
        const response = await fetch('/api/admin/drops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            date: dropDateTime.toISOString(),
            image: formData.image,
            active: formData.active,
          }),
        });

        if (response.ok) {
          fetchDrops();
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Failed to save drop:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDrop) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/drops/${deletingDrop.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDrops();
        setDeleteDialogOpen(false);
        setDeletingDrop(null);
      }
    } catch (error) {
      console.error('Failed to delete drop:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (drop: Drop) => {
    // Optimistically update UI
    const wasActive = drop.active;
    setDrops(drops.map(d => {
      if (d.id === drop.id) {
        return { ...d, active: !d.active };
      }
      // Deactivate other drops if this one is being activated
      if (!wasActive) {
        return { ...d, active: false };
      }
      return d;
    }));

    try {
      const response = await fetch(`/api/admin/drops/${drop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: drop.name,
          description: drop.description,
          date: drop.date,
          image: drop.image,
          active: !wasActive,
        }),
      });

      if (!response.ok) {
        // Revert on error
        fetchDrops();
      }
    } catch (error) {
      console.error('Failed to toggle drop:', error);
      // Revert on error
      fetchDrops();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCountdown = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'Past';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <AdminLayout title="Exclusive Drops">
        <div className="p-8 text-center text-white/40">Loading drops...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Exclusive Drops">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Exclusive Drops</h2>
          <p className="text-white/40">Manage countdown timers for upcoming releases</p>
        </div>
        <Button
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
          onClick={openCreateDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Drop
        </Button>
      </div>

      {/* Active Drop Alert */}
      {drops.filter(d => d.active).length === 0 && drops.length > 0 && (
        <Card className="bg-yellow-900/20 border-yellow-500/30 mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-yellow-200">
              No active drop. Activate a drop to show the countdown on your website.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Drops Grid */}
      {drops.length === 0 ? (
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No drops yet</h3>
            <p className="text-white/40 mb-6">
              Create your first exclusive drop to show a countdown timer on your website.
            </p>
            <Button
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
              onClick={openCreateDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Drop
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <Card
              key={drop.id}
              className={`bg-zinc-900 border-white/10 overflow-hidden ${
                drop.active ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              {/* Drop Image */}
              {drop.image && (
                <div className="h-40 bg-zinc-800 overflow-hidden">
                  <img
                    src={drop.image}
                    alt={drop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {drop.active && <Sparkles className="w-4 h-4 text-amber-400" />}
                      {drop.name}
                    </CardTitle>
                    <CardDescription className="text-white/40 mt-1">
                      {drop.description}
                    </CardDescription>
                  </div>
                  {drop.active && (
                    <Badge className="bg-amber-400 text-black">Active</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Countdown */}
                <div className="bg-zinc-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Countdown</span>
                    <span className="text-amber-400 font-bold">
                      {getCountdown(drop.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(drop.date)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(drop)}
                      className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(drop)}
                      className="border-white/10 text-white/60 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">Active</span>
                    <Switch
                      checked={drop.active}
                      onCheckedChange={() => toggleActive(drop)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDrop ? 'Edit Drop' : 'Create New Drop'}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Set up an exclusive drop with a countdown timer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/60">Drop Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Collection 2025"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>

            <div>
              <Label className="text-white/60">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Limited edition items dropping soon..."
                rows={2}
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
              <div>
                <Label className="text-white/60">Time</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <Label className="text-white/60">Image URL (optional)</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white/60">Active</Label>
                <p className="text-white/40 text-sm">Only one drop can be active at a time</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.date || saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editingDrop ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Drop</DialogTitle>
            <DialogDescription className="text-white/40">
              Are you sure you want to delete "{deletingDrop?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-500 text-white"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
