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
  Frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  Backend: ['Node.js', 'Express.js', 'REST APIs', 'GraphQL', 'NextAuth'],
  Database: ['PostgreSQL', 'Prisma ORM', 'MongoDB', 'Redis'],
  DevOps: ['AWS', 'Vercel', 'Railway', 'Docker', 'CI/CD Pipelines'],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-20">
        <div className="section-container text-center">
          <p className="text-teal-100 uppercase tracking-widest text-sm font-semibold mb-3">
            About STC
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Built by Engineers, For Business
          </h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            Sherwood Technology Consulting LLC is a full-stack development and technology consulting
            firm focused on delivering reliable, modern software for businesses that take technology seriously.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 bg-white">
        <div className="section-container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand font-semibold uppercase tracking-widest text-sm mb-3">
              Founder & Lead Engineer
            </p>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Scott Sherwood</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Scott is a full-stack software engineer with deep expertise in modern web technologies.
              He founded Sherwood Technology Consulting to bring senior-level engineering to businesses
              that need results — without the overhead of a large agency.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Specializing in React, Next.js, Node.js, and PostgreSQL, Scott has designed and
              delivered production systems across a range of industries — from SaaS platforms to
              client-facing web portals.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every client gets direct access to Scott throughout the engagement. No hand-offs,
              no account managers — just clear communication and quality work.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#008080] to-[#0d7390] rounded-2xl flex items-center justify-center min-h-[300px] text-white text-lg font-medium">
            Scott Sherwood — STC
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="section-container">
          <h2 className="section-title">How We Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card p-6">
                <div className="text-brand mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <h2 className="section-title">Our Technology Stack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(stack).map(([category, items]) => (
              <div key={category} className="card p-6">
                <h3 className="text-lg font-semibold text-brand mb-4">{category}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
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
      <section className="py-16 bg-gradient-to-br from-[#008080] to-[#0d7390] text-white text-center">
        <div className="section-container">
          <h2 className="text-3xl font-bold mb-4">Let&apos;s Build Something Together</h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Have a project in mind? We&apos;d love to hear about it.
          </p>
          <Link
            href="/contact"
            className="bg-white text-brand font-semibold px-8 py-3 rounded-lg hover:bg-teal-50 transition-colors inline-flex items-center gap-2"
          >
            Contact Us <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
