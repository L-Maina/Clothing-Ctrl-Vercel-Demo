'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLiveSettings } from '@/hooks/useRealtime';

export default function ContactPage() {
  const { settings } = useLiveSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-white/40">We'd love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Get in Touch</h2>
              <p className="text-white/60 mb-8">
                Have a question about your order, a product, or just want to say hello? 
                We're here to help! Fill out the form and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Visit Us</h3>
                  <p className="text-white/60 text-sm mt-1">
                    {settings.addressLine1 || 'Cargen House, Harambee Ave'}
                    {settings.addressLine2 && <><br />{settings.addressLine2}</>}
                    <br />
                    {settings.city || 'Nairobi CBD'}, {settings.country || 'Kenya'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Store Hours</h3>
                  <p className="text-white/60 text-sm mt-1">
                    {settings.openDays || 'Mon - Sat'}
                    <br />
                    {settings.openHour && settings.closeHour ? (
                      `${settings.openHour} - ${settings.closeHour}`
                    ) : '12:00 PM - 6:00 PM'}
                  </p>
                </div>
              </div>

              {settings.storeEmail && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Email Us</h3>
                    <a 
                      href={`mailto:${settings.storeEmail}`}
                      className="text-amber-400 hover:text-amber-300 text-sm mt-1 block"
                    >
                      {settings.storeEmail}
                    </a>
                  </div>
                </div>
              )}

              {settings.storePhone && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Call Us</h3>
                    <a 
                      href={`tel:${settings.storePhone}`}
                      className="text-amber-400 hover:text-amber-300 text-sm mt-1 block"
                    >
                      {settings.storePhone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-medium mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/faq" className="block text-white/60 hover:text-amber-400 text-sm">
                  → Frequently Asked Questions
                </Link>
                <Link href="/returns-policy" className="block text-white/60 hover:text-amber-400 text-sm">
                  → Returns & Exchanges
                </Link>
                <Link href="/track" className="block text-white/60 hover:text-amber-400 text-sm">
                  → Track Your Order
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 lg:p-8">
            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-white/60 mb-6">
                  Thank you for reaching out. We'll get back to you within 24-48 hours.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-2">Send a Message</h2>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">Phone</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+254 700 000 000"
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">Subject *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Order inquiry, product question..."
                      required
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm block mb-1.5">Message *</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    className="bg-zinc-800 border-white/10 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-3"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
