'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FiSend, FiMail, FiZap, FiArrowRight } from 'react-icons/fi';

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      toast.success('Message sent! We\'ll be in touch within 24 hours.');
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-20">
        <div className="section-container text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">
            Let&apos;s discuss your project. We&apos;ll respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-brand mb-6">Contact STC</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Have a question, a general inquiry, or just want to say hello? Fill out the form
              and we&apos;ll get back to you within 24 hours.
            </p>

            {/* ⚡ Faster response tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <FiZap size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    Get a faster response for project requests
                  </p>
                  <p className="text-sm text-amber-700 leading-relaxed mb-3">
                    If you&apos;re looking to start a project, using the <strong>Project Estimator</strong> gives
                    us everything we need to respond with a real proposal — no back-and-forth required.
                    You&apos;ll also get an instant cost and timeline estimate on the spot.
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors"
                  >
                    Browse services &amp; get a quote <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:sherwoodtechconsulting@gmail.com"
                className="flex items-center gap-3 text-gray-600 hover:text-brand transition-colors"
              >
                <FiMail size={20} className="text-brand" />
                sherwoodtechconsulting@gmail.com
              </a>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-md p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Your name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
              <input
                {...register('subject', { required: 'Subject is required' })}
                className={`input ${errors.subject ? 'input-error' : ''}`}
                placeholder="What's this about?"
              />
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                {...register('message', {
                  required: 'Message is required',
                  minLength: { value: 10, message: 'Message must be at least 10 characters' },
                })}
                className={`input min-h-[120px] resize-y ${errors.message ? 'input-error' : ''}`}
                placeholder="Tell us about your project..."
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
              )}
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Starting a project?{' '}
              <Link href="/services" className="text-brand hover:underline font-medium">
                Use the Project Estimator
              </Link>{' '}
              for a faster, more detailed response.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiSend size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
