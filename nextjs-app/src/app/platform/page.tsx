'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiActivity, FiBox, FiShield, FiEye, FiAlertCircle,
  FiCheckCircle, FiArrowRight, FiMail,
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
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

const initialForm = {
  name: '',
  email: '',
  company: '',
  role: '',
  teamSize: '',
  environmentCount: '',
  toolStack: '',
  useCase: '',
  biggestPain: '',
  linkedinUrl: '',
  notes: '',
  managesClientWorkloads: false,
  willingToInterview: true,
};

export default function PlatformPage() {
  const [form, setForm] = useState(initialForm);
  const [utm, setUtm] = useState({ utmSource: '', utmCampaign: '', utmMedium: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      utmSource: params.get('utm_source') || '',
      utmCampaign: params.get('utm_campaign') || '',
      utmMedium: params.get('utm_medium') || '',
    });
  }, []);

  useEffect(() => {
    if (!utm.utmCampaign) return;

    const trackingKey = `campaign-landing:${utm.utmCampaign}:${utm.utmSource}:${utm.utmMedium}:${window.location.pathname}`;
    if (window.sessionStorage.getItem(trackingKey)) return;

    window.sessionStorage.setItem(trackingKey, '1');

    fetch('/api/campaigns/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utmCampaign: utm.utmCampaign,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        path: `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      window.sessionStorage.removeItem(trackingKey);
    });
  }, [utm]);

  const updateField = <K extends keyof typeof initialForm>(field: K, value: (typeof initialForm)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.role || !form.useCase || !form.biggestPain) {
      toast.error('Complete the required fields before applying.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          environmentCount: form.environmentCount ? Number.parseInt(form.environmentCount, 10) : null,
          toolStack: form.toolStack.split(',').map((item) => item.trim()).filter(Boolean),
          source: 'platform-beta',
          utmSource: utm.utmSource,
          utmCampaign: utm.utmCampaign,
          utmMedium: utm.utmMedium,
          referrer: document.referrer || null,
          landingPath: window.location.pathname,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSubmitted(true);
      setForm(initialForm);
      toast.success('Beta application submitted.');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong — try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
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
            <p className="text-slate-400 max-w-2xl mx-auto mb-10">
              We are opening a focused beta for solo DevOps engineers, technical consultants, agencies, and small teams that need deployment history, environment health, incident context, and a client-safe visibility layer without enterprise overhead.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#beta-apply" className="btn-primary flex items-center justify-center gap-2">
                Apply for Beta <FiArrowRight />
              </a>
              <Link href="/contact" className="btn-secondary flex items-center justify-center gap-2">
                Talk to Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Already Running on Your Project
            </h2>
            <p className="text-slate-400 text-lg">
              STC deploys Omnis DevOps on client work now. The beta is for operators who want the same visibility layer across their own environments or customer accounts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <FiActivity size={20} />,
                title: 'Live deployment signal',
                desc: 'Track releases, failures, and environment health without stitching together five separate tools.',
              },
              {
                icon: <FiShield size={20} />,
                title: 'Built for client-facing work',
                desc: 'Share the right amount of infrastructure visibility with clients without exposing raw internal tooling.',
              },
              {
                icon: <FiEye size={20} />,
                title: 'Made for small operators',
                desc: 'Designed for the person managing too much infra, not for the platform team with a full internal enablement budget.',
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
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          <h2 className="section-title">What Omnis Does</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                className="card p-6"
              >
                <div className="text-brand mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Who We Want in the Beta</h2>
            <p className="text-slate-400 text-lg">
              We are looking for sharp operators with real workflow pain, not passive waitlist signups.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Solo DevOps engineers juggling multiple environments',
              'Agencies managing infrastructure for several clients',
              'Founding engineers carrying release and uptime responsibility',
              'Consultants who need client-safe reporting and clearer ops visibility',
            ].map((label) => (
              <div key={label} className="rounded-xl border border-[#243044] bg-[#0F1923] px-4 py-4 text-slate-200 text-sm">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="beta-apply" className="py-20">
        <div className="section-container max-w-3xl mx-auto">
          <div className="card p-8 text-center">
            <FiMail size={32} className="text-brand mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Apply for Beta Access</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              This is an application, not a generic waitlist. We are prioritizing teams with active deployment, uptime, and client-reporting pain so we can shape the product with real operational feedback.
            </p>

            {submitted ? (
              <div className="text-center py-4">
                <FiCheckCircle size={40} className="text-brand mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">Application received.</p>
                <p className="text-slate-400 text-sm mt-1">We will review fit and reach out as beta slots open.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="space-y-4 text-left">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Name <span className="text-brand">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Your name"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email <span className="text-brand">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="you@company.com"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      placeholder="Company or agency name"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Role <span className="text-brand">*</span></label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => updateField('role', e.target.value)}
                      placeholder="DevOps Engineer, Founder, Consultant"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Team Size</label>
                    <select
                      value={form.teamSize}
                      onChange={(e) => updateField('teamSize', e.target.value)}
                      className="input"
                    >
                      <option value="">Select a range</option>
                      <option value="solo">Solo</option>
                      <option value="2-5">2-5</option>
                      <option value="6-15">6-15</option>
                      <option value="16+">16+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Environments Managed</label>
                    <input
                      type="number"
                      min="0"
                      value={form.environmentCount}
                      onChange={(e) => updateField('environmentCount', e.target.value)}
                      placeholder="e.g. 8"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Current Tool Stack</label>
                  <input
                    type="text"
                    value={form.toolStack}
                    onChange={(e) => updateField('toolStack', e.target.value)}
                    placeholder="GitHub Actions, CloudWatch, UptimeRobot, Statuspage"
                    className="input"
                  />
                  <p className="text-xs text-slate-600 mt-1">Comma-separated is fine.</p>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Primary Use Case <span className="text-brand">*</span></label>
                  <textarea
                    value={form.useCase}
                    onChange={(e) => updateField('useCase', e.target.value)}
                    placeholder="What would you use Omnis DevOps for in your current workflow?"
                    className="input"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Biggest Pain Today <span className="text-brand">*</span></label>
                  <textarea
                    value={form.biggestPain}
                    onChange={(e) => updateField('biggestPain', e.target.value)}
                    placeholder="What is most broken, noisy, or time-consuming in your current DevOps visibility workflow?"
                    className="input"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={form.linkedinUrl}
                      onChange={(e) => updateField('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Anything Else?</label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      placeholder="Context, stack quirks, current evaluation timeline"
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 rounded-xl border border-[#243044] bg-[#0F1923] p-4">
                  <label className="flex items-start gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.managesClientWorkloads}
                      onChange={(e) => updateField('managesClientWorkloads', e.target.checked)}
                      className="mt-1"
                    />
                    <span>I manage client environments or customer-facing infrastructure.</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.willingToInterview}
                      onChange={(e) => updateField('willingToInterview', e.target.checked)}
                      className="mt-1"
                    />
                    <span>I am open to a short feedback call during the beta.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : <>Apply for Beta Access <FiArrowRight /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}