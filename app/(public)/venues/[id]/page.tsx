export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

async function getVenue(id: string) {
  return prisma.venue.findFirst({
    where: { id, status: "published" },
    include: {
      owner: { select: { id: true, email: true, created_at: true } },
      services: { orderBy: [{ type: "asc" }, { price: "asc" }] },
      reviews: {
        include: { user: { select: { email: true } } },
        orderBy: { created_at: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true, bookings: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenue(id);
  if (!venue) return { title: "Espace introuvable | Noscoins" };

  const priceStr =
    venue.base_price
      ? venue.currency === "XOF"
        ? `${Number(venue.base_price).toLocaleString("fr-FR")} FCFA`
        : `${Number(venue.base_price).toLocaleString("fr-FR")} €`
      : "Sur devis";

  return {
    title: `${venue.name} — ${venue.city} | Noscoins`,
    description: `Réservez ${venue.name} à ${venue.city}. ${venue.capacity_seat ? `Capacité ${venue.capacity_seat} personnes.` : ""} À partir de ${priceStr}.`,
    openGraph: {
      title: `${venue.name} | Noscoins`,
      description: `Espace événementiel à ${venue.city}`,
    },
  };
}

function formatPrice(price: number | null, currency: string | null) {
  if (!price) return "Sur devis";
  if (currency === "XOF") return `${price.toLocaleString("fr-FR")} FCFA`;
  return `${price.toLocaleString("fr-FR")} €`;
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getVenue(id);
  if (!venue) notFound();

  const avgScore =
    venue.reviews.length
      ? (venue.reviews.reduce((s, r) => s + (r.score_overall ?? 0), 0) / venue.reviews.length).toFixed(1)
      : null;

  const mandatoryServices = venue.services.filter((s) => s.type === "mandatory");
  const optionalServices = venue.services.filter((s) => s.type === "optional");

  return (
    <div className="bg-[#FBF5F0]">
      {/* Galerie placeholder */}
      <div
        className="w-full h-64 md:h-96 brand-pattern flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f0e8e0, #FBF5F0)" }}
      >
        <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4C11.582 4 8 7.582 8 12C8 18.5 16 28 16 28C16 28 24 18.5 24 12C24 7.582 20.418 4 16 4Z"
            fill="#C4622D" opacity="0.3"
          />
          <circle cx="16" cy="12" r="4" fill="#E8A838" opacity="0.4" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Colonne principale ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header espace */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="text-3xl font-bold text-[#1A1410]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {venue.name}
                </h1>
                <p className="text-[#1A1410]/60 mt-1">
                  {venue.city}
                  {venue.address ? ` · ${venue.address}` : ""}
                </p>
              </div>
              {avgScore && (
                <div className="flex items-center gap-1 bg-white rounded-xl px-4 py-2 border border-[#ede7e0]">
                  <span className="text-[#C4622D] font-bold text-lg">★ {avgScore}</span>
                  <span className="text-sm text-[#1A1410]/50">({venue._count.reviews} avis)</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {venue.capacity_seat && (
                <span className="badge badge-default">{venue.capacity_seat} places assises</span>
              )}
              {venue.capacity_stand && (
                <span className="badge badge-default">{venue.capacity_stand} debout</span>
              )}
              <span className="badge badge-default capitalize">
                {venue.booking_mode === "instant" ? "Réservation instantanée" : "Sur demande"}
              </span>
            </div>
          </div>

          {/* Services inclus */}
          {mandatoryServices.length > 0 && (
            <div>
              <h2
                className="text-xl font-bold text-[#1A1410] mb-4"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Inclus dans le prix
              </h2>
              <div className="space-y-2">
                {mandatoryServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#ede7e0]">
                    <span className="text-sm text-[#1A1410]">{s.name}</span>
                    <span className="text-sm font-semibold text-[#C4622D]">
                      {formatPrice(Number(s.price), s.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services optionnels */}
          {optionalServices.length > 0 && (
            <div>
              <h2
                className="text-xl font-bold text-[#1A1410] mb-4"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Services optionnels
              </h2>
              <div className="space-y-2">
                {optionalServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#ede7e0]">
                    <div>
                      <span className="text-sm text-[#1A1410]">{s.name}</span>
                      {s.description && (
                        <p className="text-xs text-[#1A1410]/50 mt-0.5">{s.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#C4622D]">
                      + {formatPrice(Number(s.price), s.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avis */}
          {venue.reviews.length > 0 && (
            <div>
              <h2
                className="text-xl font-bold text-[#1A1410] mb-4"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Avis ({venue._count.reviews})
              </h2>
              <div className="space-y-4">
                {venue.reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-4 border border-[#ede7e0]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#1A1410]">
                        {review.user.email?.split("@")[0]}
                      </span>
                      <span className="text-[#C4622D] font-semibold text-sm">
                        ★ {review.score_overall}/5
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[#1A1410]/70 leading-relaxed">{review.comment}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-[#1A1410]/40">
                      <span>Propreté: {review.score_cleanliness}/5</span>
                      <span>Accueil: {review.score_welcome}/5</span>
                      <span>Rapport qualité: {review.score_value}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar réservation ────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-[#ede7e0] p-6 shadow-sm">
            <p className="text-2xl font-bold text-[#C4622D] mb-1">
              {formatPrice(Number(venue.base_price), venue.currency)}
            </p>
            <p className="text-sm text-[#1A1410]/50 mb-6">par événement · acompte 30%</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#1A1410]/60">Capacité</span>
                <span className="font-medium text-[#1A1410]">
                  {venue.capacity_seat ? `${venue.capacity_seat} pers. ass.` : "—"}
                  {venue.capacity_stand ? ` / ${venue.capacity_stand} debout` : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#1A1410]/60">Mode</span>
                <span className="font-medium text-[#1A1410]">
                  {venue.booking_mode === "instant" ? "Instantané" : "Sur demande"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#1A1410]/60">Solde dû</span>
                <span className="font-medium text-[#1A1410]">{venue.balance_due_days_before}j avant</span>
              </div>
            </div>

            <Link href={`/venues/${venue.id}/book`} className="btn-primary w-full text-center block mb-3">
              Réserver
            </Link>
            <Link href={`/venues/${venue.id}/quote`} className="btn-secondary w-full text-center block">
              Demander un devis
            </Link>

            <p className="text-xs text-[#1A1410]/40 text-center mt-4">
              Aucun frais de service avant confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
