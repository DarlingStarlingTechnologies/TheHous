import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Hous of The Darling Starling",
};

export default function TermsOfServicePage() {
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
        <h1 className="font-serif text-4xl font-light text-white mb-2">Terms of Service</h1>
        <p className="text-cream-dim/40 text-sm mb-12">Last updated: April 2, 2026</p>

        <div className="space-y-8 text-cream-dim leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the website housofthedarlingstarling.com (the &quot;Site&quot;), operated by
              Hous of The Darling Starling LLC (&quot;The Hous,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be
              bound by these Terms of Service. If you do not agree to these terms, do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">2. Description of Service</h2>
            <p>
              The Site serves as the public presence and private operational portal for Hous of The
              Darling Starling LLC. It includes a public-facing landing page, inquiry form, and a
              private authenticated portal for authorized users. Additional tools and services are
              in development and will be made available over time.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">3. Account Access</h2>
            <p>
              Access to the private portal requires authentication via Google sign-in and explicit
              approval by the site administrator. We reserve the right to grant, deny, or revoke
              access at our sole discretion. You are responsible for maintaining the security of
              your account credentials and for all activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-cream-dim/80">
              <li>Use the Site for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Attempt to gain unauthorized access to any part of the Site or its systems.</li>
              <li>Interfere with or disrupt the Site or servers connected to the Site.</li>
              <li>Submit false, misleading, or fraudulent information through any form.</li>
              <li>Use automated tools, bots, or scrapers to access or collect data from the Site.</li>
              <li>Reproduce, distribute, or create derivative works from the Site content without permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">5. Intellectual Property</h2>
            <p>
              All content on the Site — including but not limited to text, images, logos, graphics,
              design, and software — is the property of Hous of The Darling Starling LLC and is
              protected by copyright, trademark, and other intellectual property laws. The name
              &quot;Hous of The Darling Starling,&quot; the starling logo, and all associated marks are
              trademarks of Hous of The Darling Starling LLC.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">6. Inquiry Submissions</h2>
            <p>
              Information submitted through the inquiry form is used solely for the purpose of
              responding to your request. By submitting an inquiry, you consent to being contacted
              at the email address provided. We are not obligated to respond to or act on any
              inquiry received.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">7. Booking and Services</h2>
            <p>
              Inquiries about booking talent or services do not constitute a contract or agreement.
              All bookings and engagements are subject to separate agreements, availability, and
              terms negotiated directly between the parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">8. Tools and Software</h2>
            <p>
              Certain tools and software referenced on the Site are in development and not yet
              available. References to upcoming tools do not constitute a guarantee of availability,
              features, or release dates. Access to tools, when available, may be subject to
              additional terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">9. Disclaimer of Warranties</h2>
            <p>
              The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either
              express or implied. We do not warrant that the Site will be uninterrupted, error-free,
              or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Hous of The Darling Starling LLC shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages arising
              from your use of or inability to use the Site.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">11. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Changes will be posted on this
              page with an updated revision date. Continued use of the Site after changes constitutes
              acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">12. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the
              state in which Hous of The Darling Starling LLC is organized, without regard to
              conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">13. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{" "}
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
