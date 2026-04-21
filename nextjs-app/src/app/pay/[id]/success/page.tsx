'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';
import Link from 'next/link';
import { FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

// This page is loaded by Stripe after confirmPayment redirect.
// It checks the PaymentIntent status from the URL params.
export default function PaySuccessPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentIntentStatus = query.get('redirect_status');

    if (paymentIntentStatus === 'succeeded') {
      setStatus('success');
    } else if (paymentIntentStatus === 'failed') {
      setStatus('failed');
      setMessage('Your payment was declined. Please try again.');
    } else {
      setStatus('failed');
      setMessage('Payment status unknown. Contact support if you were charged.');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-10 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <FiLoader size={48} className="text-brand mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-white">Confirming payment…</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-400 mb-6">
              Thank you — your payment has been received. You&apos;ll receive a receipt by email shortly.
            </p>
            <Link href="/client-portal" className="btn-primary inline-block">
              Go to Client Portal
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            <Link href={`/pay/${params.id}`} className="btn-primary inline-block">
              Try Again
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
