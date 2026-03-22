'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiExternalLink, FiGithub } from 'react-icons/fi';

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchProjects();
  }, [status]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      toast.success('Project created!');
      setShowForm(false);
      setForm({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '', featured: false });
      fetchProjects();
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <section className="relative text-white py-12 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1923]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F1923]" />
        <div className="section-container relative z-10">
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-brand/70">Welcome back, {session?.user?.name}</p>
        </div>
      </section>

      <div className="section-container py-10">
        {/* Projects Panel */}
        <div className="bg-[#1A2535] rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">My Projects</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
              <FiPlus size={16} /> Add Project
            </button>
          </div>

          {/* Add Project Form */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-[#0F1923] rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-semibold text-slate-200">New Project</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Title *</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Technologies (comma-separated)</label>
                  <input
                    className="input"
                    value={form.technologies}
                    onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-200 mb-1">Description *</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">GitHub URL</label>
                  <input
                    className="input"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Live URL</label>
                  <input
                    className="input"
                    value={form.liveUrl}
                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded"
                />
                Featured project
              </label>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary text-sm px-4 py-2">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              </div>
            </form>
          )}

          {/* Project List */}
          {projects.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No projects yet. Add your first one!</p>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="border border-[#243044] rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{p.title}</h3>
                      {p.featured && (
                        <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mb-2 line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.technologies.map((t) => (
                        <span key={t} className="text-xs bg-[#1A2535] text-slate-400 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand flex items-center gap-1">
                          <FiGithub size={12} /> GitHub
                        </a>
                      )}
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand flex items-center gap-1">
                          <FiExternalLink size={12} /> Live
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Delete project"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
