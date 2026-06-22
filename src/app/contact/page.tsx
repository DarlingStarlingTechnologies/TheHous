import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Start a project — Starling Labs",
  description: "Tell Starling Labs about your project, partnership, or product interest.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-deep">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="" className="w-9 h-9 opacity-90" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream-dim group-hover:text-white transition-colors">
            Starling Labs
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
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
              Let&apos;s talk
            </h1>
            <p className="text-cream-dim leading-relaxed text-lg max-w-lg mx-auto">
              Tell us about your project, a partnership, or a product you&apos;d
              like early access to. We read every inquiry.
            </p>
          </div>
          <ContactForm />
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
