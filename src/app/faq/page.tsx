'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  GENERAL: 'General',
  SHIPPING: 'Shipping',
  RETURNS: 'Returns & Exchanges',
  PAYMENT: 'Payment',
  PRODUCTS: 'Products',
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/faq');
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

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...new Set(faqs.map(faq => faq.category))];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-white/40">Find answers to common questions</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border-white/10 text-white pl-12 py-3"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-amber-400 text-black'
                  : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {category === 'ALL' ? 'All' : categoryLabels[category] || category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  {expandedId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                  )}
                </button>
                {expandedId === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-white/70">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 mb-2">No questions found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-amber-400 hover:text-amber-300 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-zinc-900 border border-white/10 rounded-lg p-8 text-center">
          <MessageSquare className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-white/60 mb-6">
            Can't find the answer you're looking for? Please reach out to our friendly team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
