'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, ShoppingBag, CreditCard, Truck, RefreshCw, Shield, AlertTriangle, Scale } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-white/40">Last updated: January 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              Orders and Purchases
            </h2>
            <ul className="list-disc list-inside text-white/70 space-y-3">
              <li>All orders are subject to acceptance and availability</li>
              <li>We reserve the right to refuse or cancel any order for any reason</li>
              <li>Prices are subject to change without notice</li>
              <li>We make every effort to display accurate product images and descriptions, but slight variations may occur</li>
              <li>Once an order is placed, it cannot be modified. Please contact us immediately if changes are needed.</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Payment
            </h2>
            <ul className="list-disc list-inside text-white/70 space-y-3">
              <li>We accept M-Pesa, credit/debit cards, and other payment methods as displayed at checkout</li>
              <li>All payments are processed securely through our payment partners</li>
              <li>Payment must be received before orders are processed</li>
              <li>In the event of a payment failure, your order will be cancelled</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              Shipping
            </h2>
            <ul className="list-disc list-inside text-white/70 space-y-3">
              <li>Shipping times are estimates and not guaranteed</li>
              <li>Risk of loss passes to you upon delivery to the carrier</li>
              <li>We currently ship within Kenya and internationally</li>
              <li>Shipping costs are calculated at checkout based on your location</li>
              <li>Free shipping may be available for orders above a certain threshold</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              Returns and Exchanges
            </h2>
            <ul className="list-disc list-inside text-white/70 space-y-3">
              <li>Returns are accepted within 7 days of delivery</li>
              <li>Items must be unworn, unwashed, and in original condition with tags attached</li>
              <li>Sale items and certain categories may not be eligible for returns</li>
              <li>Refunds are processed to the original payment method</li>
              <li>For detailed information, please see our <Link href="/returns-policy" className="text-amber-400 hover:text-amber-300">Returns Policy</Link></li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Product Authenticity
            </h2>
            <p className="text-white/70">
              We guarantee that all products sold on ClothingCtrl are 100% authentic. We source our products from authorized dealers and reputable suppliers. If you have any concerns about the authenticity of a product, please contact us immediately.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Limitation of Liability
            </h2>
            <p className="text-white/70">
              To the fullest extent permitted by law, ClothingCtrl shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the amount paid by you for the relevant product or service.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              Governing Law
            </h2>
            <p className="text-white/70">
              These Terms of Service shall be governed by the laws of Kenya. Any disputes arising from these terms shall be resolved in the courts of Nairobi, Kenya.
            </p>
          </Card>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Questions?</h3>
            <p className="text-white/60 mb-4">
              If you have any questions about these Terms, please contact us:
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
