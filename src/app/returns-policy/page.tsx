'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw, Package, Clock, CreditCard, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';

export default function ReturnsPolicyPage() {
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
            <RefreshCw className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Returns & Exchanges</h1>
          <p className="text-white/40">We want you to love your purchase</p>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-1">7 Days</h3>
            <p className="text-white/60 text-sm">Return window</p>
          </div>
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 text-center">
            <CreditCard className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-1">Full Refund</h3>
            <p className="text-white/60 text-sm">Original payment method</p>
          </div>
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 text-center">
            <Package className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-1">Easy Process</h3>
            <p className="text-white/60 text-sm">Simple return request</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Eligible for Returns
            </h2>
            <p className="text-white/70 mb-4">Items must meet the following conditions:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li>Returned within 7 days of delivery</li>
              <li>Unworn, unwashed, and in original condition</li>
              <li>All original tags and packaging included</li>
              <li>Proof of purchase (order number or receipt)</li>
              <li>Items not marked as "Final Sale" or "Non-returnable"</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Non-Returnable Items
            </h2>
            <p className="text-white/70 mb-4">The following items cannot be returned:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li>Items marked as "Final Sale" or "Non-returnable"</li>
              <li>Underwear, swimwear, and intimates (for hygiene reasons)</li>
              <li>Custom or personalized items</li>
              <li>Items that have been worn, washed, or altered</li>
              <li>Items without original tags or packaging</li>
              <li>Gift cards</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside text-white/70 space-y-3">
              <li>
                <strong className="text-white">Contact Us:</strong> Reach out via our <Link href="/contact" className="text-amber-400 hover:text-amber-300">contact form</Link> or email with your order number
              </li>
              <li>
                <strong className="text-white">Wait for Approval:</strong> We'll review your request within 24-48 hours
              </li>
              <li>
                <strong className="text-white">Prepare Your Package:</strong> Pack items securely with all original packaging
              </li>
              <li>
                <strong className="text-white">Ship or Drop Off:</strong> Return items to our store location or ship to our warehouse
              </li>
              <li>
                <strong className="text-white">Receive Refund:</strong> Once we receive and inspect the items, your refund will be processed within 5-7 business days
              </li>
            </ol>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Refund Methods</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Original Payment Method</h4>
                  <p className="text-white/60 text-sm">Refund to your original payment method (M-Pesa, card, etc.)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Store Credit</h4>
                  <p className="text-white/60 text-sm">Receive store credit for future purchases (may include bonus amount)</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Exchanges</h2>
            <p className="text-white/70">
              We currently do not offer direct exchanges. If you need a different size or color, please return the original item for a refund and place a new order. This ensures faster processing and availability.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Damaged or Incorrect Items</h2>
            <p className="text-white/70">
              If you received a damaged or incorrect item, please contact us immediately. We will arrange for a return pickup at no additional cost and expedite your replacement or refund. Please keep all packaging materials for inspection.
            </p>
          </Card>

          <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-6 text-center">
            <MessageSquare className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Need Help with a Return?</h3>
            <p className="text-white/60 mb-4">
              Our customer service team is here to assist you with any return or exchange questions.
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
    </div>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
