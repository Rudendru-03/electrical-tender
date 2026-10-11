# Electrical contractor website

Company website for an electrical contracting firm that takes up work on tender / contract basis.
Public site (English + Hindi), tender / RFQ and quote forms, multi-channel contact, and an admin panel for leads and content.

Stack: Next.js 16 (App Router), Tailwind CSS 4, PostgreSQL + Prisma 7, next-intl.

## Setup

```bash
cp .env.example .env        # then fill in the values
npm install
npm run db:dev -- -d        # optional: local Postgres via `prisma dev`; copy its TCP URL into DATABASE_URL and set DB_POOL_MAX=1
npm run db:migrate          # create tables (use `npm run db:deploy` in production)
npm run db:seed             # first admin user + starter content
npm run dev                 # http://localhost:3000
```

`db:seed` creates the admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. If the password is empty it generates one and prints it once.
The build needs the database, because public pages are prerendered from it.

## Configuration

Everything site-specific is in `.env` (see `.env.example`), read through `src/config/site.ts`:
company name, phone / WhatsApp / emails, social and listing links, channel toggles (`ENABLE_WHATSAPP`, `ENABLE_CALL`, `ENABLE_CHAT`),
home-page stats, upload limits, rate limits, captcha, SMTP and analytics. An empty value hides that element.

- Page copy (both languages): `messages/en.json`, `messages/hi.json`
- Services, projects, credentials, testimonials, blog, jobs: admin panel at `/admin`
- CMS fields: `src/lib/admin/resources.ts`

## How leads flow

1. A visitor submits a form (`/tenders`, `/quote`, `/contact`, `/careers`) -> `POST /api/leads`.
2. The lead is stored with a reference number; attachments go to `UPLOAD_DIR` (private).
3. The team inbox for that lead type and the visitor both get an email (logged to the console until SMTP is set).
4. Staff handle it in `/admin/leads`: status, assignee, notes, files. Leads from calls or WhatsApp can be added by hand with their source channel.

## Before going live

- Replace the sample projects and testimonial, and check the seeded credentials list matches what the firm actually holds.
- Have `/privacy` and `/terms` reviewed.
- Set `SITE_URL`, `SESSION_SECRET`, SMTP and (recommended) Turnstile keys.
- `UPLOAD_DIR` must be on persistent storage and backed up with the database.
- Rate limiting is in-memory: fine for one server instance, needs Redis for more.

## Not built yet (planned phases)

- Phase 2: client login portal, public enquiry-status tracker, quotation builder, tracker for tenders the firm bids on, WhatsApp Business API / chatbot.
- Phase 3: online payments, AMC service tickets, cost estimator, PWA.
