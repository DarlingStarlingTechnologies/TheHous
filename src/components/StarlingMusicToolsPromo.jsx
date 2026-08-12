"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Illustrated beta-access card for Starling Premium Music Tools.
 *
 * The artwork is a stylized illustration, NOT a screenshot or a mock of the
 * real interface. That is deliberate: a fabricated UI would promise an app
 * that looks like something it doesn't, which is the same problem the old
 * hero image had with its imaginary house.
 *
 * Text is real DOM text rather than baked into the image — it stays crisp at
 * any resolution, is selectable and readable by screen readers, and reflows
 * on mobile instead of shrinking to nothing.
 *
 * Every feature named below is non-AI. The app has a persona/chat layer, but
 * it is internal-only and must never be advertised here.
 *
 * Posts to /api/contact: "ecosystem-tools" is in that route's VALID_TYPES and
 * `details` is accepted as an object, sanitized per-value and stringified
 * server-side. Name is required because the API rejects submissions without
 * one, and a failed request says so rather than faking success.
 */

const FEATURES = [
  "YouTube import",
  "Audio workbench",
  "Per-show projects",
  "A-B loop practice",
  "Director delivery",
];

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
      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {/* ── Showcase ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 items-center gap-10 lg:gap-12 p-8 sm:p-10 lg:p-12">
          {/* Copy */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <span className="inline-block px-4 py-1.5 border border-gold/20 rounded-full text-gold text-xs tracking-[0.3em] uppercase">
              Private Beta
            </span>

            <h3 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-white mt-7 mb-4">
              Starling Premium
              <span className="block text-gold">Music Tools</span>
            </h3>

            <div className="w-12 h-px bg-gold/30 mx-auto lg:mx-0 mb-6" />

            <p className="text-cream-dim/70 text-sm leading-relaxed mb-4">
              A desktop studio for performers. Pull audio and video straight
              from YouTube, organize every track by show, cut and clean it
              properly — normalize, trim, pitch, tempo, mix — then deliver the
              final version to your show director without ever leaving the app.
            </p>
            <p className="text-cream-dim/40 text-xs leading-relaxed mb-7">
              Search across every show you have ever built, drill choreography
              against an A-B looping video player, and hand off to a prep
              checklist that takes over when the date is under two weeks out.
              Designed backstage, for backstage.
            </p>

            {/* Feature pills */}
            <ul className="flex flex-wrap justify-center lg:justify-start gap-2">
              {FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="rounded-full border border-border-light/60 px-3 py-1.5 text-[11px] tracking-wide text-cream-dim/60"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Illustration */}
          <div className="order-1 lg:order-2">
            <Image
              src="/music-tools-illustration.png"
              alt="Illustration of a glowing mixing console with faders and knobs, a magenta waveform ribbon rising from it into sparks"
              width={1024}
              height={1024}
              className="w-full h-auto max-w-xs sm:max-w-sm mx-auto"
              sizes="(max-width: 1024px) 384px, 480px"
            />
          </div>
        </div>

        {/* ── Beta access ──────────────────────────────────────────── */}
        <div className="border-t border-border px-8 py-9 sm:px-10 text-center">
          {status === "done" ? (
            <div>
              <p className="text-gold text-sm tracking-wide mb-1">
                Your request is in.
              </p>
              <p className="text-cream-dim/40 text-xs">
                We will be in touch when the next round of beta invitations
                goes out.
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
    </div>
  );
}
