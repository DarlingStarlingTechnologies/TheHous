"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/portal/Modal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type BookingStatus = "confirmed" | "tentative" | "canceled" | "completed";

interface Booking {
  id: string;
  title: string;
  dateTime: string;
  endTime: string | null;
  location: string | null;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookingFormData {
  title: string;
  dateTime: string;
  endTime: string;
  location: string;
  status: BookingStatus;
  notes: string;
}

const EMPTY_FORM: BookingFormData = {
  title: "",
  dateTime: "",
  endTime: "",
  location: "",
  status: "confirmed",
  notes: "",
};

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "tentative", label: "Tentative" },
  { value: "canceled", label: "Canceled" },
  { value: "completed", label: "Completed" },
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "text-emerald-400",
  tentative: "text-amber-400",
  canceled: "text-red-400/60",
  completed: "text-cream-dim",
};

const STATUS_BG: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-400/10 border-emerald-400/20",
  tentative: "bg-amber-400/10 border-amber-400/20",
  canceled: "bg-red-400/10 border-red-400/20",
  completed: "bg-cream-dim/10 border-cream-dim/20",
};

type FilterTab = "all" | BookingStatus;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateNice(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Convert an ISO string to the value expected by datetime-local inputs. */
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isPast(iso: string): boolean {
  return new Date(iso) < new Date();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookingsPage() {
  /* ---- state ---- */
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [filter, setFilter] = useState<FilterTab>("all");

  /* ---- fetch ---- */
  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data: Booking[] = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ---- derived lists ---- */
  const filtered = useMemo(() => {
    const sorted = [...bookings].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
    if (filter === "all") return sorted;
    return sorted.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const upcoming = useMemo(
    () => filtered.filter((b) => !isPast(b.dateTime)),
    [filtered],
  );
  const past = useMemo(
    () => filtered.filter((b) => isPast(b.dateTime)).reverse(),
    [filtered],
  );

  /* ---- modal helpers ---- */
  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(booking: Booking) {
    setEditing(booking);
    setForm({
      title: booking.title,
      dateTime: toLocalInputValue(booking.dateTime),
      endTime: booking.endTime ? toLocalInputValue(booking.endTime) : "",
      location: booking.location ?? "",
      status: booking.status,
      notes: booking.notes ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  /* ---- CRUD ---- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const body: Record<string, unknown> = {
      title: form.title,
      dateTime: new Date(form.dateTime).toISOString(),
      status: form.status,
      location: form.location || null,
      notes: form.notes || null,
      endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
    };

    try {
      if (editing) {
        const res = await fetch(`/api/bookings/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update booking");
      } else {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create booking");
      }

      closeModal();
      await fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      await fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  /* ---- form field updater ---- */
  function updateField<K extends keyof BookingFormData>(
    key: K,
    value: BookingFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ---- shared input classes ---- */
  const inputClass =
    "w-full bg-bg-card border border-border rounded px-3 py-2 text-cream focus:border-gold-dim focus:outline-none";

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">
            Bookings
          </h1>
          <p className="text-cream-dim/60 text-sm mt-1">
            Manage bookings and appearances.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors self-start sm:self-auto"
        >
          Add Booking
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["all", ...STATUS_OPTIONS.map((s) => s.value)] as FilterTab[]).map(
          (tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider border transition-colors ${
                  active
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-cream-dim/60 hover:text-cream hover:border-border-light"
                }`}
              >
                {tab === "all" ? "All" : tab}
              </button>
            );
          },
        )}
      </div>

      {/* Loading / Error */}
      {loading && (
        <p className="text-cream-dim/40 text-sm animate-pulse">
          Loading bookings...
        </p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Empty state */}
      {!loading && !error && bookings.length === 0 && (
        <div className="bg-bg-card border border-border rounded-lg p-10 text-center">
          <p className="text-cream-dim/60 text-sm">
            No bookings yet. Add one to get started.
          </p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl text-white mb-4">Upcoming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onEdit={() => openEdit(b)}
                onDelete={() => handleDelete(b.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-cream-dim mb-4">Past</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {past.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onEdit={() => openEdit(b)}
                onDelete={() => handleDelete(b.id)}
                dimmed
              />
            ))}
          </div>
        </section>
      )}

      {/* Filtered empty */}
      {!loading &&
        !error &&
        bookings.length > 0 &&
        filtered.length === 0 && (
          <div className="bg-bg-card border border-border rounded-lg p-10 text-center">
            <p className="text-cream-dim/60 text-sm">
              No bookings match the selected filter.
            </p>
          </div>
        )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Booking" : "New Booking"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-wider mb-1.5">
              Title <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
              placeholder="Performance at The Velvet Room"
            />
          </div>

          {/* Date / Time row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-cream-dim text-xs uppercase tracking-wider mb-1.5">
                Start Date &amp; Time <span className="text-gold">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={form.dateTime}
                onChange={(e) => updateField("dateTime", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-cream-dim text-xs uppercase tracking-wider mb-1.5">
                End Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => updateField("endTime", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
              placeholder="The Grand Theatre, London"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value as BookingStatus)
              }
              className={inputClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-cream-dim text-xs uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className={`${inputClass} resize-y min-h-[80px]`}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm text-cream-dim/60 hover:text-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="border border-gold/30 text-gold hover:bg-gold/10 rounded px-4 py-2 text-sm tracking-wider uppercase transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {submitting
                ? "Saving..."
                : editing
                  ? "Update Booking"
                  : "Create Booking"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Booking Card                                                       */
/* ------------------------------------------------------------------ */

function BookingCard({
  booking,
  onEdit,
  onDelete,
  dimmed = false,
}: {
  booking: Booking;
  onEdit: () => void;
  onDelete: () => void;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`bg-bg-card border border-border rounded-lg p-5 flex flex-col justify-between transition-colors hover:border-border-light ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      {/* Top section */}
      <div>
        {/* Status badge + title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-serif text-lg text-cream leading-tight">
            {booking.title}
          </h3>
          <span
            className={`shrink-0 text-[10px] uppercase tracking-widest border rounded-full px-2 py-0.5 ${STATUS_COLORS[booking.status]} ${STATUS_BG[booking.status]}`}
          >
            {booking.status}
          </span>
        </div>

        {/* Date / Time */}
        <div className="space-y-1 mb-3">
          <p className="text-cream-dim text-sm">
            {formatDateNice(booking.dateTime)}
          </p>
          <p className="text-cream-dim/60 text-xs">
            {formatTime(booking.dateTime)}
            {booking.endTime && <> &mdash; {formatTime(booking.endTime)}</>}
          </p>
        </div>

        {/* Location */}
        {booking.location && (
          <p className="text-cream-dim/60 text-xs mb-3">
            <span className="text-gold/60 mr-1">&bull;</span>
            {booking.location}
          </p>
        )}

        {/* Notes */}
        {booking.notes && (
          <p className="text-cream-dim/40 text-xs leading-relaxed line-clamp-3">
            {booking.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
        <button
          onClick={onEdit}
          className="text-xs text-cream-dim/50 hover:text-gold transition-colors tracking-wider uppercase"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-red-400/60 hover:text-red-400 transition-colors tracking-wider uppercase"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
