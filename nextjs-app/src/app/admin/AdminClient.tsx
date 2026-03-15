'use client';

import { useState } from 'react';
import { FiUsers, FiMail, FiFolder, FiCheck, FiLink, FiTrash2, FiPlus, FiTrendingUp, FiRadio, FiCopy, FiEdit2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

type User = { id: string; name: string; email: string; role: string; createdAt: Date; isActive: boolean };
type Message = { id: string; name: string; email: string; subject: string; message: string; status: string; createdAt: Date };
type Project = { id: string; title: string; technologies: string[]; featured: boolean };
type Invitation = { id: string; email: string; role: string; used: boolean; expiresAt: string; createdAt: string };
type ClientProject = {
  id: string; title: string; status: string; client: { name: string; email: string };
  technologies: string[]; deadline: string | null;
};
type Inquiry = {
  id: string; name: string; email: string; company: string | null;
  projectType: string; serviceCategory: string; title: string;
  description: string; complexity: string; features: string[];
  estimatedLow: number; estimatedHigh: number; estimatedWeeks: number;
  desiredTimeline: string; status: string; adminNotes: string | null;
  utmSource: string | null; utmCampaign: string | null; utmMedium: string | null;
  createdAt: string;
};

type CampaignPost = {
  id: string; campaignId: string; platform: string; content: string;
  status: string; scheduledAt: string | null; notes: string | null; createdAt: string;
};

type Campaign = {
  id: string; name: string; goal: string | null; platforms: string[];
  status: string; startDate: string | null; endDate: string | null;
  notes: string | null; utmSlug: string; createdAt: string;
  posts: { id: string; platform: string; status: string }[];
  leadCount: number;
};

const statusColors: Record<string, string> = {
  DISCOVERY: 'bg-purple-100 text-purple-700',
  PROPOSAL: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-orange-100 text-orange-700',
  COMPLETE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-[#1A2535] text-slate-400',
};

export default function AdminClient({
  users,
  messages,
  projects,
  inquiries: initialInquiries,
}: {
  users: User[];
  messages: Message[];
  projects: Project[];
  inquiries: Inquiry[];
}) {
  const [tab, setTab] = useState<'users' | 'messages' | 'projects' | 'clients' | 'invitations' | 'leads' | 'campaigns'>('users');
  const [msgList, setMsgList] = useState(messages);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('CLIENT');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [invitesLoaded, setInvitesLoaded] = useState(false);

  // ── Campaign state ──────────────────────────────────────────────────────────
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignPosts, setCampaignPosts] = useState<CampaignPost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CampaignPost | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '', goal: '', platforms: [] as string[], status: 'DRAFT',
    startDate: '', endDate: '', notes: '', utmSlug: '',
  });
  const [postForm, setPostForm] = useState({
    platform: 'linkedin', content: '', status: 'DRAFT', scheduledAt: '', notes: '',
  });
  const [campaignLoading, setCampaignLoading] = useState(false);

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

  const updateInquiryStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const res = await fetch(`/api/pricing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status, adminNotes: adminNotes ?? i.adminNotes } : i));
      if (selectedInquiry?.id === id) setSelectedInquiry((prev) => prev ? { ...prev, status, adminNotes: adminNotes ?? prev.adminNotes } : null);
      toast.success('Lead updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await fetch(`/api/pricing/${id}`, { method: 'DELETE' });
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ── Campaign functions ──────────────────────────────────────────────────────
  const loadCampaigns = async () => {
    if (campaignsLoaded) return;
    try {
      const res = await fetch('/api/admin/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setCampaignsLoaded(true);
    } catch {
      toast.error('Failed to load campaigns');
    }
  };

  const loadCampaignPosts = async (campaignId: string) => {
    setPostsLoaded(false);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/posts`);
      const data = await res.json();
      setCampaignPosts(data.posts || []);
      setPostsLoaded(true);
    } catch {
      toast.error('Failed to load posts');
    }
  };

  const createCampaign = async () => {
    if (!campaignForm.name || !campaignForm.utmSlug) return toast.error('Name and UTM slug required');
    setCampaignLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaigns((prev) => [{ ...data.campaign, posts: [], leadCount: 0 }, ...prev]);
      setCampaignForm({ name: '', goal: '', platforms: [], status: 'DRAFT', startDate: '', endDate: '', notes: '', utmSlug: '' });
      setShowCampaignForm(false);
      toast.success('Campaign created');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCampaignLoading(false);
    }
  };

  const updateCampaignStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      if (selectedCampaign?.id === id) setSelectedCampaign((prev) => prev ? { ...prev, status } : null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign and all its posts?')) return;
    try {
      await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (selectedCampaign?.id === id) { setSelectedCampaign(null); setCampaignPosts([]); }
      toast.success('Campaign deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const createPost = async () => {
    if (!selectedCampaign || !postForm.content) return toast.error('Content is required');
    setCampaignLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${selectedCampaign.id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaignPosts((prev) => [data.post, ...prev]);
      setPostForm({ platform: 'linkedin', content: '', status: 'DRAFT', scheduledAt: '', notes: '' });
      setShowPostForm(false);
      toast.success('Post saved');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCampaignLoading(false);
    }
  };

  const updatePost = async () => {
    if (!editingPost || !selectedCampaign) return;
    setCampaignLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${selectedCampaign.id}/posts/${editingPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaignPosts((prev) => prev.map((p) => p.id === editingPost.id ? data.post : p));
      setEditingPost(null);
      setPostForm({ platform: 'linkedin', content: '', status: 'DRAFT', scheduledAt: '', notes: '' });
      setShowPostForm(false);
      toast.success('Post updated');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCampaignLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!selectedCampaign) return;
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/admin/campaigns/${selectedCampaign.id}/posts/${postId}`, { method: 'DELETE' });
      setCampaignPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const copyUtmLink = (slug: string) => {
    const url = `${window.location.origin}/pricing?utm_source=linkedin&utm_medium=social&utm_campaign=${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('UTM link copied!');
  };

  const tabs = [
    { key: 'users',       label: 'Users',           icon: <FiUsers size={16} />,      count: users.length },
    { key: 'messages',    label: 'Messages',         icon: <FiMail size={16} />,       count: msgList.filter((m) => m.status === 'UNREAD').length },
    { key: 'leads',       label: 'Leads',            icon: <FiTrendingUp size={16} />, count: inquiries.filter((i) => i.status === 'NEW').length },
    { key: 'campaigns',   label: 'Campaigns',        icon: <FiRadio size={16} />,      count: campaigns.filter((c) => c.status === 'ACTIVE').length },
    { key: 'clients',     label: 'Client Projects',  icon: <FiFolder size={16} />,     count: null },
    { key: 'invitations', label: 'Invitations',      icon: <FiLink size={16} />,       count: null },
    { key: 'projects',    label: 'Portfolio',        icon: <FiFolder size={16} />,     count: projects.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0F1923]">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] text-white py-12">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-brand/70">Sherwood Technology Consulting — Admin Panel</p>
        </div>
      </section>

      <div className="section-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A2535] rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{users.length}</div>
            <div className="text-slate-500 text-sm">Users</div>
          </div>
          <div className="bg-[#1A2535] rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{msgList.filter((m) => m.status === 'UNREAD').length}</div>
            <div className="text-slate-500 text-sm">Unread Messages</div>
          </div>
          <div className="bg-[#1A2535] rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{inquiries.filter((i) => i.status === 'NEW').length}</div>
            <div className="text-slate-500 text-sm">New Leads</div>
          </div>
          <div className="bg-[#1A2535] rounded-xl shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-brand mb-1">{invitations.filter((i) => !i.used).length}</div>
            <div className="text-slate-500 text-sm">Pending Invites</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1A2535] rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-[#243044] overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  if (t.key === 'invitations') loadInvitations();
                  if (t.key === 'clients') loadClientProjects();
                  if (t.key === 'campaigns') loadCampaigns();
                }}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {t.icon} {t.label}
                {(t.key === 'messages' || t.key === 'leads') && (t.count ?? 0) > 0 && (
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
                    <tr className="text-left text-slate-500 border-b border-[#243044]">
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
                        <td className="py-3 font-medium text-white">{u.name}</td>
                        <td className="py-3 text-slate-500">{u.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.role === 'ADMIN' ? 'bg-brand/10 text-brand' :
                            u.role === 'CLIENT' ? 'bg-blue-50 text-blue-600' :
                            'bg-[#1A2535] text-slate-400'
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
                        <td className="py-3 text-slate-600">
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
                  <p className="text-slate-500 text-center py-8">No messages yet.</p>
                ) : (
                  msgList.map((m) => (
                    <div
                      key={m.id}
                      className={`border rounded-xl p-4 ${
                        m.status === 'UNREAD' ? 'border-teal-200 bg-brand/10/30' : 'border-[#243044]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{m.name}</span>
                            <span className="text-slate-600 text-sm">{m.email}</span>
                            {m.status === 'UNREAD' && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-200 mb-1">{m.subject}</p>
                          <p className="text-sm text-slate-500">{m.message}</p>
                          <p className="text-xs text-slate-600 mt-2">
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
                  <h2 className="text-lg font-bold text-white">Client Projects</h2>
                  <button
                    onClick={() => setShowCpForm(!showCpForm)}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    <FiPlus size={14} /> New Project
                  </button>
                </div>

                {showCpForm && (
                  <div className="bg-[#0F1923] rounded-xl p-5 mb-6 border border-[#243044]">
                    <h3 className="font-semibold text-slate-200 mb-4">New Client Project</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Client User ID *</label>
                        <input
                          value={cpForm.clientId}
                          onChange={(e) => setCpForm({ ...cpForm, clientId: e.target.value })}
                          className="input text-sm"
                          placeholder="User ID from Users tab"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Title *</label>
                        <input
                          value={cpForm.title}
                          onChange={(e) => setCpForm({ ...cpForm, title: e.target.value })}
                          className="input text-sm"
                          placeholder="Project title"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                        <textarea
                          value={cpForm.description}
                          onChange={(e) => setCpForm({ ...cpForm, description: e.target.value })}
                          className="input text-sm"
                          rows={2}
                          placeholder="Short description"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
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
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Technologies (comma-separated)</label>
                        <input
                          value={cpForm.technologies}
                          onChange={(e) => setCpForm({ ...cpForm, technologies: e.target.value })}
                          className="input text-sm"
                          placeholder="React, Node.js, PostgreSQL"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                        <input type="date" value={cpForm.startDate} onChange={(e) => setCpForm({ ...cpForm, startDate: e.target.value })} className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Deadline</label>
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
                    <p className="text-slate-600 text-center py-8">No client projects yet.</p>
                  )}
                  {clientProjects.map((p) => (
                    <div key={p.id} className="border border-[#243044] rounded-xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="font-semibold text-white">{p.title}</span>
                          <p className="text-xs text-slate-600 mt-0.5">{p.client.name} — {p.client.email}</p>
                          {p.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.technologies.map((t) => (
                                <span key={t} className="text-xs bg-[#1A2535] text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={p.status}
                            onChange={(e) => updateProjectStatus(p.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[p.status] || 'bg-[#1A2535] text-slate-400'}`}
                          >
                            {['DISCOVERY','PROPOSAL','IN_PROGRESS','REVIEW','COMPLETE','ON_HOLD'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {p.deadline && (
                        <p className="text-xs text-slate-600 mt-2">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Invitations Tab ── */}
            {tab === 'invitations' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Send Invitation</h2>
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

                <h3 className="text-sm font-semibold text-slate-400 mb-3">All Invitations</h3>
                <div className="space-y-2">
                  {invitations.length === 0 && (
                    <p className="text-slate-600 text-center py-6">No invitations yet.</p>
                  )}
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-[#243044] rounded-xl p-4">
                      <div>
                        <span className="font-medium text-white text-sm">{inv.email}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{inv.role}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${inv.used ? 'bg-green-50 text-green-600' : new Date(inv.expiresAt) < new Date() ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                            {inv.used ? 'Used' : new Date(inv.expiresAt) < new Date() ? 'Expired' : 'Pending'}
                          </span>
                          <span className="text-xs text-slate-600">Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
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

            {/* ── Leads Tab ── */}
            {tab === 'leads' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Lead list */}
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">
                    Project Inquiries ({inquiries.length})
                  </h2>
                  {inquiries.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No inquiries yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {inquiries.map((inq) => (
                        <button
                          key={inq.id}
                          onClick={() => setSelectedInquiry(inq)}
                          className={`w-full text-left border rounded-xl p-4 transition-all ${
                            selectedInquiry?.id === inq.id
                              ? 'border-brand bg-brand/5'
                              : 'border-[#243044] hover:border-brand/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm truncate">{inq.title}</p>
                              <p className="text-xs text-slate-500">{inq.name} — {inq.email}</p>
                              {inq.company && <p className="text-xs text-slate-600">{inq.company}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                inq.status === 'NEW' ? 'bg-red-50 text-red-500' :
                                inq.status === 'REVIEWED' ? 'bg-yellow-50 text-yellow-600' :
                                inq.status === 'PROPOSAL_SENT' ? 'bg-blue-50 text-blue-600' :
                                inq.status === 'CONVERTED' ? 'bg-green-50 text-green-600' :
                                'bg-[#1A2535] text-slate-500'
                              }`}>
                                {inq.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-600">
                                ${inq.estimatedLow.toLocaleString()}–${inq.estimatedHigh.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                            <span className="capitalize">{inq.projectType}</span>
                            <span>·</span>
                            <span className="capitalize">{inq.serviceCategory || 'pilot'}</span>
                            <span>·</span>
                            <span>{inq.estimatedWeeks}w</span>
                            <span>·</span>
                            <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lead detail / proposal */}
                <div>
                  {!selectedInquiry ? (
                    <div className="border border-dashed border-[#243044] rounded-xl p-8 text-center text-slate-600 text-sm h-full flex items-center justify-center">
                      Select a lead to view the full proposal
                    </div>
                  ) : (
                    <div className="border border-[#243044] rounded-xl p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white text-lg">{selectedInquiry.title}</h3>
                          <p className="text-sm text-slate-500">{selectedInquiry.name} · {selectedInquiry.email}</p>
                          {selectedInquiry.company && <p className="text-xs text-slate-600">{selectedInquiry.company}</p>}
                        </div>
                        <button onClick={() => deleteInquiry(selectedInquiry.id)} className="text-red-400 hover:text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      {/* Estimate highlight */}
                      <div className="bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] text-white rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-brand/70 text-xs mb-0.5">Estimate</div>
                          <div className="font-bold text-sm">${selectedInquiry.estimatedLow.toLocaleString()}–${selectedInquiry.estimatedHigh.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-brand/70 text-xs mb-0.5">Timeline</div>
                          <div className="font-bold text-sm">{selectedInquiry.estimatedWeeks} weeks</div>
                        </div>
                        <div>
                          <div className="text-brand/70 text-xs mb-0.5">Type</div>
                          <div className="font-bold text-sm capitalize">{selectedInquiry.projectType}</div>
                        </div>
                      </div>

                      {/* Details */}
                      <dl className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Category</dt>
                          <dd className="font-medium capitalize">{selectedInquiry.serviceCategory || 'Pilot'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Complexity</dt>
                          <dd className="font-medium capitalize">{selectedInquiry.complexity}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Timeline preference</dt>
                          <dd className="font-medium capitalize">{selectedInquiry.desiredTimeline.replace('month', ' month')}</dd>
                        </div>
                      </dl>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{selectedInquiry.description}</p>
                      </div>

                      {selectedInquiry.features.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2">Selected Features</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedInquiry.features.map((f) => (
                              <span key={f} className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin controls */}
                      <div className="border-t border-[#243044] pt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Update Status</label>
                          <select
                            value={selectedInquiry.status}
                            onChange={(e) => updateInquiryStatus(selectedInquiry.id, e.target.value)}
                            className="input text-sm w-full"
                          >
                            <option value="NEW">New</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="PROPOSAL_SENT">Proposal Sent</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="DECLINED">Declined</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Internal Notes</label>
                          <textarea
                            className="input text-sm w-full"
                            rows={3}
                            placeholder="Notes visible only to admin..."
                            defaultValue={selectedInquiry.adminNotes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (selectedInquiry.adminNotes || '')) {
                                updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, e.target.value);
                              }
                            }}
                          />
                        </div>
                        <a
                          href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.title)} — STC Proposal&body=Hi ${encodeURIComponent(selectedInquiry.name)},%0A%0AThank you for submitting your project inquiry to Sherwood Technology Consulting.%0A%0ABased on your submission, here is our preliminary proposal...%0A%0AProject: ${encodeURIComponent(selectedInquiry.title)}%0AEstimate: $${selectedInquiry.estimatedLow.toLocaleString()} – $${selectedInquiry.estimatedHigh.toLocaleString()}%0ATimeline: ${selectedInquiry.estimatedWeeks} weeks%0A%0A`}
                          className="btn-primary text-sm w-full text-center block"
                        >
                          ✉ Draft Proposal Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Campaigns Tab ── */}
            {tab === 'campaigns' && (
              <div className="flex gap-6 min-h-[500px]">
                {/* Left — Campaign List */}
                <div className="w-72 shrink-0 border-r border-[#243044] pr-4 space-y-2">
                  <button
                    onClick={() => { setShowCampaignForm(true); setShowPostForm(false); setSelectedCampaign(null); }}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2 mb-3"
                  >
                    <FiPlus size={14} /> New Campaign
                  </button>
                  {campaigns.length === 0 && (
                    <p className="text-slate-600 text-sm text-center py-8">No campaigns yet</p>
                  )}
                  {campaigns.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCampaign(c);
                        setShowCampaignForm(false);
                        setShowPostForm(false);
                        loadCampaignPosts(c.id);
                      }}
                      className={`w-full text-left rounded-xl p-3 border transition-colors ${
                        selectedCampaign?.id === c.id
                          ? 'border-brand bg-brand/5'
                          : 'border-[#243044] hover:border-[#243044] bg-[#1A2535]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-medium text-sm text-white leading-snug">{c.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                          c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          c.status === 'DRAFT' ? 'bg-[#1A2535] text-slate-500' :
                          c.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                          c.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-600'
                        }`}>{c.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                        <span>{c.posts.length} posts</span>
                        <span>{c.leadCount} leads</span>
                        <span>{c.platforms.join(', ')}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right — Campaign Detail or New Form */}
                <div className="flex-1 min-w-0">
                  {/* New Campaign Form */}
                  {showCampaignForm && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">New Campaign</h3>
                        <button onClick={() => setShowCampaignForm(false)}><FiX size={18} className="text-slate-600" /></button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign Name *</label>
                          <input className="input w-full" placeholder="e.g. Salesforce Pilot Launch Q2"
                            value={campaignForm.name} onChange={(e) => setCampaignForm((p) => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">UTM Slug * <span className="text-slate-600 font-normal">(lowercase, hyphens only)</span></label>
                          <input className="input w-full font-mono" placeholder="e.g. sf-pilot-q2-2026"
                            value={campaignForm.utmSlug} onChange={(e) => setCampaignForm((p) => ({ ...p, utmSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} />
                          {campaignForm.utmSlug && (
                            <p className="text-xs text-slate-600 mt-1">
                              Link: <span className="font-mono">/pricing?utm_source=linkedin&utm_campaign={campaignForm.utmSlug}</span>
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Goal</label>
                          <input className="input w-full" placeholder="e.g. Generate 5 Salesforce pilot leads"
                            value={campaignForm.goal} onChange={(e) => setCampaignForm((p) => ({ ...p, goal: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Platforms</label>
                          <div className="flex flex-wrap gap-2">
                            {['linkedin', 'twitter', 'email', 'other'].map((p) => (
                              <button key={p} onClick={() => setCampaignForm((prev) => ({
                                ...prev,
                                platforms: prev.platforms.includes(p) ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p],
                              }))}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                  campaignForm.platforms.includes(p) ? 'bg-brand text-white border-brand' : 'bg-[#1A2535] text-slate-400 border-[#243044]'
                                }`}
                              >{p}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                          <select className="input w-full" value={campaignForm.status}
                            onChange={(e) => setCampaignForm((p) => ({ ...p, status: e.target.value }))}>
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PAUSED">Paused</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                          <input type="date" className="input w-full" value={campaignForm.startDate}
                            onChange={(e) => setCampaignForm((p) => ({ ...p, startDate: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
                          <input type="date" className="input w-full" value={campaignForm.endDate}
                            onChange={(e) => setCampaignForm((p) => ({ ...p, endDate: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Notes</label>
                          <textarea className="input w-full" rows={2} placeholder="What's the strategy for this campaign?"
                            value={campaignForm.notes} onChange={(e) => setCampaignForm((p) => ({ ...p, notes: e.target.value }))} />
                        </div>
                      </div>
                      <button onClick={createCampaign} disabled={campaignLoading} className="btn-primary text-sm">
                        {campaignLoading ? 'Creating...' : 'Create Campaign'}
                      </button>
                    </div>
                  )}

                  {/* Campaign Detail */}
                  {selectedCampaign && !showCampaignForm && (
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white text-lg">{selectedCampaign.name}</h3>
                          {selectedCampaign.goal && <p className="text-slate-500 text-sm mt-0.5">{selectedCampaign.goal}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={selectedCampaign.status}
                            onChange={(e) => updateCampaignStatus(selectedCampaign.id, e.target.value)}
                            className="input text-sm"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PAUSED">Paused</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                          <button onClick={() => deleteCampaign(selectedCampaign.id)} className="text-red-400 hover:text-red-600 p-1">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#0F1923] rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-brand">{selectedCampaign.leadCount}</div>
                          <div className="text-xs text-slate-500">Leads Attributed</div>
                        </div>
                        <div className="bg-[#0F1923] rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-brand">{campaignPosts.length}</div>
                          <div className="text-xs text-slate-500">Posts</div>
                        </div>
                        <div className="bg-[#0F1923] rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-brand">
                            {campaignPosts.filter((p) => p.status === 'PUBLISHED').length}
                          </div>
                          <div className="text-xs text-slate-500">Published</div>
                        </div>
                      </div>

                      {/* UTM Link */}
                      <div className="bg-brand/5 border border-brand/20 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-400 mb-0.5">Campaign UTM Link</div>
                            <div className="font-mono text-xs text-slate-200 truncate">
                              /pricing?utm_source=linkedin&utm_medium=social&utm_campaign={selectedCampaign.utmSlug}
                            </div>
                          </div>
                          <button onClick={() => copyUtmLink(selectedCampaign.utmSlug)}
                            className="shrink-0 flex items-center gap-1.5 text-brand text-xs font-semibold hover:underline">
                            <FiCopy size={13} /> Copy
                          </button>
                        </div>
                      </div>

                      {/* Posts */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-200 text-sm">Posts</h4>
                          <button
                            onClick={() => {
                              setEditingPost(null);
                              setPostForm({ platform: 'linkedin', content: '', status: 'DRAFT', scheduledAt: '', notes: '' });
                              setShowPostForm(true);
                            }}
                            className="flex items-center gap-1 text-brand text-sm font-semibold hover:underline"
                          >
                            <FiPlus size={14} /> Add Post
                          </button>
                        </div>

                        {/* Post form */}
                        {showPostForm && (
                          <div className="bg-[#0F1923] rounded-xl p-4 mb-4 space-y-3 border border-[#243044]">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-200">{editingPost ? 'Edit Post' : 'New Post'}</span>
                              <button onClick={() => { setShowPostForm(false); setEditingPost(null); }}><FiX size={16} className="text-slate-600" /></button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Platform</label>
                                <select className="input w-full text-sm" value={postForm.platform}
                                  onChange={(e) => setPostForm((p) => ({ ...p, platform: e.target.value }))}>
                                  <option value="linkedin">LinkedIn</option>
                                  <option value="twitter">Twitter / X</option>
                                  <option value="email">Email</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                                <select className="input w-full text-sm" value={postForm.status}
                                  onChange={(e) => setPostForm((p) => ({ ...p, status: e.target.value }))}>
                                  <option value="DRAFT">Draft</option>
                                  <option value="READY">Ready</option>
                                  <option value="PUBLISHED">Published</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-semibold text-slate-400">Content *</label>
                                  <span className={`text-xs ${
                                    postForm.platform === 'twitter' && postForm.content.length > 260 ? 'text-red-500' :
                                    postForm.platform === 'twitter' && postForm.content.length > 230 ? 'text-yellow-500' :
                                    'text-slate-600'
                                  }`}>
                                    {postForm.content.length}
                                    {postForm.platform === 'twitter' && ' / 280'}
                                    {postForm.platform === 'linkedin' && ' / 3000'}
                                  </span>
                                </div>
                                <textarea
                                  className="input w-full text-sm font-mono"
                                  rows={6}
                                  placeholder={postForm.platform === 'linkedin'
                                    ? "Write your LinkedIn post here...\n\nTip: Start with a hook, add value, end with a CTA linking to your UTM URL."
                                    : postForm.platform === 'twitter'
                                    ? "Write your tweet here (280 chars max)..."
                                    : "Write your post content here..."}
                                  value={postForm.content}
                                  onChange={(e) => setPostForm((p) => ({ ...p, content: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Scheduled Date</label>
                                <input type="datetime-local" className="input w-full text-sm" value={postForm.scheduledAt}
                                  onChange={(e) => setPostForm((p) => ({ ...p, scheduledAt: e.target.value }))} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Notes</label>
                                <input className="input w-full text-sm" placeholder="Hashtags, target audience..."
                                  value={postForm.notes} onChange={(e) => setPostForm((p) => ({ ...p, notes: e.target.value }))} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={editingPost ? updatePost : createPost}
                                disabled={campaignLoading}
                                className="btn-primary text-sm"
                              >
                                {campaignLoading ? 'Saving...' : editingPost ? 'Update Post' : 'Save Post'}
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    postForm.content + `\n\n👉 ${window.location.origin}/pricing?utm_source=${postForm.platform}&utm_medium=social&utm_campaign=${selectedCampaign.utmSlug}`
                                  );
                                  toast.success('Post + UTM link copied!');
                                }}
                                className="btn-secondary text-sm flex items-center gap-1.5"
                              >
                                <FiCopy size={13} /> Copy with Link
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Posts list */}
                        {!postsLoaded && <p className="text-slate-600 text-sm">Loading posts...</p>}
                        {postsLoaded && campaignPosts.length === 0 && (
                          <p className="text-slate-600 text-sm text-center py-6">No posts yet — add your first one above</p>
                        )}
                        <div className="space-y-3">
                          {campaignPosts.map((post) => (
                            <div key={post.id} className="border border-[#243044] rounded-xl p-4 bg-[#1A2535]">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-[#1A2535] text-slate-400 px-2 py-0.5 rounded-full capitalize">{post.platform}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                    post.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                                    'bg-[#1A2535] text-slate-500'
                                  }`}>{post.status}</span>
                                  {post.scheduledAt && (
                                    <span className="text-xs text-slate-600">
                                      📅 {new Date(post.scheduledAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        post.content + `\n\n👉 ${window.location.origin}/pricing?utm_source=${post.platform}&utm_medium=social&utm_campaign=${selectedCampaign.utmSlug}`
                                      );
                                      toast.success('Copied!');
                                    }}
                                    className="text-slate-600 hover:text-brand p-1"
                                    title="Copy post + link"
                                  ><FiCopy size={14} /></button>
                                  <button
                                    onClick={() => {
                                      setEditingPost(post);
                                      setPostForm({ platform: post.platform, content: post.content, status: post.status, scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : '', notes: post.notes || '' });
                                      setShowPostForm(true);
                                    }}
                                    className="text-slate-600 hover:text-brand p-1"
                                  ><FiEdit2 size={14} /></button>
                                  <button onClick={() => deletePost(post.id)} className="text-slate-600 hover:text-red-500 p-1">
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed line-clamp-4">{post.content}</p>
                              {post.notes && <p className="text-xs text-slate-600 mt-2 italic">{post.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedCampaign && !showCampaignForm && (
                    <div className="flex items-center justify-center h-full text-slate-600 text-sm">
                      ← Select a campaign or create a new one
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Portfolio Projects Tab ── */}
            {tab === 'projects' && (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border border-[#243044] rounded-xl p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{p.title}</span>
                        {p.featured && (
                          <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full">Featured</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologies.map((t) => (
                          <span key={t} className="text-xs bg-[#1A2535] text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
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