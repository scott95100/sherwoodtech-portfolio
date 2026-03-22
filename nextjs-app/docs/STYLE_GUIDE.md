# STC Portfolio Site — Developer & Style Guide

> Last updated: March 2026  
> Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · NextAuth · PostgreSQL/Neon

---

## 1. Color Palette

All colors are defined in `tailwind.config.js` and referenced via Tailwind class names.

| Token | Hex | Usage |
|---|---|---|
| `brand` | `#00D4FF` | Primary accent — links, highlights, active states |
| `brand-light` | `#33DDFF` | Hover state for brand elements |
| `brand-dark` | `#009EBF` | Pressed / subdued brand |
| `surface` / `#1A2535` | Steel panel | Card backgrounds, form containers |
| `surface-dark` / `#0F1923` | Deep steel | Page background color |
| `surface-darker` / `#0A1018` | Darkest | Footer background |
| `surface-border` / `#243044` | Steel border | All borders and dividers |
| `slate-200` | `#E2E8F0` | Primary body text |
| `slate-400` | `#94A3B8` | Secondary / muted text |
| `slate-500` | `#64748B` | Placeholder / dimmed text |

### Rules
- **Never** use raw `gray-*` Tailwind classes — always use `slate-*` or the surface hex values
- **Never** use `bg-white` or `bg-gray-50` — use `bg-[#1A2535]` (card) or `bg-[#0F1923]` (page)
- All `border-*` classes should use `border-[#243044]` or `border-brand/40`

---

## 2. Typography

Font: **Inter** (Google Fonts, loaded in `layout.tsx`)

| Element | Classes |
|---|---|
| Page title (H1) | `text-4xl sm:text-5xl font-bold text-white` |
| Section title | `section-title` → `text-3xl sm:text-4xl font-bold text-brand text-center mb-12` |
| Body text | `text-slate-200` |
| Muted text | `text-slate-400` |
| Hero subtext | `text-brand/70` |
| Label / eyebrow | `text-brand/70 uppercase tracking-widest text-sm font-semibold` |

---

## 3. Global Background

The circuit board background image (`/public/hero-bg.png`) is applied **globally** via `layout.tsx`:

```tsx
// Fixed behind everything, -z-10
<div className="fixed inset-0 -z-10 bg-[#0F1923] bg-cover bg-center bg-no-repeat"
     style={{ backgroundImage: "url('/hero-bg.png')" }} />
<div className="fixed inset-0 -z-10 bg-[#0F1923]/82" /> {/* dark overlay */}
```

### Page-level wrapper rule
Every page's outermost `<div>` **must be `bg-transparent`** so the fixed background shows through:
```tsx
<div className="min-h-screen bg-transparent">
```

### Hero section rule
Hero sections use a local semi-transparent overlay (not a solid gradient):
```tsx
<section className="relative text-white py-24 overflow-hidden">
  <div className="absolute inset-0 bg-[#0F1923]/60" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F1923]" />
  <div className="section-container text-center relative z-10">
    {/* content */}
  </div>
</section>
```

### CTA section rule
Full-width CTA banners at the bottom of pages use the same pattern at higher opacity:
```tsx
<section className="py-20 relative text-white text-center overflow-hidden">
  <div className="absolute inset-0 bg-[#0F1923]/70" />
  <div className="section-container relative z-10">
    {/* content */}
  </div>
</section>
```

---

## 4. Component Classes (`globals.css`)

| Class | Description |
|---|---|
| `.btn-primary` | Electric blue bg (`bg-brand`), dark text, hover `bg-brand-light` |
| `.btn-secondary` | Ghost — `border-brand/50`, hover `bg-brand/10` |
| `.card` | `bg-[#1A2535] border border-[#243044]` + brand border on hover |
| `.input` | `bg-[#0F1923] border border-[#243044] text-slate-200` |
| `.input-error` | Adds `border-red-500` to `.input` |
| `.section-container` | `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` |
| `.section-title` | Standard centered section heading in `text-brand` |

---

## 5. Layout Structure

```
layout.tsx
  └── fixed bg divs (hero-bg.png + overlay)   z-index: -10
  └── <Navbar />                               sticky top-0, z-50
  └── <main>{page content}</main>
  └── <Footer />
```

### Navbar
- File: `src/components/layout/Navbar.tsx`
- Logo: `next/image` → `/public/logo.svg` (200×60 viewBox, `#00D4FF`)
- Height: `h-16`
- Background: `bg-[#0F1923]/95 backdrop-blur-sm border-b border-[#243044]`
- Active link: `text-brand`, default: `text-slate-400`

### Footer
- File: `src/components/layout/Footer.tsx`
- Background: `bg-[#0A1018] border-t border-[#243044]`

---

## 6. Auth & Roles

Handled by **NextAuth** with JWT strategy.

| Role | Access |
|---|---|
| `ADMIN` | `/admin` — full dashboard (users, messages, leads, projects, campaigns) |
| `CLIENT` | `/client-portal` — project board, pipeline view |
| Guest | Public pages only |

Admin seeded via `prisma/seed.js`.  
Credentials: set in `.env.local` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## 7. API Routes (`src/app/api/`)

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/[...nextauth]` | — | NextAuth handler |
| `POST /api/register` | — | Client self-registration |
| `GET/POST /api/contact` | — | Contact form submissions |
| `GET/POST /api/projects` | Admin | Portfolio project CRUD |
| `GET/POST /api/pipeline` | Admin | Lead pipeline management |
| `GET/POST /api/pricing` | — | Pricing estimate submissions |
| `GET/POST /api/admin/*` | Admin | Users, campaigns, invitations |
| `GET/POST /api/client-projects` | Client/Admin | Client project boards |

---

## 8. Database (Prisma / Neon PostgreSQL)

Schema: `prisma/schema.prisma`  
Key models:

- `User` — role: `ADMIN | CLIENT`
- `Portfolio` — public project showcase
- `ContactMessage` — contact form submissions
- `Lead` — sales pipeline entries
- `ClientProject` — client-facing project boards
- `Campaign` — LinkedIn/email campaign manager
- `ClientInvitation` — invite tokens for client onboarding
- `PricingInquiry` — project estimator submissions

Migrations: `prisma/migrations/`  
Run migrations: `npx prisma migrate deploy`  
Seed admin: `node prisma/seed.js`

---

## 9. Environment Variables (`.env.local`)

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## 10. Dev Commands

```bash
# Start dev server
export PATH="$HOME/node20/bin:$PATH"
npm run dev

# Build for production
npm run build

# Prisma studio
npx prisma studio

# Push schema changes (dev)
npx prisma db push

# Run migrations (prod)
npx prisma migrate deploy

# Seed admin user
node prisma/seed.js
```

---

## 11. File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Pages | `page.tsx` in route folder | `app/about/page.tsx` |
| Client components | PascalCase `.tsx` | `AdminClient.tsx` |
| API routes | `route.ts` in route folder | `api/contact/route.ts` |
| Utilities | camelCase `.ts` | `lib/auth.ts` |
| Public assets | kebab-case | `hero-bg.png`, `logo.svg` |

---

## 12. Git Conventions

Branch: `main` (single branch, direct commits)  
Remote: `https://github.com/scott95100/sherwoodtech-portfolio`

Commit message format:
```
type: short description

- bullet detail
- bullet detail
```

Types: `feat` · `fix` · `refactor` · `style` · `docs` · `chore`
