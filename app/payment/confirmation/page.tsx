"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const status = searchParams.get("status"); // "success" | "failed" | "pending"

  const [booking, setBooking] = useState<{ venue: { name: string }; total_price: string | number; client_currency: string | null } | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => setBooking(d.data));
  }, [bookingId]);

  const isSuccess = status === "success" || !status;
  const isFailed = status === "failed";

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl ${
        isSuccess ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-yellow-100"
      }`}>
        {isSuccess ? "✓" : isFailed ? "✕" : "⏳"}
      </div>

      <h1 className="text-2xl font-bold text-[#1A1410] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        {isSuccess ? "Réservation confirmée !" : isFailed ? "Paiement échoué" : "Paiement en attente"}
      </h1>

      {booking && (
        <p className="text-[#1A1410]/60 mb-2">
          {booking.venue.name}
        </p>
      )}

      {isSuccess && (
        <div className="bg-[#FBF5F0] rounded-2xl p-5 mb-6 text-left space-y-2">
          <p className="text-sm text-[#1A1410]/70">
            ✓ Acompte prélevé avec succès
          </p>
          <p className="text-sm text-[#1A1410]/70">
            ✓ Email de confirmation envoyé
          </p>
          <p className="text-sm text-[#1A1410]/70">
            ✓ Propriétaire notifié
          </p>
        </div>
      )}

      {isFailed && (
        <div className="bg-red-50 rounded-2xl p-5 mb-6">
          <p className="text-sm text-red-600">
            Le paiement n&apos;a pas pu être traité. Aucun montant n&apos;a été débité.
          </p>
        </div>
      )}

      {!isSuccess && !isFailed && (
        <div className="bg-yellow-50 rounded-2xl p-5 mb-6">
          <p className="text-sm text-yellow-700">
            Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isSuccess && bookingId && (
          <Link href={`/client/bookings/${bookingId}`} className="btn-primary w-full">
            Voir ma réservation
          </Link>
        )}
        {isFailed && bookingId && (
          <Link href={`/client/bookings/${bookingId}`} className="btn-primary w-full">
            Réessayer le paiement
          </Link>
        )}
        <Link href="/client" className="btn-ghost w-full">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
