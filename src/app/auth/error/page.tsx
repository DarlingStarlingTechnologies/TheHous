"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please contact the site administrator.",
  AccessDenied: "Access was denied. You may not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An error occurred during authentication. Please try again.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-3xl font-light text-white mb-4">
          Something went wrong
        </h1>
        <p className="text-cream-dim/60 text-sm mb-8">{message}</p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 border border-gold/30 rounded text-gold text-sm
                     tracking-widest uppercase hover:bg-gold/10 hover:border-gold/50
                     transition-all duration-300"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
