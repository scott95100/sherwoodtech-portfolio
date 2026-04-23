'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiMail, FiFolder, FiCheck, FiLink, FiTrash2, FiPlus, FiTrendingUp, FiRadio, FiCopy, FiEdit2, FiX, FiDollarSign, FiSend, FiExternalLink, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getSiteTrafficOptOut, setSiteTrafficOptOut, SITE_TRAFFIC_OPTOUT_KEY, SITE_TRAFFIC_SESSION_KEY } from '@/lib/siteTraffic';

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

type BetaApplication = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  role: string | null;
  teamSize: string | null;
  environmentCount: number | null;
  toolStack: string[];
  useCase: string | null;
  biggestPain: string | null;
  managesClientWorkloads: boolean;
  willingToInterview: boolean;
  linkedinUrl: string | null;
  notes: string | null;
  status: 'NEW' | 'REVIEWING' | 'APPROVED' | 'WAITLISTED' | 'REJECTED';
  adminNotes: string | null;
  reviewedAt: string | Date | null;
  contactedAt: string | Date | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  landingPath: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type InvoiceLineItem = { description: string; amount: number };
type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  description: string | null;
  lineItems: InvoiceLineItem[];
  amount: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  adminNotes: string | null;
  client: { id: string; name: string; email: string };
  createdAt: string;
};

type CampaignPost = {
  id: string; campaignId: string; platform: string; content: string;
  status: string; scheduledAt: string | null; notes: string | null; createdAt: string;
};

type Campaign = {
  id: string; name: string; goal: string | null; platforms: string[];
  status: string; landingPath: string; startDate: string | null; endDate: string | null;
  notes: string | null; utmSlug: string; createdAt: string;
  posts: { id: string; platform: string; status: string }[];
  clickCount: number;
  landingCount: number;
  pricingLeadCount: number;
  betaApplicationCount: number;
  conversionCount: number;
};

type SiteTrafficPage = { path: string; views: number; lastVisitedAt: string };
type SiteTrafficReferrer = { source: string; views: number };
type SiteTrafficVisit = { id: string; path: string; source: string; createdAt: string };
type SiteTraffic = {
  available: boolean;
  totalViews: number;
  viewsToday: number;
  views7d: number;
  uniqueVisitors7d: number;
  uniqueVisitors30d: number;
  topPages: SiteTrafficPage[];
  topReferrers: SiteTrafficReferrer[];
  recentVisits: SiteTrafficVisit[];
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
  betaApplications: initialBetaApplications,
}: {
  users: User[];
  messages: Message[];
  projects: Project[];
  inquiries: Inquiry[];
  betaApplications: BetaApplication[];
}) {
  const [tab, setTab] = useState<'users' | 'messages' | 'projects' | 'clients' | 'invitations' | 'leads' | 'beta' | 'campaigns' | 'traffic' | 'invoices'>('users');
  const [userList, setUserList] = useState(users);
  const [msgList, setMsgList] = useState(messages);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [betaApplications, setBetaApplications] = useState<BetaApplication[]>(initialBetaApplications);
  const [selectedBetaApplication, setSelectedBetaApplication] = useState<BetaApplication | null>(null);
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
  const [campaignSlugEdited, setCampaignSlugEdited] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '', goal: '', platforms: [] as string[], status: 'DRAFT', landingPath: '/pricing',
    startDate: '', endDate: '', notes: '', utmSlug: '',
  });
  const [postForm, setPostForm] = useState({
    platform: 'linkedin', content: '', status: 'DRAFT', scheduledAt: '', notes: '',
  });
  const [campaignLoading, setCampaignLoading] = useState(false);

  // ── Invoice state ───────────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoaded, setInvoicesLoaded] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    title: '',
    description: '',
    dueDate: '',
    lineItems: [{ description: '', amount: '' }] as { description: string; amount: string }[],
  });

  // New Client Project form state
  const [cpForm, setCpForm] = useState({
    clientId: '', title: '', description: '', status: 'DISCOVERY',
    startDate: '', deadline: '', technologies: '', budget: '',
  });
  const [cpLoading, setCpLoading] = useState(false);
  const [showCpForm, setShowCpForm] = useState(false);
  const [trafficLoaded, setTrafficLoaded] = useState(false);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficOptOut, setTrafficOptOutState] = useState(false);
  const [siteTraffic, setSiteTraffic] = useState<SiteTraffic>({
    available: false,
    totalViews: 0,
    viewsToday: 0,
    views7d: 0,
    uniqueVisitors7d: 0,
    uniqueVisitors30d: 0,
    topPages: [],
    topReferrers: [],
    recentVisits: [],
  });

  useEffect(() => {
    setTrafficOptOutState(getSiteTrafficOptOut());
  }, []);

  const updateTrafficOptOut = (value: boolean) => {
    setSiteTrafficOptOut(value);
    setTrafficOptOutState(value);
    window.dispatchEvent(new Event(SITE_TRAFFIC_OPTOUT_KEY));
    toast.success(value ? 'This browser will be ignored in site traffic' : 'This browser will be tracked again');
  };

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
      if (data.emailDelivery?.status === 'sent') {
        toast.success(`Invitation created and emailed to ${data.invitation.email}`);
      } else if (data.emailDelivery?.status === 'failed') {
        toast.error(`Invitation created, but email delivery failed: ${data.emailDelivery.reason || 'Unknown error'}`);
      } else if (data.emailDelivery?.status === 'skipped') {
        toast.error(`Invitation created, but email delivery is not configured: ${data.emailDelivery.reason || 'Missing email settings'}`);
      } else {
        toast.success(`Invitation created for ${data.invitation.email}`);
      }
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

  const updateBetaApplication = async (
    id: string,
    payload: { status?: BetaApplication['status']; adminNotes?: string; contactedAt?: string | null }
  ) => {
    try {
      const res = await fetch(`/api/admin/beta-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBetaApplications((prev) => prev.map((application) => (
        application.id === id ? data.application : application
      )));
      if (selectedBetaApplication?.id === id) {
        setSelectedBetaApplication(data.application);
      }
      toast.success('Beta application updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update beta application');
    }
  };

  const deleteBetaApplication = async (id: string) => {
    if (!confirm('Delete this beta application?')) return;
    try {
      const res = await fetch(`/api/admin/beta-applications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBetaApplications((prev) => prev.filter((application) => application.id !== id));
      if (selectedBetaApplication?.id === id) setSelectedBetaApplication(null);
      toast.success('Beta application deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete beta application');
    }
  };

  const loadSiteTraffic = async () => {
    if (trafficLoaded) return;
    setTrafficLoading(true);
    try {
      const res = await fetch('/api/admin/site-traffic');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSiteTraffic(data);
      setTrafficLoaded(true);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load site traffic');
    } finally {
      setTrafficLoading(false);
    }
  };

  const refreshSiteTraffic = async () => {
    setTrafficLoaded(false);
    setTrafficLoading(true);
    try {
      const res = await fetch('/api/admin/site-traffic');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSiteTraffic(data);
      setTrafficLoaded(true);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load site traffic');
    } finally {
      setTrafficLoading(false);
    }
  };

  const deleteMyTrafficVisits = async () => {
    const sessionId = window.sessionStorage.getItem(SITE_TRAFFIC_SESSION_KEY);
    if (!sessionId) {
      toast.error('No browser traffic session found');
      return;
    }

    if (!confirm('Delete traffic records collected from this browser session?')) return;

    try {
      const res = await fetch(`/api/admin/site-traffic?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Deleted ${data.deletedCount} visit${data.deletedCount === 1 ? '' : 's'} from this browser session`);
      await refreshSiteTraffic();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete visits');
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
      setCampaigns((prev) => [{
        ...data.campaign,
        posts: [],
        pricingLeadCount: 0,
        betaApplicationCount: 0,
        conversionCount: 0,
        clickCount: 0,
        landingCount: 0,
      }, ...prev]);
      setCampaignForm({ name: '', goal: '', platforms: [], status: 'DRAFT', landingPath: '/pricing', startDate: '', endDate: '', notes: '', utmSlug: '' });
      setCampaignSlugEdited(false);
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

  const syncCampaignPostSummary = (
    campaignId: string,
    updatePosts: (posts: Array<{ id: string; platform: string; status: string }>) => Array<{ id: string; platform: string; status: string }>
  ) => {
    setCampaigns((prev) => prev.map((campaign) => (
      campaign.id === campaignId
        ? { ...campaign, posts: updatePosts(campaign.posts) }
        : campaign
    )));

    setSelectedCampaign((prev) => (
      prev && prev.id === campaignId
        ? { ...prev, posts: updatePosts(prev.posts) }
        : prev
    ));
  };

  const createPost = async (openInLinkedIn = false) => {
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
      syncCampaignPostSummary(selectedCampaign.id, (posts) => [
        { id: data.post.id, platform: data.post.platform, status: data.post.status },
        ...posts,
      ]);
      setPostForm({ platform: 'linkedin', content: '', status: 'DRAFT', scheduledAt: '', notes: '' });
      setShowPostForm(false);
      toast.success('Post saved');
      if (openInLinkedIn) {
        openLinkedInWithCopiedPost(data.post.content, selectedCampaign.utmSlug);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCampaignLoading(false);
    }
  };

  const updatePost = async (openInLinkedIn = false) => {
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
      syncCampaignPostSummary(selectedCampaign.id, (posts) => posts.map((post) => (
        post.id === editingPost.id
          ? { ...post, platform: data.post.platform, status: data.post.status }
          : post
      )));
      setEditingPost(null);
      setPostForm({ platform: 'linkedin', content: '', status: 'DRAFT', scheduledAt: '', notes: '' });
      setShowPostForm(false);
      toast.success('Post updated');
      if (openInLinkedIn) {
        openLinkedInWithCopiedPost(data.post.content, selectedCampaign.utmSlug);
      }
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
      syncCampaignPostSummary(selectedCampaign.id, (posts) => posts.filter((post) => post.id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ── Invoice functions ─────────────────────────────────────────────────────
  const loadInvoices = async () => {
    if (invoicesLoaded) return;
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data.invoices || []);
      setInvoicesLoaded(true);
    } catch {
      toast.error('Failed to load invoices');
    }
  };

  const createInvoice = async () => {
    if (!invoiceForm.clientId || !invoiceForm.title) return toast.error('Client and title required');
    const lineItems = invoiceForm.lineItems
      .filter((li) => li.description && li.amount)
      .map((li) => ({ description: li.description, amount: Math.round(parseFloat(li.amount) * 100) }));
    if (lineItems.length === 0) return toast.error('At least one line item required');
    setInvoiceLoading(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoiceForm, lineItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvoices((prev) => [data.invoice, ...prev]);
      setInvoiceForm({ clientId: '', title: '', description: '', dueDate: '', lineItems: [{ description: '', amount: '' }] });
      setShowInvoiceForm(false);
      toast.success(`Invoice ${data.invoice.invoiceNumber} created`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status } : inv));
      toast.success('Invoice updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copyPayLink = (invoiceId: string) => {
    const url = `${window.location.origin}/pay/${invoiceId}`;
    navigator.clipboard.writeText(url);
    toast.success('Payment link copied!');
  };

  const slugifyCampaignName = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const buildCampaignUrl = (slug: string, source = 'linkedin', medium = 'social') =>
    `${window.location.origin}/c/${slug}?source=${encodeURIComponent(source)}&medium=${encodeURIComponent(medium)}`;

  const copyUtmLink = (slug: string) => {
    const url = buildCampaignUrl(slug);
    navigator.clipboard.writeText(url);
    toast.success('Campaign link copied!');
  };

  const copyPostWithLink = (content: string, platform: string, slug: string) => {
    const medium = platform === 'email' ? 'outreach' : 'social';
    navigator.clipboard.writeText(`${content}\n\n${buildCampaignUrl(slug, platform, medium)}`);
    toast.success('Post + campaign link copied!');
  };

  const openLinkedInWithCopiedPost = (content: string, slug: string) => {
    copyPostWithLink(content, 'linkedin', slug);
    window.open('https://www.linkedin.com/feed/', '_blank', 'noopener,noreferrer');
    toast.success('LinkedIn opened. Your post is on the clipboard.');
  };

  const buildGeneratedPost = ({
    campaign,
    platform,
    notes,
  }: {
    campaign: Pick<Campaign, 'name' | 'goal' | 'notes' | 'utmSlug'>;
    platform: string;
    notes: string;
  }) => {
    const goal = campaign.goal?.trim();
    const campaignNotes = campaign.notes?.trim();
    const postNotes = notes.trim();
    const focusLine = goal || `We're running a focused push around ${campaign.name}.`;
    const supportLine = postNotes || campaignNotes || 'If this is on your roadmap, I can share a practical next-step plan.';

    if (platform === 'twitter') {
      return `${campaign.name}\n\n${focusLine}\n\n${supportLine}`.slice(0, 280);
    }

    if (platform === 'email') {
      return [
        `Subject: ${campaign.name}`,
        '',
        `Hi,`,
        '',
        focusLine,
        supportLine,
        '',
        'If you want, I can send over a short outline of scope, timeline, and next steps.',
        '',
        'Scott',
      ].join('\n');
    }

    return [
      `If ${campaign.name} is relevant to your team right now, this is the conversation I want to have.`,
      '',
      focusLine,
      '',
      supportLine,
      '',
      'I put together a short breakdown of how STC would approach it, what to prioritize first, and where teams usually lose time.',
      '',
      'If you want the outline, take a look here:',
    ].join('\n');
  };

  const generatePostDraft = (campaign: Pick<Campaign, 'name' | 'goal' | 'notes' | 'utmSlug'>) => {
    setPostForm((prev) => ({
      ...prev,
      content: buildGeneratedPost({
        campaign,
        platform: prev.platform,
        notes: prev.notes,
      }),
    }));
    toast.success('Draft generated');
  };

  const tabs = [
    { key: 'users',       label: 'Users',           icon: <FiUsers size={16} />,      count: users.length },
    { key: 'messages',    label: 'Messages',         icon: <FiMail size={16} />,       count: msgList.filter((m) => m.status === 'UNREAD').length },
    { key: 'leads',       label: 'Leads',            icon: <FiTrendingUp size={16} />, count: inquiries.filter((i) => i.status === 'NEW').length },
    { key: 'beta',        label: 'Beta Apps',        icon: <FiSend size={16} />,       count: betaApplications.filter((application) => application.status === 'NEW').length },
    { key: 'traffic',     label: 'Site Traffic',     icon: <FiGlobe size={16} />,      count: null },
    { key: 'campaigns',   label: 'Campaigns',        icon: <FiRadio size={16} />,      count: campaigns.filter((c) => c.status === 'ACTIVE').length },
    { key: 'clients',     label: 'Client Projects',  icon: <FiFolder size={16} />,     count: null },
    { key: 'invitations', label: 'Invitations',      icon: <FiLink size={16} />,       count: null },
    { key: 'invoices',    label: 'Invoices',         icon: <FiDollarSign size={16} />, count: invoices.filter((i) => i.status === 'SENT').length },
    { key: 'projects',    label: 'Portfolio',        icon: <FiFolder size={16} />,     count: projects.length },
  ] as const;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <section className="relative text-white py-12 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1923]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F1923]" />
        <div className="section-container relative z-10">
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
            <div className="text-3xl font-bold text-brand mb-1">{betaApplications.filter((application) => application.status === 'NEW').length}</div>
            <div className="text-slate-500 text-sm">New Beta Apps</div>
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
                  if (t.key === 'traffic') loadSiteTraffic();
                  if (t.key === 'invoices') loadInvoices();
                }}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {t.icon} {t.label}
                {(t.key === 'messages' || t.key === 'leads' || t.key === 'beta') && (t.count ?? 0) > 0 && (
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
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {userList.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-medium text-white">{u.name}</td>
                        <td className="py-3 text-slate-500">{u.email}</td>
                        <td className="py-3">
                          <select
                            value={u.role}
                            onChange={async (e) => {
                              const role = e.target.value;
                              await fetch(`/api/admin/users/${u.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ role }),
                              });
                              setUserList((prev) => prev.map((x) => x.id === u.id ? { ...x, role } : x));
                              toast.success('Role updated');
                            }}
                            className="text-xs px-2 py-1 rounded-full font-medium bg-[#1A2535] text-slate-200 border border-[#334155] focus:outline-none"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="CLIENT">CLIENT</option>
                            <option value="USER">USER</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={async () => {
                              const isActive = !u.isActive;
                              await fetch(`/api/admin/users/${u.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ isActive }),
                              });
                              setUserList((prev) => prev.map((x) => x.id === u.id ? { ...x, isActive } : x));
                              toast.success(isActive ? 'User activated' : 'User deactivated');
                            }}
                            className={`text-xs px-2 py-1 rounded-full ${
                              u.isActive ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500' : 'bg-red-50 text-red-500 hover:bg-green-50 hover:text-green-600'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 text-slate-600">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
                              const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setUserList((prev) => prev.filter((x) => x.id !== u.id));
                                toast.success('User deleted');
                              } else {
                                const d = await res.json();
                                toast.error(d.error || 'Failed to delete user');
                              }
                            }}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Delete user"
                          >
                            <FiTrash2 size={15} />
                          </button>
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

            {tab === 'beta' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">
                    Beta Applications ({betaApplications.length})
                  </h2>
                  {betaApplications.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No beta applications yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {betaApplications.map((application) => (
                        <button
                          key={application.id}
                          onClick={() => setSelectedBetaApplication(application)}
                          className={`w-full text-left border rounded-xl p-4 transition-all ${
                            selectedBetaApplication?.id === application.id
                              ? 'border-brand bg-brand/5'
                              : 'border-[#243044] hover:border-brand/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm truncate">{application.name || application.email}</p>
                              <p className="text-xs text-slate-500">{application.email}</p>
                              <p className="text-xs text-slate-600 truncate">
                                {[application.role, application.company].filter(Boolean).join(' · ') || 'Independent operator'}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              application.status === 'NEW' ? 'bg-red-50 text-red-500' :
                              application.status === 'REVIEWING' ? 'bg-yellow-50 text-yellow-600' :
                              application.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                              application.status === 'WAITLISTED' ? 'bg-blue-50 text-blue-600' :
                              'bg-[#1A2535] text-slate-500'
                            }`}>
                              {application.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                            <span>{application.environmentCount ?? 'n/a'} envs</span>
                            <span>·</span>
                            <span>{application.teamSize || 'team size unknown'}</span>
                            <span>·</span>
                            <span>{application.utmCampaign || application.source || 'direct'}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  {!selectedBetaApplication ? (
                    <div className="border border-dashed border-[#243044] rounded-xl p-8 text-center text-slate-600 text-sm h-full flex items-center justify-center">
                      Select a beta application to review fit, attribution, and outreach readiness
                    </div>
                  ) : (
                    <div className="border border-[#243044] rounded-xl p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white text-lg">{selectedBetaApplication.name || selectedBetaApplication.email}</h3>
                          <p className="text-sm text-slate-500">{selectedBetaApplication.email}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {[selectedBetaApplication.role, selectedBetaApplication.company].filter(Boolean).join(' · ') || 'No company provided'}
                          </p>
                        </div>
                        <button onClick={() => deleteBetaApplication(selectedBetaApplication.id)} className="text-red-400 hover:text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <div className="bg-gradient-to-br from-[#0F1923] via-[#162032] to-[#0a1525] text-white rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-brand/70 text-xs mb-0.5">Status</div>
                          <div className="font-bold text-sm">{selectedBetaApplication.status.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-brand/70 text-xs mb-0.5">Environments</div>
                          <div className="font-bold text-sm">{selectedBetaApplication.environmentCount ?? 'n/a'}</div>
                        </div>
                        <div>
                          <div className="text-brand/70 text-xs mb-0.5">Interview</div>
                          <div className="font-bold text-sm">{selectedBetaApplication.willingToInterview ? 'Yes' : 'No'}</div>
                        </div>
                      </div>

                      <dl className="text-sm space-y-2">
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Team size</dt>
                          <dd className="font-medium text-right">{selectedBetaApplication.teamSize || 'Not provided'}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Client workloads</dt>
                          <dd className="font-medium text-right">{selectedBetaApplication.managesClientWorkloads ? 'Yes' : 'No'}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">LinkedIn</dt>
                          <dd className="font-medium text-right">
                            {selectedBetaApplication.linkedinUrl ? (
                              <a href={selectedBetaApplication.linkedinUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline inline-flex items-center gap-1">
                                Open <FiExternalLink size={12} />
                              </a>
                            ) : 'Not provided'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Attribution</dt>
                          <dd className="font-medium text-right">{selectedBetaApplication.utmCampaign || selectedBetaApplication.source || 'Direct'}</dd>
                        </div>
                      </dl>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Primary Use Case</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{selectedBetaApplication.useCase || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Biggest Pain</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{selectedBetaApplication.biggestPain || 'Not provided'}</p>
                      </div>

                      {selectedBetaApplication.toolStack.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2">Current Tooling</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedBetaApplication.toolStack.map((tool) => (
                              <span key={tool} className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">{tool}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedBetaApplication.notes && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1">Applicant Notes</p>
                          <p className="text-sm text-slate-200 leading-relaxed">{selectedBetaApplication.notes}</p>
                        </div>
                      )}

                      <div className="rounded-xl border border-[#243044] bg-[#0F1923] p-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">UTM Source</span>
                          <span className="text-slate-200 text-right">{selectedBetaApplication.utmSource || 'n/a'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">UTM Medium</span>
                          <span className="text-slate-200 text-right">{selectedBetaApplication.utmMedium || 'n/a'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Landing Path</span>
                          <span className="text-slate-200 text-right">{selectedBetaApplication.landingPath || 'n/a'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Submitted</span>
                          <span className="text-slate-200 text-right">{new Date(selectedBetaApplication.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-[#243044] pt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Update Status</label>
                          <select
                            value={selectedBetaApplication.status}
                            onChange={(e) => updateBetaApplication(selectedBetaApplication.id, { status: e.target.value as BetaApplication['status'] })}
                            className="input text-sm w-full"
                          >
                            <option value="NEW">New</option>
                            <option value="REVIEWING">Reviewing</option>
                            <option value="APPROVED">Approved</option>
                            <option value="WAITLISTED">Waitlisted</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Internal Notes</label>
                          <textarea
                            className="input text-sm w-full"
                            rows={3}
                            placeholder="Fit notes, follow-up angle, or objections..."
                            defaultValue={selectedBetaApplication.adminNotes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (selectedBetaApplication.adminNotes || '')) {
                                updateBetaApplication(selectedBetaApplication.id, { adminNotes: e.target.value });
                              }
                            }}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => updateBetaApplication(selectedBetaApplication.id, { contactedAt: new Date().toISOString() })}
                            className="btn-secondary text-sm"
                          >
                            {selectedBetaApplication.contactedAt ? 'Update Contacted Time' : 'Mark Contacted'}
                          </button>
                          <a
                            href={`mailto:${selectedBetaApplication.email}?subject=${encodeURIComponent('Omnis DevOps beta application')}`}
                            className="btn-primary text-sm text-center block flex-1"
                          >
                            Email Applicant
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'traffic' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border border-[#243044] rounded-xl p-4 bg-[#0F1923]">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Ignore Your Own Visits</h3>
                    <p className="text-xs text-slate-500 mt-1">When enabled, this browser will not be counted in site traffic. Admin sessions are opted out automatically, and auth pages are excluded entirely.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={deleteMyTrafficVisits}
                      className="px-3 py-2 rounded-lg text-sm font-semibold border border-[#243044] bg-[#1A2535] text-slate-300 transition-colors hover:border-red-500 hover:text-red-400"
                    >
                      Delete My Existing Visits
                    </button>
                    <button
                      onClick={() => updateTrafficOptOut(!trafficOptOut)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        trafficOptOut
                          ? 'bg-brand text-white border-brand'
                          : 'bg-[#1A2535] text-slate-300 border-[#243044]'
                      }`}
                    >
                      {trafficOptOut ? 'Ignoring This Browser' : 'Ignore This Browser'}
                    </button>
                  </div>
                </div>

                {trafficLoading && !trafficLoaded && (
                  <p className="text-slate-500 text-sm">Loading site traffic...</p>
                )}

                {!trafficLoading && !siteTraffic.available && (
                  <div className="border border-dashed border-[#243044] rounded-xl p-5 text-sm text-slate-500">
                    Site traffic tracking is deployed in the app, but the SiteVisit storage is not available yet in the current database. Once the migration is present, this panel will populate automatically.
                  </div>
                )}

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-[#0F1923] rounded-xl p-4 border border-[#243044]">
                    <div className="text-2xl font-bold text-brand">{siteTraffic.totalViews}</div>
                    <div className="text-xs text-slate-500 mt-1">Total Recorded Views</div>
                  </div>
                  <div className="bg-[#0F1923] rounded-xl p-4 border border-[#243044]">
                    <div className="text-2xl font-bold text-brand">{siteTraffic.viewsToday}</div>
                    <div className="text-xs text-slate-500 mt-1">Last 24 Hours</div>
                  </div>
                  <div className="bg-[#0F1923] rounded-xl p-4 border border-[#243044]">
                    <div className="text-2xl font-bold text-brand">{siteTraffic.views7d}</div>
                    <div className="text-xs text-slate-500 mt-1">Last 7 Days</div>
                  </div>
                  <div className="bg-[#0F1923] rounded-xl p-4 border border-[#243044]">
                    <div className="text-2xl font-bold text-brand">{siteTraffic.uniqueVisitors30d}</div>
                    <div className="text-xs text-slate-500 mt-1">Unique Visitors, 30 Days</div>
                  </div>
                </div>

                <div className="grid xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2 border border-[#243044] rounded-xl p-5 bg-[#0F1923]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-200">Top Landing Pages</h3>
                      <span className="text-xs text-slate-500">Last 30 days</span>
                    </div>
                    {siteTraffic.topPages.length === 0 ? (
                      <p className="text-sm text-slate-600 py-6 text-center">No site landing data yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {siteTraffic.topPages.map((page) => (
                          <div key={page.path} className="flex items-center justify-between gap-3 border border-[#243044] rounded-lg px-4 py-3 bg-[#1A2535]">
                            <div className="min-w-0">
                              <div className="font-mono text-sm text-slate-100 truncate">{page.path}</div>
                              <div className="text-xs text-slate-500 mt-1">Last visit {new Date(page.lastVisitedAt).toLocaleString()}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-brand">{page.views}</div>
                              <div className="text-xs text-slate-500">views</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border border-[#243044] rounded-xl p-5 bg-[#0F1923]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-200">Top Referrers</h3>
                      <span className="text-xs text-slate-500">Last 30 days</span>
                    </div>
                    {siteTraffic.topReferrers.length === 0 ? (
                      <p className="text-sm text-slate-600 py-6 text-center">No referrers recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {siteTraffic.topReferrers.map((referrer) => (
                          <div key={referrer.source} className="flex items-center justify-between gap-3 border border-[#243044] rounded-lg px-4 py-3 bg-[#1A2535]">
                            <div className="text-sm text-slate-200 truncate">{referrer.source}</div>
                            <div className="text-sm font-semibold text-brand shrink-0">{referrer.views}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-[#243044] rounded-xl p-5 bg-[#0F1923]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-200">Recent Visits</h3>
                    <span className="text-xs text-slate-500">Latest recorded landings</span>
                  </div>
                  {siteTraffic.recentVisits.length === 0 ? (
                    <p className="text-sm text-slate-600 py-6 text-center">No visits recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {siteTraffic.recentVisits.map((visit) => (
                        <div key={visit.id} className="flex items-center justify-between gap-3 border border-[#243044] rounded-lg px-4 py-3 bg-[#1A2535]">
                          <div className="min-w-0">
                            <div className="font-mono text-sm text-slate-100 truncate">{visit.path}</div>
                            <div className="text-xs text-slate-500 mt-1">{visit.source}</div>
                          </div>
                          <div className="text-xs text-slate-500 shrink-0">{new Date(visit.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
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
                        <span>{c.clickCount} clicks</span>
                        <span>{c.landingCount} landings</span>
                        <span>{c.conversionCount} conversions</span>
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
                            value={campaignForm.name} onChange={(e) => {
                              const name = e.target.value;
                              setCampaignForm((p) => ({
                                ...p,
                                name,
                                utmSlug: campaignSlugEdited ? p.utmSlug : slugifyCampaignName(name),
                              }));
                            }} />
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <label className="block text-xs font-semibold text-slate-400">UTM Slug * <span className="text-slate-600 font-normal">(auto-generated, editable)</span></label>
                            <button
                              type="button"
                              onClick={() => {
                                setCampaignSlugEdited(false);
                                setCampaignForm((p) => ({ ...p, utmSlug: slugifyCampaignName(p.name) }));
                              }}
                              className="text-xs text-brand font-semibold hover:underline"
                            >
                              Regenerate
                            </button>
                          </div>
                          <input className="input w-full font-mono" placeholder="e.g. sf-pilot-q2-2026"
                            value={campaignForm.utmSlug} onChange={(e) => {
                              setCampaignSlugEdited(true);
                              setCampaignForm((p) => ({ ...p, utmSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
                            }} />
                          {campaignForm.utmSlug && (
                            <div className="mt-2 rounded-lg bg-[#0F1923] border border-[#243044] p-3">
                              <div className="text-xs font-semibold text-slate-400 mb-1">Ready-to-post campaign link</div>
                              <div className="font-mono text-xs text-slate-200 break-all">{buildCampaignUrl(campaignForm.utmSlug)}</div>
                              <button type="button" onClick={() => copyUtmLink(campaignForm.utmSlug)} className="text-xs text-brand font-semibold hover:underline mt-2">
                                Copy link
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Goal</label>
                          <input className="input w-full" placeholder="e.g. Generate 5 Salesforce pilot leads"
                            value={campaignForm.goal} onChange={(e) => setCampaignForm((p) => ({ ...p, goal: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Landing Path</label>
                          <input
                            className="input w-full font-mono"
                            placeholder="/platform"
                            value={campaignForm.landingPath}
                            onChange={(e) => setCampaignForm((p) => ({
                              ...p,
                              landingPath: e.target.value.startsWith('/') ? e.target.value : `/${e.target.value.replace(/^\/+/, '')}`,
                            }))}
                          />
                          <p className="text-xs text-slate-600 mt-1">Use /platform for beta campaigns and /pricing for service lead campaigns.</p>
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#0F1923] rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-brand">{selectedCampaign.clickCount}</div>
                          <div className="text-xs text-slate-500">Clicks</div>
                        </div>
                        <div className="bg-[#0F1923] rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-brand">{selectedCampaign.landingCount}</div>
                          <div className="text-xs text-slate-500">Landings</div>
                        </div>
                        <div className="bg-[#0F1923] rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-brand">{selectedCampaign.conversionCount}</div>
                          <div className="text-xs text-slate-500">Conversions</div>
                        </div>
                        <div className="bg-[#0F1923] rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-brand">
                            {campaignPosts.filter((p) => p.status === 'PUBLISHED').length}
                          </div>
                          <div className="text-xs text-slate-500">Published Posts</div>
                        </div>
                      </div>

                      {/* UTM Link */}
                      <div className="bg-brand/5 border border-brand/20 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-400 mb-0.5">Campaign Tracking Link</div>
                            <div className="font-mono text-xs text-slate-200 truncate">
                              {buildCampaignUrl(selectedCampaign.utmSlug)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Redirects to {selectedCampaign.landingPath}</div>
                          </div>
                          <button onClick={() => copyUtmLink(selectedCampaign.utmSlug)}
                            className="shrink-0 flex items-center gap-1.5 text-brand text-xs font-semibold hover:underline">
                            <FiCopy size={13} /> Copy
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#0F1923] rounded-xl p-3 border border-[#243044] text-center">
                          <div className="text-lg font-bold text-brand">{selectedCampaign.pricingLeadCount}</div>
                          <div className="text-xs text-slate-500">Pricing Leads</div>
                        </div>
                        <div className="bg-[#0F1923] rounded-xl p-3 border border-[#243044] text-center">
                          <div className="text-lg font-bold text-brand">{selectedCampaign.betaApplicationCount}</div>
                          <div className="text-xs text-slate-500">Beta Apps</div>
                        </div>
                        <div className="bg-[#0F1923] rounded-xl p-3 border border-[#243044] text-center">
                          <div className="text-lg font-bold text-brand">{selectedCampaign.clickCount > 0 ? `${Math.round((selectedCampaign.conversionCount / selectedCampaign.clickCount) * 100)}%` : '0%'}</div>
                          <div className="text-xs text-slate-500">Click to Conversion</div>
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
                                onClick={() => generatePostDraft(selectedCampaign)}
                                className="btn-secondary text-sm flex items-center gap-1.5"
                              >
                                <FiSend size={13} /> Generate Draft
                              </button>
                              <button
                                onClick={() => {
                                  void (editingPost ? updatePost() : createPost());
                                }}
                                disabled={campaignLoading}
                                className="btn-primary text-sm"
                              >
                                {campaignLoading ? 'Saving...' : editingPost ? 'Update Post' : 'Save Post'}
                              </button>
                              <button
                                onClick={() => {
                                  copyPostWithLink(postForm.content, postForm.platform, selectedCampaign.utmSlug);
                                }}
                                className="btn-secondary text-sm flex items-center gap-1.5"
                              >
                                <FiCopy size={13} /> Copy with Link
                              </button>
                              {postForm.platform === 'linkedin' && (
                                <button
                                  onClick={() => editingPost ? updatePost(true) : createPost(true)}
                                  className="btn-secondary text-sm flex items-center gap-1.5"
                                >
                                  <FiExternalLink size={13} /> Save + Open LinkedIn
                                </button>
                              )}
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
                                      copyPostWithLink(post.content, post.platform, selectedCampaign.utmSlug);
                                    }}
                                    className="text-slate-600 hover:text-brand p-1"
                                    title="Copy post + link"
                                  ><FiCopy size={14} /></button>
                                  {post.platform === 'linkedin' && (
                                    <button
                                      onClick={() => openLinkedInWithCopiedPost(post.content, selectedCampaign.utmSlug)}
                                      className="text-slate-600 hover:text-brand p-1"
                                      title="Open LinkedIn"
                                    ><FiExternalLink size={14} /></button>
                                  )}
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

            {/* ── Invoices Tab ── */}
            {tab === 'invoices' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">Invoices</h2>
                  <button
                    onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    <FiPlus size={14} /> New Invoice
                  </button>
                </div>

                {showInvoiceForm && (
                  <div className="bg-[#0F1923] rounded-xl p-5 mb-6 border border-[#243044] space-y-4">
                    <h3 className="font-semibold text-slate-200">New Invoice</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Client User ID *</label>
                        <input
                          value={invoiceForm.clientId}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                          className="input text-sm"
                          placeholder="Paste User ID from Users tab"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Invoice Title *</label>
                        <input
                          value={invoiceForm.title}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                          className="input text-sm"
                          placeholder="e.g. Salesforce Pilot — Deposit"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                        <input
                          value={invoiceForm.description}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                          className="input text-sm"
                          placeholder="Optional description shown to client"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={invoiceForm.dueDate}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                          className="input text-sm"
                        />
                      </div>
                    </div>

                    {/* Line Items */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">Line Items *</label>
                      <div className="space-y-2">
                        {invoiceForm.lineItems.map((li, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              className="input text-sm flex-1"
                              placeholder="Description (e.g. Project deposit)"
                              value={li.description}
                              onChange={(e) => {
                                const updated = [...invoiceForm.lineItems];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                setInvoiceForm({ ...invoiceForm, lineItems: updated });
                              }}
                            />
                            <div className="relative w-32">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                              <input
                                className="input text-sm pl-6 w-full"
                                placeholder="0.00"
                                type="number"
                                min="0"
                                step="0.01"
                                value={li.amount}
                                onChange={(e) => {
                                  const updated = [...invoiceForm.lineItems];
                                  updated[idx] = { ...updated[idx], amount: e.target.value };
                                  setInvoiceForm({ ...invoiceForm, lineItems: updated });
                                }}
                              />
                            </div>
                            {invoiceForm.lineItems.length > 1 && (
                              <button
                                onClick={() => setInvoiceForm({ ...invoiceForm, lineItems: invoiceForm.lineItems.filter((_, i) => i !== idx) })}
                                className="text-red-400 hover:text-red-600"
                              >
                                <FiX size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setInvoiceForm({ ...invoiceForm, lineItems: [...invoiceForm.lineItems, { description: '', amount: '' }] })}
                        className="mt-2 text-brand text-sm flex items-center gap-1 hover:underline"
                      >
                        <FiPlus size={14} /> Add Line Item
                      </button>
                      <div className="mt-3 text-right text-sm font-bold text-brand">
                        Total: ${invoiceForm.lineItems.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={createInvoice} disabled={invoiceLoading} className="btn-primary text-sm">
                        {invoiceLoading ? 'Creating...' : 'Create Invoice'}
                      </button>
                      <button onClick={() => setShowInvoiceForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {invoices.length === 0 && (
                    <p className="text-slate-600 text-center py-8">No invoices yet.</p>
                  )}
                  {invoices.map((inv) => {
                    const invoiceStatusColors: Record<string, string> = {
                      DRAFT: 'bg-[#1A2535] text-slate-400',
                      SENT: 'bg-blue-100 text-blue-700',
                      PAID: 'bg-green-100 text-green-700',
                      VOID: 'bg-gray-100 text-gray-500',
                      OVERDUE: 'bg-red-100 text-red-700',
                    };
                    return (
                      <div key={inv.id} className="border border-[#243044] rounded-xl p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-500">{inv.invoiceNumber}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                invoiceStatusColors[inv.status] ?? invoiceStatusColors.DRAFT
                              }`}>{inv.status}</span>
                            </div>
                            <p className="font-semibold text-white mt-0.5">{inv.title}</p>
                            <p className="text-xs text-slate-500">{inv.client.name} — {inv.client.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-brand">${(inv.amount / 100).toFixed(2)}</p>
                            {inv.dueDate && (
                              <p className="text-xs text-slate-500">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                            )}
                            {inv.paidAt && (
                              <p className="text-xs text-green-500">Paid {new Date(inv.paidAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {inv.status !== 'PAID' && inv.status !== 'VOID' && (
                            <select
                              value={inv.status}
                              onChange={(e) => updateInvoiceStatus(inv.id, e.target.value)}
                              className="input text-xs py-1 w-auto"
                            >
                              <option value="DRAFT">DRAFT</option>
                              <option value="SENT">SENT</option>
                              <option value="OVERDUE">OVERDUE</option>
                              <option value="VOID">VOID</option>
                            </select>
                          )}
                          {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                            <button
                              onClick={() => copyPayLink(inv.id)}
                              className="flex items-center gap-1.5 text-brand text-xs font-semibold hover:underline"
                            >
                              <FiCopy size={13} /> Copy Pay Link
                            </button>
                          )}
                          <a
                            href={`/pay/${inv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-slate-400 text-xs hover:text-brand"
                          >
                            <FiExternalLink size={13} /> Preview
                          </a>
                          {inv.status === 'DRAFT' && (
                            <button
                              onClick={() => updateInvoiceStatus(inv.id, 'SENT')}
                              className="flex items-center gap-1.5 text-xs btn-primary py-1 px-3"
                            >
                              <FiSend size={12} /> Send to Client
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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