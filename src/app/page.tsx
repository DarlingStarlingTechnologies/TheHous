import Image from "next/image";
import Link from "next/link";

const capabilities = [
  {
    title: "Nothing gets lost",
    body: "Every email, decision, and conversation is captured and recalled. No dropped threads, no “who said what,” no context evaporating between meetings.",
  },
  {
    title: "Complete requirements",
    body: "Specs are written in full and kept current. Projects start from a clear, shared understanding of what is actually being built.",
  },
  {
    title: "Rigorous testing",
    body: "Builds are tested thoroughly and consistently — edge cases included — so what ships is what was promised.",
  },
  {
    title: "Clear direction",
    body: "Planning and architecture stay coherent from first principle to final feature. No drift, no confused hand-offs.",
  },
  {
    title: "Legal & subject-matter compliance",
    body: "Regulatory and subject-matter concerns are accounted for up front — not patched in after launch.",
  },
  {
    title: "50-state geo-compliance",
    body: "Geographic restrictions and state-by-state compliance are handled across all 50 states, so products launch on solid ground.",
  },
];

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-bg-deep/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={32} height={32} className="opacity-90" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream-dim">
            Starling Labs
          </span>
        </Link>
        <nav className="flex items-center gap-7">
          <a href="#products" className="hidden text-sm text-cream-dim transition-colors hover:text-white sm:block">
            Products
          </a>
          <a href="#approach" className="hidden text-sm text-cream-dim transition-colors hover:text-white sm:block">
            Approach
          </a>
          <Link href="/contact" className="text-sm text-cream-dim transition-colors hover:text-white">
            Contact
          </Link>
          <Link
            href="/login"
            className="text-cream-dim/30 transition-colors hover:text-gold/60"
            aria-label="Owner login"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-deep">
      <Nav />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-grid pt-20">
        <div className="absolute inset-0 glow-gold" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-bg-deep to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="max-w-3xl">
            <p
              className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-cream-dim/60 opacity-0 animate-fade-in"
              style={{ animationFillMode: "forwards" }}
            >
              Hous of The Darling Starling · Software Division
            </p>

            <h1
              className="text-4xl font-semibold leading-[1.05] tracking-tight text-white opacity-0 animate-fade-in delay-100 sm:text-6xl lg:text-7xl"
              style={{ animationFillMode: "forwards" }}
            >
              Software,
              <br />
              engineered with{" "}
              <span className="text-gold">intention.</span>
            </h1>

            <p
              className="mt-8 max-w-xl text-lg leading-relaxed text-cream-dim opacity-0 animate-fade-in delay-200"
              style={{ animationFillMode: "forwards" }}
            >
              Starling Labs designs and builds software products — and the
              systems behind them — both for our own portfolio and for clients.
              One architect, amplified by AI into a firm that doesn&apos;t lose
              the thread.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-4 opacity-0 animate-fade-in delay-300"
              style={{ animationFillMode: "forwards" }}
            >
              <Link
                href="/contact"
                className="rounded-md bg-gold px-7 py-3.5 text-sm font-medium text-bg-deep transition-colors hover:bg-gold-light"
              >
                Start a project
              </Link>
              <a
                href="#products"
                className="rounded-md border border-border-light px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:border-gold/40 hover:text-white"
              >
                See our products
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="border-t border-border/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold/70">
            What we do
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            We build our own products, and we build for clients.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            <div className="bg-bg-card p-8">
              <h3 className="text-lg font-medium text-white">Our products</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                We invent, design, and ship software under our own name —
                AI-powered tools, creator software, and consumer apps. Each one
                is a bet on building something genuinely useful, end to end.
              </p>
            </div>
            <div className="bg-bg-card p-8">
              <h3 className="text-lg font-medium text-white">Client work</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                We take on a small number of client builds — from MVP to full
                product — and carry them the whole way: architecture,
                requirements, testing, compliance, and launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="scroll-mt-20 border-t border-border/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold/70">
            Portfolio
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Products & projects
          </h2>
          <p className="mt-4 max-w-2xl text-cream-dim">
            A snapshot of what we&apos;re building right now — some for the
            world, some for clients, all built to the same standard.
          </p>

          {/* Flagship — Liquid Candy */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-bg-card">
            <Image
              src="/liquid-candy-promo.png"
              alt="Liquid Candy — your AI mixologist. Ask Candy for any cocktail or shot recipe and get the perfect mix, with ingredients, technique, and pro tips."
              width={1535}
              height={1024}
              className="h-auto w-full"
              priority
            />
            <div className="flex flex-col gap-4 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-white">Liquid Candy</h3>
                <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
                  Coming Soon
                </span>
              </div>
              <p className="font-mono text-xs tracking-wide text-cream-dim/70">
                Our first flagship app · arriving on the App Store &amp; Google Play
              </p>
            </div>
          </div>

          {/* Latest tool — Lyric Lab */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-card">
            <Image
              src="/lyric-lab-promo.png"
              alt="Lyric Lab — a lip-sync practice studio. Time-synced lyrics and evidence-based drills that help performers memorize any song."
              width={3200}
              height={1800}
              className="h-auto w-full"
            />
            <div className="border-t border-border px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-white">Lyric Lab</h3>
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
                    In Development
                  </span>
                </div>
                <p className="font-mono text-xs tracking-wide text-cream-dim/70">
                  Our latest tool · a native Android app in active development
                </p>
              </div>
              <p className="mt-5 max-w-3xl leading-relaxed text-cream-dim">
                Lyric Lab is a lip-sync practice studio for performers. Pick a
                song from your phone or cloud storage and it pulls time-synced
                lyrics, then runs evidence-based memorization drills against the
                audio — karaoke highlighting, section looping, pitch-corrected
                slow-down, progressive word-hiding, and a test mode that flags
                exactly what to drill next. Everything caches locally, so a song
                works offline after the first fetch.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Own Product", "React Native", "Expo", "Android"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border-light/60 px-2.5 py-1 font-mono text-[10px] tracking-wide text-cream-dim/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="scroll-mt-20 border-t border-border/40 bg-bg-dark px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold/70">
            The approach
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            One architect. An AI-amplified firm.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-dim">
            Starling Labs is led by a single mind — and extended by AI across
            every part of the business. The result is the focus and consistency
            of one architect, with the coverage and discipline of a full team.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div key={cap.title} className="bg-bg-card p-7">
                <div className="mb-4 h-px w-8 bg-gold/40" />
                <h3 className="text-base font-medium text-white">{cap.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-cream-dim">
                  {cap.body}
                </p>
              </div>
            ))}
          </div>

          {/* Founder */}
          <div className="mt-12 rounded-xl border border-border bg-bg-card p-8 sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-cream-dim/60">
              Lead Architect & Founder
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Anthony Glines
            </h3>
            <p className="mt-4 max-w-3xl leading-relaxed text-cream-dim">
              Anthony is the architect and planner behind every Starling Labs
              product. Rather than scaling with headcount, he scales with
              context — using AI as a team of always-on collaborators that hold
              the full picture of each project. Nothing falls through the
              cracks: requirements stay complete, testing stays rigorous,
              compliance is handled, and direction stays clear from first
              sketch to launch.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 px-6 py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Have something to build?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream-dim">
            Whether it&apos;s an MVP, a full product, or an idea that needs an
            architect — tell us what you have in mind.
          </p>
          <Link
            href="/contact"
            className="mt-9 inline-block rounded-md bg-gold px-8 py-3.5 text-sm font-medium text-bg-deep transition-colors hover:bg-gold-light"
          >
            Start a project
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Image src="/logo.png" alt="" width={28} height={28} className="opacity-70" />
            <div>
              <p className="text-sm text-cream-dim">
                Starling Labs — a division of Hous of The Darling Starling LLC
              </p>
              <p className="mt-0.5 text-xs text-cream-dim/40">
                © 2026 Hous of The Darling Starling LLC. All rights reserved.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/privacy" className="text-xs text-cream-dim/40 transition-colors hover:text-cream-dim">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-cream-dim/40 transition-colors hover:text-cream-dim">
              Terms
            </Link>
            <span className="font-mono text-xs text-cream-dim/30">
              housofthedarlingstarling.com
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
