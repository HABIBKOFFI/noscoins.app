export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

// In production: get owner ID from JWT cookie
const DEMO_OWNER_ID = "demo-owner-id";

async function getOwnerVenues(ownerId: string) {
  return prisma.venue.findMany({
    where: { owner_id: ownerId },
    include: {
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { created_at: "desc" },
  }).catch(() => []);
}

const DEMO_VENUES = [
  {
    id: "venue-1",
    name: "Loft Marais",
    city: "Paris",
    address: "12 rue de Bretagne, 75003",
    capacity_seat: 80,
    capacity_stand: 120,
    base_price: 1200,
    currency: "EUR",
    status: "published",
    booking_mode: "instant",
    created_at: new Date("2026-01-15"),
    _count: { bookings: 5, reviews: 3 },
  },
  {
    id: "venue-2",
    name: "Rooftop Bastille",
    city: "Paris",
    address: "8 place de la Bastille, 75011",
    capacity_seat: 50,
    capacity_stand: 80,
    base_price: 800,
    currency: "EUR",
    status: "pending",
    booking_mode: "request",
    created_at: new Date("2026-02-20"),
    _count: { bookings: 0, reviews: 0 },
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "bg-yellow-100 text-yellow-700" },
  validated: { label: "Validé",      color: "bg-blue-100 text-blue-700" },
  published: { label: "Publié",      color: "bg-green-100 text-green-700" },
  suspended: { label: "Suspendu",    color: "bg-red-100 text-red-600" },
};

export default async function OwnerVenuesPage() {
  const venues = DEMO_VENUES;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
            Mes espaces
          </h1>
          <p className="text-sm text-[#1A1410]/50 mt-1">{venues.length} espace{venues.length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/owner/venues/new" className="btn-primary text-sm">
          + Ajouter un espace
        </Link>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#ede7e0]">
          <div className="w-16 h-16 rounded-2xl bg-[#FBF5F0] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C11.582 4 8 7.582 8 12C8 18.5 16 28 16 28C16 28 24 18.5 24 12C24 7.582 20.418 4 16 4Z" fill="#C4622D" opacity="0.4"/>
              <circle cx="16" cy="12" r="4" fill="#E8A838" opacity="0.5"/>
            </svg>
          </div>
          <p className="font-semibold text-[#1A1410] mb-2">Aucun espace créé</p>
          <p className="text-sm text-[#1A1410]/50 mb-6">Commencez par créer votre premier espace événementiel.</p>
          <Link href="/owner/venues/new" className="btn-primary">
            Créer mon premier espace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((venue) => {
            const statusInfo = STATUS_LABELS[venue.status] ?? { label: venue.status, color: "bg-gray-100 text-gray-600" };
            return (
              <div key={venue.id} className="bg-white rounded-2xl border border-[#ede7e0] p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-semibold text-[#1A1410]">{venue.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-[#1A1410]/40 bg-[#FBF5F0] px-2 py-0.5 rounded-full">
                        {venue.booking_mode === "instant" ? "Instantané" : "Sur demande"}
                      </span>
                    </div>
                    <p className="text-sm text-[#1A1410]/60">{venue.city} · {venue.address}</p>
                    <div className="flex gap-4 mt-2 text-xs text-[#1A1410]/50">
                      <span>{venue.capacity_seat} pers. ass. / {venue.capacity_stand} debout</span>
                      <span>·</span>
                      <span className="text-[#C4622D] font-semibold">
                        {venue.currency === "XOF"
                          ? `${Number(venue.base_price).toLocaleString("fr-FR")} FCFA`
                          : `${Number(venue.base_price).toLocaleString("fr-FR")} €`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm flex-shrink-0">
                    <div className="text-center">
                      <p className="font-semibold text-[#1A1410]">{venue._count.bookings}</p>
                      <p className="text-xs text-[#1A1410]/40">résa.</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#1A1410]">{venue._count.reviews}</p>
                      <p className="text-xs text-[#1A1410]/40">avis</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-[#ede7e0]">
                  <Link href={`/venues/${venue.id}`} className="text-xs text-[#1A1410]/60 hover:text-[#C4622D] border border-[#ede7e0] rounded-lg px-3 py-1.5 transition-colors">
                    Voir la page
                  </Link>
                  <Link href={`/owner/venues/${venue.id}/edit`} className="text-xs text-[#C4622D] border border-[#C4622D]/30 rounded-lg px-3 py-1.5 hover:bg-[#C4622D]/5 transition-colors">
                    Modifier
                  </Link>
                  {venue.status === "validated" && (
                    <button className="text-xs text-green-600 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors">
                      Publier
                    </button>
                  )}
                  {venue.status === "published" && (
                    <button className="text-xs text-[#1A1410]/50 border border-[#ede7e0] rounded-lg px-3 py-1.5 hover:bg-[#FBF5F0] transition-colors">
                      Dépublier
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info KYC */}
      <div className="mt-8 bg-[#E8A838]/10 rounded-2xl border border-[#E8A838]/30 p-5">
        <div className="flex gap-3">
          <span className="text-[#E8A838] text-lg flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm font-medium text-[#1A1410]">Publication conditionnée au KYC</p>
            <p className="text-sm text-[#1A1410]/60 mt-1">
              Vos espaces ne peuvent être publiés qu&apos;après validation de vos documents d&apos;identité et RIB par notre équipe.{" "}
              <Link href="/owner/documents" className="text-[#C4622D] hover:underline">Soumettre mes documents →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
