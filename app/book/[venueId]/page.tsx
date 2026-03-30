"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

interface Service {
  id: string;
  name: string;
  price: string | number;
  currency: string;
  type: "mandatory" | "optional";
  category: string | null;
}

interface Availability {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface Venue {
  id: string;
  name: string;
  city: string | null;
  base_price: string | number | null;
  currency: string;
  booking_mode: string;
  services: Service[];
  availabilities: Availability[];
}

function BookForm({ venueId }: { venueId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDate = searchParams.get("date");

  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/venues/${venueId}`)
      .then((r) => r.json())
      .then((d) => setVenue(d.data));
  }, [venueId]);

  useEffect(() => {
    if (!venue || !preselectedDate) return;
    const slot = venue.availabilities.find((a) => a.date.startsWith(preselectedDate));
    if (slot) setSelectedSlotId(slot.id);
  }, [venue, preselectedDate]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function calcTotal() {
    if (!venue) return 0;
    const base = Number(venue.base_price ?? 0);
    const mandatory = venue.services.filter((s) => s.type === "mandatory").reduce((sum, s) => sum + Number(s.price), 0);
    const optional = venue.services
      .filter((s) => s.type === "optional" && selectedServices.includes(s.id))
      .reduce((sum, s) => sum + Number(s.price), 0);
    return base + mandatory + optional;
  }

  async function handleBook() {
    if (!selectedSlotId) { setError("Sélectionnez une date."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityId: selectedSlotId, serviceIds: selectedServices }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Erreur lors de la réservation");
        return;
      }
      router.push(`/book/${venueId}/pay?bookingId=${data.data.booking_id}`);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (!venue) return <div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>;

  const total = calcTotal();
  const deposit = total * 0.3;
  const currency = venue.currency;
  const fmt = (n: number) => currency === "XOF" ? `${n.toLocaleString("fr-FR")} FCFA` : `${n.toLocaleString("fr-FR")} €`;

  const mandatoryServices = venue.services.filter((s) => s.type === "mandatory");
  const optionalServices = venue.services.filter((s) => s.type === "optional");

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href={`/venues/${venueId}`} className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">
          ← {venue.name}
        </Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Réserver cet espace
        </h1>
        {venue.booking_mode === "request" && (
          <div className="mt-2 badge badge-warning text-sm py-2 px-4 rounded-xl">
            📋 Mode sur demande — le propriétaire confirmera sous 48h
          </div>
        )}
      </div>

      {error && <div className="badge badge-error w-full justify-center mb-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="space-y-5">
        {/* Choix du créneau */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
          <h2 className="font-semibold text-[#1A1410] mb-3">Choisir une date</h2>
          {venue.availabilities.length === 0 ? (
            <p className="text-sm text-[#1A1410]/40">Aucune disponibilité pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {venue.availabilities.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedSlotId(a.id)}
                  className={`py-2.5 px-3 rounded-xl text-sm border-2 transition-colors text-left ${
                    selectedSlotId === a.id
                      ? "border-[#C4622D] bg-[#C4622D]/5 text-[#C4622D]"
                      : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
                  }`}
                >
                  <p className="font-medium">{new Date(a.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</p>
                  <p className="text-xs opacity-70">{a.start_time} – {a.end_time}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Services obligatoires */}
        {mandatoryServices.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
            <h2 className="font-semibold text-[#1A1410] mb-3">Services inclus</h2>
            <div className="space-y-2">
              {mandatoryServices.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-sm">
                  <span className="text-[#1A1410]">{s.name}</span>
                  <span className="text-[#1A1410]/60">{fmt(Number(s.price))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services optionnels */}
        {optionalServices.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
            <h2 className="font-semibold text-[#1A1410] mb-3">Services optionnels</h2>
            <div className="space-y-2">
              {optionalServices.map((s) => (
                <label key={s.id} className="flex items-center justify-between cursor-pointer gap-3 py-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="w-4 h-4 accent-[#C4622D]"
                    />
                    <span className="text-sm text-[#1A1410]">{s.name}</span>
                  </div>
                  <span className="text-sm text-[#1A1410]/60">{fmt(Number(s.price))}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Récapitulatif */}
        <div className="bg-[#FBF5F0] rounded-2xl border border-[#ede7e0] p-5">
          <h2 className="font-semibold text-[#1A1410] mb-3">Récapitulatif</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[#1A1410]/70">
              <span>Prix de base</span>
              <span>{fmt(Number(venue.base_price ?? 0))}</span>
            </div>
            {mandatoryServices.map((s) => (
              <div key={s.id} className="flex justify-between text-[#1A1410]/70">
                <span>{s.name}</span>
                <span>{fmt(Number(s.price))}</span>
              </div>
            ))}
            {optionalServices.filter((s) => selectedServices.includes(s.id)).map((s) => (
              <div key={s.id} className="flex justify-between text-[#1A1410]/70">
                <span>{s.name}</span>
                <span>{fmt(Number(s.price))}</span>
              </div>
            ))}
            <div className="border-t border-[#ede7e0] pt-2 mt-2 flex justify-between font-semibold text-[#1A1410]">
              <span>Total</span>
              <span className="text-[#C4622D]">{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#1A1410]/60">
              <span>Acompte dû maintenant (30%)</span>
              <span className="font-medium text-[#1A1410]">{fmt(deposit)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleBook}
          disabled={loading || !selectedSlotId}
          className="btn-primary w-full text-base py-3"
        >
          {loading ? "Traitement…" : venue.booking_mode === "instant" ? "Réserver et payer" : "Envoyer la demande"}
        </button>

        <p className="text-xs text-center text-[#1A1410]/40">
          En réservant, vous acceptez nos{" "}
          <Link href="/legal/terms" className="underline">CGU</Link>.
          L&apos;acompte de 30% est prélevé à la confirmation.
        </p>
      </div>
    </div>
  );
}

export default function BookPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = use(params);
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>}>
      <BookForm venueId={venueId} />
    </Suspense>
  );
}
