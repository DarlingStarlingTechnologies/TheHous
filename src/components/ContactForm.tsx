"use client";

import { useState } from "react";

const inquiryTypes = [
  { value: "", label: "Select type of inquiry" },
  { value: "collaboration", label: "Collaboration" },
  { value: "software-development", label: "Software Development" },
  { value: "booking-talent", label: "Booking Talent" },
  { value: "ecosystem-tools", label: "Access to Ecosystem Tools" },
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

      {/* Booking Talent Fields */}
      {t === "booking-talent" && (
        <div className="space-y-5 animate-fade-in" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
          <div>
            <p className={labelClass}>Select Performer</p>
            <div className="space-y-3">
              {[
                {
                  id: "anastasia-starling",
                  name: "Anastasia Starling",
                  photo: "/anastasia-starling.jpg",
                  house: "Rumor's Nightclub",
                  division: "Amateur (Amcab)",
                  titles: [] as string[],
                },
              ].map((performer) => {
                const selected = form.details.performer === performer.id;
                return (
                  <button
                    type="button"
                    key={performer.id}
                    onClick={() => setForm(setDetail(form, "performer", selected ? "" : performer.id))}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all duration-200 ${
                      selected
                        ? "bg-gold/10 border-gold/30"
                        : "bg-bg-card border-border hover:border-border-light"
                    }`}
                  >
                    <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0 border border-border">
                      <img
                        src={performer.photo}
                        alt={performer.name}
                        className="w-full h-full object-cover object-[center_50%]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-serif text-lg tracking-wide ${selected ? "text-gold" : "text-white"}`}>
                        {performer.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-cream-dim/50 text-xs">{performer.house}</span>
                        <span className="text-cream-dim/20 text-xs">|</span>
                        <span className="text-cream-dim/50 text-xs">{performer.division}</span>
                      </div>
                      {performer.titles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {performer.titles.map((title) => (
                            <span
                              key={title}
                              className="text-[10px] uppercase tracking-widest text-gold-dim bg-gold/5 border border-gold/10 rounded-full px-2.5 py-0.5"
                            >
                              {title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] ${
                      selected ? "border-gold/50 bg-gold/20 text-gold" : "border-border-light"
                    }`}>
                      {selected && "✓"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="book-event" className={labelClass}>Event Type</label>
              <select
                id="book-event"
                value={form.details.eventType || ""}
                onChange={(e) => setForm(setDetail(form, "eventType", e.target.value))}
                className={`${inputClass} appearance-none`}
                style={selectStyle}
              >
                <option value="" className="bg-bg-card text-cream">Select...</option>
                <option value="general-show" className="bg-bg-card text-cream">General Show</option>
                <option value="feature-show" className="bg-bg-card text-cream">Feature Show</option>
                <option value="private" className="bg-bg-card text-cream">Private Event</option>
                <option value="corporate" className="bg-bg-card text-cream">Corporate Event</option>
                <option value="festival" className="bg-bg-card text-cream">Festival / Concert</option>
                <option value="venue" className="bg-bg-card text-cream">Venue Residency</option>
                <option value="media" className="bg-bg-card text-cream">Media / Film / TV</option>
                <option value="other" className="bg-bg-card text-cream">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="book-date" className={labelClass}>Event Date</label>
              <input
                id="book-date"
                type="date"
                value={form.details.eventDate || ""}
                onChange={(e) => setForm(setDetail(form, "eventDate", e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="book-location" className={labelClass}>Venue / Location</label>
              <input
                id="book-location"
                type="text"
                value={form.details.venue || ""}
                onChange={(e) => setForm(setDetail(form, "venue", e.target.value))}
                className={inputClass}
                placeholder="Venue name or city"
              />
            </div>
            <div>
              <label htmlFor="book-audience" className={labelClass}>Expected Audience</label>
              <select
                id="book-audience"
                value={form.details.audienceSize || ""}
                onChange={(e) => setForm(setDetail(form, "audienceSize", e.target.value))}
                className={`${inputClass} appearance-none`}
                style={selectStyle}
              >
                <option value="" className="bg-bg-card text-cream">Select...</option>
                <option value="intimate" className="bg-bg-card text-cream">Intimate (under 50)</option>
                <option value="small" className="bg-bg-card text-cream">Small (50–200)</option>
                <option value="medium" className="bg-bg-card text-cream">Medium (200–1,000)</option>
                <option value="large" className="bg-bg-card text-cream">Large (1,000+)</option>
              </select>
            </div>
          </div>
          {/* Budget — contextual based on event type */}
          {form.details.eventType === "festival" ? (
            <p className="text-cream-dim/50 text-sm italic px-1">
              Festival and concert bookings require direct discussion. Please include details in the notes below.
            </p>
          ) : form.details.eventType && (
            <div>
              <label htmlFor="book-budget" className={labelClass}>
                Budget Range
                {form.details.eventType === "general-show" && (
                  <span className="normal-case tracking-normal text-cream-dim/40 ml-2">
                    (standard rate: $50 + tips)
                  </span>
                )}
              </label>
              <select
                id="book-budget"
                value={form.details.budget || ""}
                onChange={(e) => setForm(setDetail(form, "budget", e.target.value))}
                className={`${inputClass} appearance-none`}
                style={selectStyle}
              >
                {form.details.eventType === "general-show" ? (
                  <>
                    <option value="" className="bg-bg-card text-cream">Select...</option>
                    <option value="standard" className="bg-bg-card text-cream">Standard ($50 + tips)</option>
                    <option value="50-100" className="bg-bg-card text-cream">$50 – $100</option>
                    <option value="100-200" className="bg-bg-card text-cream">$100 – $200</option>
                    <option value="200-plus" className="bg-bg-card text-cream">$200+</option>
                  </>
                ) : form.details.eventType === "feature-show" ? (
                  <>
                    <option value="" className="bg-bg-card text-cream">Select...</option>
                    <option value="200-500" className="bg-bg-card text-cream">$200 – $500</option>
                    <option value="500-1000" className="bg-bg-card text-cream">$500 – $1,000</option>
                    <option value="1000-2500" className="bg-bg-card text-cream">$1,000 – $2,500</option>
                    <option value="2500-plus" className="bg-bg-card text-cream">$2,500+</option>
                    <option value="discuss" className="bg-bg-card text-cream">Let's Discuss</option>
                  </>
                ) : (
                  <>
                    <option value="" className="bg-bg-card text-cream">Select...</option>
                    <option value="under-500" className="bg-bg-card text-cream">Under $500</option>
                    <option value="500-1500" className="bg-bg-card text-cream">$500 – $1,500</option>
                    <option value="1500-5000" className="bg-bg-card text-cream">$1,500 – $5,000</option>
                    <option value="5000-plus" className="bg-bg-card text-cream">$5,000+</option>
                    <option value="discuss" className="bg-bg-card text-cream">Let's Discuss</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Ecosystem Tools Fields */}
      {t === "ecosystem-tools" && (
        <div className="space-y-5 animate-fade-in" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
          <p className="text-cream-dim/40 text-sm -mt-1">
            These tools are currently in development and will be available as they launch. Let us know which ones you're interested in and we'll notify you when access becomes available.
          </p>
          <div>
            <label htmlFor="tools-interest" className={labelClass}>Tool of Interest</label>
            <select
              id="tools-interest"
              value={form.details.tool || ""}
              onChange={(e) => setForm(setDetail(form, "tool", e.target.value))}
              className={`${inputClass} appearance-none`}
              style={selectStyle}
            >
              <option value="" className="bg-bg-card text-cream">Select a tool (optional)</option>
              <option value="oddsai" className="bg-bg-card text-cream">OddsAI</option>
              <option value="starling-media" className="bg-bg-card text-cream">Starling Premium Media Tools</option>
              <option value="big-green-machine" className="bg-bg-card text-cream">The Big Green Machine</option>
              <option value="slayjar" className="bg-bg-card text-cream">SlayJar</option>
              <option value="character-expressions" className="bg-bg-card text-cream">Character Expressions & AI Canon Builder</option>
            </select>
            {form.details.tool && (
              <p className="mt-2 text-amber-400/70 text-xs">
                This tool is not yet live. It is currently in development. Leave your details and we'll reach out when it becomes available.
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
