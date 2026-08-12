export default function OddsAIPromo() {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-8 sm:p-10 text-center h-full flex flex-col">
      {/* Status pill */}
      <div className="mb-8">
        <span className="inline-block px-4 py-1.5 border border-gold/20 rounded-full text-gold text-xs tracking-[0.3em] uppercase">
          In Development
        </span>
      </div>

      {/* Tool name */}
      <h3 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white mb-4">
        OddsAI
      </h3>

      {/* Decorative rule */}
      <div className="w-12 h-px bg-gold/30 mx-auto mb-6" />

      {/* Description */}
      <p className="text-cream-dim/60 text-sm leading-relaxed max-w-md mx-auto mb-3">
        An AI-powered lottery number picker that analyzes historical frequency
        data to find hot numbers on cold streaks — where pattern meets chance
        and every draw tells a story.
      </p>
      <p className="text-cream-dim/40 text-xs leading-relaxed max-w-sm mx-auto">
        Powered by OpenAI. Glass globe ball machine. Canvas physics.
        Confetti celebrations. A dark space theme for those who dream big.
      </p>
    </div>
  );
}
