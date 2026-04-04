"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#080808",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center", padding: "1rem" }}>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.875rem",
              fontWeight: 300,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "rgba(232, 220, 200, 0.6)",
              fontSize: "0.875rem",
              marginBottom: "2rem",
            }}
          >
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              borderRadius: "0.25rem",
              color: "#c9a84c",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
