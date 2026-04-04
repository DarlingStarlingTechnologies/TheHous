import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-5xl font-light text-gold mb-4">404</h1>
        <h2 className="font-serif text-2xl font-light text-white mb-4">
          Page not found
        </h2>
        <p className="text-cream-dim/60 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 border border-gold/30 rounded text-gold text-sm
                     tracking-widest uppercase hover:bg-gold/10 hover:border-gold/50
                     transition-all duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
