"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface BookingSummary {
  id: string;
  total_price: string | number;
  deposit_amount: string | number | null;
  service_fee_amount: string | number | null;
  service_fee_currency: string | null;
  client_currency: string | null;
  expires_at: string | null;
  venue: { name: string; city: string | null; currency: string };
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [seconds, setSeconds] = useState(() => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 0) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const isUrgent = seconds < 120;

  return (
    <div className={`text-center py-2 px-4 rounded-xl text-sm font-medium ${isUrgent ? "bg-red-50 text-red-600" : "bg-[#FBF5F0] text-[#1A1410]/70"}`}>
      ⏱ Créneau réservé — {m}:{s.toString().padStart(2, "0")} restantes
    </div>
  );
}

function PayForm({ venueId }: { venueId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [method, setMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => {
        setBooking(d.data);
        // Auto-select method based on currency
        if (d.data?.client_currency === "XOF") setMethod("orange_money");
        else setMethod("card");
      });
  }, [bookingId]);

  async function handlePay() {
    if (!bookingId || !method) { setError("Sélectionnez un mode de paiement."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, method }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message ?? "Erreur paiement"); return; }

      if (data.data.provider === "stripe") {
        // Redirect to Stripe hosted checkout or use client secret
        router.push(`/payment/stripe?bookingId=${bookingId}&clientSecret=${data.data.clientSecret}`);
      } else if (data.data.provider === "paydunya") {
        window.location.href = data.data.checkoutUrl;
      }
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (!booking) return <div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>;

  const isCI = booking.client_currency === "XOF";
  const fmt = (n: string | number | null) => {
    if (!n) return "–";
    return isCI ? `${Number(n).toLocaleString("fr-FR")} FCFA` : `${Number(n).toLocaleString("fr-FR")} €`;
  };

  const euMethods = [
    { id: "card", label: "Carte bancaire", icon: "💳" },
    { id: "apple_pay", label: "Apple Pay", icon: "" },
    { id: "google_pay", label: "Google Pay", icon: "G" },
    { id: "sepa", label: "Virement SEPA", icon: "🏦" },
  ];
  const ciMethods = [
    { id: "orange_money", label: "Orange Money", icon: "🟠" },
    { id: "mtn", label: "MTN Mobile Money", icon: "🟡" },
    { id: "moov", label: "Moov Money", icon: "🔵" },
    { id: "wave", label: "Wave", icon: "🌊" },
  ];
  const methods = isCI ? ciMethods : euMethods;

  const serviceFee = Number(booking.service_fee_amount ?? 0);
  const deposit = Number(booking.deposit_amount ?? 0);
  const totalDue = deposit + serviceFee;

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href={`/book/${venueId}`} className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Retour</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Paiement de l&apos;acompte
        </h1>
      </div>

      {booking.expires_at && <div className="mb-4"><CountdownTimer expiresAt={booking.expires_at} /></div>}
      {error && <div className="badge badge-error w-full justify-center mb-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="space-y-4">
        {/* Récap */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
          <p className="font-semibold text-[#1A1410] mb-1">{booking.venue.name}</p>
          {booking.venue.city && <p className="text-sm text-[#1A1410]/60 mb-3">{booking.venue.city}</p>}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[#1A1410]/70">
              <span>Total réservation</span>
              <span>{fmt(booking.total_price)}</span>
            </div>
            <div className="flex justify-between text-[#1A1410]/70">
              <span>Acompte (30%)</span>
              <span>{fmt(booking.deposit_amount)}</span>
            </div>
            {serviceFee > 0 && (
              <div className="flex justify-between text-[#1A1410]/70">
                <span>Frais de service <span className="text-xs">(non remboursables)</span></span>
                <span>{fmt(booking.service_fee_amount)}</span>
              </div>
            )}
            <div className="border-t border-[#ede7e0] pt-2 flex justify-between font-bold text-[#1A1410]">
              <span>À payer maintenant</span>
              <span className="text-[#C4622D] text-base">{fmt(totalDue)}</span>
            </div>
          </div>
        </div>

        {/* Méthode de paiement */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
          <h2 className="font-semibold text-[#1A1410] mb-3">Mode de paiement</h2>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 text-sm transition-colors ${
                  method === m.id
                    ? "border-[#C4622D] bg-[#C4622D]/5 text-[#C4622D]"
                    : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
                }`}
              >
                <span>{m.icon}</span>
                <span className="font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isCI && method && (
          <div className="bg-[#FBF5F0] rounded-xl p-4 text-sm text-[#1A1410]/70">
            Vous allez être redirigé vers votre opérateur mobile money pour confirmer le paiement.
            Gardez votre téléphone à portée.
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading || !method}
          className="btn-primary w-full text-base py-3"
        >
          {loading ? "Redirection…" : `Payer ${fmt(totalDue)}`}
        </button>

        <p className="text-xs text-center text-[#1A1410]/40">
          Paiement sécurisé. {isCI ? "Opéré par PayDunya." : "Opéré par Stripe."}
        </p>
      </div>
    </div>
  );
}

export default function PayPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = use(params);
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>}>
      <PayForm venueId={venueId} />
    </Suspense>
  );
}
