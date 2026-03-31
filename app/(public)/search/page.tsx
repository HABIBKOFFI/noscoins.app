export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchVenuesByLocation } from "@/lib/services/venue.service";

interface SearchParams {
  city?: string;
  q?: string;
  lat?: string;
  lng?: string;
  radius?: string;
  capacity?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

async function getVenues(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 20;

  if (params.lat && params.lng) {
    return searchVenuesByLocation(
      parseFloat(params.lat),
      parseFloat(params.lng),
      params.radius ? parseFloat(params.radius) * 1000 : 50000,
      {
        capacity: params.capacity ? parseInt(params.capacity) : undefined,
        minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      }
    );
  }

  const where: Record<string, unknown> = { status: "published" };
  if (params.city) where.city = { contains: params.city, mode: "insensitive" };
  if (params.capacity) where.capacity_seat = { gte: parseInt(params.capacity) };
  if (params.minPrice || params.maxPrice) {
    where.base_price = {
      ...(params.minPrice ? { gte: parseFloat(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: parseFloat(params.maxPrice) } : {}),
    };
  }

  return prisma.venue.findMany({
    where,
    include: { reviews: { select: { score_overall: true } } },
    orderBy: { created_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
}

function formatPrice(price: number | null, currency: string | null) {
  if (!price) return "Sur devis";
  if (currency === "XOF") return `${price.toLocaleString("fr-FR")} FCFA`;
  return `${price.toLocaleString("fr-FR")} €`;
}

function avgScore(reviews: { score_overall: number | null }[]) {
  const valid = reviews.filter((r) => r.score_overall !== null);
  if (!valid.length) return null;
  return (valid.reduce((s, r) => s + r.score_overall!, 0) / valid.length).toFixed(1);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const venues = await getVenues(params);
  const title = params.city ? `Espaces à ${params.city}` : params.q ? `"${params.q}"` : "Tous les espaces";

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      {/* Filtres */}
      <div className="bg-white border-b border-[#ede7e0] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              name="city"
              defaultValue={params.city}
              placeholder="Ville (Paris, Abidjan…)"
              className="input flex-1 text-sm"
            />
            <input
              name="capacity"
              type="number"
              defaultValue={params.capacity}
              placeholder="Capacité min."
              className="input w-full sm:w-36 text-sm"
            />
            <input
              name="minPrice"
              type="number"
              defaultValue={params.minPrice}
              placeholder="Prix min."
              className="input w-full sm:w-32 text-sm"
            />
            <input
              name="maxPrice"
              type="number"
              defaultValue={params.maxPrice}
              placeholder="Prix max."
              className="input w-full sm:w-32 text-sm"
            />
            <button type="submit" className="btn-primary text-sm px-6">
              Filtrer
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Titre + compteur */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-[#1A1410]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {title}
          </h1>
          <p className="text-sm text-[#1A1410]/60 mt-1">
            {venues.length} espace{venues.length > 1 ? "s" : ""} trouvé{venues.length > 1 ? "s" : ""}
          </p>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#1A1410]/50 text-lg mb-4">Aucun espace trouvé pour ces critères.</p>
            <Link href="/search" className="btn-secondary">
              Effacer les filtres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue: any) => {
              const score = avgScore(venue.reviews ?? []);
              return (
                <Link key={venue.id} href={`/venues/${venue.id}`} className="venue-card">
                  <div
                    className="w-full h-44 brand-pattern flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f0e8e0, #FBF5F0)" }}
                  >
                    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                      <path
                        d="M16 4C11.582 4 8 7.582 8 12C8 18.5 16 28 16 28C16 28 24 18.5 24 12C24 7.582 20.418 4 16 4Z"
                        fill="#C4622D" opacity="0.35"
                      />
                      <circle cx="16" cy="12" r="4" fill="#E8A838" opacity="0.45" />
                    </svg>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-[#1A1410] text-sm leading-snug">{venue.name}</h3>
                      {score && (
                        <span className="text-xs font-semibold text-[#C4622D] whitespace-nowrap">★ {score}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#1A1410]/55 mb-2">
                      {venue.city}
                      {venue.capacity_seat ? ` · ${venue.capacity_seat} pers.` : ""}
                    </p>
                    <p className="text-[#C4622D] font-semibold text-sm">
                      {formatPrice(Number(venue.base_price), venue.currency)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
