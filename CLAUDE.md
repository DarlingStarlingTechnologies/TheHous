# Hous of The Darling Starling — Starling Labs

## What This Is

The live hosted site at `housofthedarlingstarling.com`. The **public face is Starling Labs**, the software division of **Hous of The Darling Starling** (the parent brand). Starling Labs designs and builds software products — its own portfolio and client work. The site is a client-facing software-firm landing page + secure private owner portal.

This is **not** the full Hous creative universe — do not build canon, multiplayer worlds, or performance halls. Note: this site was **rebranded away from a "creative universe / drag performance" framing**. Anastasia Starling and all performance/booking content have been removed from the public face. The sole employee is **Anthony Glines** (lead architect & founder); the firm's differentiator is an AI-amplified, single-architect workflow (nothing lost, complete requirements, rigorous testing, legal/subject-matter + 50-state geo-compliance).

Public products on the landing page: **Liquid Candy** (flagship AI mixologist app, coming soon to the App Store / Google Play) and **The Nest** (shipped client marketing site, nestmuskegon.com). **ToddAI** (formerly OddsAI) and **Starling Premium Music** are early-concept ideas that may be scrapped or kept internal — deliberately **not** shown publicly.

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
- `/` — Starling Labs landing page: sticky nav, hero ("Software, engineered with intention" — Hous eyebrow, "Start a project" CTA), "What we do" (own products + client work), products grid (`ProductCard` × 4), "Approach" section (AI-amplified methodology + Anthony Glines founder card), CTA, footer. Logo at `public/logo.png`. No hero photo — uses a designed grid + gold-glow background.
- `/contact` — Inquiry form with type-specific fields (New Project / Build, Collaboration / Partnership, Product Access / Early Access). Server `inquiryType` values: `software-development`, `collaboration`, `ecosystem-tools` (`booking-talent` still in `VALID_TYPES`/labels server-side but no longer offered in the UI).
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

Modernized toward a clean software-firm look (the public face). Token **names** are unchanged so the portal/login inherit the new palette automatically; only the values were cooled.

- **Palette:** cool near-blacks (`--bg-deep: #0a0b0d`, `--bg-card: #14171c`), gold retained as the brand accent / Hous tie (`--gold: #c9a84c`), cool light-neutral text (`--cream: #e3e6ec`, `--cream-dim: #98a0ac`). Note: `--cream` is now a cool gray, not warm cream.
- **Fonts:** **Inter for headings** (sans, tight tracking) and body; **JetBrains Mono** (`font-mono`, token `--font-jetbrains-mono`) for technical eyebrows/labels. Cormorant Garamond (`font-serif`) is still wired up and used by some portal/auth pages, but the public face no longer uses serif headings.
- **Tailwind tokens:** `bg-bg-deep`, `bg-bg-card`, `bg-bg-dark`, `text-cream`, `text-cream-dim`, `text-gold`, `border-border`, `border-border-light`, `font-mono`. Utilities: `.bg-grid` (technical grid), `.glow-gold` (hero radial glow) in `globals.css`.
- **Logo:** `public/logo.png` — starling bird with gold star, dark background. Used in nav, login, sidebar, contact, favicon, OG image.
- **Tone:** modern, precise, restrained, engineered — a software firm with a tasteful dark-gold brand edge. Not novelty, not theatrical.

## Key Gotchas

- `.env` values with `$` (like bcrypt hashes) get expanded by dotenv. Use single quotes or avoid `$` in env values.
- Prisma v7 `prisma-client` generator outputs ESM TypeScript — works with Next.js bundler but not with `tsx` or plain `node` for standalone scripts. Use `@neondatabase/serverless` directly for seed/scripts.
- Auth config MUST be split into edge-safe (`auth.config.ts`) and full (`auth.ts`) — importing Prisma in middleware causes Edge Runtime errors.
- The `middleware.ts` convention is deprecated in Next.js 16 (replaced by `proxy.ts`) but still works. Migration not urgent.
- Contact form honeypot field + 3-second timing gate silently fake success for bots.
- The Portfolio section in `src/app/page.tsx` uses two bespoke image showcases (no shared card component): **Liquid Candy** as a full-width promo banner (`public/liquid-candy-promo.png`, the owner-supplied ad) with a "Coming Soon" caption bar, and **The Nest** as an image+text showcase (`public/the-nest-preview.png`, a headless-Chrome screenshot of `the-nest-muskegon.vercel.app`) linking to nestmuskegon.com. To re-shoot the Nest preview: `chrome --headless=new --screenshot=public/the-nest-preview.png --window-size=1440,900 <url>` (the git-branch URL is behind Vercel deployment protection; use the production alias).
- The portal still contains a **Bookings** model + CRUD (`/portal/bookings`, `/api/bookings`) left over from the performance era. Not surfaced on the public face; safe to keep or remove later.

## File Layout

```
src/
  app/
    page.tsx                    # Starling Labs landing (hero, products, approach, founder, CTA)
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
  liquid-candy-promo.png        # Liquid Candy advertising banner (flagship product showcase)
  the-nest-preview.png          # The Nest website screenshot (client showcase)
  hous-hero.png                 # Legacy hero image — no longer referenced by the landing page
```
