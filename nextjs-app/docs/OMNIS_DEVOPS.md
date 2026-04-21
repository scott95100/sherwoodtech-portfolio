# Omnis DevOps — Product Specification

> **An STC Product**  
> Status: Pre-development / Planning  
> Last updated: March 2026  
> Tagline: *"Full visibility. Zero complexity. Built for one."*

---

## What Is Omnis DevOps?

**Omnis DevOps** is a lightweight, opinionated DevOps observability and operations platform designed for:

- **Solo DevOps engineers** managing multiple client or internal environments
- **Small engineering teams** (1–5 people) who don't have a dedicated platform engineering team
- **Freelance/agency engineers** who need to show clients what's happening with their infrastructure — without exposing raw tooling

The name **Omnis** (Latin: *all / everything*) reflects the core value: **one platform for all your DevOps signal** — pipelines, deployments, uptime, incidents, and client visibility in one place.

---

## Problem Statement

Small-shop DevOps engineers are forced to context-switch across:
- GitHub Actions / GitLab CI for pipeline status
- AWS Console / Vercel / Railway for deployment state
- PagerDuty / OpsGenie (too expensive) for incidents
- Slack threads and spreadsheets to update clients

There is no tool designed **for the 1-engineer shop** that combines all of this cleanly, affordably, and with a client-facing read-only view built in.

**Omnis DevOps solves this.**

---

## Core Features (v1 MVP)

### 1. Pipeline Dashboard
Connect your CI/CD providers and see all pipelines in one view.

- GitHub Actions integration (webhook receiver)
- GitLab CI integration (webhook receiver)
- CircleCI integration (webhook receiver)
- Per-pipeline status: `passing | failing | running | skipped`
- Run history with duration, branch, triggered-by
- Filter by project / environment

### 2. Deployment Tracker
Log and track deployments across every environment.

- Manual deployment log entry
- Webhook-triggered automatic logging
- Per-environment tracking: `production | staging | dev | preview`
- Tag releases with version/SHA
- Rollback flag (mark a deployment as a rollback)
- 30/60/90 day deployment frequency metrics

### 3. Environment Health Monitor
Know if your endpoints are up before your clients do.

- HTTP health check engine (cron-based, configurable interval)
- Status: `healthy | degraded | down`
- Uptime % over 24h / 7d / 30d rolling windows
- Response time tracking
- Email/webhook alert on status change

### 4. Incident Manager
Simple incident lifecycle management — not enterprise bloat.

- Create incident: title, severity (`P1–P4`), affected systems
- Timeline entries (updates posted during incident)
- Resolve with postmortem notes
- Incident history per project
- Link incidents to deployments (root cause tracking)

### 5. Client Board (Read-Only)
The killer feature — a shareable, read-only view for clients.

- Each project generates a **client token**
- Client accesses their board via:
  - Direct Omnis link: `omnis.sherwoodtech.it.com/board/{token}`
  - **Embedded in STC portfolio client portal** `/client-portal/devops`
- Board shows: deployment history, environment health, open incidents, pipeline status
- No login required for clients — token-authenticated read-only
- Branded with project name (not raw tooling names exposed)

### 6. Alerting (v1)
- Email alerts: pipeline failure, environment down, new incident
- Webhook alerts: POST to any endpoint (Slack, Teams, custom)
- Per-project alert configuration

---

## v2 Features (Post-MVP)

| Feature | Description |
|---|---|
| **Cost Dashboard** | AWS/GCP/Azure spend via billing APIs — per-project cost breakdown |
| **Slack Integration** | Two-way: receive alerts + create incidents from Slack |
| **Scheduled Reports** | Weekly digest emailed to engineer + client |
| **Custom Status Page** | Public status page per project (`status.client-domain.com`) |
| **GitHub PR → Deploy tracking** | Link PRs to deployments end-to-end |
| **Terraform / IaC drift detection** | Alert when live infra diverges from IaC |

---

## Multi-Tenant Architecture

```
Workspace (DevOps Engineer account)
  └── Project A (e.g. "Acme Corp Infrastructure")
  │     └── Environments: prod, staging, dev
  │     └── Pipelines, Deployments, Incidents
  │     └── Client Token → read-only board
  └── Project B (e.g. "Startup XYZ")
        └── Environments: prod, preview
        └── ...
```

- One workspace per engineer/team
- Unlimited projects per workspace (tiered by plan)
- Each project gets one client token (revocable)
- All data is workspace-scoped — no cross-workspace data leakage

---

## API Contract (STC Portfolio Integration)

The STC portfolio site's `/client-portal/devops` page fetches data from Omnis via these read-only endpoints:

```
Base URL: https://api.omnis.sherwoodtech.it.com

GET  /v1/board/{clientToken}/summary
  → { project, environments[], lastDeploy, openIncidents, uptime30d }

GET  /v1/board/{clientToken}/deployments?limit=10
  → [{ id, env, version, status, deployedAt, deployedBy }]

GET  /v1/board/{clientToken}/pipelines?limit=5
  → [{ id, name, branch, status, duration, runAt }]

GET  /v1/board/{clientToken}/incidents?status=open
  → [{ id, title, severity, status, createdAt, resolvedAt }]

GET  /v1/board/{clientToken}/health
  → [{ endpoint, status, uptimePct, responseTimeMs }]
```

All `/v1/board/{token}/*` routes are **public, read-only, rate-limited**.  
The token is a signed JWT or UUID scoped to a single project's read-only data.

---

## Tech Stack (Planned)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (same palette as STC site) |
| Backend | Next.js API routes or separate Node.js/Go service |
| Database | PostgreSQL (Neon or Railway) + Prisma ORM |
| Auth | NextAuth or Clerk (multi-tenant workspace auth) |
| Health checks | Node cron job or Vercel cron |
| CI webhooks | Express receiver or Next.js API routes |
| Hosting | Vercel (frontend) + Railway (backend/cron) |
| Billing | Stripe (v2) |

---

## Pricing Model (Planned)

| Tier | Price | Limits |
|---|---|---|
| **Free** | $0/mo | 1 project, 3 environments, 7-day history |
| **Pro** | $29/mo | 10 projects, unlimited environments, 90-day history, email alerts |
| **Team** | $79/mo | Unlimited projects, team members, 1-year history, webhook alerts |

---

## Branding

- **Product name:** Omnis DevOps
- **Parent brand:** STC (Sherwood Technology Consulting LLC)
- **Full attribution:** *Omnis DevOps — an STC product*
- **Color palette:** Same dark steel + electric blue as STC site (`#0F1923`, `#00D4FF`)
- **Logo:** Separate mark from STC logo (TBD — circuit trace style consistent with STC brand)
- **Domain:** `omnis.sherwoodtech.it.com` (planned subdomain)
- **Repo:** `scott95100/omnis-devops` (new GitHub repo — not yet created)

---

## STC Portfolio Site Tasks (Pre-Omnis)

These can be built now without Omnis being live:

- [ ] `/platform` page — marketing page for Omnis DevOps with waitlist CTA
- [ ] `Waitlist` Prisma model + `POST /api/waitlist` route
- [ ] Admin: Waitlist tab (view signups, name/email/company, export)
- [ ] `/client-portal/devops` scaffold — mock data UI (swap for live API later)
- [ ] Admin: Client token field on `ClientProject` model

---

## Development Order

```
Phase 1 (Portfolio site — now)
  → /platform marketing page + waitlist
  → Admin waitlist tab
  → /client-portal/devops mock UI

Phase 2 (Omnis MVP — new repo)
  → Workspace + project + auth
  → Deployment tracker (manual)
  → Health check engine
  → Client board API
  → Incident manager

Phase 3 (Integration)
  → Portfolio client portal fetches live Omnis data
  → Admin: token management per ClientProject
  → GitHub Actions webhook receiver live

Phase 4 (Growth)
  → Stripe billing
  → Cost dashboard
  → LinkedIn waitlist nurture campaign (via STC campaign manager)
```
