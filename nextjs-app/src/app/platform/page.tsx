'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiActivity, FiBox, FiShield, FiEye, FiAlertCircle,
  FiCheckCircle, FiArrowRight, FiMail,
} from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

const features = [
  {
    icon: <FiActivity size={24} />,
    title: 'Pipeline Visibility',
    desc: 'Every CI/CD run tracked. Pass, fail, duration — across all your environments.',
  },
  {
    icon: <FiBox size={24} />,
    title: 'Deployment Tracker',
    desc: 'Every deploy logged by environment, version, and timestamp. Full history, always.',
  },
  {
    icon: <FiShield size={24} />,
    title: 'Environment Health',
    desc: 'Continuous uptime monitoring on every endpoint. Know before your clients do.',
  },
  {
    icon: <FiAlertCircle size={24} />,
    title: 'Incident Manager',
    desc: 'Create, track, and resolve incidents with severity levels and postmortem notes.',
  },
  {
    icon: <FiEye size={24} />,
    title: 'Client Board',
    desc: 'A read-only view for each client — live project health without exposing your tooling.',
  },
  {
    icon: <FiCheckCircle size={24} />,
    title: 'Alerting',
    desc: 'Email and webhook alerts on pipeline failures, downtime, or new incidents.',
  },
];

export default function PlatformPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company, source: 'platform-page' }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      toast.success('You\'re on the list!');
    } catch {
      toast.error('Something went wrong — try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">

      {/* Hero */}
      <section className="relative text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1923]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F1923]" />
        <div className="section-container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand/70 border border-brand/20 rounded-full px-4 py-1 mb-6">
              STC Products
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold mb-5">
              Omnis DevOps
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4">
              Full visibility. Zero complexity. Built for one.
            </p>
            <p className="text-slate-400 max-w-xl mx-auto mb-10">
              The DevOps platform STC uses on every client project — now available as a standalone product for solo engineers and small teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#waitlist" className="btn-primary flex items-center justify-center gap-2">
                Join the Waitlist <FiArrowRight />
              </a>
              <Link href="/contact" className="btn-secondary flex items-center justify-center gap-2">
                Talk to Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How clients benefit */}
      <section className="py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Already Running on Your Project
            </h2>
            <p className="text-slate-400 text-lg">
              STC deploys Omnis DevOps on every client engagement. That means from day one, your infrastructure is monitored, your deployments are logged, and your pipeline is tracked — automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <FiActivity size={20} />,
                title: 'Live in your portal',
                desc: 'STC clients see deployment status, environment health, and pipeline results directly in their client portal — no extra logins, no raw tooling exposed.',
              },
              {
                icon: <FiShield size={20} />,
                title: 'Always monitored',
                desc: 'Every endpoint STC manages is continuously health-checked. You get notified of issues before they become incidents.',
              },
              {
                icon: <FiEye size={20} />,
                title: 'Full transparency',
                desc: 'Know exactly what shipped, when it shipped, and what the current state of your environment is — at any time.',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="card p-6"
              >
                <div className="text-brand mb-3">{item.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/client-portal" className="text-brand hover:text-brand-light text-sm font-medium inline-flex items-center gap-1 transition-colors">
              STC clients: view your project board <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="section-container">
          <h2 className="section-title">What Omnis Does</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="card p-6"
              >
                <div className="text-brand mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16">
        <div className="section-container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Built for the 1-Engineer Shop</h2>
          <p className="text-slate-400 text-lg mb-8">
            Omnis isn't built for enterprise platform teams with 20 engineers. It's built for the DevOps engineer managing 5 client environments from a single pane of glass — and who needs to show each client what's going on without exposing raw tooling.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Solo DevOps engineers', 'Freelance infrastructure engineers', 'Small agencies', 'Startups without a platform team', 'STC consulting clients'].map((label) => (
              <span key={label} className="text-sm text-brand border border-brand/30 rounded-full px-4 py-1.5 bg-brand/5">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-20">
        <div className="section-container max-w-lg mx-auto">
          <div className="card p-8 text-center">
            <FiMail size={32} className="text-brand mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h2>
            <p className="text-slate-400 mb-8">
              Omnis DevOps is in active development. Get early access when it launches.
            </p>

            {submitted ? (
              <div className="text-center py-4">
                <FiCheckCircle size={40} className="text-brand mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">You're on the list.</p>
                <p className="text-slate-400 text-sm mt-1">We'll reach out when early access opens.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email <span className="text-brand">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Company / Role</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Freelance DevOps, Acme Corp"
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : <>Join Waitlist <FiArrowRight /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
