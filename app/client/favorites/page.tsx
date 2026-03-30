"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VenueCard from "@/components/ui/VenueCard";

interface Favorite {
  id: string;
  venue: {
    id: string;
    name: string;
    city: string | null;
    base_price: string | number | null;
    currency: string | null;
    capacity_seat: number | null;
    status: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => { setFavorites(d.data ?? []); setLoading(false); });
  }, []);

  async function remove(venueId: string) {
    await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId }),
    });
    setFavorites((fs) => fs.filter((f) => f.venue.id !== venueId));
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/client" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Mes favoris
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-12 text-center">
          <p className="text-[#1A1410]/40 mb-4">Vous n&apos;avez pas encore de favoris.</p>
          <Link href="/search" className="btn-primary text-sm">Explorer les espaces</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((f) => (
            <div key={f.id} className="relative">
              <VenueCard
                id={f.venue.id}
                name={f.venue.name}
                city={f.venue.city}
                base_price={f.venue.base_price}
                currency={f.venue.currency}
                capacity_seat={f.venue.capacity_seat}
              />
              <button
                onClick={() => remove(f.venue.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-400 hover:text-red-600 flex items-center justify-center text-sm shadow-sm"
                title="Retirer des favoris"
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
