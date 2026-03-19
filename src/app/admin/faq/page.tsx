'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: 'GENERAL', label: 'General' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'RETURNS', label: 'Returns & Exchanges' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'PRODUCTS', label: 'Products' },
];

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'GENERAL',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/admin/faq');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'GENERAL',
      order: faqs.length,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      alert('Question and answer are required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/faq';
      const method = editingFaq ? 'PUT' : 'POST';
      const body = editingFaq 
        ? { ...formData, id: editingFaq.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchFaqs();
        setDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save FAQ');
      }
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/faq?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFaqs();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  const toggleActive = async (faq: FAQ) => {
    try {
      await fetch('/api/admin/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: faq.id,
          isActive: !faq.isActive,
        }),
      });
      fetchFaqs();
    } catch (error) {
      console.error('Failed to update FAQ:', error);
    }
  };

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (loading) {
    return (
      <AdminLayout title="FAQ Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="FAQ Management">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">FAQ Management</h2>
          <p className="text-white/40">Manage frequently asked questions</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* FAQ List */}
      <div className="space-y-6">
        {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
          <Card key={category} className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                {categories.find(c => c.value === category)?.label || category}
                <span className="text-white/40 text-sm font-normal">
                  ({categoryFaqs.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`p-4 bg-zinc-800 rounded-lg border ${
                      faq.isActive ? 'border-white/10' : 'border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{faq.question}</h4>
                        <p className="text-white/60 text-sm">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 mr-2">
                          <Label className="text-white/40 text-xs">Active</Label>
                          <Switch
                            checked={faq.isActive}
                            onCheckedChange={() => toggleActive(faq)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(faq)}
                          className="text-white/60 hover:text-white"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(faq.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {faqs.length === 0 && (
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/40 mb-4">No FAQs yet</p>
              <Button
                onClick={openCreateDialog}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First FAQ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
            <DialogDescription className="text-white/40">
              {editingFaq ? 'Update the FAQ details' : 'Add a new frequently asked question'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/60">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-white/10 text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/60">Question</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g., What are your shipping options?"
                className="bg-zinc-800 border-white/10 text-white mt-1.5"
              />
            </div>

            <div>
              <Label className="text-white/60">Answer</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Provide a clear and helpful answer..."
                rows={4}
                className="bg-zinc-800 border-white/10 text-white mt-1.5"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white/60">Active (visible to customers)</Label>
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
              {editingFaq ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription className="text-white/40">
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
