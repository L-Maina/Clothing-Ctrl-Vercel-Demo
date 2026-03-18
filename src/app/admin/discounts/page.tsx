'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
} from 'lucide-react';

interface Discount {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  appliesTo: string;
  createdAt: string;
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/admin/discounts');
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data.discounts);
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      minOrderAmount: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description || '',
      type: discount.type,
      value: discount.value.toString(),
      minOrderAmount: discount.minOrderAmount?.toString() || '',
      maxUses: discount.maxUses?.toString() || '',
      startDate: discount.startDate ? discount.startDate.split('T')[0] : '',
      endDate: discount.endDate ? discount.endDate.split('T')[0] : '',
      isActive: discount.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.value) {
      alert('Code and value are required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/discounts';
      const method = editingDiscount ? 'PUT' : 'POST';
      const body = editingDiscount 
        ? { ...formData, id: editingDiscount.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchDiscounts();
        setDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save discount');
      }
    } catch (error) {
      console.error('Failed to save discount:', error);
      alert('Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/discounts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDiscounts();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete discount:', error);
    }
  };

  const toggleActive = async (discount: Discount) => {
    try {
      await fetch('/api/admin/discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: discount.id,
          isActive: !discount.isActive,
        }),
      });
      fetchDiscounts();
    } catch (error) {
      console.error('Failed to update discount:', error);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (discount: Discount) => {
    if (!discount.endDate) return false;
    return new Date(discount.endDate) < new Date();
  };

  const isUpcoming = (discount: Discount) => {
    if (!discount.startDate) return false;
    return new Date(discount.startDate) > new Date();
  };

  const getStatusBadge = (discount: Discount) => {
    if (isExpired(discount)) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Expired</span>;
    }
    if (isUpcoming(discount)) {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Upcoming</span>;
    }
    if (!discount.isActive) {
      return <span className="px-2 py-1 bg-white/10 text-white/40 text-xs rounded-full">Inactive</span>;
    }
    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Used Up</span>;
    }
    return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <AdminLayout title="Discounts">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Discounts">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Discount Codes</h2>
          <p className="text-white/40">Create and manage promotional codes</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white/40 text-sm">Total Codes</p>
                <p className="text-white text-xl font-bold">{discounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-400/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/40 text-sm">Active</p>
                <p className="text-white text-xl font-bold">
                  {discounts.filter(d => d.isActive && !isExpired(d)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/40 text-sm">Percentage</p>
                <p className="text-white text-xl font-bold">
                  {discounts.filter(d => d.type === 'PERCENTAGE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-400/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/40 text-sm">Fixed Amount</p>
                <p className="text-white text-xl font-bold">
                  {discounts.filter(d => d.type === 'FIXED_AMOUNT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount List */}
      <div className="space-y-4">
        {discounts.map((discount) => (
          <Card key={discount.id} className="bg-zinc-900 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-lg font-bold bg-zinc-800 px-3 py-1 rounded">
                      {discount.code}
                    </span>
                    <button
                      onClick={() => copyCode(discount.code)}
                      className="p-1.5 hover:bg-zinc-800 rounded text-white/40 hover:text-white"
                    >
                      {copiedCode === discount.code ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div>
                    <p className="text-amber-400 font-bold">
                      {discount.type === 'PERCENTAGE' 
                        ? `${discount.value}% off` 
                        : `KES ${discount.value.toLocaleString()} off`}
                    </p>
                    {discount.description && (
                      <p className="text-white/40 text-sm">{discount.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {discount.minOrderAmount && (
                        <span className="text-white/40 text-xs">
                          Min: KES {discount.minOrderAmount.toLocaleString()}
                        </span>
                      )}
                      {discount.maxUses && (
                        <span className="text-white/40 text-xs">
                          Uses: {discount.currentUses}/{discount.maxUses}
                        </span>
                      )}
                      {discount.startDate && (
                        <span className="text-white/40 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(discount.startDate).toLocaleDateString()}
                          {discount.endDate && ` - ${new Date(discount.endDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(discount)}
                  <Switch
                    checked={discount.isActive}
                    onCheckedChange={() => toggleActive(discount)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(discount)}
                    className="text-white/60 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(discount.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {discounts.length === 0 && (
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/40 mb-4">No discount codes yet</p>
              <Button
                onClick={openCreateDialog}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Code
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Create Discount Code'}</DialogTitle>
            <DialogDescription className="text-white/40">
              {editingDiscount ? 'Update the discount details' : 'Create a new promotional code'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  className="bg-zinc-800 border-white/10 text-white mt-1.5 font-mono uppercase"
                />
              </div>
              <div>
                <Label className="text-white/60">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10 text-white mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-white/10">
                    <SelectItem value="PERCENTAGE" className="text-white">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT" className="text-white">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white/60">Value ({formData.type === 'PERCENTAGE' ? '%' : 'KES'})</Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.type === 'PERCENTAGE' ? '20' : '500'}
                className="bg-zinc-800 border-white/10 text-white mt-1.5"
              />
            </div>

            <div>
              <Label className="text-white/60">Description (optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summer sale discount"
                className="bg-zinc-800 border-white/10 text-white mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Min Order Amount (KES)</Label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="1000"
                  className="bg-zinc-800 border-white/10 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-white/60">Max Uses</Label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="100"
                  className="bg-zinc-800 border-white/10 text-white mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-zinc-800 border-white/10 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-white/60">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-zinc-800 border-white/10 text-white mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white/60">Active</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-white/10 text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editingDiscount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Discount</DialogTitle>
            <DialogDescription className="text-white/40">
              Are you sure you want to delete this discount code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="border-white/10 text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
