'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiClock, FiExternalLink, FiGithub, FiMessageSquare } from 'react-icons/fi';

type Note = { id: string; content: string; createdAt: string; isInternal: boolean };
type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  deadline: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  technologies: string[];
  notes: Note[];
};

const statusColors: Record<string, string> = {
  DISCOVERY: 'bg-purple-100 text-purple-700',
  PROPOSAL: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-orange-100 text-orange-700',
  COMPLETE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-gray-100 text-gray-600',
};

const statusLabel: Record<string, string> = {
  DISCOVERY: 'Discovery',
  PROPOSAL: 'Proposal',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'In Review',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold',
};

export default function ClientPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (status === 'authenticated') {
      if (session.user?.role !== 'CLIENT' && session.user?.role !== 'ADMIN') {
        router.replace('/');
        return;
      }
      fetchProjects();
    }
  }, [status, session, router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/client-projects');
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data.projects);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-16">
        <div className="section-container">
          <p className="text-teal-100 text-sm uppercase tracking-widest mb-2">Client Portal</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-teal-100">Track the status of your projects with STC.</p>
        </div>
      </section>

      <div className="section-container py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <FiClock size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-500 mb-2">No projects yet</h2>
            <p className="text-gray-400">
              Your projects will appear here once STC has set them up.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                className="card p-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{project.title}</h2>
                    {project.description && (
                      <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      statusColors[project.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {statusLabel[project.status] || project.status}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  {project.startDate && (
                    <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                  )}
                  {project.deadline && (
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((t) => (
                        <span key={t} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                {(project.liveUrl || project.repoUrl) && (
                  <div className="flex gap-4 mb-4">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand text-sm hover:underline"
                      >
                        <FiExternalLink size={14} /> Live Site
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand text-sm hover:underline"
                      >
                        <FiGithub size={14} /> Repository
                      </a>
                    )}
                  </div>
                )}

                {/* Notes */}
                {project.notes.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-1 mb-3">
                      <FiMessageSquare size={14} /> Updates
                    </h3>
                    <div className="space-y-2">
                      {project.notes.map((note) => (
                        <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-700 text-sm">{note.content}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
