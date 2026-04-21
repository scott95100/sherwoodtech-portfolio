# SherwoodTech Portfolio

A full-stack portfolio site built with **Next.js 14**, **PostgreSQL**, **Prisma ORM**, and **NextAuth.js**.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (credentials) |
| Hosting | Vercel (frontend + API) |
| DB Hosting | Neon or Supabase (free tier) |

---

## Quick Start

### 1. Prerequisites
- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 20`)
- A PostgreSQL database (free options below)

### 2. Install dependencies
```bash
cd nextjs-app
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/portfolio"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
ADMIN_EMAIL="scott@sherwoodtech.it.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="Scott Sherwood"
```

### 4. Set up the database
```bash
# Push schema to DB and generate Prisma client
npm run db:push

# Seed with admin user and sample data
npm run db:seed
```

### 5. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Free Database Options

### Option A: Neon (recommended)
1. Go to [neon.tech](https://neon.tech) → Create free account
2. Create a new project → Copy the connection string
3. Paste into `DATABASE_URL` in `.env.local`

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) → Create free account
2. Create a new project → Settings → Database → Copy "Connection string (URI)"
3. Replace `[YOUR-PASSWORD]` with your project password

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import the repo
3. Set **Root Directory** to `nextjs-app`
4. Add all environment variables from `.env.local`
5. Deploy ✅

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home / hero |
| `/about` | Bio + skills |
| `/projects` | Projects grid (from DB) |
| `/contact` | Contact form (saves to DB) |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Manage your projects (auth required) |
| `/admin` | Admin panel — users, messages, projects (admin only) |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Create new user |
| POST | `/api/contact` | Submit contact message |
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |
| PATCH | `/api/admin/messages/[id]` | Mark message as read |
