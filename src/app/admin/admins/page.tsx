'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Mail,
  Clock,
  Check,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
    const response = await fetch('/api/admin/admins');
    const data = await response.json();
    setAdmins(data.admins || []);
  } catch (error) {
    console.error('Failed to fetch admins:', error);
  } finally {
    setLoading(false);
  }
  };

  const openCreateDialog = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
    });
    setShowDialog(true);
  };

  const openEditDialog = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: 'Error', description: 'Name and email are required', variant: 'destructive' });
      return;
    }

    if (!editingAdmin && !formData.password) {
      toast({ title: 'Error', description: 'Password is required for new admins', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editingAdmin) {
        // Update existing admin
        const response = await fetch('/api/admin/admins', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAdmin.id,
            name: formData.name,
            role: formData.role,
            password: formData.password || undefined,
          }),
        });

        if (response.ok) {
          toast({ title: 'Success', description: 'Admin updated successfully' });
          fetchAdmins();
          setShowDialog(false);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update admin');
        }
      } else {
        // Create new admin
        const response = await fetch('/api/admin/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({ title: 'Success', description: 'Admin created successfully' });
          fetchAdmins();
          setShowDialog(false);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create admin');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save admin',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.name}?`)) return;

    try {
      const response = await fetch(`/api/admin/admins?id=${admin.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Admin deleted successfully' });
        fetchAdmins();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete admin');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete admin',
        variant: 'destructive',
      });
    }
  };

  const toggleAdminStatus = async (admin: Admin) => {
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: admin.id,
          isActive: !admin.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        fetchAdmins();
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Super Admin</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Admin</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout title="Admin Management">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Users</h2>
            <p className="text-white/40">Manage admin access and roles</p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {/* Admin List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map(i => (
              <Card key={i} className="bg-zinc-900 border-white/10 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-zinc-800 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : admins.length === 0 ? (
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/60">No admins found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {admins.map((admin, index) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "bg-zinc-900 border-white/10",
                    !admin.isActive && "opacity-50"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                          admin.role === 'SUPER_ADMIN'
                            ? "bg-amber-400 text-black"
                            : "bg-blue-500/20 text-blue-400"
                        )}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium">{admin.name}</h3>
                            {getRoleBadge(admin.role)}
                            {!admin.isActive && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/20">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {admin.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Created: {formatDate(admin.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(admin)}
                            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAdminStatus(admin)}
                            className={cn(
                              "border-white/10",
                              admin.isActive
                                ? "text-red-400 hover:bg-red-500/10"
                                : "text-green-400 hover:bg-green-500/10"
                            )}
                          >
                            {admin.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {admin.role !== 'SUPER_ADMIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(admin)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Role Info */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Role Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Super Admin</h4>
                  <p className="text-white/50 text-sm">Full access to all features. Can manage other admins.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Admin</h4>
                  <p className="text-white/50 text-sm">Standard admin access. Can manage products, orders, and customers.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
            <DialogDescription className="text-white/40">
              {editingAdmin ? 'Update admin details' : 'Create a new admin user'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/60">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Admin name"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
                disabled={!!editingAdmin}
                className="mt-1.5 bg-zinc-800 border-white/10 text-white disabled:opacity-50"
              />
            </div>

            {!editingAdmin && (
              <div>
                <Label className="text-white/60">Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create password"
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white"
                />
              </div>
            )}

            {editingAdmin && (
              <div>
                <Label className="text-white/60">New Password (leave blank to keep current)</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password to change"
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white"
                />
              </div>
            )}

            <div>
              <Label className="text-white/60">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="mt-1.5 bg-zinc-800 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1 border-white/10 text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                editingAdmin ? 'Update Admin' : 'Create Admin'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
