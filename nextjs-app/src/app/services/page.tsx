import Link from 'next/link';
import { FiArrowRight, FiCode, FiServer, FiShield, FiUsers, FiDatabase, FiCloud, FiZap } from 'react-icons/fi';

const services = [
  {
    key: 'salesforce',
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
    pilot: 'Custom LWC component or Apex trigger — scoped, tested, deployed.',
    range: '$8,000 – $35,000',
  },
  {
    key: 'web',
    icon: <FiCode size={32} />,
    title: 'Web & App Development',
    desc: 'End-to-end development of web applications and client portals. We handle design, architecture, implementation, and deployment — delivering production-ready software.',
    features: [
      'React & Next.js applications',
      'Responsive, accessible UI',
      'SEO optimization',
      'Performance-first engineering',
    ],
    pilot: 'One working page or feature module — built, deployed, and handed off.',
    range: '$8,000 – $40,000',
  },
  {
    key: 'api',
    icon: <FiServer size={32} />,
    title: 'API & Backend Engineering',
    desc: 'Robust server-side systems that power your product. We design APIs that are fast, secure, and easy to integrate with.',
    features: [
      'REST & GraphQL API design',
      'Authentication & authorization',
      'Salesforce Connected App integrations',
      'Webhook & event systems',
    ],
    pilot: 'One API endpoint or integration — authenticated, documented, tested.',
    range: '$5,000 – $25,000',
  },
  {
    key: 'database',
    icon: <FiDatabase size={32} />,
    title: 'Database Architecture',
    desc: 'Thoughtful schema design and query optimization for PostgreSQL and other relational databases. Built for scale from day one.',
    features: [
      'PostgreSQL & Prisma ORM',
      'Schema design & migrations',
      'Query optimization',
      'Data modeling & normalization',
    ],
    pilot: 'Schema design + migrations for one domain — reviewed, documented, deployed.',
    range: '$3,000 – $15,000',
  },
  {
    key: 'devops',
    icon: <FiCloud size={32} />,
    title: 'Cloud & DevOps',
    desc: 'Modern cloud deployments with CI/CD pipelines, containerization, and managed infrastructure so your app stays fast and available.',
    features: [
      'AWS, Vercel, Railway deployments',
      'Docker containerization',
      'CI/CD pipeline setup',
      'Environment management',
    ],
    pilot: 'CI/CD pipeline or containerized deployment for one service — live and documented.',
    range: '$3,000 – $20,000',
  },
  {
    key: 'security',
    icon: <FiShield size={32} />,
    title: 'Security & Auth Systems',
    desc: 'Authentication, role-based access control, and secure data handling — built correctly the first time.',
    features: [
      'OAuth & credential auth',
      'Role-based access control',
      'Invite-only user systems',
      'Session & token management',
    ],
    pilot: 'Auth system with RBAC for one app — login, roles, sessions, tested.',
    range: '$4,000 – $15,000',
  },
  {
    key: 'consulting',
    icon: <FiUsers size={32} />,
    title: 'Technology Consulting',
    desc: 'Strategic technical guidance to help you make the right decisions early — saving time, money, and rework down the road.',
    features: [
      'Stack selection & architecture',
      'Salesforce org assessments',
      'Code & system audits',
      'Technical roadmapping',
    ],
    pilot: '2-hour architecture or org assessment session — recorded, with written recommendations.',
    range: '$150 – $250 / hr',
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
    <div className="min-h-screen bg-transparent">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] text-white py-20">
        <div className="section-container text-center">
          <p className="text-brand/70 uppercase tracking-widest text-sm font-semibold mb-3">
            What We Offer
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-brand/70 text-lg max-w-2xl mx-auto">
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
              <Link
                key={s.title}
                href={`/pricing?service=${s.key}`}
                className="card p-8 group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer block"
              >
                <div className="text-brand mb-5">{s.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-2 mb-5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-slate-400 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[#243044] pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide mb-0.5">Full Project</div>
                      <div className="text-sm font-semibold text-slate-200">{s.range}</div>
                    </div>
                    <div className="flex items-center gap-1 text-brand text-sm font-semibold group-hover:gap-2 transition-all">
                      Get a Quote <FiArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-[#1A2535]/60">
        <div className="section-container">
          <h2 className="section-title">Our Process</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p) => (
              <div key={p.step} className="text-center p-6">
                <div className="text-5xl font-bold text-brand opacity-30 mb-3">{p.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] text-white text-center">
        <div className="section-container">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-brand/70 text-lg mb-8 max-w-xl mx-auto">
            Schedule a free 30-minute consultation to discuss your project.
          </p>
          <Link
            href="/pricing"
            className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4"
          >
            Get a Free Quote <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
