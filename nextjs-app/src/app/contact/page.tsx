'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiSend, FiMail, FiGithub, FiLinkedin } from 'react-icons/fi';

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
      toast.success('Message sent! I\'ll get back to you soon.');
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
            Have a project in mind or want to chat? I&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-teal-DEFAULT mb-6">Contact Info</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              I&apos;m always open to discussing new projects, creative ideas, or opportunities to
              be part of something great. Fill out the form and I&apos;ll get back to you as soon as
              possible.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:scott@sherwoodtech.dev"
                className="flex items-center gap-3 text-gray-600 hover:text-teal-DEFAULT transition-colors"
              >
                <FiMail size={20} className="text-teal-DEFAULT" />
                scott@sherwoodtech.dev
              </a>
              <a
                href="https://github.com/scott95100"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-teal-DEFAULT transition-colors"
              >
                <FiGithub size={20} className="text-teal-DEFAULT" />
                github.com/scott95100
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-teal-DEFAULT transition-colors"
              >
                <FiLinkedin size={20} className="text-teal-DEFAULT" />
                LinkedIn Profile
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
                placeholder="Tell me about your project..."
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
              )}
            </div>

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
