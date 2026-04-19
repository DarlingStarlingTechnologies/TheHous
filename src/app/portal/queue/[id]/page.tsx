"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ── types ─────────────────────────────────────────────────── */

type DirectiveStatus = "pending" | "claimed" | "running" | "completed" | "failed";

interface DirectiveResult {
  id: string;
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  summary: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  truncated: boolean;
  error: string | null;
}

interface Directive {
  id: string;
  instruction: string;
  status: DirectiveStatus;
  targetPath: string | null;
  branch: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  claimedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  result: DirectiveResult | null;
}

/* ── helpers ───────────────────────────────────────────────── */

function statusColor(s: DirectiveStatus) {
  switch (s) {
    case "pending":
      return "text-cream-dim/60";
    case "claimed":
      return "text-blue-400";
    case "running":
      return "text-amber-400";
    case "completed":
      return "text-emerald-400";
    case "failed":
      return "text-red-400";
  }
}

function statusBg(s: DirectiveStatus) {
  switch (s) {
    case "pending":
      return "bg-cream-dim/5 border-cream-dim/20";
    case "claimed":
      return "bg-blue-400/10 border-blue-400/20";
    case "running":
      return "bg-amber-400/10 border-amber-400/20";
    case "completed":
      return "bg-emerald-400/10 border-emerald-400/20";
    case "failed":
      return "bg-red-400/10 border-red-400/20";
  }
}

function formatDateTime(iso: string | null) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

/* ── component ─────────────────────────────────────────────── */

export default function DirectiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [directive, setDirective] = useState<Directive | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [stdoutExpanded, setStdoutExpanded] = useState(false);
  const [stderrExpanded, setStderrExpanded] = useState(false);

  const fetchDirective = useCallback(async () => {
    try {
      const res = await fetch(`/api/queue/admin/${id}`);
      if (res.ok) {
        setDirective(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDirective();
  }, [fetchDirective]);

  async function handleRetry() {
    if (!directive) return;
    setRetrying(true);
    try {
      const res = await fetch("/api/queue/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: directive.instruction,
          targetPath: directive.targetPath,
          branch: directive.branch,
          metadata: directive.metadata,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        router.push(`/portal/queue/${created.id}`);
      }
    } finally {
      setRetrying(false);
    }
  }

  const labelCls = "text-xs uppercase tracking-wider text-cream-dim/60";
  const valueCls = "text-cream mt-1";

  if (loading) {
    return (
      <div className="p-12 text-center text-cream-dim/60 text-sm">
        Loading directive...
      </div>
    );
  }

  if (!directive) {
    return (
      <div className="p-12 text-center text-cream-dim/60 text-sm">
        Directive not found.{" "}
        <Link href="/portal/queue" className="text-gold hover:underline">
          Back to queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/portal/queue"
            className="text-cream-dim/40 hover:text-cream-dim text-xs uppercase tracking-wider transition-colors"
          >
            &larr; Back to Queue
          </Link>
          <h1 className="font-serif text-3xl font-light text-white mt-2">
            Directive Detail
          </h1>
          <p className="text-cream-dim/40 text-xs mt-1 font-mono">{directive.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors disabled:opacity-40"
          >
            {retrying ? "Creating..." : "Retry"}
          </button>
        </div>
      </div>

      {/* status + timestamps card */}
      <div className="bg-bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className={labelCls}>Status</p>
            <div className="mt-1">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs border capitalize ${statusColor(directive.status)} ${statusBg(directive.status)}`}
              >
                {directive.status}
              </span>
            </div>
          </div>
          <div>
            <p className={labelCls}>Created</p>
            <p className={valueCls}>{formatDateTime(directive.createdAt)}</p>
          </div>
          <div>
            <p className={labelCls}>Claimed</p>
            <p className={valueCls}>{formatDateTime(directive.claimedAt)}</p>
          </div>
          <div>
            <p className={labelCls}>Completed</p>
            <p className={valueCls}>{formatDateTime(directive.completedAt)}</p>
          </div>
        </div>
      </div>

      {/* instruction card */}
      <div className="bg-bg-card border border-border rounded-lg p-6">
        <p className={labelCls + " mb-2"}>Instruction</p>
        <pre className="text-cream whitespace-pre-wrap text-sm leading-relaxed">
          {directive.instruction}
        </pre>

        {(directive.targetPath || directive.branch) && (
          <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t border-border">
            {directive.targetPath && (
              <div>
                <p className={labelCls}>Target Path</p>
                <p className="text-cream font-mono text-sm mt-1">{directive.targetPath}</p>
              </div>
            )}
            {directive.branch && (
              <div>
                <p className={labelCls}>Branch</p>
                <p className="text-cream font-mono text-sm mt-1">{directive.branch}</p>
              </div>
            )}
          </div>
        )}

        {directive.metadata && Object.keys(directive.metadata).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className={labelCls}>Metadata</p>
            <pre className="text-cream font-mono text-xs mt-1 bg-bg-deep rounded p-3 overflow-x-auto">
              {JSON.stringify(directive.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* result card */}
      {directive.result && (
        <div className="bg-bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-light text-white">Result</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className={directive.result.success ? "text-emerald-400" : "text-red-400"}>
                {directive.result.success ? "Success" : "Failed"}
              </span>
              {directive.result.exitCode !== null && (
                <span className="text-cream-dim/60">
                  Exit code: <span className="text-cream font-mono">{directive.result.exitCode}</span>
                </span>
              )}
              <span className="text-cream-dim/60">
                Duration: <span className="text-cream">{formatDuration(directive.result.durationMs)}</span>
              </span>
              {directive.result.truncated && (
                <span className="text-amber-400 text-xs">Truncated</span>
              )}
            </div>
          </div>

          {/* summary */}
          {directive.result.summary && (
            <div>
              <p className={labelCls}>Summary</p>
              <p className="text-cream text-sm mt-1">{directive.result.summary}</p>
            </div>
          )}

          {/* error */}
          {directive.result.error && (
            <div>
              <p className={labelCls}>Error</p>
              <pre className="text-red-400 text-sm mt-1 bg-red-400/5 border border-red-400/20 rounded p-3 whitespace-pre-wrap">
                {directive.result.error}
              </pre>
            </div>
          )}

          {/* stdout */}
          {directive.result.stdout && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className={labelCls}>Stdout</p>
                <button
                  onClick={() => setStdoutExpanded(!stdoutExpanded)}
                  className="text-gold/60 hover:text-gold text-xs uppercase tracking-wider transition-colors"
                >
                  {stdoutExpanded ? "Collapse" : "Expand"}
                </button>
              </div>
              <pre
                className={`text-cream text-xs font-mono bg-bg-deep rounded p-3 overflow-x-auto whitespace-pre-wrap ${
                  stdoutExpanded ? "max-h-[600px]" : "max-h-48"
                } overflow-y-auto`}
              >
                {directive.result.stdout}
              </pre>
            </div>
          )}

          {/* stderr */}
          {directive.result.stderr && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className={labelCls}>Stderr</p>
                <button
                  onClick={() => setStderrExpanded(!stderrExpanded)}
                  className="text-gold/60 hover:text-gold text-xs uppercase tracking-wider transition-colors"
                >
                  {stderrExpanded ? "Collapse" : "Expand"}
                </button>
              </div>
              <pre
                className={`text-red-300/80 text-xs font-mono bg-bg-deep rounded p-3 overflow-x-auto whitespace-pre-wrap ${
                  stderrExpanded ? "max-h-[600px]" : "max-h-48"
                } overflow-y-auto`}
              >
                {directive.result.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
