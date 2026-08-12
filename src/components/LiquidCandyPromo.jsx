export default function LiquidCandyPromo() {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-8 sm:p-10 text-center h-full flex flex-col">
      {/* Status pill */}
      <div className="mb-8">
        <span className="inline-block px-4 py-1.5 border border-gold/20 rounded-full text-gold text-xs tracking-[0.3em] uppercase">
          Coming Soon
        </span>
      </div>

      {/* Tool name */}
      <h3 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white mb-4">
        Liquid Candy
      </h3>

      {/* Decorative rule */}
      <div className="w-12 h-px bg-gold/30 mx-auto mb-6" />

      {/* Description */}
      <p className="text-cream-dim/60 text-sm leading-relaxed max-w-md mx-auto mb-3">
        Your AI mixologist. Ask Candy for any cocktail or shot and get the
        perfect mix back — ingredients, technique, and the pro tips that make
        it taste like someone who knows what they&apos;re doing made it.
      </p>
      <p className="text-cream-dim/40 text-xs leading-relaxed max-w-sm mx-auto">
        The first flagship app — arriving on the App Store and Google Play.
      </p>
    </div>
  );
}
