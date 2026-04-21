# STC Platform Expansion — Product Roadmap

> Status: Planning  
> Last updated: March 2026  
> SaaS Product Name: **Omnis DevOps** *(an STC product)*

---

## Overview

STC is expanding from a consulting portfolio site into a **two-product platform**:

1. **STC Portfolio Site** (current) — consulting services, client portal, project pipeline
2. **Omnis DevOps** (new SaaS) — separate codebase, B2B DevOps platform for small teams and solo engineers

The portfolio site will serve as the **marketing funnel and customer portal** for Omnis DevOps — with a dedicated client-facing DevOps board view embedded in the client portal, and a public `/platform` marketing page advertising the product.

---

## Product 1: STC Portfolio Site (this repo)

### Planned Additions

#### A. Client-Facing DevOps Board
A new section of the client portal where clients can see live insight into their project's infrastructure and DevOps pipeline status — powered by data from the SaaS platform via API.

**New route:** `/client-portal/devops`

**Features:**
- Deployment history (environment, status, timestamp, triggered by)
- Current environment health (prod / staging / dev)
- CI/CD pipeline status (last run, pass/fail, duration)
- Incident log (open, resolved, severity)
- Infrastructure uptime summary (30-day rolling)
- Link to full SaaS dashboard (for clients who purchase SaaS access)

**Data source:** REST API call to SaaS platform backend (authenticated via shared client token)

**UI style:** Same dark steel + electric blue theme, card-based layout, status badges (`green/amber/red`)

---

#### B. Omnis DevOps Marketing Page
A new public marketing page to advertise **Omnis DevOps** to site visitors.

**New route:** `/platform`

**Content:**
- Hero: "Omnis DevOps — Built for the 1-Engineer Shop" + tagline
- What it is: solo/small team DevOps observability platform (an STC product)
- Key features list (pipeline visibility, alerting, incident tracking, uptime, cost dashboard)
- Who it's for: 1-engineer DevOps shops, small startups, agencies managing client infra
- Pricing tiers preview (free / pro / team)
- CTA: "Join the waitlist" → email capture form stored in local DB
- Link to `omnis.sherwoodtech.it.com` once live

**DB addition needed:** `Waitlist` model (email, name, company, source, createdAt)

---

#### C. Admin Additions
- Waitlist tab in admin dashboard (view signups, export CSV)
- DevOps board configuration per client (which SaaS tenant they map to)
- Client token management (generate/revoke API tokens for SaaS integration)

---

## Product 2: Omnis DevOps *(an STC product — separate codebase)*

> **Repo:** TBD (new GitHub repo — `scott95100/omnis-devops`)  
> **Domain:** `omnis.sherwoodtech.it.com` (planned)  
> **Stack:** Next.js + Node.js + PostgreSQL, or Go backend (TBD)  
> **Tagline:** *"Full visibility. Zero complexity. Built for one."*

### Product Vision

**Omnis DevOps** is a **lightweight DevOps observability and operations platform** built specifically for:
- Solo DevOps engineers managing multiple client environments
- Small engineering teams (1–5 people) with no dedicated platform team
- Freelance/agency engineers who need client-facing visibility without enterprise tooling complexity

The name *Omnis* (Latin: "all / everything") reflects the goal: **one place for all your DevOps signal**.

### Core Feature Set (v1)

| Feature | Description |
|---|---|
| **Pipeline Dashboard** | Connect GitHub Actions / GitLab CI / CircleCI — see all pipelines in one place |
| **Deployment Tracker** | Log deployments per environment, tag releases, view history |
| **Environment Health** | HTTP health checks on endpoints, uptime tracking, status badges |
| **Incident Manager** | Create/resolve incidents, severity levels, postmortem notes |
| **Client Board** | Read-only shareable view for clients (embedded in STC portfolio client portal) |
| **Alerting** | Email/webhook alerts on pipeline failures or downtime |
| **Cost Dashboard** (v2) | AWS/GCP/Azure spend summary via cloud billing APIs |

### Multi-Tenant Architecture
- Each user (DevOps engineer) has a **workspace**
- Each workspace has multiple **projects** (client environments)
- Each project has a unique **client token** for read-only board sharing
- Clients access their board via STC portfolio site `/client-portal/devops`

### Integration Points with Portfolio Site
```
Omnis DevOps API
  POST /api/clients/{token}/deployments    → log new deployment
  GET  /api/clients/{token}/summary        → portfolio site fetches for client board
  GET  /api/clients/{token}/pipelines      → CI/CD status
  GET  /api/clients/{token}/incidents      → open incidents
```

---

## Integration Architecture

```
[STC Portfolio Site]                    [Omnis DevOps Platform]
  /client-portal/devops  ──── REST ──→   GET /api/clients/{token}/summary
  Admin: token manager   ──── REST ──→   POST /api/tokens (create/revoke)
  /platform (marketing)  ─────────────→  Link to omnis.sherwoodtech.it.com
  Waitlist form          → local DB only (no Omnis dependency)
```

---

## Implementation Order

### Phase 1 — Portfolio site additions (this repo)
- [ ] `/platform` marketing page with waitlist form
- [ ] `Waitlist` Prisma model + API route
- [ ] Admin waitlist tab
- [ ] `/client-portal/devops` page scaffold (mock data first)

### Phase 2 — Omnis DevOps MVP (new repo: `scott95100/omnis-devops`)
- [ ] Auth + workspace + multi-tenant model
- [ ] Deployment logger (manual entry + webhook receiver)
- [ ] Health check engine (cron-based HTTP pings)
- [ ] Client read-only board API (`GET /api/clients/{token}/summary`)
- [ ] Basic incident manager (create, resolve, severity, notes)
- [ ] Simple web UI for the DevOps engineer dashboard

### Phase 3 — Integration
- [ ] Portfolio client portal fetches live data from SaaS API
- [ ] Admin: token management UI
- [ ] CI/CD integrations (GitHub Actions webhook receiver)

### Phase 4 — Growth
- [ ] Pricing tiers + Stripe billing in Omnis DevOps
- [ ] Cost dashboard (AWS Cost Explorer API)
- [ ] LinkedIn/email campaign for waitlist nurture (using existing campaign manager)
- [ ] `omnis.sherwoodtech.it.com` subdomain live

---

## Naming

**Confirmed:** `Omnis DevOps` *(an STC product)*

- *Omnis* — Latin for "all / everything" → one platform for all DevOps signal
- Branding: same dark steel + electric blue (`#00D4FF`) palette as STC site
- Logo: separate mark from STC logo — TBD

---

## Notes

- **Omnis DevOps** is designed to work **standalone** (not dependent on the portfolio site)
- The portfolio site integration is a **read-only consumer** of the Omnis API — no write access from portal
- Keep the two repos completely separate; share only the API contract (documented in `docs/OMNIS_API_CONTRACT.md` once defined)
- Client tokens are scoped to read-only `summary` endpoints — no sensitive DevOps data exposed to clients
- The `/platform` marketing page on the portfolio site should be buildable **before** Omnis is live (waitlist-only mode)
