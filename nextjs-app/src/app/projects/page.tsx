import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FiGithub, FiExternalLink } from 'react-icons/fi';

async function getProjects() {
  try {
    // Find admin user's portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { isPublic: true },
      include: {
        projects: { orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] },
      },
    });
    return portfolio?.projects ?? [];
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-20">
        <div className="section-container text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Projects</h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">
            A selection of things I&apos;ve built.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="section-container">
          {projects.length === 0 ? (
            <p className="text-center text-gray-500 py-20">Projects coming soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="card flex flex-col">
                  {/* Card header */}
                  <div className="h-48 bg-gradient-to-br from-rackley to-[#0d7390] rounded-t-xl flex items-center justify-center text-white font-semibold text-lg px-4 text-center">
                    {project.title}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-teal-DEFAULT mb-3">{project.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                      {project.description}
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-teal-DEFAULT hover:text-teal-dark"
                        >
                          <FiGithub size={14} /> GitHub
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-teal-DEFAULT hover:text-teal-dark"
                        >
                          <FiExternalLink size={14} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
