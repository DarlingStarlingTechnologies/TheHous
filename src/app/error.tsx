"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-3xl font-light text-white mb-4">
          Something went wrong
        </h1>
        <p className="text-cream-dim/60 text-sm mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block px-8 py-3 border border-gold/30 rounded text-gold text-sm
                     tracking-widest uppercase hover:bg-gold/10 hover:border-gold/50
                     transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
