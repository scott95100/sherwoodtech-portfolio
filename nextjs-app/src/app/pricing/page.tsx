'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiArrowLeft, FiCheck, FiDollarSign, FiClock, FiSend, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── Restricted Industries (conflict with day job) ────────────────────────────
const RESTRICTED_INDUSTRIES = [
  'life-insurance',
  'annuities',
  'imo-fmo',
  'aum-wealth-management',
  'insurance-distribution',
];

const RESTRICTED_INDUSTRY_LABELS: Record<string, string> = {
  'life-insurance':         'Life Insurance',
  'annuities':              'Annuities / Fixed Indexed Annuities',
  'imo-fmo':                'IMO / FMO / Insurance Marketing Organizations',
  'aum-wealth-management':  'AUM / Wealth Management / RIA',
  'insurance-distribution': 'Insurance Distribution / Broker-Dealer',
};

// ─── OFAC Sanctioned Countries ────────────────────────────────────────────────
const SANCTIONED_COUNTRIES = [
  'Cuba', 'Iran', 'North Korea', 'Russia', 'Syria',
  'Belarus', 'Myanmar', 'Venezuela', 'Zimbabwe',
];

// ─── Industry Options ─────────────────────────────────────────────────────────
const INDUSTRY_OPTIONS = [
  { value: 'saas-software',         label: 'SaaS / Software' },
  { value: 'fintech',               label: 'FinTech / Payments' },
  { value: 'healthcare',            label: 'Healthcare / MedTech' },
  { value: 'ecommerce-retail',      label: 'eCommerce / Retail' },
  { value: 'real-estate',           label: 'Real Estate' },
  { value: 'manufacturing',         label: 'Manufacturing / Industrial' },
  { value: 'nonprofit',             label: 'Non-Profit / Education' },
  { value: 'professional-services', label: 'Professional Services / Legal' },
  { value: 'logistics',             label: 'Logistics / Supply Chain' },
  { value: 'media-entertainment',   label: 'Media / Entertainment' },
  { value: 'government',            label: 'Government / Public Sector' },
  { value: 'life-insurance',        label: 'Life Insurance', restricted: true },
  { value: 'annuities',             label: 'Annuities / Fixed Indexed Annuities', restricted: true },
  { value: 'imo-fmo',               label: 'IMO / FMO / Insurance Marketing Org', restricted: true },
  { value: 'aum-wealth-management', label: 'AUM / Wealth Management / RIA', restricted: true },
  { value: 'insurance-distribution',label: 'Insurance Distribution / Broker-Dealer', restricted: true },
  { value: 'other',                 label: 'Other' },
] as const;

// ─── Country List (abbreviated — common + all sanctioned included) ────────────
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand',
  'Germany', 'France', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Switzerland', 'Austria', 'Belgium', 'Ireland', 'Spain', 'Italy', 'Portugal',
  'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Greece',
  'Japan', 'South Korea', 'Singapore', 'India', 'Philippines', 'Thailand',
  'Malaysia', 'Indonesia', 'Vietnam', 'Taiwan', 'Hong Kong',
  'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru',
  'South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Egypt',
  'Israel', 'UAE', 'Saudi Arabia', 'Turkey', 'Pakistan',
  // Sanctioned — always included so users see the block message
  'Cuba', 'Iran', 'North Korea', 'Russia', 'Syria',
  'Belarus', 'Myanmar', 'Venezuela', 'Zimbabwe',
  'Other',
];

// ─── Service Configs (per-service pricing + messaging) ───────────────────────

type ServiceConfig = {
  label: string;
  pilotDeliverable: string;
  pilotExamples: string[];
  fullDescription: string;
  fullFeatures: string[];
  pilotLow: number;
  pilotHigh: number;
  fullLow: number;
  fullHigh: number;
  fullWeeks: number;
};

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  salesforce: {
    label: 'Salesforce Development',
    pilotDeliverable: 'One custom LWC component or Apex class — built, tested, and deployed to your org.',
    pilotExamples: ['Custom Lightning Web Component', 'Apex trigger + handler class', 'Flow automation for one process', 'Connected App + REST integration'],
    fullDescription: 'Full-cycle Salesforce development: LWC component suites, Apex services, Flow automation, external integrations, custom objects, and org architecture.',
    fullFeatures: ['LWC component library', 'Apex classes, triggers & batch jobs', 'Flow & Process Builder automation', 'REST/SOAP Connected App integrations', 'Custom objects, fields & page layouts', 'Permission sets, profiles & sharing rules', 'Data migration & org cleanup', 'Salesforce DX deployment pipeline'],
    pilotLow: 1500, pilotHigh: 3000,
    fullLow: 8000, fullHigh: 35000, fullWeeks: 6,
  },
  web: {
    label: 'Web & App Development',
    pilotDeliverable: 'One production-ready page or feature module — responsive, deployed, and fully handed off.',
    pilotExamples: ['Landing page with contact form', 'User auth flow (login/register)', 'Admin dashboard with one data view', 'Client portal MVP with one core feature'],
    fullDescription: 'End-to-end web applications built with React & Next.js — from architecture through production deployment with CI/CD.',
    fullFeatures: ['React / Next.js App Router', 'Responsive, accessible UI', 'Authentication & role-based access', 'Database + API layer', 'Admin dashboard', 'Payment integration', 'SEO & performance optimization', 'Cloud deployment + CI/CD'],
    pilotLow: 1500, pilotHigh: 3000,
    fullLow: 8000, fullHigh: 40000, fullWeeks: 7,
  },
  api: {
    label: 'API & Backend Engineering',
    pilotDeliverable: 'One authenticated REST API endpoint or third-party integration — documented and tested.',
    pilotExamples: ['REST API endpoint with auth middleware', 'Salesforce Connected App + OAuth flow', 'Webhook receiver + event handler', 'Third-party API integration (Stripe, Twilio, etc.)'],
    fullDescription: 'Robust backend systems: REST and GraphQL APIs, authentication layers, webhook systems, and third-party integrations built for production.',
    fullFeatures: ['REST & GraphQL API design', 'JWT / OAuth authentication', 'Rate limiting & security middleware', 'Webhook + event-driven systems', 'Third-party API integrations', 'Caching layer (Redis / edge)', 'OpenAPI / Swagger documentation', 'Load testing & performance tuning'],
    pilotLow: 1500, pilotHigh: 3000,
    fullLow: 5000, fullHigh: 25000, fullWeeks: 5,
  },
  database: {
    label: 'Database Architecture',
    pilotDeliverable: 'Schema design + migrations for one domain — reviewed, documented, and deployed.',
    pilotExamples: ['Data model design for one domain (ERD + Prisma schema)', 'Migration strategy for existing schema', 'Query audit + optimization for top 5 slow queries', 'Normalization review + recommendations'],
    fullDescription: 'Thoughtful schema design, Prisma ORM setup, query optimization, and data modeling for PostgreSQL — built to scale from day one.',
    fullFeatures: ['PostgreSQL schema design', 'Prisma ORM setup & migrations', 'Data normalization & modeling', 'Indexing strategy', 'Query optimization', 'Seed data & test fixtures', 'Backup & recovery plan', 'Multi-environment configuration'],
    pilotLow: 1500, pilotHigh: 3000,
    fullLow: 3000, fullHigh: 15000, fullWeeks: 4,
  },
  devops: {
    label: 'Cloud & DevOps',
    pilotDeliverable: 'CI/CD pipeline or containerized deployment for one service — live, monitored, and documented.',
    pilotExamples: ['GitHub Actions CI/CD pipeline for one service', 'Dockerized app deployment to Railway/Render', 'Vercel + preview deployment setup', 'Environment management (dev/staging/prod)'],
    fullDescription: 'Modern cloud infrastructure: CI/CD pipelines, Docker containerization, managed deployments to AWS/Vercel/Railway, and environment management.',
    fullFeatures: ['CI/CD pipeline (GitHub Actions)', 'Docker + docker-compose', 'AWS / Vercel / Railway deployment', 'Staging & production environments', 'SSL, domain, and DNS setup', 'Log aggregation & alerting', 'Automated database backups', 'Infrastructure as code'],
    pilotLow: 1500, pilotHigh: 3000,
    fullLow: 3000, fullHigh: 20000, fullWeeks: 4,
  },
  security: {
    label: 'Security & Auth Systems',
    pilotDeliverable: 'Auth system with RBAC for one app — login, roles, sessions, and security headers configured.',
    pilotExamples: ['NextAuth / JWT auth for one app', 'Role-based access control (admin/user/client)', 'Invite-only registration system', 'OAuth2 provider integration (Google, GitHub)'],
    fullDescription: 'Production-grade authentication, role-based access control, secure session management, and security hardening across your entire stack.',
    fullFeatures: ['OAuth & credential auth', 'Role-based access control (RBAC)', 'JWT + session management', 'Invite-only user provisioning', 'Password policies & reset flows', 'CSRF, XSS & injection protection', 'Security headers (CSP, HSTS)', 'Audit logging & anomaly detection'],
    pilotLow: 1500, pilotHigh: 3000,
    fullLow: 4000, fullHigh: 15000, fullWeeks: 5,
  },
  consulting: {
    label: 'Technology Consulting',
    pilotDeliverable: '2-hour architecture or Salesforce org assessment — recorded session with written recommendations.',
    pilotExamples: ['Architecture review + written recommendations', 'Salesforce org assessment (health, tech debt, roadmap)', 'Stack selection workshop', 'Code audit with prioritized findings'],
    fullDescription: 'Strategic technical guidance: stack selection, Salesforce org assessments, code audits, and technical roadmapping to help you move faster with fewer mistakes.',
    fullFeatures: ['Architecture design & review', 'Salesforce org health assessment', 'Code & system audits', 'Tech stack selection workshop', 'Technical roadmap development', 'Team training sessions', 'Security assessment', 'Ongoing advisory retainer'],
    pilotLow: 300, pilotHigh: 500,
    fullLow: 1500, fullHigh: 12500, fullWeeks: 2,
  },
};

// ─── Pricing Engine ───────────────────────────────────────────────────────────

const BASE_RATES: Record<string, { low: number; high: number; weeks: number }> = {
  salesforce: { low: 8000,  high: 35000, weeks: 6 },
  web:        { low: 8000,  high: 40000, weeks: 7 },
  api:        { low: 5000,  high: 25000, weeks: 5 },
  database:   { low: 3000,  high: 15000, weeks: 4 },
  devops:     { low: 3000,  high: 20000, weeks: 4 },
  security:   { low: 4000,  high: 15000, weeks: 5 },
  consulting: { low: 1500,  high: 12500, weeks: 2 },
};

const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  simple: 1.0, moderate: 1.5, complex: 2.2,
};

const TIMELINE_MULTIPLIER: Record<string, number> = {
  asap: 1.25, '1month': 1.1, '3months': 1.0, flexible: 0.95,
};

function calculateEstimate(form: FormState) {
  if (form.projectType === 'pilot') {
    const cfg = SERVICE_CONFIGS[form.serviceCategory];
    if (cfg) return { low: cfg.pilotLow, high: cfg.pilotHigh, weeks: 2 };
    return { low: 1500, high: 3000, weeks: 2 };
  }
  if (form.serviceCategory === 'consulting') {
    const hours = form.complexity === 'simple' ? 10 : form.complexity === 'moderate' ? 25 : 50;
    return { low: hours * 150, high: hours * 250, weeks: Math.ceil(hours / 10) };
  }

  const base = BASE_RATES[form.serviceCategory] || BASE_RATES.web;
  const compMult = COMPLEXITY_MULTIPLIER[form.complexity] || 1;
  const timeMult = TIMELINE_MULTIPLIER[form.desiredTimeline] || 1;

  let addons = 0;
  let addWeeks = 0;
  if (form.needsAuth)         { addons += 1200; addWeeks += 0.5; }
  if (form.needsHosting)      { addons += 800;  addWeeks += 0.5; }
  if (form.needsIntegrations) { addons += 1500; addWeeks += 1; }
  if (!form.hasDesign)        { addons += 1200; addWeeks += 1; }

  const featureAddon = form.features.length * 500;
  const low   = Math.round((base.low  * compMult + addons + featureAddon) * timeMult / 100) * 100;
  const high  = Math.round((base.high * compMult + addons + featureAddon) * timeMult / 100) * 100;
  const weeks = Math.round(base.weeks * compMult + addWeeks);

  return { low, high, weeks };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  name: string; email: string; company: string; phone: string;
  industry: string; country: string;
  projectType: string;
  serviceCategory: string;
  title: string; description: string; complexity: string;
  features: string[]; hasDesign: boolean;
  needsHosting: boolean; needsAuth: boolean;
  needsIntegrations: boolean; integrationNotes: string;
  desiredTimeline: string;
};

const INITIAL: FormState = {
  name: '', email: '', company: '', phone: '',
  industry: '', country: '',
  projectType: '', serviceCategory: '',
  title: '', description: '', complexity: 'moderate',
  features: [], hasDesign: false,
  needsHosting: false, needsAuth: false,
  needsIntegrations: false, integrationNotes: '',
  desiredTimeline: 'flexible',
};

// ─── Feature Options ──────────────────────────────────────────────────────────

const FEATURE_OPTIONS: Record<string, string[]> = {
  salesforce: [
    'Custom LWC Components', 'Apex Triggers & Classes', 'Flow Automation',
    'Custom Objects & Fields', 'Reports & Dashboards', 'External API Integration',
    'Data Migration', 'Permission Sets & Profiles',
  ],
  web: [
    'User Authentication', 'Admin Dashboard', 'Payment Integration',
    'Email Notifications', 'File Uploads', 'Search & Filtering',
    'Multi-language Support', 'Analytics Integration',
  ],
  api: [
    'CRUD Endpoints', 'Authentication Middleware', 'Rate Limiting',
    'Webhook System', 'Third-party OAuth', 'Caching Layer',
    'API Documentation', 'Batch Processing',
  ],
  database: [
    'Schema Design & ERD', 'Prisma ORM Setup', 'Data Migrations',
    'Query Optimization', 'Indexing Strategy', 'Seed Data & Fixtures',
    'Multi-environment Config', 'Backup & Recovery Plan',
  ],
  devops: [
    'CI/CD Pipeline', 'Docker Containerization', 'Staging Environment',
    'Production Deployment', 'SSL & Domain Setup', 'Log Aggregation',
    'Automated Backups', 'Infrastructure as Code',
  ],
  security: [
    'OAuth / JWT Auth', 'Role-Based Access Control', 'Invite-Only Registration',
    'Password Reset Flow', 'CSRF & XSS Protection', 'Security Headers',
    'Session Management', 'Audit Logging',
  ],
  consulting: [
    'Architecture Review', 'Code Audit', 'Team Training Session',
    'Tech Stack Recommendation', 'Security Assessment', 'Performance Analysis',
  ],
  pilot: [
    'Single Feature Build', 'Basic UI', 'One API Integration',
    'Simple Database', 'Deployment Setup',
  ],
};

// ─── Step Dots ────────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`rounded-full transition-all duration-300 ${
          i < current ? 'w-6 h-2 bg-brand' :
          i === current ? 'w-8 h-2 bg-brand' : 'w-2 h-2 bg-gray-200'
        }`} />
      ))}
    </div>
  );
}

// ─── Blocked Screen ───────────────────────────────────────────────────────────

function BlockedScreen({ type, value }: { type: 'industry' | 'country'; value: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-gray-700 to-gray-900 text-white py-20">
        <div className="section-container text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle size={32} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            {type === 'industry' ? 'Industry Not Accepted' : 'Region Not Served'}
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            {type === 'industry'
              ? 'We\'re unable to accept projects in this industry at this time.'
              : 'We\'re unable to accept projects from this region due to regulatory requirements.'}
          </p>
        </div>
      </section>

      <div className="section-container py-16 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          {type === 'industry' ? (
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <FiAlertCircle size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-2">Conflict of Interest Disclosure</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Due to existing professional commitments, Sherwood Technology Consulting LLC
                    is <strong>not accepting projects</strong> in the following industries:
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mb-6 ml-14">
                {Object.values(RESTRICTED_INDUSTRY_LABELS).map((label) => (
                  <li key={label} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 text-sm leading-relaxed ml-14">
                This restriction is in place to avoid any conflict of interest with current
                professional obligations. We apologize for the inconvenience and hope to
                be able to serve these industries in the future.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <FiAlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-2">Region Restriction</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Sherwood Technology Consulting LLC is a US-based company and is legally
                    required to comply with <strong>OFAC (Office of Foreign Assets Control)</strong> sanctions
                    regulations. We are unable to provide services to clients located in
                    sanctioned countries or territories.
                  </p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 ml-14">
                <p className="text-sm text-red-700 font-medium mb-2">Currently Restricted Regions:</p>
                <p className="text-sm text-red-600">{SANCTIONED_COUNTRIES.join(', ')}</p>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed ml-14">
                This is not a business decision — it is a legal requirement under US federal law (31 CFR Chapter V).
                Violations of OFAC regulations carry significant civil and criminal penalties.
                If you believe this restriction has been applied in error, please contact us directly.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/contact" className="btn-primary flex-1 text-center">
            Contact Us Directly
          </Link>
          <Link href="/" className="btn-secondary flex-1 text-center">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function PricingInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ low: number; high: number; weeks: number } | null>(null);
  const [blocked, setBlocked] = useState<{ type: 'industry' | 'country'; value: string } | null>(null);
  const [pipeline, setPipeline] = useState<{ activeProjects: number; weeksUntilAvailable: number; estimatedStartDate: string } | null>(null);
  // Pre-selected service from ?service= param
  const [preselectedService, setPreselectedService] = useState<string | null>(null);

  const [utm, setUtm] = useState({ utmSource: '', utmCampaign: '', utmMedium: '' });
  useEffect(() => {
    const service = searchParams.get('service');
    setUtm({
      utmSource:   searchParams.get('utm_source')   || '',
      utmCampaign: searchParams.get('utm_campaign') || '',
      utmMedium:   searchParams.get('utm_medium')   || '',
    });
    if (service && SERVICE_CONFIGS[service]) {
      setPreselectedService(service);
      setForm((prev) => ({ ...prev, serviceCategory: service }));
    }
  }, [searchParams]);

  const update = (field: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleFeature = (f: string) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }));

  const estimate = calculateEstimate(form);
  const TOTAL_STEPS = 7; // 0=Contact, 1=Industry+Country, 2=ProjectType, 3=Category, 4=Scope, 5=Features, 6=Timeline

  const canNext = () => {
    if (step === 0) return !!(form.name && form.email);
    if (step === 1) return !!(form.industry && form.country);
    if (step === 2) return !!form.projectType;
    // Step 3: if pilot + preselected service, or full project with category chosen
    if (step === 3) return form.projectType === 'pilot' || !!form.serviceCategory;
    if (step === 4) return !!(form.title && form.description);
    return true;
  };

  const handleNext = () => {
    // Compliance checks on step 1 advance
    if (step === 1) {
      if (RESTRICTED_INDUSTRIES.includes(form.industry)) {
        setBlocked({ type: 'industry', value: form.industry });
        return;
      }
      if (SANCTIONED_COUNTRIES.includes(form.country)) {
        setBlocked({ type: 'country', value: form.country });
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const est = calculateEstimate(form);
    try {
      // Fetch pipeline data in parallel with submission
      const [res, pipelineRes] = await Promise.all([
        fetch('/api/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, ...est, ...utm }),
        }),
        fetch('/api/pipeline'),
      ]);
      if (!res.ok) throw new Error('Submission failed');
      const pipelineData = await pipelineRes.json();
      setPipeline(pipelineData);
      setResult(est);
      setSubmitted(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Blocked screen ──
  if (blocked) return <BlockedScreen type={blocked.type} value={blocked.value} />;

  // ── Confirmation screen ──
  if (submitted && result) {
    const startDateStr = pipeline?.estimatedStartDate
      ? new Date(pipeline.estimatedStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'TBD';
    const weeksOut = pipeline?.weeksUntilAvailable ?? 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-20">
          <div className="section-container text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck size={32} />
            </div>
            <h1 className="text-4xl font-bold mb-3">Your Estimate is Ready</h1>
            <p className="text-teal-100 text-lg max-w-xl mx-auto">
              We&apos;ve received your project details. Here&apos;s your estimated scope.
            </p>
          </div>
        </section>

        <div className="section-container py-16 max-w-2xl">
          {/* Estimate cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <FiDollarSign size={24} className="text-brand mx-auto mb-2" />
              <div className="text-sm text-gray-500 mb-1">Estimated Range</div>
              <div className="text-2xl font-bold text-gray-800">
                ${result.low.toLocaleString()} – ${result.high.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <FiClock size={24} className="text-brand mx-auto mb-2" />
              <div className="text-sm text-gray-500 mb-1">Build Timeline</div>
              <div className="text-2xl font-bold text-gray-800">
                {result.weeks} {result.weeks === 1 ? 'week' : 'weeks'}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <FiCheck size={24} className="text-brand mx-auto mb-2" />
              <div className="text-sm text-gray-500 mb-1">Project Type</div>
              <div className="text-2xl font-bold text-gray-800 capitalize">
                {form.projectType === 'pilot' ? 'Pilot' : 'Full Project'}
              </div>
            </div>
          </div>

          {/* Pipeline / Availability */}
          <div className={`rounded-2xl p-6 mb-6 border ${
            weeksOut === 0
              ? 'bg-green-50 border-green-200'
              : weeksOut <= 4
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                weeksOut === 0 ? 'bg-green-100' : weeksOut <= 4 ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <FiClock size={18} className={
                  weeksOut === 0 ? 'text-green-600' : weeksOut <= 4 ? 'text-yellow-600' : 'text-blue-600'
                } />
              </div>
              <div>
                <h3 className={`font-bold text-base mb-1 ${
                  weeksOut === 0 ? 'text-green-800' : weeksOut <= 4 ? 'text-yellow-800' : 'text-blue-800'
                }`}>
                  {weeksOut === 0
                    ? '✅ Currently Available'
                    : weeksOut <= 4
                    ? '⏳ Limited Availability'
                    : '📅 Pipeline Scheduled'}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  weeksOut === 0 ? 'text-green-700' : weeksOut <= 4 ? 'text-yellow-700' : 'text-blue-700'
                }`}>
                  {weeksOut === 0
                    ? 'We\'re ready to start immediately after proposal approval. No wait time.'
                    : `There ${pipeline?.activeProjects === 1 ? 'is' : 'are'} currently ${pipeline?.activeProjects} active project${(pipeline?.activeProjects ?? 0) > 1 ? 's' : ''} in the pipeline. Based on current capacity, the earliest estimated start date for a new project is `}
                  {weeksOut > 0 && (
                    <strong>{startDateStr}</strong>
                  )}
                  {weeksOut > 0 && ` (approximately ${weeksOut} week${weeksOut !== 1 ? 's' : ''} from now).`}
                </p>
                <p className={`text-xs mt-2 ${
                  weeksOut === 0 ? 'text-green-600' : weeksOut <= 4 ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  * This is an estimate based on current workload. Actual start date will be confirmed in your proposal.
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Project Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Project</dt>
                <dd className="font-medium text-gray-800">{form.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium text-gray-800 capitalize">{form.serviceCategory || 'Pilot'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Industry</dt>
                <dd className="font-medium text-gray-800">
                  {INDUSTRY_OPTIONS.find((i) => i.value === form.industry)?.label || form.industry}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Complexity</dt>
                <dd className="font-medium text-gray-800 capitalize">{form.complexity}</dd>
              </div>
              {form.features.length > 0 && (
                <div>
                  <dt className="text-gray-500 mb-2">Selected Features</dt>
                  <dd className="flex flex-wrap gap-1">
                    {form.features.map((f) => (
                      <span key={f} className="bg-brand/10 text-brand text-xs px-2 py-1 rounded-full">{f}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-teal-50 border border-brand/20 rounded-2xl p-6 mb-8 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-1">What happens next?</p>
            Scott will review your submission and reach out within <strong>24 hours</strong> with
            a formal proposal, any clarifying questions, and a confirmed start date. This estimate
            is a starting point — the final proposal will reflect your exact requirements.
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact" className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
              Schedule a Call <FiArrowRight />
            </Link>
            <Link href="/" className="btn-secondary flex-1 text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-16">
        <div className="section-container text-center">
          <p className="text-teal-100 uppercase tracking-widest text-sm font-semibold mb-3">Project Estimator</p>
          {preselectedService && SERVICE_CONFIGS[preselectedService] ? (
            <>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {SERVICE_CONFIGS[preselectedService].label}
              </h1>
              <p className="text-teal-100 text-lg max-w-2xl mx-auto">
                Get an instant cost and timeline estimate for your {SERVICE_CONFIGS[preselectedService].label.toLowerCase()} project — no commitment required.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get a Project Estimate</h1>
              <p className="text-teal-100 text-lg max-w-2xl mx-auto">
                Answer a few questions about your project and we&apos;ll generate an instant cost
                and timeline estimate — no commitment required.
              </p>
            </>
          )}
        </div>
      </section>

      <div className="section-container py-12 max-w-2xl">
        <StepDots current={step} total={TOTAL_STEPS} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >

            {/* Step 0 — Contact Info */}
            {step === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Let&apos;s start with you</h2>
                <p className="text-gray-500 text-sm mb-6">We&apos;ll send your estimate and proposal to this email.</p>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                      <input className="input" placeholder="Your name" value={form.name} onChange={(e) => update('name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                      <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                      <input className="input" placeholder="Company name (optional)" value={form.company} onChange={(e) => update('company', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Industry + Country (compliance gate) */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">About your business</h2>
                <p className="text-gray-500 text-sm mb-6">
                  We need this to confirm we can serve your project.
                </p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Industry *</label>
                    <select
                      className="input w-full"
                      value={form.industry}
                      onChange={(e) => update('industry', e.target.value)}
                    >
                      <option value="">Select your industry...</option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}{('restricted' in opt && opt.restricted) ? ' ⚠️' : ''}
                        </option>
                      ))}
                    </select>
                    {RESTRICTED_INDUSTRIES.includes(form.industry) && (
                      <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <FiAlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">
                          <strong>Note:</strong> This industry is restricted. Clicking Next will show you more information.
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Country *</label>
                    <select
                      className="input w-full"
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                    >
                      <option value="">Select your country...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}{SANCTIONED_COUNTRIES.includes(c) ? ' ⚠️' : ''}
                        </option>
                      ))}
                    </select>
                    {SANCTIONED_COUNTRIES.includes(form.country) && (
                      <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                        <FiAlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-700">
                          <strong>Note:</strong> This country is subject to OFAC sanctions. Clicking Next will show you more information.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Project Type (service-aware) */}
            {step === 2 && (() => {
              const cfg = SERVICE_CONFIGS[form.serviceCategory];
              return (
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">What type of engagement?</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    {cfg
                      ? `Choose how you'd like to start your ${cfg.label} project.`
                      : 'Not sure yet? A pilot is a great low-risk way to start.'}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Pilot card */}
                    <button
                      onClick={() => update('projectType', 'pilot')}
                      className={`text-left p-6 rounded-xl border-2 transition-all ${
                        form.projectType === 'pilot' ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-bold text-gray-800 text-lg">Pilot Project</span>
                        {form.projectType === 'pilot' && (
                          <span className="w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                            <FiCheck size={12} className="text-white" />
                          </span>
                        )}
                      </div>
                      <div className="text-brand font-semibold text-sm mb-2">
                        ${(cfg?.pilotLow ?? 1500).toLocaleString()} – ${(cfg?.pilotHigh ?? 3000).toLocaleString()}
                      </div>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                        {cfg
                          ? cfg.pilotDeliverable
                          : 'A small, scoped engagement to prove the concept and build confidence.'}
                      </p>
                      {cfg && (
                        <ul className="space-y-1 mb-2">
                          {cfg.pilotExamples.map((ex) => (
                            <li key={ex} className="flex items-start gap-2 text-xs text-gray-500">
                              <span className="w-1 h-1 rounded-full bg-brand inline-block mt-1.5 flex-shrink-0" />{ex}
                            </li>
                          ))}
                        </ul>
                      )}
                      <ul className="space-y-1 mt-3 border-t border-gray-100 pt-3">
                        {['2-week delivery', 'Full code ownership', 'Low-risk commitment'].map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-1 h-1 rounded-full bg-brand inline-block" />{f}
                          </li>
                        ))}
                      </ul>
                    </button>

                    {/* Full project card */}
                    <button
                      onClick={() => update('projectType', 'full')}
                      className={`text-left p-6 rounded-xl border-2 transition-all ${
                        form.projectType === 'full' ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-bold text-gray-800 text-lg">Full Project</span>
                        {form.projectType === 'full' && (
                          <span className="w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                            <FiCheck size={12} className="text-white" />
                          </span>
                        )}
                      </div>
                      <div className="text-brand font-semibold text-sm mb-2">
                        {cfg
                          ? `$${cfg.fullLow.toLocaleString()} – $${cfg.fullHigh.toLocaleString()}`
                          : 'Custom estimate'}
                      </div>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                        {cfg ? cfg.fullDescription : 'A complete end-to-end build from architecture to production deployment.'}
                      </p>
                      {cfg && (
                        <ul className="space-y-1">
                          {cfg.fullFeatures.slice(0, 5).map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs text-gray-500">
                              <span className="w-1 h-1 rounded-full bg-brand inline-block mt-1.5 flex-shrink-0" />{f}
                            </li>
                          ))}
                          {cfg.fullFeatures.length > 5 && (
                            <li className="text-xs text-gray-400 pl-3">+ {cfg.fullFeatures.length - 5} more</li>
                          )}
                        </ul>
                      )}
                      {!cfg && (
                        <ul className="space-y-1">
                          {['Full scope & milestone plan', 'Regular progress updates', 'Client portal access', 'Post-launch support'].map((f) => (
                            <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="w-1 h-1 rounded-full bg-brand inline-block" />{f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Step 3 — Service Category */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                {form.projectType === 'pilot' && preselectedService && SERVICE_CONFIGS[preselectedService] ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      {SERVICE_CONFIGS[preselectedService].label} Pilot
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      Fixed-scope, 2-week engagement at ${SERVICE_CONFIGS[preselectedService].pilotLow.toLocaleString()}–${SERVICE_CONFIGS[preselectedService].pilotHigh.toLocaleString()}.
                    </p>
                    <div className="bg-teal-50 border border-brand/20 rounded-xl p-5 text-sm text-gray-600 leading-relaxed mb-4">
                      <p className="font-semibold text-gray-800 mb-2">What&apos;s included:</p>
                      <p className="mb-3">{SERVICE_CONFIGS[preselectedService].pilotDeliverable}</p>
                      <ul className="space-y-1">
                        {SERVICE_CONFIGS[preselectedService].pilotExamples.map((ex) => (
                          <li key={ex} className="flex items-center gap-2 text-gray-600 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block flex-shrink-0" />{ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 text-sm text-gray-600">
                      Pilots are low-risk by design. Full code ownership, clean documentation, and a clear path to a full project if you want to continue.
                    </div>
                  </>
                ) : form.projectType === 'pilot' ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Pilot Project</h2>
                    <p className="text-gray-500 text-sm mb-6">
                      A 2-week, fixed-scope engagement at $1,500–$3,000. Tell us what you want to build
                      in the next step and we&apos;ll scope it out.
                    </p>
                    <div className="bg-teal-50 border border-brand/20 rounded-xl p-5 text-sm text-gray-600 leading-relaxed">
                      Pilots are designed to be a low-risk starting point. We&apos;ll scope one
                      focused feature or module, deliver it in 2 weeks, and you get full ownership of the code.
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">What&apos;s the focus?</h2>
                    <p className="text-gray-500 text-sm mb-6">Select the primary service category for your project.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { key: 'salesforce', label: 'Salesforce Development',   sub: 'LWC, Apex, Flows, integrations',         range: '$8k – $35k' },
                        { key: 'web',        label: 'Web Application',           sub: 'React, Next.js, full-stack',             range: '$8k – $40k' },
                        { key: 'api',        label: 'API & Backend',             sub: 'REST, GraphQL, integrations',            range: '$5k – $25k' },
                        { key: 'database',   label: 'Database Architecture',     sub: 'PostgreSQL, Prisma, schema design',      range: '$3k – $15k' },
                        { key: 'devops',     label: 'Cloud & DevOps',            sub: 'CI/CD, Docker, AWS/Vercel/Railway',      range: '$3k – $20k' },
                        { key: 'security',   label: 'Security & Auth Systems',   sub: 'OAuth, RBAC, session management',        range: '$4k – $15k' },
                        { key: 'consulting', label: 'Technology Consulting',     sub: 'Architecture, audits, advisory',         range: '$150–$250/hr' },
                      ].map((opt) => (
                        <button key={opt.key} onClick={() => update('serviceCategory', opt.key)}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            form.serviceCategory === opt.key ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">{opt.label}</div>
                              <div className="text-gray-400 text-xs mt-0.5">{opt.sub}</div>
                              <div className="text-brand text-xs font-medium mt-1">{opt.range}</div>
                            </div>
                            {form.serviceCategory === opt.key && (
                              <span className="w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                                <FiCheck size={12} className="text-white" />
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4 — Scope */}
            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Tell us about your project</h2>
                <p className="text-gray-500 text-sm mb-6">The more detail, the more accurate the estimate.</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Project Title *</label>
                    <input className="input" placeholder="e.g. Customer Portal, LWC Component Suite" value={form.title} onChange={(e) => update('title', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                    <textarea
                      className="input min-h-[100px] resize-y"
                      placeholder="Describe what you want to build, what problem it solves, and any key requirements..."
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Complexity</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'simple', label: 'Simple', sub: 'Single feature, minimal logic' },
                        { key: 'moderate', label: 'Moderate', sub: 'Multiple features, some integrations' },
                        { key: 'complex', label: 'Complex', sub: 'Large scope, many integrations' },
                      ].map((opt) => (
                        <button key={opt.key} onClick={() => update('complexity', opt.key)}
                          className={`text-left p-3 rounded-xl border-2 transition-all ${
                            form.complexity === opt.key ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40'
                          }`}
                        >
                          <div className="font-semibold text-sm text-gray-800">{opt.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 — Features & Add-ons */}
            {step === 5 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Features & Requirements</h2>
                <p className="text-gray-500 text-sm mb-6">Select all that apply — each adds to the estimate.</p>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Features needed</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(FEATURE_OPTIONS[form.serviceCategory] || FEATURE_OPTIONS.pilot).map((f) => (
                      <button key={f} onClick={() => toggleFeature(f)}
                        className={`flex items-center gap-2 text-left p-3 rounded-lg border transition-all text-sm ${
                          form.features.includes(f) ? 'border-brand bg-brand/5 text-brand font-medium' : 'border-gray-200 text-gray-600 hover:border-brand/40'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                          form.features.includes(f) ? 'bg-brand border-brand' : 'border-gray-300'
                        }`}>
                          {form.features.includes(f) && <FiCheck size={10} className="text-white" />}
                        </span>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Additional requirements</label>
                  {[
                    { key: 'needsAuth',        label: 'Authentication / user login system',   price: '+$1,200' },
                    { key: 'needsHosting',      label: 'Cloud hosting & deployment setup',    price: '+$800' },
                    { key: 'needsIntegrations', label: 'Third-party API integrations',        price: '+$1,500' },
                    { key: 'hasDesign',         label: 'I have existing designs / mockups',   price: 'saves $1,200' },
                  ].map((item) => (
                    <button key={item.key}
                      onClick={() => update(item.key as keyof FormState, !form[item.key as keyof FormState])}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm ${
                        form[item.key as keyof FormState] ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                          form[item.key as keyof FormState] ? 'bg-brand border-brand' : 'border-gray-300'
                        }`}>
                          {form[item.key as keyof FormState] && <FiCheck size={10} className="text-white" />}
                        </span>
                        <span className="text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-xs text-brand font-medium">{item.price}</span>
                    </button>
                  ))}
                </div>
                {form.needsIntegrations && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Which integrations?</label>
                    <input className="input" placeholder="e.g. Stripe, Salesforce, Twilio..." value={form.integrationNotes} onChange={(e) => update('integrationNotes', e.target.value)} />
                  </div>
                )}
              </div>
            )}

            {/* Step 6 — Timeline + Live Estimate */}
            {step === 6 && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Timeline preference</h2>
                  <p className="text-gray-500 text-sm mb-6">Rush timelines carry a premium.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { key: 'asap',     label: 'As soon as possible', sub: 'Rush — 25% premium' },
                      { key: '1month',   label: 'Within 1 month',      sub: 'Priority — 10% premium' },
                      { key: '3months',  label: 'Within 3 months',     sub: 'Standard timeline' },
                      { key: 'flexible', label: 'Flexible',            sub: 'Best value — 5% discount' },
                    ].map((opt) => (
                      <button key={opt.key} onClick={() => update('desiredTimeline', opt.key)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          form.desiredTimeline === opt.key ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm text-gray-800">{opt.label}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                          </div>
                          {form.desiredTimeline === opt.key && (
                            <span className="w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                              <FiCheck size={12} className="text-white" />
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white rounded-2xl p-8">
                  <h3 className="font-bold text-teal-100 uppercase tracking-wide text-sm mb-4">Live Estimate</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-teal-100 text-sm mb-1">Estimated Cost</div>
                      <div className="text-3xl font-bold">
                        ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-teal-100 text-sm mb-1">Estimated Timeline</div>
                      <div className="text-3xl font-bold">
                        {estimate.weeks} {estimate.weeks === 1 ? 'week' : 'weeks'}
                      </div>
                    </div>
                  </div>
                  <p className="text-teal-100 text-xs leading-relaxed">
                    This is a preliminary estimate. A formal proposal with exact pricing will follow after submission.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex items-center gap-2">
              <FiArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <FiArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <FiSend size={16} />
              {loading ? 'Submitting...' : 'Submit & Get Estimate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <PricingInner />
    </Suspense>
  );
}

