import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Hous of The Darling Starling",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-deep">
      <header className="px-6 py-6 flex items-center justify-between max-w-4xl mx-auto">
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

      <main className="px-6 py-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-light text-white mb-2">Privacy Policy</h1>
        <p className="text-cream-dim/40 text-sm mb-12">Last updated: April 2, 2026</p>

        <div className="space-y-8 text-cream-dim leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-white mb-3">1. Introduction</h2>
            <p>
              Hous of The Darling Starling LLC (&quot;The Hous,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website
              housofthedarlingstarling.com. This Privacy Policy explains how we collect, use, and protect
              your personal information when you visit our website or use our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 text-cream-dim/80">
              <li>
                <strong className="text-cream">Contact information</strong> — name and email address provided
                through our inquiry form.
              </li>
              <li>
                <strong className="text-cream">Inquiry details</strong> — the type of inquiry and any additional
                information you provide in the form fields.
              </li>
              <li>
                <strong className="text-cream">Google account information</strong> — if you sign in with Google,
                we receive your name, email address, and profile picture from your Google account.
              </li>
              <li>
                <strong className="text-cream">Usage data</strong> — standard server logs including IP address,
                browser type, and pages visited.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-cream-dim/80">
              <li>To respond to your inquiries and contact requests.</li>
              <li>To authenticate and manage access to our private portal.</li>
              <li>To communicate with you about bookings, collaborations, or services.</li>
              <li>To improve and maintain our website and services.</li>
              <li>To protect against unauthorized access and abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">4. Google Authentication</h2>
            <p>
              We use Google OAuth for authentication. When you sign in with Google, we access only your
              basic profile information (name, email, profile picture). We do not access your Google
              contacts, calendar, drive, or any other Google services. Your Google password is never
              shared with us — authentication is handled entirely by Google.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">5. Data Storage and Security</h2>
            <p>
              Your information is stored securely and is only accessible to authorized personnel.
              We implement appropriate technical and organizational measures to protect your personal
              data against unauthorized access, alteration, disclosure, or destruction. Portal access
              requires explicit approval by the site administrator.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">6. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-cream-dim/80 mt-3">
              <li>With your explicit consent.</li>
              <li>To comply with legal obligations or respond to lawful requests.</li>
              <li>To protect our rights, property, or safety.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">7. Cookies</h2>
            <p>
              We use essential cookies required for authentication and session management. We do not
              use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">8. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any time
              by contacting us. If you have signed in with Google, you can also revoke access through
              your Google Account settings.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated revision date. Continued use of the website after changes constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:hello@housofthedarlingstarling.com" className="text-gold hover:text-gold-light transition-colors">
                hello@housofthedarlingstarling.com
              </a>
              {" "}or through our{" "}
              <Link href="/contact" className="text-gold hover:text-gold-light transition-colors">
                inquiry form
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="px-6 py-8 text-center">
        <p className="text-cream-dim/20 text-xs">
          © 2026 Hous of The Darling Starling LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
