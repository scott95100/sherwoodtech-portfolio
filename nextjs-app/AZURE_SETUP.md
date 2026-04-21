# Azure & Microsoft Integration Plan
## Sherwood Technology Consulting LLC

> **Reference document** — steps to complete before wiring into code.
> Delete or move to `/docs` once setup is complete.

---

## 1. Azure Subscription Setup

### Create Account
1. Go to [portal.azure.com](https://portal.azure.com)
2. Sign in with or create a Microsoft account
3. Start a **Pay-As-You-Go** subscription (free to create, only pay for what you use)
4. Azure gives **$200 free credit** for the first 30 days

### Create a Resource Group
- Name: `stc-production`
- Region: `East US 2` (or closest to your clients)
- All STC resources go in this group for easy billing/management

---

## 2. Azure Static Web Apps (Hosting)

### Tier
- **Standard** — $9/month
- Supports Next.js App Router (required for our setup)
- Free SSL, custom domain, GitHub Actions CI/CD

### Setup Steps
1. In Azure Portal → **Create a resource** → search `Static Web Apps`
2. Resource group: `stc-production`
3. Name: `sherwoodtech-portfolio`
4. Plan type: **Standard**
5. Region: `East US 2`
6. Deployment source: **GitHub**
   - Connect to `scott95100/sherwoodtech-portfolio`
   - Branch: `main`
   - Build preset: **Next.js**
7. Azure auto-generates a GitHub Actions workflow file — commit it to repo
8. Every push to `main` triggers an automatic deploy

### Environment Variables to Add in Azure Portal
After creation → Settings → Environment Variables:
```
DATABASE_URL=<your Azure PostgreSQL connection string>
NEXTAUTH_URL=https://sherwoodtech.it.com
NEXTAUTH_SECRET=<generate new strong secret for production>
ADMIN_EMAIL=scott@sherwoodtech.it.com
ADMIN_NAME=Scott Sherwood
AZURE_COMMUNICATION_CONNECTION_STRING=<from step 3>
AZURE_EMAIL_SENDER=noreply@sherwoodtech.it.com
```

### Custom Domain
1. Static Web App → **Custom domains** → Add `sherwoodtech.it.com`
2. Add a CNAME record at your domain registrar pointing to the Azure-generated URL
3. Azure handles SSL certificate automatically (Let's Encrypt)

---

## 3. Azure Communication Services (Email)

### Purpose
Sends all transactional emails from `noreply@sherwoodtech.it.com`:
- Client invite emails with signup link
- Welcome email after client registers
- Password reset emails
- Contact form notification to `sherwoodtechconsulting@gmail.com`

### Cost
- First 100 emails/month: **free**
- After that: **$0.00025/email** (~$0.25 per 1,000 emails)

### Setup Steps

#### Create the ACS Resource
1. Azure Portal → **Create a resource** → search `Communication Services`
2. Resource group: `stc-production`
3. Name: `stc-email`
4. Region: `United States`
5. Click **Create**
6. Once created → go to resource → **Keys** → copy the **Connection String**

#### Add Email Domain
1. In ACS resource → **Email** → **Domains** → **Add domain**
2. Choose **Custom domain**
3. Enter: `sherwoodtech.it.com`
4. Azure gives you **3 DNS records** to add at your registrar:
   - TXT record (domain verification)
   - SPF record (spam prevention)
   - DKIM records (email authentication)
5. Add all records at your registrar, click **Verify**
6. Once verified → sender address `noreply@sherwoodtech.it.com` is active

#### Connect Email Domain to ACS
1. ACS resource → **Email** → **Connected domains** → link your verified domain

---

## 4. Microsoft 365 Business Basic (Optional — Business Inbox)

### Purpose
Gives you a real `scott@sherwoodtech.it.com` inbox instead of Gmail.
Not required for the app to function — purely for professionalism.

### Cost
- **$6/user/month** (annual commitment)
- Includes: Outlook, Teams, SharePoint, 1TB OneDrive

### Setup Steps
1. Go to [microsoft.com/microsoft-365/business](https://www.microsoft.com/microsoft-365/business)
2. Buy **Business Basic** plan
3. Sign in with Microsoft account
4. Add domain `sherwoodtech.it.com` → verify with TXT record at registrar
5. Create user: `scott@sherwoodtech.it.com`
6. Update MX records at registrar to point to Microsoft mail servers
7. Update `ADMIN_EMAIL` env var to `scott@sherwoodtech.it.com`

> **Note:** If you set up M365, ACS email can still send FROM `noreply@sherwoodtech.it.com` 
> while you receive replies at `scott@sherwoodtech.it.com`. These are separate.

---

## 5. Code Changes Required (Post-Setup)

Once Azure services are live, the following needs to be built/updated:

### Install ACS Email SDK
```bash
npm install @azure/communication-email
```

### New file: `src/lib/email.ts`
Central email utility using ACS SDK — functions for:
- `sendInviteEmail(to, token)` — invite link email to new client
- `sendWelcomeEmail(to, name)` — confirmation after registration
- `sendPasswordResetEmail(to, token)` — reset link
- `sendContactNotification(name, email, subject, message)` — alert to Scott

### API Routes to Update
| Route | Change |
|---|---|
| `POST /api/admin/invitations` | Call `sendInviteEmail()` after creating invite |
| `POST /api/register` | Call `sendWelcomeEmail()` after user created |
| `POST /api/contact` | Call `sendContactNotification()` after message saved |
| `POST /api/auth/forgot-password` | New route — call `sendPasswordResetEmail()` |

### New Pages to Build
| Page | Purpose |
|---|---|
| `/forgot-password` | Form to enter email and request reset link |
| `/reset-password` | Form to enter new password (validates token from URL) |

### New Prisma Model Needed
```prisma
model PasswordReset {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique @default(cuid())
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 6. DNS Records Summary

All records to add at your domain registrar (`sherwoodtech.it.com`):

| Type | Host | Value | Purpose |
|---|---|---|---|
| A / CNAME | `@` | Azure Static Web App URL | Main site hosting |
| CNAME | `www` | Azure Static Web App URL | www redirect |
| TXT | `@` | From ACS domain verification | Email domain verify |
| TXT | `@` | `v=spf1 include:azure...` | SPF (spam prevention) |
| CNAME | `selector1._domainkey` | From ACS | DKIM signing |
| CNAME | `selector2._domainkey` | From ACS | DKIM signing |
| MX | `@` | Microsoft mail servers | Only if using M365 inbox |

---

## 7. Decision Checklist

- [x] Register domain `sherwoodtech.it.com` at Namecheap ✅
- [ ] Create Azure subscription at portal.azure.com
- [ ] Decide on M365 Business Basic — yes or skip (keep Gmail)?
- [ ] Create `stc-production` resource group
- [ ] Set up Azure PostgreSQL Flexible Server
- [ ] Set up Azure Static Web Apps (Standard)
- [ ] Set up Azure Communication Services
- [x] Verify `sherwoodtech.it.com` domain in Microsoft 365 ✅
- [ ] Add DNS records at registrar
- [ ] Add all env vars to Azure Static Web App settings
- [ ] Wire ACS email SDK into invite/register/contact API routes
- [ ] Build forgot-password / reset-password flow
- [ ] Test full invite → register → welcome email flow end to end

---

*Created: March 15, 2026*  
*Status: Pre-setup — awaiting Azure account creation*
