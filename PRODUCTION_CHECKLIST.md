# Production Readiness Checklist

Manual steps required before deploying to production. Each item requires human action — they cannot be automated by code changes alone.

---

## CRITICAL — Must complete before go-live

### 1. Rotate all exposed secrets
The `.env` file containing real credentials was committed to git history. **All values must be regenerated:**

- [ ] `AUTH_SECRET` — generate a new one: `openssl rand -base64 32`
- [ ] `ADMIN_USERNAME` — choose a new username
- [ ] `ADMIN_PASSWORD` — choose a new strong password
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — regenerate in Google Cloud Console > APIs & Services > Credentials
- [ ] `SENDGRID_API_KEY` — revoke the old key and create a new one in SendGrid dashboard
- [ ] `SENDGRID_FROM_EMAIL` — verify the sender in SendGrid if not already done

### 2. Scrub git history
The old secrets are still in git history even though `.env` is gitignored. Remove them:

- [ ] Install BFG Repo Cleaner or `git filter-repo`
- [ ] Run: `bfg --delete-files .env` or `git filter-repo --path .env --invert-paths`
- [ ] Force-push the cleaned history to remote
- [ ] Confirm no secrets remain: `git log --all -p -- .env`

### 3. Set up Neon Postgres database
Code has been migrated from SQLite to Neon Postgres. You need to create the database and run migrations:

- [ ] Create a Neon account at https://console.neon.tech
- [ ] Create a new project and database
- [ ] Copy the connection string and set it as `DATABASE_URL` in `.env`
- [ ] Delete old SQLite migrations: `rm -rf prisma/migrations`
- [ ] Run `npm install` (installs new `@neondatabase/serverless` and `@prisma/adapter-neon`, removes old `better-sqlite3`)
- [ ] Run `npx prisma migrate dev --name init` to create the Postgres schema
- [ ] Run `npm run db:seed` to populate initial data
- [ ] Test all CRUD operations in the portal
- [ ] Delete `dev.db` and `prisma/seed.js` (no longer needed)

### 4. Set environment variables in Vercel
Do **not** commit secrets to the repo. Set them in the Vercel dashboard:

- [ ] `DATABASE_URL`
- [ ] `AUTH_SECRET`
- [ ] `AUTH_TRUST_HOST=true`
- [ ] `NEXTAUTH_URL=https://housofthedarlingstarling.com`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `ADMIN_USERNAME`
- [ ] `ADMIN_PASSWORD`
- [ ] `SENDGRID_API_KEY`
- [ ] `SENDGRID_FROM_EMAIL`
- [ ] `SENDGRID_FROM_NAME`

---

## HIGH — Should complete before go-live

### 5. Configure Google OAuth redirect URIs
- [ ] In Google Cloud Console, add `https://housofthedarlingstarling.com/api/auth/callback/google` as an authorized redirect URI
- [ ] Remove any `localhost` redirect URIs from the production OAuth client (or use a separate client for dev)

### 6. Configure SendGrid domain authentication
- [ ] Authenticate `mail.housofthedarlingstarling.com` in SendGrid (DNS records: CNAME, DKIM, SPF)
- [ ] Verify the sender email `delivery@mail.housofthedarlingstarling.com`
- [ ] Test email delivery from production

### 7. Set up DNS and domain
- [ ] Point `housofthedarlingstarling.com` to Vercel (DNS settings)
- [ ] Verify SSL certificate is active
- [ ] Set up `www` redirect if desired

### 8. Connect Vercel to the git repo
- [ ] Link the repository in Vercel dashboard
- [ ] Configure build command: `npm run build`
- [ ] Configure output directory (default for Next.js is fine)
- [ ] Set the root directory if the repo isn't at root
- [ ] Trigger a test deployment and verify

---

## MEDIUM — Recommended before or shortly after launch

### 9. Set up error monitoring
- [ ] Add Sentry, LogRocket, or similar (Vercel has built-in error tracking on Pro plan)
- [ ] Replace `console.error` calls with structured logging if desired

### 10. Set up database backups
- [ ] Neon free tier includes 7-day point-in-time restore — verify this is enabled in your project settings
- [ ] For additional safety, set up `pg_dump` on a schedule or use Neon's branching for snapshots

### 11. Review rate limiting for production
- [ ] The contact form rate limiter is in-memory and resets on each serverless cold start
- [ ] Consider upgrading to Upstash Redis or Vercel KV for persistent rate limiting across instances

### 12. ~~Add database indexes~~ DONE
- [x] Indexes added to schema for `status`, `priority`, `category`, `dateTime`, `createdAt` on all models — will be applied when you run `prisma migrate dev`

---

## Completed (automated fixes already applied)

- [x] Auth guards on all CRUD API routes
- [x] Try-catch error handling on all API routes
- [x] Input validation (title, status, dates, amounts) on all endpoints
- [x] Role whitelist validation on user updates
- [x] Environment variable validation at startup
- [x] Prisma singleton pattern fixed
- [x] Security headers (HSTS, X-Frame-Options, CSP, etc.)
- [x] Error boundaries (error.tsx, global-error.tsx, not-found.tsx)
- [x] Email service graceful handling when unconfigured
- [x] Email failure warning surfaced to admin on user approval
- [x] Database migrated from SQLite to Neon Postgres (schema, adapter, seed script, dependencies)
