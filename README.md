# Hous of The Darling Starling

The first live public home of **Hous of The Darling Starling** — a living creative universe, arriving.

This is a temporary but real web presence deployed at [housofthedarlingstarling.com](https://housofthedarlingstarling.com), combining a public landing experience with a secure private owner portal.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Prisma v7** + SQLite (with `better-sqlite3` adapter)
- **NextAuth v5** (credentials provider, JWT sessions)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate a password hash
node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"

# Run database migration
npx prisma migrate dev

# Seed example data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public landing page.

Navigate to [http://localhost:3000/login](http://localhost:3000/login) for the owner portal.

**Default credentials:** `owner@housofthedarlingstarling.com` / `changeme`

## Project Structure

```
src/
  app/
    page.tsx                  # Public landing page
    login/page.tsx            # Owner login
    portal/                   # Private owner portal
      page.tsx                # Dashboard
      projects/page.tsx       # Project management
      legal/page.tsx          # Legal/formation tracking
      financial/page.tsx      # Financial tracking
      bookings/page.tsx       # Booking management
    api/                      # REST API routes
  components/portal/          # Portal UI components
  lib/
    auth.ts                   # NextAuth configuration
    prisma.ts                 # Database client
prisma/
  schema.prisma               # Database schema
  seed.js                     # Seed script
```

## Deployment

Designed for **Vercel** deployment:

1. Push to a Git repository
2. Import in Vercel
3. Set environment variables (see `.env.example`)
4. For production, switch `DATABASE_URL` to a hosted database (e.g., Turso, PlanetScale)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed example data |
| `npm run db:studio` | Open Prisma Studio |
