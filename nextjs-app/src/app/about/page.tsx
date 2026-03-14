import { FiCode, FiDatabase, FiServer, FiGithub } from 'react-icons/fi';

const skills = {
  Frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  Backend: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'NextAuth'],
  Database: ['PostgreSQL', 'Prisma ORM', 'MongoDB'],
  DevOps: ['Git', 'Docker', 'Vercel', 'Railway', 'CI/CD'],
};

const skillIcons: Record<string, React.ReactNode> = {
  Frontend: <FiCode size={24} />,
  Backend: <FiServer size={24} />,
  Database: <FiDatabase size={24} />,
  DevOps: <FiGithub size={24} />,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-20">
        <div className="section-container text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Me</h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">
            Full Stack Engineer — I turn ideas into polished web applications.
          </p>
        </div>
      </section>

      {/* Bio */}
      <section className="py-16">
        <div className="section-container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-teal-DEFAULT mb-6">Hello, I&apos;m Scott!</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              I&apos;m a passionate Full Stack Software Engineer with expertise in modern web
              technologies. I love creating clean, efficient, and scalable solutions that make a real
              difference.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              With a strong foundation in both frontend and backend development, I specialize in
              React, Next.js, Node.js, and PostgreSQL. I enjoy working on challenging projects that
              push me to learn and grow.
            </p>
            <p className="text-gray-600 leading-relaxed">
              When I&apos;m not coding, I explore new technologies, contribute to open source, and
              share knowledge with the developer community.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#008080] to-[#0d7390] rounded-2xl flex items-center justify-center min-h-[300px] text-white text-lg font-medium">
            Professional Photo Coming Soon
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <h2 className="section-title">Skills & Technologies</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className="card p-6">
                <div className="flex items-center gap-3 mb-4 text-teal-DEFAULT">
                  {skillIcons[category]}
                  <h3 className="text-lg font-semibold">{category}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-DEFAULT inline-block" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
