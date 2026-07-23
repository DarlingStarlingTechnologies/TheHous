"use client";

import { useState } from "react";

const inquiryTypes = [
  { value: "", label: "Select type of inquiry" },
  { value: "software-development", label: "New Project / Build" },
  { value: "collaboration", label: "Collaboration / Partnership" },
  { value: "ecosystem-tools", label: "Product Access / Early Access" },
];

const inputClass =
  "w-full bg-bg-card border border-border rounded px-4 py-3 text-cream focus:outline-none focus:border-gold-dim transition-colors placeholder:text-cream-dim/30";

const labelClass = "block text-xs uppercase tracking-widest text-cream-dim/60 mb-2";

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a9080' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 12px center",
};

interface FormData {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  details: Record<string, string>;
}

const emptyForm: FormData = {
  name: "",
  email: "",
  inquiryType: "",
  message: "",
  details: {},
};

function setDetail(form: FormData, key: string, value: string): FormData {
  return { ...form, details: { ...form.details, [key]: value } };
}

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [honeypot, setHoneypot] = useState("");
  const [loadedAt] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Bot filled the honeypot
    if (honeypot) {
      setStatus("sent");
      return;
    }

    // Form submitted too fast (under 3 seconds) — likely automated
    if (Date.now() - loadedAt < 3000) {
      setStatus("sent");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _t: loadedAt }),
      });

      if (res.ok) {
        setStatus("sent");
        setForm(emptyForm);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <p className="font-serif text-2xl text-gold mb-3">Thank you.</p>
        <p className="text-cream-dim">
          Your inquiry has been received. We will be in touch.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-cream-dim/40 text-xs hover:text-cream-dim transition-colors tracking-widest uppercase"
        >
          Send another
        </button>
      </div>
    );
  }

  const t = form.inquiryType;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className={labelClass}>Name</label>
          <input
            id="contact-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>Email</label>
          <input
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Honeypot — hidden from humans, bots fill it */}
      <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Inquiry Type */}
      <div>
        <label htmlFor="contact-type" className={labelClass}>Type of Inquiry</label>
        <select
          id="contact-type"
          required
          value={form.inquiryType}
          onChange={(e) => setForm({ ...form, inquiryType: e.target.value, details: {} })}
          className={`${inputClass} appearance-none`}
          style={selectStyle}
        >
          {inquiryTypes.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ""} className="bg-bg-card text-cream">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Collaboration Fields */}
      {t === "collaboration" && (
        <div className="space-y-5 animate-fade-in" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="collab-type" className={labelClass}>Nature of Collaboration</label>
              <select
                id="collab-type"
                value={form.details.collabType || ""}
                onChange={(e) => setForm(setDetail(form, "collabType", e.target.value))}
                className={`${inputClass} appearance-none`}
                style={selectStyle}
              >
                <option value="" className="bg-bg-card text-cream">Select...</option>
                <option value="creative" className="bg-bg-card text-cream">Creative / Artistic</option>
                <option value="brand" className="bg-bg-card text-cream">Brand Partnership</option>
                <option value="media" className="bg-bg-card text-cream">Media / Press</option>
                <option value="event" className="bg-bg-card text-cream">Event / Experience</option>
                <option value="other" className="bg-bg-card text-cream">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="collab-timeline" className={labelClass}>Timeline</label>
              <input
                id="collab-timeline"
                type="text"
                value={form.details.timeline || ""}
                onChange={(e) => setForm(setDetail(form, "timeline", e.target.value))}
                className={inputClass}
                placeholder="e.g. Q2 2026, flexible, ongoing"
              />
            </div>
          </div>
          <div>
            <label htmlFor="collab-background" className={labelClass}>Your Background / Expertise</label>
            <input
              id="collab-background"
              type="text"
              value={form.details.background || ""}
              onChange={(e) => setForm(setDetail(form, "background", e.target.value))}
              className={inputClass}
              placeholder="Brief description of your work or practice"
            />
          </div>
          <div>
            <label htmlFor="collab-portfolio" className={labelClass}>Portfolio or Website</label>
            <input
              id="collab-portfolio"
              type="url"
              value={form.details.portfolio || ""}
              onChange={(e) => setForm(setDetail(form, "portfolio", e.target.value))}
              className={inputClass}
              placeholder="https://"
            />
          </div>
        </div>
      )}

      {/* Software Development Fields */}
      {t === "software-development" && (
        <div className="space-y-5 animate-fade-in" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
          <div>
            <label htmlFor="dev-project" className={labelClass}>Project Description</label>
            <input
              id="dev-project"
              type="text"
              value={form.details.projectDescription || ""}
              onChange={(e) => setForm(setDetail(form, "projectDescription", e.target.value))}
              className={inputClass}
              placeholder="Brief overview of the project or need"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="dev-scope" className={labelClass}>Scope</label>
              <select
                id="dev-scope"
                value={form.details.scope || ""}
                onChange={(e) => setForm(setDetail(form, "scope", e.target.value))}
                className={`${inputClass} appearance-none`}
                style={selectStyle}
              >
                <option value="" className="bg-bg-card text-cream">Select...</option>
                <option value="mvp" className="bg-bg-card text-cream">MVP / Prototype</option>
                <option value="full-build" className="bg-bg-card text-cream">Full Build</option>
                <option value="enhancement" className="bg-bg-card text-cream">Enhancement / Feature</option>
                <option value="consulting" className="bg-bg-card text-cream">Consulting / Advisory</option>
                <option value="maintenance" className="bg-bg-card text-cream">Maintenance / Support</option>
              </select>
            </div>
            <div>
              <label htmlFor="dev-timeline" className={labelClass}>Timeline</label>
              <input
                id="dev-timeline"
                type="text"
                value={form.details.timeline || ""}
                onChange={(e) => setForm(setDetail(form, "timeline", e.target.value))}
                className={inputClass}
                placeholder="e.g. 4 weeks, Q3 2026, ASAP"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="dev-budget" className={labelClass}>Budget Range</label>
              <select
                id="dev-budget"
                value={form.details.budget || ""}
                onChange={(e) => setForm(setDetail(form, "budget", e.target.value))}
                className={`${inputClass} appearance-none`}
                style={selectStyle}
              >
                <option value="" className="bg-bg-card text-cream">Select...</option>
                <option value="under-5k" className="bg-bg-card text-cream">Under $5,000</option>
                <option value="5k-15k" className="bg-bg-card text-cream">$5,000 – $15,000</option>
                <option value="15k-50k" className="bg-bg-card text-cream">$15,000 – $50,000</option>
                <option value="50k-plus" className="bg-bg-card text-cream">$50,000+</option>
                <option value="discuss" className="bg-bg-card text-cream">Let's Discuss</option>
              </select>
            </div>
            <div>
              <label htmlFor="dev-platform" className={labelClass}>Platform / Tech</label>
              <input
                id="dev-platform"
                type="text"
                value={form.details.platform || ""}
                onChange={(e) => setForm(setDetail(form, "platform", e.target.value))}
                className={inputClass}
                placeholder="e.g. Web, iOS, API, AI/ML"
              />
            </div>
          </div>
        </div>
      )}

      {/* Ecosystem Tools Fields */}
      {t === "ecosystem-tools" && (
        <div className="space-y-5 animate-fade-in" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
          <p className="text-cream-dim/40 text-sm -mt-1">
            Our products are currently in development and will be available as they launch. Let us know which one you're interested in and we'll notify you when early access becomes available.
          </p>
          <div>
            <label htmlFor="tools-interest" className={labelClass}>Product of Interest</label>
            <select
              id="tools-interest"
              value={form.details.tool || ""}
              onChange={(e) => setForm(setDetail(form, "tool", e.target.value))}
              className={`${inputClass} appearance-none`}
              style={selectStyle}
            >
              <option value="" className="bg-bg-card text-cream">Select a product (optional)</option>
              <option value="toddai" className="bg-bg-card text-cream">ToddAI</option>
              <option value="starling-music" className="bg-bg-card text-cream">Starling Premium Music</option>
              <option value="liquid-candy" className="bg-bg-card text-cream">Liquid Candy</option>
              <option value="lyric-lab" className="bg-bg-card text-cream">Lyric Lab</option>
            </select>
            {form.details.tool && (
              <p className="mt-2 text-amber-400/70 text-xs">
                This product is not yet live. It is currently in development. Leave your details and we'll reach out when it becomes available.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="tools-about" className={labelClass}>What are you looking to do?</label>
            <textarea
              id="tools-about"
              rows={3}
              value={form.details.useCase || ""}
              onChange={(e) => setForm(setDetail(form, "useCase", e.target.value))}
              className={`${inputClass} resize-none`}
              placeholder="Tell us what you'd like to use, what you're hoping to accomplish, or any questions you have"
            />
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          {t ? "Additional Notes" : "Message"}
        </label>
        <textarea
          id="contact-message"
          required={!t}
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder={t ? "Anything else we should know..." : "Tell us about your inquiry..."}
        />
      </div>

      {status === "error" && (
        <p className="text-red-400/80 text-sm text-center">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-10 py-3.5 border border-gold/30 rounded text-gold text-sm
                     tracking-widest uppercase hover:bg-gold/10 hover:border-gold/50
                     transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending..." : "Send Inquiry"}
        </button>
      </div>
    </form>
  );
}
