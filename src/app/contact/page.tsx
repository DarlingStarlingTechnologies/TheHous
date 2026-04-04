import Link from "next/link";
// import ContactForm from "@/components/ContactForm"; // TODO: re-enable after SendGrid verification

export const metadata = {
  title: "Inquiries — Hous of The Darling Starling",
  description: "Get in touch with Hous of The Darling Starling.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-deep">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="" className="w-10 h-10 opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="font-serif text-lg text-gold/80 group-hover:text-gold transition-colors tracking-wide">
            The Hous
          </span>
        </Link>
        <Link
          href="/"
          className="text-cream-dim/40 text-xs hover:text-cream-dim transition-colors tracking-widest uppercase"
        >
          ← Back
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-white mb-4">
              Inquiries
            </h1>
            <p className="text-cream-dim leading-relaxed text-lg max-w-lg mx-auto">
              For questions, collaborations, or to express interest in the world
              being built here, you are welcome to reach out.
            </p>
          </div>
          {/* TODO: Re-enable ContactForm once SendGrid account is verified */}
          <div className="bg-bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-cream text-lg font-serif mb-3">Inquiries are temporarily unavailable</p>
            <p className="text-cream-dim text-sm leading-relaxed">
              We are setting up our communication channels. Please check back soon, or reach out directly at your convenience.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-cream-dim/20 text-xs">
          © 2026 Hous of The Darling Starling LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
