import Image from "next/image";
import Link from "next/link";
import OddsAIPromo from "@/components/OddsAIPromo";
import StarlingMediaToolsPromo from "@/components/StarlingMediaToolsPromo";

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 text-gold-dim/60">
      <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold-dim/40" />
      <span className="text-xs">✦</span>
      <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold-dim/40" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-deep">
      {/* Hero — full-bleed image */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden">
        {/* Logo — top left */}
        <div className="absolute top-5 left-6 z-20 opacity-0 animate-fade-in-slow delay-500" style={{ animationFillMode: "forwards" }}>
          <Image
            src="/logo.png"
            alt="Hous of The Darling Starling"
            width={52}
            height={52}
            className="opacity-80 hover:opacity-100 transition-opacity duration-500"
          />
        </div>

        {/* Login icon — top right */}
        <Link
          href="/login"
          className="absolute top-6 right-6 z-20 text-cream-dim/25 hover:text-gold/60 transition-colors duration-500"
          aria-label="Owner login"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </Link>

        {/* Background image — slow fade in */}
        <div className="absolute inset-0 opacity-0 animate-fade-in-slow delay-300" style={{ animationDuration: "3s", animationFillMode: "forwards" }}>
          <Image
            src="/hous-hero.png"
            alt="Hous of The Darling Starling — an elegant dark estate illuminated at twilight"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/60 via-transparent to-transparent h-1/3" />

        {/* Hero text — positioned at the bottom third */}
        <div className="relative z-10 text-center px-6 pb-20 pt-40 max-w-3xl mx-auto">
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationFillMode: "forwards" }}
          >
            <p className="text-cream-dim/50 text-xs tracking-[0.4em] uppercase mb-6">
              Est. 2026
            </p>
          </div>

          <h1
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white tracking-wide leading-[1.1] opacity-0 animate-fade-in delay-200"
            style={{ animationFillMode: "forwards" }}
          >
            Hous of The
            <br />
            <span className="text-gold">Darling Starling</span>
          </h1>

          <div
            className="mt-8 opacity-0 animate-fade-in delay-400"
            style={{ animationFillMode: "forwards" }}
          >
            <Ornament />
          </div>

          <p
            className="mt-6 text-cream-dim/80 text-lg sm:text-xl font-serif font-light leading-relaxed opacity-0 animate-fade-in delay-500"
            style={{ animationFillMode: "forwards" }}
          >
            A living creative universe, arriving.
          </p>

          {/* Scroll hint */}
          <div
            className="mt-12 opacity-0 animate-fade-in-slow delay-1000"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="animate-shimmer text-cream-dim/30 text-xs tracking-widest">
              ↓
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mb-10">
            What is The Hous?
          </h2>
          <div className="space-y-6 text-cream-dim leading-relaxed text-lg">
            <p>
              The Hous of The Darling Starling is the first public home of an
              expanding creative universe — a place where performance, story,
              identity, and artistry converge into something larger than any
              single expression.
            </p>
            <p>
              It is not yet fully open. What you see here is the first open
              door: a threshold, a soft light in the window, a sign that
              something is being carefully built inside.
            </p>
          </div>
        </div>
      </section>

      {/* Meet Anastasia */}
      <section className="px-6 py-24 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Portrait */}
            <div className="flex-shrink-0">
              <div className="relative w-72 h-[30rem] sm:w-80 sm:h-[34rem] rounded-lg overflow-hidden border border-border">
                <Image
                  src="/anastasia-starling.jpg"
                  alt="Anastasia Starling"
                  fill
                  className="object-cover object-[center_20%]"
                  sizes="(max-width: 1024px) 288px, 320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/80 via-transparent to-transparent" />
              </div>
            </div>

            {/* Bio */}
            <div className="text-center lg:text-left">
              <p className="text-cream-dim/40 text-xs tracking-[0.3em] uppercase mb-4">
                The Resident
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl font-light text-white tracking-wide mb-3">
                Anastasia Starling
              </h2>
              <div className="flex items-center justify-center lg:justify-start gap-3 text-gold-dim/60 mb-8">
                <span className="block flex-1 h-px bg-gradient-to-r from-transparent to-gold-dim/40" />
                <span className="text-xs">✦</span>
                <span className="block flex-1 h-px bg-gradient-to-l from-transparent to-gold-dim/40" />
              </div>
              <div className="space-y-5 text-cream-dim leading-relaxed text-lg">
                <p>
                  Performer. Creator. The beating heart of The Hous.
                </p>
                <p className="text-cream-dim/70">
                  Anastasia Starling is the founder, resident artist, and
                  creative force behind Hous of The Darling Starling. Equal
                  parts glamour and grit, she builds worlds onstage and off —
                  commanding rooms with a presence that refuses to be ignored.
                </p>
                <p className="text-cream-dim/50 text-base">
                  The Hous exists because she does. Everything here — the
                  performances, the tools, the universe being built — carries
                  her name for a reason.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* In Development */}
      <section className="px-6 py-24 border-t border-border/30">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-5 py-2 border border-gold/20 rounded-full mb-10">
            <span className="text-gold text-xs tracking-[0.3em] uppercase">
              In Development
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mb-10">
            First Light
          </h2>
          <div className="space-y-6 text-cream-dim leading-relaxed text-lg max-w-2xl mx-auto">
            <p>
              This is the first public iteration of a much larger creative
              project. The Hous is currently under active development — its
              rooms are being designed, its stories are being written, and its
              systems are being built with care and intention.
            </p>
            <p>
              This site exists as proof of presence: the Hous is real, it has
              an address, and it is on its way.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
            <OddsAIPromo />
            <StarlingMediaToolsPromo />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-6 py-24 border-t border-border/30">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mb-8">
            Inquiries
          </h2>
          <p className="text-cream-dim leading-relaxed text-lg mb-10">
            For questions, collaborations, or to express interest in the world
            being built here, you are welcome to reach out.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-3.5 border border-gold/30 rounded text-gold text-sm
                       tracking-widest uppercase hover:bg-gold/10 hover:border-gold/50
                       transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border/20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-serif text-sm text-cream-dim/50">
              Hous of The Darling Starling LLC
            </p>
            <p className="text-cream-dim/25 text-xs mt-1">
              © 2026 Hous of The Darling Starling LLC. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-end">
            <Link href="/privacy" className="text-cream-dim/20 text-xs hover:text-cream-dim/40 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-cream-dim/20 text-xs hover:text-cream-dim/40 transition-colors">
              Terms
            </Link>
            <span className="text-cream-dim/20 text-xs tracking-widest">
              housofthedarlingstarling.com
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
