'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, Cookie, Bell, UserCheck, Globe } from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-white/40">Last updated: January 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <Card className="bg-zinc-900 border-white/10 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              Information We Collect
            </h2>
            <p className="text-white/70 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li>Name, email address, and phone number when you create an account or place an order</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Order history and preferences</li>
              <li>Communications you send to us</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              How We Use Your Information
            </h2>
            <p className="text-white/70 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Data Security
            </h2>
            <p className="text-white/70">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology, and we never store your complete credit card information on our servers.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-amber-400" />
              Cookies
            </h2>
            <p className="text-white/70">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings. For more information, see our Cookie Policy.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              Data Retention
            </h2>
            <p className="text-white/70">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. When data is no longer needed, we securely delete or anonymize it.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              Third-Party Services
            </h2>
            <p className="text-white/70">
              We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you. These parties are contractually obligated to keep your information confidential and use it only for the purposes we specify.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Your Rights
            </h2>
            <p className="text-white/70 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to processing of your personal data</li>
            </ul>
          </Card>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Questions?</h3>
            <p className="text-white/60 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <Link href="/contact" className="text-amber-400 hover:text-amber-300 font-medium">
              Contact Us →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
