'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  if (!token) {
    return <p className="text-red-400">Invalid reset link.</p>;
  }

  return done ? (
    <div className="text-center py-6">
      <p className="text-green-400 font-semibold mb-2">Password updated!</p>
      <p className="text-slate-400 text-sm">Redirecting to login...</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        required
        placeholder="New password (min 8 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
      />
      <input
        type="password"
        required
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Set new password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
      <div className="w-full max-w-md bg-[#111827] border border-[#1e293b] rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Set new password</h1>
        <Suspense fallback={<p className="text-slate-400">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link href="/login" className="text-cyan-400 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
