import Image from "next/image";

// Hide on/after this local date in the venue's timezone.
// Show: Sat May 16, 2026 in Muskegon, MI. Banner disappears starting Sun May 17.
const HIDE_ON_OR_AFTER = "2026-05-17";
const VENUE_TIMEZONE = "America/Detroit";

function isPastShow(): boolean {
  const todayAtVenue = new Intl.DateTimeFormat("en-CA", {
    timeZone: VENUE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return todayAtVenue >= HIDE_ON_OR_AFTER;
}

export default function UpcomingShowBanner() {
  if (isPastShow()) return null;

  return (
    <div className="relative z-30 bg-bg-deep border-b border-gold/25">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-3.5 sm:py-4 flex items-center gap-4 sm:gap-5">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gold/40 flex-shrink-0">
          <Image
            src="/anastasia-starling.jpg"
            alt="Anastasia Starling"
            fill
            className="object-cover object-[center_60%]"
            sizes="80px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-gold text-[10px] sm:text-xs tracking-[0.3em] uppercase">
            <span>Upcoming</span>
            <span className="text-gold/40">✦</span>
          </div>
          <p className="font-serif text-lg sm:text-2xl text-white leading-tight mt-0.5">
            May-Hem Drag Show &amp; Dance Night
          </p>
          <p className="text-cream-dim text-xs sm:text-sm mt-1.5 leading-snug">
            Saturday, May 16 · Doors 6:30pm · Show 7pm · Unruly Brewing Co., Downtown Muskegon · $10 advance / $15 at the door
          </p>
          <p className="text-cream-dim/60 text-[11px] sm:text-xs mt-0.5 leading-snug">
            Anastasia Starling — first light at the door · Hosted by{" "}
            <a
              href="https://www.dollhouseproduction.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dim hover:text-gold transition-colors"
            >
              Doll House Productions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
