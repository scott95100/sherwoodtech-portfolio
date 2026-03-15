'use client';

import { useState } from 'react';
import { FiUsers, FiMail, FiFolder, FiCheck, FiLink, FiTrash2, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

type User = { id: string; name: string; email: string; role: string; createdAt: Date; isActive: boolean };
type Message = { id: string; name: string; email: string; subject: string; message: string; status: string; createdAt: Date };
type Project = { id: string; title: string; technologies: string[]; featured: boolean };
type Invitation = { id: string; email: string; role: string; used: boolean; expiresAt: string; createdAt: string };
type ClientProject = {
  id: string; title: string; status: string; client: { name: string; email: string };
  technologies: string[]; deadline: string | null;
};

const statusColors: Record<string, string> = {
  DISCOVERY: 'bg-purple-100 text-purple-700',
  PROPOSAL: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-orange-100 text-orange-700',
  COMPLETE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-gray-100 text-gray-600',
};

export default function AdminClient({
  users,
  messages,
  projects,
}: {
  users: User[];
  messages: Message[];
  projects: Project[];
}) {
  const [tab, setTab] = useState<'users' | 'messages' | 'projects' | 'clients' | 'invitations'>('users');
  const [msgList, setMsgList] = useState(messages);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('CLIENT');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [invitesLoaded, setInvitesLoaded] = useState(false);

  // New Client Project form state
  const [cpForm, setCpForm] = useState({
    clientId: '', title: '', description: '', status: 'DISCOVERY',
    startDate: '', deadline: '', technologies: '', budget: '',
  });
  const [cpLoading, setCpLoading] = useState(false);
  const [showCpForm, setShowCpForm] = useState(false);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      });
      setMsgList((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'READ' } : m)));
    } catch {
      toast.error('Failed to update');
    }
  };

  const loadInvitations = async () => {
    if (invitesLoaded) return;
    try {
      const res = await fetch('/api/admin/invitations');
      const data = await res.json();
      setInvitations(data.invitations || []);
      setInvitesLoaded(true);
    } catch {
      toast.error('Failed to load invitations');
    }
  };

  const loadClientProjects = async () => {
    if (clientsLoaded) return;
    try {
      const res = await fetch('/api/admin/client-projects');
      const data = await res.json();
      setClientProjects(data.projects || []);
      setClientsLoaded(true);
    } catch {
      toast.error('Failed to load client projects');
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail) return toast.error('Email is required');
    setInviteLoading(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvitations((prev) => [data.invitation, ...prev]);
      setInviteEmail('');
      toast.success(`Invitation created for ${data.invitation.email}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const revokeInvite = async (id: string) => {
    try {
      await fetch(`/api/admin/invitations?id=${id}`, { method: 'DELETE' });
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      toast.success('Invitation revoked');
    } catch {
      toast.error('Failed to revoke');
    }
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  const createClientProject = async () => {
    if (!cpForm.clientId || !cpForm.title) return toast.error('Client and title are required');
    setCpLoading(true);
    try {
      const res = await fetch('/api/admin/client-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cpForm,
          technologies: cpForm.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClientProjects((prev) => [data.project, ...prev]);
      setCpForm({ clientId: '', title: '', description: '', status: 'DISCOVERY', startDate: '', deadline: '', technologies: '', budget: '' });
      setShowCpForm(false);
      toast.success('Client project created');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCpLoading(false);
    }
  };

  const updateProjectStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/client-projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClientProjects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
      toast.success('Status updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const tabs = [
    { key: 'users', label: 'Users', icon: <FiUsers size={16} />, count: users.length },
    { key: 'messages', label: 'Messages', icon: <FiMail size={16} />, count: msgList.filter((m) => m.status === 'UNREAD').length },
    { key: 'clients', label: 'Client Projects', icon: <FiFolder size={16} />, count: null },
    { key: 'invitations', label: 'Invitations', icon: <FiLink size={16} />, count: null },
    { key: 'projects', label: 'Portfolio', icon: <FiFolder size={16} />, count: projects.length },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-12">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-teal-100">Sherwood Technology Consulting — Admin Panel</p>
        </div>
      </section>

      <div className="section-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{users.length}</div>
            <div className="text-gray-500 text-sm">Users</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{msgList.filter((m) => m.status === 'UNREAD').length}</div>
            <div className="text-gray-500 text-sm">Unread Messages</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{clientProjects.length}</div>
            <div className="text-gray-500 text-sm">Client Projects</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{invitations.filter((i) => !i.used).length}</div>
            <div className="text-gray-500 text-sm">Pending Invites</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  if (t.key === 'invitations') loadInvitations();
                  if (t.key === 'clients') loadClientProjects();
                }}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon} {t.label}
                {t.key === 'messages' && (t.count ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── Users Tab ── */}
            {tab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-medium text-gray-800">{u.name}</td>
                        <td className="py-3 text-gray-500">{u.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.role === 'ADMIN' ? 'bg-teal-50 text-brand' :
                            u.role === 'CLIENT' ? 'bg-blue-50 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Messages Tab ── */}
            {tab === 'messages' && (
              <div className="space-y-4">
                {msgList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet.</p>
                ) : (
                  msgList.map((m) => (
                    <div
                      key={m.id}
                      className={`border rounded-xl p-4 ${
                        m.status === 'UNREAD' ? 'border-teal-200 bg-teal-50/30' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{m.name}</span>
                            <span className="text-gray-400 text-sm">{m.email}</span>
                            {m.status === 'UNREAD' && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{m.subject}</p>
                          <p className="text-sm text-gray-500">{m.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(m.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {m.status === 'UNREAD' && (
                          <button onClick={() => markRead(m.id)} className="text-brand hover:text-brand-dark" title="Mark as read">
                            <FiCheck size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Client Projects Tab ── */}
            {tab === 'clients' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-800">Client Projects</h2>
                  <button
                    onClick={() => setShowCpForm(!showCpForm)}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    <FiPlus size={14} /> New Project
                  </button>
                </div>

                {showCpForm && (
                  <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">New Client Project</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Client User ID *</label>
                        <input
                          value={cpForm.clientId}
                          onChange={(e) => setCpForm({ ...cpForm, clientId: e.target.value })}
                          className="input text-sm"
                          placeholder="User ID from Users tab"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                        <input
                          value={cpForm.title}
                          onChange={(e) => setCpForm({ ...cpForm, title: e.target.value })}
                          className="input text-sm"
                          placeholder="Project title"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <textarea
                          value={cpForm.description}
                          onChange={(e) => setCpForm({ ...cpForm, description: e.target.value })}
                          className="input text-sm"
                          rows={2}
                          placeholder="Short description"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                        <select
                          value={cpForm.status}
                          onChange={(e) => setCpForm({ ...cpForm, status: e.target.value })}
                          className="input text-sm"
                        >
                          {['DISCOVERY','PROPOSAL','IN_PROGRESS','REVIEW','COMPLETE','ON_HOLD'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Technologies (comma-separated)</label>
                        <input
                          value={cpForm.technologies}
                          onChange={(e) => setCpForm({ ...cpForm, technologies: e.target.value })}
                          className="input text-sm"
                          placeholder="React, Node.js, PostgreSQL"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                        <input type="date" value={cpForm.startDate} onChange={(e) => setCpForm({ ...cpForm, startDate: e.target.value })} className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Deadline</label>
                        <input type="date" value={cpForm.deadline} onChange={(e) => setCpForm({ ...cpForm, deadline: e.target.value })} className="input text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={createClientProject} disabled={cpLoading} className="btn-primary text-sm">
                        {cpLoading ? 'Creating...' : 'Create Project'}
                      </button>
                      <button onClick={() => setShowCpForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {clientProjects.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No client projects yet.</p>
                  )}
                  {clientProjects.map((p) => (
                    <div key={p.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="font-semibold text-gray-800">{p.title}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{p.client.name} — {p.client.email}</p>
                          {p.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.technologies.map((t) => (
                                <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={p.status}
                            onChange={(e) => updateProjectStatus(p.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {['DISCOVERY','PROPOSAL','IN_PROGRESS','REVIEW','COMPLETE','ON_HOLD'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {p.deadline && (
                        <p className="text-xs text-gray-400 mt-2">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Invitations Tab ── */}
            {tab === 'invitations' && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Send Invitation</h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="input flex-1 min-w-[200px] text-sm"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="input w-32 text-sm"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="USER">USER</option>
                  </select>
                  <button onClick={sendInvite} disabled={inviteLoading} className="btn-primary text-sm whitespace-nowrap">
                    {inviteLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-gray-600 mb-3">All Invitations</h3>
                <div className="space-y-2">
                  {invitations.length === 0 && (
                    <p className="text-gray-400 text-center py-6">No invitations yet.</p>
                  )}
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-gray-100 rounded-xl p-4">
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{inv.email}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{inv.role}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${inv.used ? 'bg-green-50 text-green-600' : new Date(inv.expiresAt) < new Date() ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                            {inv.used ? 'Used' : new Date(inv.expiresAt) < new Date() ? 'Expired' : 'Pending'}
                          </span>
                          <span className="text-xs text-gray-400">Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!inv.used && new Date(inv.expiresAt) >= new Date() && (
                          <button
                            onClick={() => copyInviteLink(inv.id)}
                            className="text-brand hover:text-brand-dark text-xs flex items-center gap-1"
                            title="Copy invite link"
                          >
                            <FiLink size={14} /> Copy Link
                          </button>
                        )}
                        <button
                          onClick={() => revokeInvite(inv.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Revoke invitation"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Portfolio Projects Tab ── */}
            {tab === 'projects' && (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{p.title}</span>
                        {p.featured && (
                          <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full">Featured</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologies.map((t) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}