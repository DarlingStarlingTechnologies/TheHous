# Hous of The Darling Starling

## What This Is

The first live hosted version of **Hous of The Darling Starling** for `housofthedarlingstarling.com`. A temporary but real web presence: public landing site + secure private owner portal. This is **not** the full Hous universe — do not build canon, multiplayer, portal systems, or performance halls.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack dev)
- **Tailwind CSS v4** (configured in `globals.css` via `@theme inline`)
- **Prisma v7** + PostgreSQL via `@prisma/adapter-neon` + `@neondatabase/serverless`
- **NextAuth v5 beta** (Google OAuth + admin credentials, JWT sessions)
- **SendGrid** (`@sendgrid/mail`) for transactional email
- Target deployment: **Vercel**

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run db:seed` — seed example data (`node prisma/seed.js`)
- `npm run db:studio` — open Prisma Studio
- `npx prisma migrate dev` — run migrations
- `npx prisma generate` — regenerate client (runs automatically on `npm install`)

## Architecture

### Public Site
- `/` — Landing page: hero image (`public/hous-hero.png`), logo (`public/logo.png`), Anastasia Starling bio, OddsAI + Starling Media Tools promo cards, inquiry CTA, footer
- `/contact` — Inquiry form with type-specific fields (Collaboration, Software Development, Booking Talent, Ecosystem Tools)
- `/privacy` — Privacy policy
- `/terms` — Terms of service
- `/auth/error` — Styled auth error page

### Owner Portal (`/portal/*`)
Protected by NextAuth. Server-side approval check in `portal/layout.tsx`. Pages: Dashboard (personalized greeting by name + time of day), Projects, Legal, Financial, Bookings. All CRUD pages are client components fetching from API routes.

### User Management (`/portal/users`) — Admin Only
- View pending/approved/restricted Google-authenticated users
- Approve or restrict access, remove users
- Welcome email auto-sent on approval via SendGrid
- "Resend Welcome" button for approved users
- Styled toast notifications (not browser alerts)
- Protected by `portal/users/layout.tsx` server-side admin check

### API Routes (`/api/*`)
- CRUD: projects, legal, financial, bookings (auth-protected)
- `/api/contact` — public, rate-limited (5/15min per IP), honeypot + timing protection, input sanitization
- `/api/users` — admin-only user management
- `/api/users/[id]` — PUT (update status, sends welcome email on approval), POST (resend welcome), DELETE
- `/api/auth/*` — NextAuth handlers

### Auth (Two-tier system)
- **Site Administrator**: username/password via env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). Full portal access including User Management.
- **Google OAuth users**: Must be approved by admin before accessing portal. New sign-ins register as "pending" in User table.
- Auth config split: `auth.config.ts` (edge-safe, no Prisma) for middleware, `auth.ts` (full, with Prisma callbacks) for server.
- Portal layout does server-side approval check — unapproved users redirected to `/login?error=pending`.
- Login page shows Google sign-in button prominently, admin form hidden behind "Administrator Access" toggle.

### Email
- SendGrid via `@sendgrid/mail` — configured in `src/lib/email.ts`
- Templates in `src/lib/email-templates.ts` — dark themed HTML matching site branding
- From: `delivery@mail.housofthedarlingstarling.com`
- Welcome email sent automatically on user approval

### Database
- Prisma v7 with `prisma-client` generator, outputs to `src/generated/prisma/`
- Import PrismaClient from `@/generated/prisma/client`
- Requires `PrismaNeon` adapter with `@neondatabase/serverless` Pool (see `src/lib/prisma.ts`)
- Database hosted on Neon Postgres — connection string in `DATABASE_URL`
- Seed script is ESM (`prisma/seed.mjs`) using `@neondatabase/serverless` directly
- Models: Project, LegalItem, FinancialItem, Booking, ContactInquiry, User

## Design System

- **Palette:** deep blacks (`--bg-deep: #080808`), warm gold (`--gold: #c9a84c`), cream text (`--cream: #e8dcc8`)
- **Fonts:** Cormorant Garamond (serif headings), Inter (body)
- **Tailwind tokens:** `bg-bg-deep`, `bg-bg-card`, `text-cream`, `text-cream-dim`, `text-gold`, `border-border`, `font-serif`
- **Logo:** `public/logo.png` — starling bird with gold star, dark background. Used in landing hero, login, sidebar, contact, favicon, OG image.
- **Tone:** moody, elegant, theatrical, restrained — not SaaS, not corporate, not novelty
- **Key persona:** Anastasia Starling — founder, resident artist. Photo at `public/anastasia-starling.jpg`. Bio section on landing page. Listed as bookable performer in contact form.

## Key Gotchas

- `.env` values with `$` (like bcrypt hashes) get expanded by dotenv. Use single quotes or avoid `$` in env values.
- Prisma v7 `prisma-client` generator outputs ESM TypeScript — works with Next.js bundler but not with `tsx` or plain `node` for standalone scripts. Use `@neondatabase/serverless` directly for seed/scripts.
- Auth config MUST be split into edge-safe (`auth.config.ts`) and full (`auth.ts`) — importing Prisma in middleware causes Edge Runtime errors.
- The `middleware.ts` convention is deprecated in Next.js 16 (replaced by `proxy.ts`) but still works. Migration not urgent.
- Anastasia's photo has a large wig — face detection / `object-top` positioning won't find her face correctly. Use `object-[center_20%]` or similar manual positioning.
- Booking talent performer list is hardcoded. Future integration with Starling Premium Media Tools will make it dynamic.
- Contact form honeypot field + 3-second timing gate silently fake success for bots.

## File Layout

```
src/
  app/
    page.tsx                    # Public landing (hero, bio, promos, inquiry CTA)
    contact/page.tsx            # Inquiry form page
    login/page.tsx              # Google + admin login
    privacy/page.tsx            # Privacy policy
    terms/page.tsx              # Terms of service
    auth/error/page.tsx         # Styled auth error page
    portal/
      layout.tsx                # Auth gate + sidebar shell
      page.tsx                  # Dashboard (personalized greeting)
      projects/page.tsx         # Projects CRUD
      legal/page.tsx            # Legal CRUD
      financial/page.tsx        # Financial CRUD
      bookings/page.tsx         # Bookings CRUD
      users/
        layout.tsx              # Admin-only gate
        page.tsx                # User management
    api/
      auth/[...nextauth]/       # NextAuth handler
      contact/                  # Public inquiry endpoint
      projects/, legal/, financial/, bookings/  # CRUD + [id] subroutes
      users/, users/[id]/       # Admin user management
  components/
    ContactForm.tsx             # Inquiry form with type-specific fields
    OddsAIPromo.jsx             # OddsAI promo card
    StarlingMediaToolsPromo.jsx # Starling Media Tools promo card
    portal/
      Sidebar.tsx               # Portal nav + user profile card
      Modal.tsx                 # Reusable modal dialog
  lib/
    auth.ts                     # NextAuth config (full, with Prisma)
    auth.config.ts              # NextAuth config (edge-safe, no Prisma)
    prisma.ts                   # PrismaClient singleton
    email.ts                    # SendGrid email service
    email-templates.ts          # HTML email templates
  middleware.ts                 # Route protection (edge-safe)
prisma/
  schema.prisma                 # DB schema
  seed.mjs                      # Seed script (ESM, @neondatabase/serverless)
public/
  logo.png                      # Starling logo
  hous-hero.png                 # Landing page hero image
  anastasia-starling.jpg        # Anastasia portrait
```
