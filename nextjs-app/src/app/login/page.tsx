'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

type FormData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') router.replace('/admin');
    else if (session?.user?.role === 'CLIENT') router.replace('/client-portal');
  }, [session, router]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Welcome back!');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <div className="bg-[#1A2535] rounded-2xl shadow-lg shadow-black/20 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-brand mb-2 text-center">Client Login</h1>
        <p className="text-slate-500 text-sm text-center mb-8">
          Sign in to access your STC client portal
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1">Email</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1">Password</label>
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          <Link href="/forgot-password" className="text-brand hover:underline">
            Forgot your password?
          </Link>
        </p>

        <p className="text-center text-sm text-slate-500 mt-2">
          Have an invite code?{' '}
          <Link href="/register" className="text-brand font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}