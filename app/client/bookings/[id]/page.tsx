"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface BookingDetail {
  id: string;
  status: string;
  total_price: string | number;
  deposit_amount: string | number | null;
  service_fee_amount: string | number | null;
  service_fee_currency: string | null;
  client_currency: string | null;
  expires_at: string | null;
  created_at: string;
  venue: {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
    owner: { email: string; phone: string | null };
  };
  user: { email: string };
  services: Array<{
    quantity: number;
    unit_price: string | number;
    total_price: string | number;
    service: { name: string; type: string };
  }>;
  payments: Array<{
    id: string;
    amount: string | number;
    currency: string;
    status: string;
    method: string;
    created_at: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", locked: "En cours de paiement", confirmed: "Confirmée",
  paid: "Payée", completed: "Terminée", cancelled: "Annulée",
};
const STATUS_CLASSES: Record<string, string> = {
  draft: "badge-default", locked: "badge-warning", confirmed: "badge-or",
  paid: "badge-success", completed: "badge-success", cancelled: "badge-error",
};

function fmt(amount: string | number | null, currency: string | null) {
  if (!amount) return "–";
  const n = Number(amount);
  return currency === "XOF" ? `${n.toLocaleString("fr-FR")} FCFA` : `${n.toLocaleString("fr-FR")} €`;
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((d) => setBooking(d.data));
  }, [id]);

  async function cancelBooking() {
    if (!confirm("Annuler cette réservation ?")) return;
    setCancelling(true);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    setBooking((b) => b ? { ...b, status: "cancelled" } : b);
    setCancelling(false);
  }

  if (!booking) return <div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>;

  const canCancel = ["locked", "confirmed", "paid"].includes(booking.status);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/client/bookings" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Mes réservations</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
            Réservation #{id.slice(0, 8).toUpperCase()}
          </h1>
          <span className={`badge ${STATUS_CLASSES[booking.status] ?? "badge-default"}`}>
            {STATUS_LABELS[booking.status] ?? booking.status}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Espace */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
          <h2 className="font-semibold text-[#1A1410] mb-3">Espace réservé</h2>
          <p className="text-[#1A1410] font-medium">{booking.venue.name}</p>
          {booking.venue.city && <p className="text-sm text-[#1A1410]/60">{booking.venue.city}</p>}
          {booking.venue.address && <p className="text-sm text-[#1A1410]/60">{booking.venue.address}</p>}
          <Link href={`/venues/${booking.venue.id}`} className="text-sm text-[#C4622D] hover:underline mt-1 inline-block">
            Voir la fiche →
          </Link>
        </div>

        {/* Récapitulatif financier */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
          <h2 className="font-semibold text-[#1A1410] mb-3">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            {booking.services.map((bs, i) => (
              <div key={i} className="flex justify-between text-[#1A1410]/70">
                <span>{bs.service.name} {bs.service.type === "mandatory" ? "(inclus)" : ""}</span>
                <span>{fmt(bs.total_price, booking.client_currency)}</span>
              </div>
            ))}
            <div className="flex justify-between text-[#1A1410]/70 pt-2 border-t border-[#ede7e0]">
              <span>Acompte (30%)</span>
              <span>{fmt(booking.deposit_amount, booking.client_currency)}</span>
            </div>
            {booking.service_fee_amount && (
              <div className="flex justify-between text-[#1A1410]/70">
                <span>Frais de service <span className="text-xs">(non remboursables)</span></span>
                <span>{fmt(booking.service_fee_amount, booking.service_fee_currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#1A1410] pt-2 border-t border-[#ede7e0]">
              <span>Total</span>
              <span className="text-[#C4622D]">{fmt(booking.total_price, booking.client_currency)}</span>
            </div>
          </div>
        </div>

        {/* Paiements */}
        {booking.payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
            <h2 className="font-semibold text-[#1A1410] mb-3">Paiements</h2>
            <div className="space-y-2">
              {booking.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#1A1410]/70">{new Date(p.created_at).toLocaleDateString("fr-FR")} · {p.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{fmt(p.amount, p.currency)}</span>
                    <span className={`badge text-xs ${p.status === "succeeded" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-warning"}`}>
                      {p.status === "succeeded" ? "Payé" : p.status === "failed" ? "Échoué" : "En attente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {booking.status === "confirmed" && (
            <Link href={`/book/${booking.venue.id}/pay?bookingId=${id}`} className="btn-primary flex-1 text-center">
              Finaliser le paiement
            </Link>
          )}
          {booking.status === "completed" && (
            <Link href={`/venues/${booking.venue.id}#reviews`} className="btn-secondary flex-1 text-center">
              Laisser un avis
            </Link>
          )}
          {canCancel && (
            <button onClick={cancelBooking} disabled={cancelling} className="btn-ghost text-sm text-red-500 border-red-200 hover:border-red-400">
              {cancelling ? "Annulation…" : "Annuler la réservation"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
