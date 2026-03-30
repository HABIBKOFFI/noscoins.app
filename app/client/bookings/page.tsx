"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  status: string;
  total_price: string | number;
  client_currency: string | null;
  created_at: string;
  venue: { name: string; city: string | null };
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", locked: "En cours de paiement", confirmed: "Confirmée",
  paid: "Payée", completed: "Terminée", cancelled: "Annulée",
};
const STATUS_CLASSES: Record<string, string> = {
  draft: "badge-default", locked: "badge-warning", confirmed: "badge-or",
  paid: "badge-success", completed: "badge-success", cancelled: "badge-error",
};

function formatPrice(amount: string | number | null, currency: string | null) {
  if (!amount) return "–";
  const n = Number(amount);
  return currency === "XOF" ? `${n.toLocaleString("fr-FR")} FCFA` : `${n.toLocaleString("fr-FR")} €`;
}

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/bookings?role=client")
      .then((r) => r.json())
      .then((d) => { setBookings(d.data ?? []); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/client" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Mes réservations
        </h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "confirmed", "paid", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm py-1.5 px-4 rounded-full border transition-colors ${
              filter === s ? "border-[#C4622D] bg-[#C4622D] text-white" : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
            }`}
          >
            {s === "all" ? "Toutes" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-12 text-center">
          <p className="text-[#1A1410]/40 mb-4">Aucune réservation pour l&apos;instant.</p>
          <Link href="/search" className="btn-primary text-sm">Trouver un espace</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/client/bookings/${b.id}`}
              className="bg-white rounded-2xl border border-[#ede7e0] p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-[#1A1410] truncate">{b.venue?.name}</span>
                  <span className={`badge text-xs ${STATUS_CLASSES[b.status] ?? "badge-default"}`}>
                    {STATUS_LABELS[b.status] ?? b.status}
                  </span>
                </div>
                <p className="text-sm text-[#1A1410]/60">
                  {b.venue?.city} · {new Date(b.created_at).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-[#C4622D] font-medium mt-0.5">
                  {formatPrice(b.total_price, b.client_currency)}
                </p>
              </div>
              <span className="text-[#1A1410]/30 text-lg">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
