"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [showAdmin, setShowAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const statusMessage =
    errorParam === "pending"
      ? "Your account is pending approval. The site administrator will review your access."
      : errorParam === "restricted"
        ? "Your access has been restricted. Contact the site administrator."
        : null;

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("admin-credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      router.push("/portal");
      router.refresh();
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/portal" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <img
            src="/logo.png"
            alt="Hous of The Darling Starling"
            className="w-20 h-20 mx-auto mb-6 opacity-90"
          />
          <h1 className="font-serif text-4xl font-light text-gold tracking-wide">
            The Hous
          </h1>
          <p className="text-cream-dim text-sm mt-2 tracking-widest uppercase">
            Private Entrance
          </p>
        </div>

        {statusMessage && (
          <div
            className="mb-8 p-4 rounded border border-amber-400/20 bg-amber-400/5 text-center opacity-0 animate-fade-in delay-100"
            style={{ animationFillMode: "forwards" }}
          >
            <p className="text-amber-400/80 text-sm">{statusMessage}</p>
          </div>
        )}

        <div
          className="space-y-4 opacity-0 animate-fade-in delay-200"
          style={{ animationFillMode: "forwards" }}
        >
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-bg-card border border-border rounded py-3 px-4
                       text-cream hover:border-border-light hover:bg-bg-elevated transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm">Sign in with Google</span>
          </button>

          {/* Admin toggle */}
          {!showAdmin ? (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAdmin(true)}
                className="text-cream-dim/30 text-xs hover:text-cream-dim/50 transition-colors tracking-widest uppercase"
              >
                Administrator Access
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4 pt-4 border-t border-border/50">
              <p className="text-cream-dim/40 text-xs text-center tracking-widest uppercase mb-2">
                Administrator
              </p>
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-bg-card border border-border rounded px-4 py-3 text-cream
                             focus:outline-none focus:border-gold-dim transition-colors
                             placeholder:text-cream-dim/40"
                  placeholder="Username"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-bg-card border border-border rounded px-4 py-3 text-cream
                             focus:outline-none focus:border-gold-dim transition-colors
                             placeholder:text-cream-dim/40"
                  placeholder="Password"
                />
              </div>

              {error && (
                <p className="text-red-400/80 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold/10 border border-gold/30 text-gold rounded py-3
                           hover:bg-gold/20 hover:border-gold/50 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           tracking-widest uppercase text-sm font-medium"
              >
                {loading ? "Entering..." : "Enter"}
              </button>
            </form>
          )}
        </div>

        <div
          className="text-center mt-12 opacity-0 animate-fade-in-slow delay-500"
          style={{ animationFillMode: "forwards" }}
        >
          <a
            href="/"
            className="text-cream-dim/50 text-xs hover:text-cream-dim transition-colors tracking-widest uppercase"
          >
            Return to the front
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
