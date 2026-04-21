'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { FiCheck, FiAlertCircle, FiFileText, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type LineItem = { description: string; amount: number };
type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  description: string | null;
  lineItems: LineItem[];
  amount: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  client: { name: string; email: string };
};

// ─── Inner checkout form ──────────────────────────────────────────────────────
function CheckoutForm({ invoice }: { invoice: Invoice }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pay/${invoice.id}/success`,
      },
    });

    if (error) {
      setErrorMsg(error.message ?? 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMsg && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          <FiAlertCircle className="flex-shrink-0" />
          {errorMsg}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FiLock size={16} />
        {loading ? 'Processing…' : `Pay $${(invoice.amount / 100).toFixed(2)}`}
      </button>
      <p className="text-xs text-center text-slate-500">
        Secured by Stripe. Your card info is never stored on our servers.
      </p>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PayInvoicePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=/pay/${params.id}`);
      return;
    }
    if (status === 'authenticated') {
      loadInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to load invoice');
      }
      const data = await res.json();
      setInvoice(data.invoice);

      if (data.invoice.status === 'PAID') {
        // Already paid — skip payment intent creation
        setLoading(false);
        return;
      }

      // Get / create PaymentIntent
      const piRes = await fetch(`/api/invoices/${params.id}/payment-intent`, {
        method: 'POST',
      });
      if (!piRes.ok) {
        const piData = await piRes.json();
        throw new Error(piData.error ?? 'Failed to initialize payment');
      }
      const piData = await piRes.json();
      setClientSecret(piData.clientSecret);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to load invoice</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const lineItems = invoice.lineItems as LineItem[];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Invoice Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center">
                  <FiFileText className="text-brand" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">
                    {invoice.invoiceNumber}
                  </p>
                  <h1 className="text-xl font-bold text-white">{invoice.title}</h1>
                </div>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>

            {invoice.description && (
              <p className="text-slate-400 text-sm mb-4">{invoice.description}</p>
            )}

            {/* Line Items */}
            <div className="border-t border-[#1A2535] pt-4 space-y-2">
              {lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-400">{item.description}</span>
                  <span className="text-white font-medium">
                    ${(item.amount / 100).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-[#1A2535] text-base font-bold">
                <span className="text-white">Total</span>
                <span className="text-brand">${(invoice.amount / 100).toFixed(2)} USD</span>
              </div>
            </div>

            {invoice.dueDate && invoice.status !== 'PAID' && (
              <p className="text-xs text-slate-500 mt-3">
                Due by {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Payment Form or Paid State */}
          {invoice.status === 'PAID' ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Payment Complete</h2>
              <p className="text-slate-400">
                This invoice was paid on{' '}
                {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : '—'}.
              </p>
            </div>
          ) : clientSecret ? (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-white mb-4">Payment Details</h2>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#38BDF8',
                      colorBackground: '#0F1923',
                      colorText: '#F1F5F9',
                      colorDanger: '#F87171',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <CheckoutForm invoice={invoice} />
              </Elements>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-[#1A2535] text-slate-400',
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    VOID: 'bg-gray-100 text-gray-500',
    OVERDUE: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors[status] ?? colors.DRAFT}`}>
      {status}
    </span>
  );
}
