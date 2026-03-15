import Link from 'next/link';
import { FiArrowRight, FiCode, FiServer, FiShield, FiUsers, FiDatabase, FiCloud, FiZap } from 'react-icons/fi';

const services = [
  {
    icon: <FiCode size={32} />,
    title: 'Web & App Development',
    desc: 'End-to-end development of web applications and client portals. We handle design, architecture, implementation, and deployment — delivering production-ready software.',
    features: [
      'React & Next.js applications',
      'Responsive, accessible UI',
      'SEO optimization',
      'Performance-first engineering',
    ],
  },
  {
    icon: <FiServer size={32} />,
    title: 'API & Backend Engineering',
    desc: 'Robust server-side systems that power your product. We design APIs that are fast, secure, and easy to integrate with.',
    features: [
      'REST & GraphQL API design',
      'Authentication & authorization',
      'Salesforce Connected App integrations',
      'Webhook & event systems',
    ],
  },
  {
    icon: <FiDatabase size={32} />,
    title: 'Database Architecture',
    desc: 'Thoughtful schema design and query optimization for PostgreSQL and other relational databases. Built for scale from day one.',
    features: [
      'PostgreSQL & Prisma ORM',
      'Schema design & migrations',
      'Query optimization',
      'Data modeling & normalization',
    ],
  },
  {
    icon: <FiCloud size={32} />,
    title: 'Cloud & DevOps',
    desc: 'Modern cloud deployments with CI/CD pipelines, containerization, and managed infrastructure so your app stays fast and available.',
    features: [
      'AWS, Vercel, Railway deployments',
      'Docker containerization',
      'CI/CD pipeline setup',
      'Environment management',
    ],
  },
  {
    icon: <FiShield size={32} />,
    title: 'Security & Auth Systems',
    desc: 'Authentication, role-based access control, and secure data handling — built correctly the first time.',
    features: [
      'OAuth & credential auth',
      'Role-based access control',
      'Invite-only user systems',
      'Session & token management',
    ],
  },
  {
    icon: <FiZap size={32} />,
    title: 'Salesforce Development',
    desc: 'Full-cycle Salesforce development from custom LWC components and Apex classes to complex automation, integrations, and org architecture.',
    features: [
      'Lightning Web Components (LWC)',
      'Apex classes, triggers & batch jobs',
      'Flow & Process Builder automation',
      'REST/SOAP API integrations',
      'Custom objects & schema design',
      'Salesforce org migrations & cleanup',
    ],
  },
  {
    icon: <FiUsers size={32} />,
    title: 'Technology Consulting',
    desc: 'Strategic technical guidance to help you make the right decisions early — saving time, money, and rework down the road.',
    features: [
      'Stack selection & architecture',
      'Salesforce org assessments',
      'Code & system audits',
      'Technical roadmapping',
    ],
  },
];

const process = [
  { step: '01', title: 'Discovery', desc: 'We start with a consultation to understand your goals, constraints, and timeline.' },
  { step: '02', title: 'Proposal', desc: 'You receive a clear scope of work, timeline, and pricing — no surprises.' },
  { step: '03', title: 'Build', desc: 'Regular updates and direct communication as we build your product.' },
  { step: '04', title: 'Deliver', desc: 'Deployment, documentation, and post-launch support to make sure everything runs smoothly.' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-20">
        <div className="section-container text-center">
          <p className="text-teal-100 uppercase tracking-widest text-sm font-semibold mb-3">
            What We Offer
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            From Salesforce LWC and Apex to full-stack web apps and cloud infrastructure — STC
            covers your entire technology stack with senior-level expertise.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => (
              <div key={s.title} className="card p-8">
                <div className="text-brand mb-5">{s.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <h2 className="section-title">Our Process</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p) => (
              <div key={p.step} className="text-center p-6">
                <div className="text-5xl font-bold text-brand opacity-30 mb-3">{p.step}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#008080] to-[#0d7390] text-white text-center">
        <div className="section-container">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Schedule a free 30-minute consultation to discuss your project.
          </p>
          <Link
            href="/pricing"
            className="bg-white text-brand font-semibold px-10 py-4 rounded-lg hover:bg-teal-50 transition-colors inline-flex items-center gap-2 text-lg"
          >
            Get a Free Quote <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
