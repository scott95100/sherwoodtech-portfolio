'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCode, FiServer, FiShield, FiUsers } from 'react-icons/fi';

const services = [
  {
    icon: <FiCode size={28} />,
    title: 'Salesforce Development',
    desc: 'Custom LWC components, Apex classes, automation flows, and full org implementations — built for real-world production use.',
  },
  {
    icon: <FiServer size={28} />,
    title: 'Full Stack Web Development',
    desc: 'End-to-end React, Next.js, and Node.js applications with cloud deployments on AWS and Vercel.',
  },
  {
    icon: <FiShield size={28} />,
    title: 'API & Backend Engineering',
    desc: 'Robust REST APIs, Salesforce integrations, authentication systems, and scalable database architecture.',
  },
  {
    icon: <FiUsers size={28} />,
    title: 'Technology Consulting',
    desc: 'Strategic guidance on stack selection, Salesforce org architecture, code reviews, and technical roadmapping.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-28">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.p
              className="text-teal-100 uppercase tracking-widest text-sm font-semibold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Sherwood Technology Consulting LLC
            </motion.p>
            <motion.h1
              className="text-5xl sm:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              Salesforce & Full Stack <br className="hidden sm:block" />
              Development Experts
            </motion.h1>
            <motion.p
              className="text-lg text-teal-100 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              LWC, Apex, React, Next.js, and cloud infrastructure — delivered by a senior engineer
              who takes ownership from day one.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              <Link
                href="/pricing"
                className="bg-white text-brand font-semibold px-8 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                Start a Project <FiArrowRight />
              </Link>
              <Link
                href="/services"
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-brand transition-colors text-center"
              >
                Our Services
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gray-50">
        <div className="section-container">
          <h2 className="section-title">What We Do</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-brand mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why STC */}
      <section className="py-20 bg-white">
        <div className="section-container grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-brand font-semibold uppercase tracking-widest text-sm mb-3">Why STC</p>
            <h2 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
              Senior-level Salesforce & web engineering without the overhead
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Sherwood Technology Consulting brings deep Salesforce platform expertise — LWC,
              Apex, and org architecture — alongside modern full-stack web development. Whether
              you need a custom Salesforce solution, a new web product, or a trusted technical
              partner for both, we deliver.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              You work directly with Scott, the engineer building your product. Clear communication,
              transparent progress tracking, and a focus on long-term maintainability — not just
              shipping fast.
            </p>
            <Link href="/about" className="btn-primary inline-flex items-center gap-2">
              About STC <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: '100%', label: 'Client Satisfaction' },
              { stat: '5+', label: 'Years Experience' },
              { stat: '20+', label: 'Projects Delivered' },
              { stat: '24h', label: 'Response Time' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-brand mb-2">{item.stat}</div>
                <div className="text-gray-500 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#008080] to-[#0d7390] text-white text-center">
        <div className="section-container">
          <h2 className="text-4xl font-bold mb-4">Ready to build something great?</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Tell us about your project and we&apos;ll get back to you within 24 hours.
          </p>
          <Link
            href="/pricing"
            className="bg-white text-brand font-semibold px-10 py-4 rounded-lg hover:bg-teal-50 transition-colors inline-flex items-center gap-2 text-lg"
          >
            Get a Free Consultation <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
