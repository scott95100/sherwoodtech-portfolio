'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

type FormData = {
  token: string;
  name: string;
  password: string;
  confirmPassword: string;
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { token: searchParams.get('token') || '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token, name: data.name, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <div className="bg-[#1A2535] rounded-2xl shadow-lg shadow-black/20 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-brand mb-2 text-center">Create Account</h1>
        <p className="text-slate-500 text-sm text-center mb-8">
          STC client portal accounts require an invitation. Enter your invite token below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1">Invite Token</label>
            <input
              {...register('token', { required: 'Invite token is required' })}
              className={`input font-mono text-sm ${errors.token ? 'input-error' : ''}`}
              placeholder="Paste your invite token here"
            />
            {errors.token && <p className="text-red-500 text-xs mt-1">{errors.token.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1">Full Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Your full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1">Password</label>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
              type="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1">Confirm Password</label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
              type="password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}