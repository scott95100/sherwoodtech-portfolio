'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
      <div className="w-full max-w-md bg-[#111827] border border-[#1e293b] rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Forgot password</h1>
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-slate-300 mb-4">
              If that email exists, a reset link has been sent. Check your inbox.
            </p>
            <Link href="/login" className="text-cyan-400 hover:underline text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="you@sherwoodtech.it.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              <Link href="/login" className="text-cyan-400 hover:underline">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
