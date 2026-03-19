'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  CalendarIcon,
  Loader2,
  Package,
  Users,
  ShoppingBag,
  Mail,
  Star,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  count?: number;
}

const exportOptions: ExportOption[] = [
  { id: 'products', label: 'Products', description: 'Product catalog with prices, variants, stock', icon: Package },
  { id: 'customers', label: 'Customers', description: 'Customer accounts and contact info', icon: Users },
  { id: 'orders', label: 'Orders', description: 'Order history with items and status', icon: ShoppingBag },
  { id: 'subscribers', label: 'Subscribers', description: 'Newsletter subscribers', icon: Mail },
  { id: 'reviews', label: 'Reviews', description: 'Product reviews and ratings', icon: Star },
  { id: 'discounts', label: 'Discount Codes', description: 'Active and used discount codes', icon: Tag },
  { id: 'returns', label: 'Returns', description: 'Return requests and status', icon: TrendingUp },
];

const datePresets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: -1 },
  { label: 'All time', days: -2 },
];

export default function ExportPage() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['products', 'customers', 'orders']);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exporting, setExporting] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Fetch counts for each data type
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/admin/export/counts');
        if (response.ok) {
          const data = await response.json();
          setCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };
    fetchCounts();
  }, []);

  const toggleOption = (id: string) => {
    setSelectedOptions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDatePreset = (days: number) => {
    const now = new Date();
    if (days === -2) {
      // All time - set to very old date
      setStartDate(new Date('2020-01-01'));
      setEndDate(now);
    } else if (days === -1) {
      // This month
      setStartDate(startOfMonth(now));
      setEndDate(endOfMonth(now));
    } else {
      setStartDate(subDays(now, days));
      setEndDate(now);
    }
  };

  const handleExport = async () => {
    if (selectedOptions.length === 0) return;

    setExporting(true);
    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: selectedOptions,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format: exportFormat,
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clothingctrl-export-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout title="Export Data">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Export Store Data</h2>
            <p className="text-white/40">Download your store data in JSON or CSV format</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={exportFormat === 'json' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportFormat('json')}
              className={exportFormat === 'json' ? 'bg-amber-400 text-black' : 'border-white/10 text-white/60'}
            >
              <FileJson className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button
              variant={exportFormat === 'csv' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportFormat('csv')}
              className={exportFormat === 'csv' ? 'bg-amber-400 text-black' : 'border-white/10 text-white/60'}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Date Range Selection */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Date Range</CardTitle>
            <CardDescription className="text-white/40">
              Select the time period for the data export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {datePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDatePreset(preset.days)}
                  className="border-white/10 text-white/60 hover:text-white hover:border-amber-400/50"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-white/60">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-white/10 text-white bg-zinc-800">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(startDate, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-white/60">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-white/10 text-white bg-zinc-800">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(endDate, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Selection */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Select Data to Export</CardTitle>
            <CardDescription className="text-white/40">
              Choose which data types to include in the export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOptions.includes(option.id);
                const count = counts[option.id];
                
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        isSelected 
                          ? "border-amber-400 bg-amber-400/5" 
                          : "border-white/10 bg-zinc-800/50 hover:border-white/30"
                      )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={isSelected}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-5 h-5", isSelected ? "text-amber-400" : "text-white/40")} />
                          <span className={cn("font-medium", isSelected ? "text-white" : "text-white/60")}>
                            {option.label}
                          </span>
                          {count !== undefined && (
                            <span className="text-xs text-white/40 bg-zinc-700 px-2 py-0.5 rounded">
                              {count.toLocaleString()} records
                            </span>
                          )}
                        </div>
                        <p className="text-white/40 text-sm mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Export Summary */}
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {selectedOptions.length} data type{selectedOptions.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-white/40 text-sm">
                  {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                </p>
              </div>
              <Button
                onClick={handleExport}
                disabled={exporting || selectedOptions.length === 0}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {exporting ? 'Exporting...' : `Export ${selectedOptions.length} ${exportFormat.toUpperCase()}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
