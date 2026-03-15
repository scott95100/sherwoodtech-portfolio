import Link from 'next/link';
import { FiCode, FiDatabase, FiServer, FiCloud, FiArrowRight } from 'react-icons/fi';

const values = [
  {
    icon: <FiCode size={24} />,
    title: 'Clean Code',
    desc: 'We write maintainable, well-documented code that your team can confidently build on for years.',
  },
  {
    icon: <FiCloud size={24} />,
    title: 'Scalable Architecture',
    desc: 'Systems designed to grow with your business — from MVP to enterprise scale.',
  },
  {
    icon: <FiServer size={24} />,
    title: 'Direct Communication',
    desc: 'No project managers in the way. You work directly with the engineer building your product.',
  },
  {
    icon: <FiDatabase size={24} />,
    title: 'Data-First Thinking',
    desc: 'Thoughtful database design and API architecture from day one — not bolted on later.',
  },
];

const stack = {
  Salesforce: ['Lightning Web Components', 'Apex', 'SOQL / SOSL', 'Flows & Automation', 'REST/SOAP APIs', 'Salesforce DX'],
  Frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  Backend: ['Node.js', 'Express.js', 'REST APIs', 'GraphQL', 'NextAuth'],
  'Database & DevOps': ['PostgreSQL', 'Prisma ORM', 'MongoDB', 'AWS', 'Vercel', 'Docker'],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F1923]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] text-white py-20">
        <div className="section-container text-center">
          <p className="text-brand/70 uppercase tracking-widest text-sm font-semibold mb-3">
            About STC
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Built by Engineers, For Business
          </h1>
          <p className="text-brand/70 text-lg max-w-2xl mx-auto">
            Sherwood Technology Consulting LLC is a full-stack development and technology consulting
            firm focused on delivering reliable, modern software for businesses that take technology seriously.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 bg-[#1A2535]">
        <div className="section-container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand font-semibold uppercase tracking-widest text-sm mb-3">
              Founder & Lead Engineer
            </p>
            <h2 className="text-3xl font-bold text-white mb-6">Scott Sherwood</h2>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Scott is a full-stack software engineer and certified Salesforce developer with deep
              expertise across the modern web stack and the Salesforce platform. He founded Sherwood
              Technology Consulting to bring senior-level engineering to businesses that need
              results — without the overhead of a large agency.
            </p>
            <p className="text-slate-400 mb-4 leading-relaxed">
              On the Salesforce side, Scott builds production-grade Lightning Web Components,
              complex Apex solutions, and end-to-end org automations. On the web side, he
              specializes in React, Next.js, Node.js, and PostgreSQL — designing and delivering
              full-stack systems from architecture to deployment.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Every client works directly with Scott. No hand-offs, no account managers — just
              clear communication, transparent progress tracking, and quality work delivered on time.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] rounded-2xl flex items-center justify-center min-h-[300px] text-white text-lg font-medium">
            Scott Sherwood — STC
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-[#0F1923]">
        <div className="section-container">
          <h2 className="section-title">How We Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card p-6">
                <div className="text-brand mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-[#1A2535]">
        <div className="section-container">
          <h2 className="section-title">Our Technology Stack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(stack).map(([category, items]) => (
              <div key={category} className="card p-6">
                <h3 className="text-lg font-semibold text-brand mb-4">{category}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-400 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] text-white text-center">
        <div className="section-container">
          <h2 className="text-3xl font-bold mb-4">Let&apos;s Build Something Together</h2>
          <p className="text-brand/70 mb-8 max-w-xl mx-auto">
            Have a project in mind? We&apos;d love to hear about it.
          </p>
          <Link
            href="/pricing"
            className="btn-primary inline-flex items-center gap-2"
          >
            Get a Quote <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
