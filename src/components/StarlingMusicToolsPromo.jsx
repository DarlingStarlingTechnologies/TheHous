"use client";

import { useState } from "react";

/**
 * Beta-access card for Starling Premium Music Tools.
 *
 * Posts to the same /api/contact endpoint the contact form uses.
 * "ecosystem-tools" is in that route's VALID_TYPES, and `details` is
 * accepted as an object, sanitized per-value and stringified server-side.
 *
 * Two deliberate differences from the older promo card this replaces:
 *   1. Name is REQUIRED here. The API rejects a submission without one,
 *      so leaving it optional produced a guaranteed 400.
 *   2. A failed request shows an error. The old card caught the failure
 *      and displayed the success state anyway, telling people they were
 *      on a list they had never been added to.
 */
export default function StarlingMusicToolsPromo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          inquiryType: "ecosystem-tools",
          details: { tool: "starling-music" },
          message: "Requesting beta access to Starling Premium Music Tools.",
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-6">
      <div className="bg-bg-card border border-border rounded-lg p-8 sm:p-10 text-center">
        {/* Status pill */}
        <div className="mb-8">
          <span className="inline-block px-4 py-1.5 border border-gold/20 rounded-full text-gold text-xs tracking-[0.3em] uppercase">
            Private Beta
          </span>
        </div>

        {/* Tool name */}
        <h3 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white mb-4">
          Starling Premium Music Tools
        </h3>

        {/* Decorative rule */}
        <div className="w-12 h-px bg-gold/30 mx-auto mb-6" />

        {/* Description */}
        <p className="text-cream-dim/60 text-sm leading-relaxed max-w-lg mx-auto mb-3">
          A desktop studio for performers. Pull audio and video straight from
          YouTube, organize every track by show, cut and clean it properly —
          normalize, trim, pitch, tempo, mix — then deliver the final version
          to your show director without ever leaving the app.
        </p>
        {/* Every feature named here is deliberately non-AI. The app has an
            AI persona/chat layer, but it is not shipping in the release, so
            it must not appear in the promo. */}
        <p className="text-cream-dim/40 text-xs leading-relaxed max-w-md mx-auto mb-8">
          Search across every show you have ever built, drill choreography
          against an A-B looping video player, and hand off to a prep
          checklist that takes over when the date is under two weeks out.
          Designed backstage, for backstage.
        </p>

        {/* Divider */}
        <div className="border-t border-border-light/50 my-8" />

        {status === "done" ? (
          <div className="py-4">
            <p className="text-gold text-sm tracking-wide mb-1">
              Your request is in.
            </p>
            <p className="text-cream-dim/40 text-xs">
              We will be in touch when the next round of beta invitations goes
              out.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
            <p className="text-cream-dim text-xs tracking-[0.2em] uppercase mb-5">
              Request Beta Access
            </p>
            <div className="space-y-3 mb-5">
              <input
                type="text"
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-deep border border-border-light rounded px-4 py-2.5 text-sm text-cream placeholder:text-cream-dim/40 focus:outline-none focus:border-gold/30 transition-colors duration-300"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-deep border border-border-light rounded px-4 py-2.5 text-sm text-cream placeholder:text-cream-dim/40 focus:outline-none focus:border-gold/30 transition-colors duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 rounded px-8 py-3 text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Sending..." : "Request Beta Access"}
            </button>

            {status === "error" && (
              <p className="mt-4 text-amber-400/80 text-xs">
                That didn&apos;t go through. Please try again, or use the
                contact form below.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
